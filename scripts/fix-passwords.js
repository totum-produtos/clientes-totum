const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cgpkfhrqprqptvehatad.supabase.co';
const SERVICE_ROLE_KEY = process.env.PRIVATE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('PRIVATE_SUPABASE_SERVICE_KEY ou SUPABASE_SERVICE_ROLE_KEY é obrigatória para rodar este script.');
  process.exit(1);
}

const DEV_PASSWORD = process.env.SETUP_DEV_PASSWORD;
const CLIENT_PASSWORD = process.env.SETUP_CLIENT_PASSWORD;

if (!DEV_PASSWORD || !CLIENT_PASSWORD) {
  console.error('SETUP_DEV_PASSWORD e SETUP_CLIENT_PASSWORD são obrigatórias para resetar senhas.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function fixPasswords() {
  console.log('🔧 Resetando senhas...\n');

  // Reset dev password
  const { data: devUser, error: devFindErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const dev = devUser?.users.find(u => u.email === 'dev@grupototum.com');
  
  if (dev) {
    const { error } = await supabase.auth.admin.updateUserById(dev.id, { 
      password: DEV_PASSWORD,
      email_confirm: true 
    });
    if (error) {
      console.log('❌ dev@grupototum.com:', error.message);
    } else {
      console.log('✅ dev@grupototum.com — senha resetada via SETUP_DEV_PASSWORD');
    }
  } else {
    console.log('⚠️ dev@grupototum.com não encontrado');
  }

  // Reset teste password
  const teste = devUser?.users.find(u => u.email === 'teste@grupototum.com');
  
  if (teste) {
    const { error } = await supabase.auth.admin.updateUserById(teste.id, { 
      password: CLIENT_PASSWORD,
      email_confirm: true 
    });
    if (error) {
      console.log('❌ teste@grupototum.com:', error.message);
    } else {
      console.log('✅ teste@grupototum.com — senha resetada via SETUP_CLIENT_PASSWORD');
    }
  } else {
    console.log('⚠️ teste@grupototum.com não encontrado');
  }
}

fixPasswords().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
