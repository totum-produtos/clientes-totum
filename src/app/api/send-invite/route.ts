import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { getClientUserRole } from '@/services/db/users';
import { getClientNome } from '@/services/db/clients';
import { invalidatePendingInvites, insertInvite } from '@/services/db/onboarding';

type InviteInsert = {
  client_id: string;
  email: string;
  token: string;
  expires_at: string;
  created_by?: string;
};

type ResendResponse = {
  id?: string;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Erro desconhecido';
}

function isSupabaseAdminBearer(token: string) {
  if (token.startsWith('sb_secret_')) {
    return true;
  }

  try {
    const [, payload] = token.split('.');
    if (!payload) return false;

    return JSON.parse(atob(payload)).role === 'service_role';
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { client_id, email } = body;

    if (!client_id || !email) {
      return NextResponse.json(
        { error: 'client_id e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jwt = authHeader.replace('Bearer ', '');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.PRIVATE_SUPABASE_SERVICE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    let userId: string | undefined;
    let isServiceRole = false;

    if (isSupabaseAdminBearer(jwt)) {
      isServiceRole = true;
      userId = '00000000-0000-0000-0000-000000000000';
    }

    if (!isServiceRole) {
      const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
      if (userError || !user) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      userId = user.id;

      // Check role
      const { data: roleData } = await getClientUserRole(supabase, user.id);

      if (!roleData) {
        return NextResponse.json(
          { error: 'Apenas admins e masters podem enviar convites' },
          { status: 403 }
        );
      }
    }

    // Get client info
    const { data: clientData } = await getClientNome(supabase, client_id);

    if (!clientData) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    // Invalidate previous unused invites
    await invalidatePendingInvites(supabase, client_id, email.toLowerCase().trim(), new Date().toISOString());

    // Generate token
    const token = crypto.randomUUID();

    // Insert invite (72h expiry)
    const insertData: InviteInsert = {
      client_id,
      email: email.toLowerCase().trim(),
      token,
      expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    };
    if (!isServiceRole && userId) {
      insertData.created_by = userId;
    }

    const { error: insertError } = await insertInvite(supabase, insertData);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Build URLs
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cliente.grupototum.com';
    const inviteUrl = `${siteUrl}/auth/convite?token=${token}`;
    const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${token}`;
    const logoUrl = `${siteUrl}/logo.png`;

    // Read template
    const templatePath = path.join(process.cwd(), 'supabase', 'functions', 'send-invite', 'totum-email-boas-vindas.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders
    html = html
      .replace(/{{NOME_CLIENTE}}/g, clientData.nome)
      .replace(/{{LINK_CONVITE}}/g, inviteUrl)
      .replace(/{{LINK_DESCADASTRO}}/g, unsubscribeUrl)
      .replace(/cid:logo-totum/g, logoUrl);

    // Try SMTP first, fallback to Resend
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || 'Totum <contato@grupototum.com>';
    const resendApiKey = process.env.RESEND_API_KEY;

    let messageId: string | undefined;

    if (smtpHost && smtpUser && smtpPass) {
      // Send via Nodemailer (SMTP)
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort || '587'),
        secure: smtpPort === '465',
        auth: { user: smtpUser, pass: smtpPass },
      });

      const info = await transporter.sendMail({
        from: smtpFrom,
        to: email,
        subject: 'Seu acesso à plataforma Totum está pronto ✅',
        html,
        headers: {
          'List-Unsubscribe': '<mailto:sair@totum.com.br>',
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          'Precedence': 'bulk',
          'X-Mailer': 'Totum Platform v1',
        },
      });
      messageId = info.messageId;
    } else if (resendApiKey) {
      // Fallback: Send via Resend
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: smtpFrom,
          to: email,
          subject: 'Seu acesso à plataforma Totum está pronto ✅',
          html,
          headers: {
            'List-Unsubscribe': '<mailto:sair@totum.com.br>',
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            'Precedence': 'bulk',
            'X-Mailer': 'Totum Platform v1',
          },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json(
          { error: 'Erro ao enviar email via Resend: ' + err },
          { status: 500 }
        );
      }

      const resendData = (await res.json()) as ResendResponse;
      messageId = resendData.id;
    } else {
      return NextResponse.json({
        success: true,
        message: 'Convite criado (sem serviço de email configurado)',
        invite_url: inviteUrl,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Convite enviado com sucesso para ' + email,
      messageId,
    });

  } catch (error: unknown) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
