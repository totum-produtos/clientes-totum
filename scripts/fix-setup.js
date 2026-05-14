const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cgpkfhrqprqptvehatad.supabase.co';
const SERVICE_ROLE_KEY = process.env.PRIVATE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('PRIVATE_SUPABASE_SERVICE_KEY ou SUPABASE_SERVICE_ROLE_KEY é obrigatória para rodar este script.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function fix() {
  console.log('🔧 Corrigindo setup...\n');

  const devUserId = 'e6d2d658-ca24-4577-a6e9-f6e60cfa2a67';
  const testeUserId = '74858ecd-4a37-48ca-b2d1-c56801255381';
  const clientId = '1e865aa3-7833-4b4f-9236-06abb75c7c54';

  // 1. Garantir dev como master em user_roles
  console.log('1️⃣  Garantindo dev como master...');
  const { data: existingDev } = await supabase.from('user_roles').select('*').eq('user_id', devUserId).single();
  if (existingDev) {
    const { error } = await supabase.from('user_roles').update({ role: 'master' }).eq('user_id', devUserId);
    console.log(existingDev.role === 'master' ? '   ✅ Já é master' : '   ✅ Atualizado para master', error ? `(erro: ${error.message})` : '');
  } else {
    const { error } = await supabase.from('user_roles').insert({ user_id: devUserId, role: 'master' });
    console.log('   ✅ Inserido como master', error ? `(erro: ${error.message})` : '');
  }

  // 2. Linkar teste ao cliente com role CLIENTE
  console.log('\n2️⃣  Linkando teste@ ao cliente como CLIENTE...');
  
  // Deletar registro existente primeiro para evitar conflito
  await supabase.from('portal_client_users').delete().eq('user_id', testeUserId);
  
  const { error: linkErr } = await supabase
    .from('portal_client_users')
    .insert({ user_id: testeUserId, client_id: clientId, role: 'cliente' });
  
  if (linkErr) {
    console.log('   ❌ Erro:', linkErr.message);
  } else {
    console.log('   ✅ Linkado com role cliente');
  }

  // 3. Verificar o resultado
  console.log('\n3️⃣  Verificando...');
  const { data: pcu } = await supabase.from('portal_client_users').select('*').eq('user_id', testeUserId);
  console.log('   portal_client_users para teste:', pcu);
  
  const { data: ur } = await supabase.from('user_roles').select('*').eq('user_id', testeUserId);
  console.log('   user_roles para teste:', ur);
}

fix().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
