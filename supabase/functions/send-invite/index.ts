import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { corsHeaders } from '../_shared/cors.ts'

// Edge Function: send-invite
// Envia um convite por email para um cliente criar conta no portal
// Body: { client_id, email }

const EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">

  <!--
    === ANTI-SPAM CHECKLIST (implementar no servidor) ===
    1. Enviar pelo domínio autenticado (SPF, DKIM, DMARC configurados)
    2. Usar IP dedicado com boa reputação (ex: SendGrid, Mailgun, Amazon SES)
    3. Linha de assunto: "Seu acesso à plataforma Totum está pronto"
    4. Cabeçalhos obrigatórios no servidor:
       List-Unsubscribe: <mailto:sair@totum.com.br>
       List-Unsubscribe-Post: List-Unsubscribe=One-Click
       Precedence: bulk
       X-Mailer: Totum Platform v1
  -->

  <title>Bem-vindo à Totum</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { margin: 0; padding: 0; width: 100%; }
    body {
      background-color: #F0EFED;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; display: block; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { color: inherit; }

    .email-wrapper {
      background-color: #F0EFED;
      padding: 40px 16px;
    }

    .email-card {
      background-color: #FFFFFF;
      max-width: 560px;
      margin: 0 auto;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 2px 20px rgba(0,0,0,0.08);
    }

    /* HEADER */
    .email-header {
      background-color: #D93025;
      padding: 44px 48px;
      text-align: center;
    }

    .email-header img {
      height: 52px;
      width: auto;
      margin: 0 auto;
      display: block;
    }

    /* BODY */
    .email-body {
      padding: 44px 48px 40px;
    }

    .label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #D93025;
      margin-bottom: 18px;
    }

    h1 {
      font-size: 26px;
      font-weight: 700;
      color: #111111;
      line-height: 1.3;
      margin-bottom: 28px;
      letter-spacing: -0.3px;
    }

    p {
      font-size: 15px;
      line-height: 1.75;
      color: #444444;
      margin-bottom: 18px;
    }

    p:last-of-type { margin-bottom: 0; }

    hr {
      border: none;
      border-top: 1px solid #EBEBEB;
      margin: 32px 0;
    }

    .steps-block {
      background-color: #FAF9F7;
      border-left: 3px solid #D93025;
      border-radius: 0 4px 4px 0;
      padding: 22px 26px;
      margin: 32px 0;
    }

    .steps-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.13em;
      text-transform: uppercase;
      color: #D93025;
      margin-bottom: 18px;
    }

    .step {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 14px;
    }

    .step:last-child { margin-bottom: 0; }

    .step-num {
      flex-shrink: 0;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background-color: #D93025;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 2px;
    }

    .step p {
      font-size: 14px;
      line-height: 1.6;
      color: #444444;
      margin-bottom: 0;
    }

    .step p strong { color: #111111; }

    .cta-wrap {
      text-align: center;
      margin: 36px 0 28px;
    }

    .cta-btn {
      display: inline-block;
      background-color: #D93025;
      color: #FFFFFF !important;
      text-decoration: none;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.02em;
      padding: 15px 40px;
      border-radius: 4px;
    }

    .cta-note {
      font-size: 12px;
      color: #999999;
      text-align: center;
      margin-top: 10px;
      margin-bottom: 0;
    }

    .link-box {
      background-color: #FAF9F7;
      border: 1px dashed #DDDDDD;
      border-radius: 4px;
      padding: 14px 18px;
      margin-top: 24px;
    }

    .link-box p {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      color: #777777;
      line-height: 1.6;
      margin-bottom: 4px;
    }

    .link-box a {
      color: #D93025;
      text-decoration: underline;
      word-break: break-all;
    }

    /* FOOTER */
    .email-footer {
      background-color: #F0EFED;
      border-top: 1px solid #E5E4E2;
      padding: 28px 48px;
      text-align: center;
    }

    .footer-brand {
      font-size: 13px;
      font-weight: 600;
      color: #555555;
      margin-bottom: 6px;
    }

    .footer-text {
      font-size: 12px;
      line-height: 1.7;
      color: #999999;
    }

    .footer-text a {
      color: #D93025;
      text-decoration: none;
    }

    @media only screen and (max-width: 600px) {
      .email-body, .email-header, .email-footer { padding-left: 24px !important; padding-right: 24px !important; }
      h1 { font-size: 22px !important; }
      .email-header img { height: 40px !important; }
    }
  </style>
</head>
<body>

<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Preparamos tudo para você. Clique e crie sua senha agora. ‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌</div>

<div class="email-wrapper">
  <div class="email-card">

    <div class="email-header">
      <img src="{{LOGO_URL}}" alt="Totum" />
    </div>

    <div class="email-body">

      <p class="label">Convite de acesso</p>

      <h1>Oi, {{NOME_CLIENTE}}. Seu acesso está pronto.</h1>

      <p>
        Ficamos felizes de ter você aqui. A partir de agora, vamos trabalhar juntos de um jeito mais organizado e transparente. Tudo que envolver o seu projeto vai passar pela nossa plataforma: briefing, aprovações, entregas e resultados.
      </p>

      <p>
        Criamos um acesso exclusivo para você. É rápido de configurar e você só precisa fazer isso uma vez.
      </p>

      <hr>

      <div class="steps-block">
        <p class="steps-label">Como acessar</p>

        <div class="step">
          <div class="step-num">1</div>
          <p><strong>Clique no botão abaixo.</strong> Ele vai abrir uma página exclusiva para você.</p>
        </div>

        <div class="step">
          <div class="step-num">2</div>
          <p><strong>Crie a sua senha.</strong> Escolha uma que você vai lembrar, ela é só sua.</p>
        </div>

        <div class="step">
          <div class="step-num">3</div>
          <p><strong>Pronto, você já está dentro.</strong> O sistema vai te levar direto para o seu painel.</p>
        </div>
      </div>

      <div class="cta-wrap">
        <a href="{{LINK_CONVITE}}" class="cta-btn" target="_blank" rel="noopener noreferrer">
          Criar minha senha e entrar
        </a>
        <p class="cta-note">Este link é só seu e expira em <strong>72 horas</strong>.</p>
      </div>

      <hr>

      <p>
        Se você não estava esperando este email, pode ignorar sem problema. Nenhuma conta foi criada e nenhuma informação sua foi usada sem que alguém da Totum tivesse cadastrado você.
      </p>

      <p>
        Ficou com alguma dúvida? Responde este email mesmo, a gente está por aqui.
      </p>

      <div class="link-box">
        <p>Se o botão não abrir, copie e cole este link no navegador:</p>
        <p><a href="{{LINK_CONVITE}}">{{LINK_CONVITE}}</a></p>
      </div>

    </div>

    <div class="email-footer">
      <p class="footer-brand">Grupo Totum &mdash; Marketing para Resultados</p>
      <p class="footer-text">
        <a href="mailto:hello@totum.com.br">hello@totum.com.br</a>
      </p>
      <br>
      <p class="footer-text">
        Você recebeu este email porque foi cadastrado por um administrador da Totum.<br>
        <a href="{{LINK_DESCADASTRO}}">Cancelar recebimento de emails</a>
      </p>
    </div>

  </div>
</div>

</body>
</html>
o docido`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { client_id, email } = await req.json()

    if (!client_id || !email) {
      return new Response(
        JSON.stringify({ error: 'client_id e email são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const jwt = authHeader.replace('Bearer ', '')
    let userId: string | undefined
    let isServiceRole = false

    try {
      const payload = JSON.parse(atob(jwt.split('.')[1]))
      if (payload.role === 'service_role') {
        isServiceRole = true
        userId = '00000000-0000-0000-0000-000000000000'
      }
    } catch {
      // não é JWT válido
    }

    if (!isServiceRole) {
      const { data: { user }, error: userError } = await supabase.auth.getUser(jwt)
      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      userId = user.id
    }

    if (!isServiceRole) {
      const { data: roleData } = await supabase
        .from('portal_client_users')
        .select('role')
        .eq('user_id', userId)
        .in('role', ['master', 'admin'])
        .single()

      if (!roleData) {
        return new Response(
          JSON.stringify({ error: 'Apenas admins e masters podem enviar convites' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const { data: clientData } = await supabase
      .from('portal_clients')
      .select('nome')
      .eq('id', client_id)
      .single()

    if (!clientData) {
      return new Response(
        JSON.stringify({ error: 'Cliente não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabase
      .from('client_invites')
      .update({ used_at: new Date().toISOString() })
      .eq('client_id', client_id)
      .eq('email', email.toLowerCase().trim())
      .is('used_at', null)

    const token = crypto.randomUUID()

    const insertData: any = {
      client_id,
      email: email.toLowerCase().trim(),
      token,
      expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    }
    if (!isServiceRole && userId) {
      insertData.created_by = userId
    }
    
    const { error: insertError } = await supabase
      .from('client_invites')
      .insert(insertData)

    if (insertError) {
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const siteUrl = Deno.env.get('SITE_URL') ?? 'https://cliente.grupototum.com'
    const inviteUrl = `${siteUrl}/auth/convite?token=${token}`
    const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${token}`
    const logoUrl = `${siteUrl}/logo.png`

    const html = EMAIL_TEMPLATE
      .replace(/{{NOME_CLIENTE}}/g, clientData.nome)
      .replace(/{{LINK_CONVITE}}/g, inviteUrl)
      .replace(/{{LINK_DESCADASTRO}}/g, unsubscribeUrl)
      .replace(/{{LOGO_URL}}/g, logoUrl)

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Convite criado (email não enviado — RESEND_API_KEY não configurada)',
          invite_url: inviteUrl
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Totum <contato@grupototum.com>',
        to: email,
        subject: 'Seu acesso à plataforma Totum está pronto ✅',
        html: html,
        headers: {
          'List-Unsubscribe': '<mailto:sair@totum.com.br>',
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          'Precedence': 'bulk',
          'X-Mailer': 'Totum Platform v1',
        },
        tags: [
          { name: 'category', value: 'convite' },
          { name: 'client_id', value: client_id }
        ]
      })
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend error:', err)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao enviar email: ' + err,
          invite_url: inviteUrl
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resendData = await res.json()
    console.log(`Convite enviado: client=${client_id}, email=${email}, token=${token}, resend_id=${resendData.id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Convite enviado com sucesso para ' + email,
        resend_id: resendData.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
