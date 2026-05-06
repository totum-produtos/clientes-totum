import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.PRIVATE_SUPABASE_SERVICE_KEY || '';

const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export async function createNotification({
  userId,
  type,
  title,
  message,
  data = {}
}: {
  userId: string;
  type: 'alteracao_pendente' | 'alteracao_aprovada' | 'alteracao_rejeitada' | 'geral';
  title: string;
  message: string;
  data?: Record<string, any>;
}) {
  const { error } = await serviceClient
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      data,
      read: false
    });

  if (error) {
    console.error('Erro ao criar notificação:', error);
  }
}

export async function notifyMastersAboutChange(changeId: string, clientName: string) {
  const { data: masters } = await serviceClient
    .from('user_roles')
    .select('user_id')
    .eq('role', 'master');

  if (!masters) return;

  for (const master of masters) {
    await createNotification({
      userId: master.user_id,
      type: 'alteracao_pendente',
      title: 'Alteração pendente de aprovação',
      message: `O cliente "${clientName}" submeteu alterações no cadastro que aguardam sua aprovação.`,
      data: { change_id: changeId, client_name: clientName }
    });
  }
}

export async function notifyClientAboutReview(clientUserId: string, clientName: string, approved: boolean) {
  await createNotification({
    userId: clientUserId,
    type: approved ? 'alteracao_aprovada' : 'alteracao_rejeitada',
    title: approved ? 'Alteração aprovada' : 'Alteração rejeitada',
    message: approved
      ? `Suas alterações no cadastro de "${clientName}" foram aprovadas.`
      : `Suas alterações no cadastro de "${clientName}" foram rejeitadas. Entre em contato para mais informações.`,
    data: { client_name: clientName }
  });
}
