const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cgpkfhrqprqptvehatad.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncGtmaHJxcHJxcHR2ZWhhdGFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTIyNDI2MiwiZXhwIjoyMDkwODAwMjYyfQ.kV_iFypk00cXplJNUnSW8FEz04v2HD9z5lO5X9eJFag';

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
      password: 'Totum@2025',
      email_confirm: true 
    });
    if (error) {
      console.log('❌ dev@grupototum.com:', error.message);
    } else {
      console.log('✅ dev@grupototum.com — senha resetada para: Totum@2025');
    }
  } else {
    console.log('⚠️ dev@grupototum.com não encontrado');
  }

  // Reset teste password
  const teste = devUser?.users.find(u => u.email === 'teste@grupototum.com');
  
  if (teste) {
    const { error } = await supabase.auth.admin.updateUserById(teste.id, { 
      password: 'Cliente@2025',
      email_confirm: true 
    });
    if (error) {
      console.log('❌ teste@grupototum.com:', error.message);
    } else {
      console.log('✅ teste@grupototum.com — senha resetada para: Cliente@2025');
    }
  } else {
    console.log('⚠️ teste@grupototum.com não encontrado');
  }
}

fixPasswords().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
