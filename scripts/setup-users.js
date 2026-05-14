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
  console.error('SETUP_DEV_PASSWORD e SETUP_CLIENT_PASSWORD são obrigatórias para criar usuários de teste.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function findUserByEmail(email) {
  // Listar usuários e filtrar por email (paginação simples)
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page: page,
      perPage: perPage,
    });
    if (error) throw error;
    const user = data.users.find(u => u.email === email);
    if (user) return user;
    if (data.users.length < perPage) break;
    page++;
  }
  return null;
}

async function setup() {
  console.log('🔧 Configurando usuários no Supabase...\n');

  // ============================================================
  // 1. Garantir dev@grupototum.com como MASTER
  // ============================================================
  console.log('1️⃣  Verificando dev@grupototum.com...');
  
  let devUser = await findUserByEmail('dev@grupototum.com');
  let devUserId;
  
  if (!devUser) {
    console.log('   ⚠️ Usuário dev@grupototum.com não encontrado, criando...');
    const { data: newDev, error: createDevErr } = await supabase.auth.admin.createUser({
      email: 'dev@grupototum.com',
      password: DEV_PASSWORD,
      email_confirm: true,
    });
    if (createDevErr) {
      console.error('   ❌ Erro ao criar dev@grupototum.com:', createDevErr.message);
      process.exit(1);
    }
    devUserId = newDev.user.id;
    console.log('   ✅ dev@grupototum.com criado com ID:', devUserId);
  } else {
    devUserId = devUser.id;
    console.log('   ✅ dev@grupototum.com encontrado, ID:', devUserId);
  }

  // Garantir role master em user_roles
  const { error: roleErr } = await supabase
    .from('user_roles')
    .upsert({ user_id: devUserId, role: 'master' }, { onConflict: 'user_id' });
  
  if (roleErr) {
    console.error('   ❌ Erro ao setar role master:', roleErr.message);
  } else {
    console.log('   ✅ Role master garantida em user_roles\n');
  }

  // ============================================================
  // 2. Criar usuário teste@grupototum.com como CLIENTE
  // ============================================================
  console.log('2️⃣  Verificando teste@grupototum.com...');
  
  let testeUser = await findUserByEmail('teste@grupototum.com');
  let testeUserId;
  
  if (!testeUser) {
    console.log('   ⚠️ Usuário teste@grupototum.com não encontrado, criando...');
    const { data: newTeste, error: createTesteErr } = await supabase.auth.admin.createUser({
      email: 'teste@grupototum.com',
      password: CLIENT_PASSWORD,
      email_confirm: true,
    });
    if (createTesteErr) {
      console.error('   ❌ Erro ao criar teste@grupototum.com:', createTesteErr.message);
      process.exit(1);
    }
    testeUserId = newTeste.user.id;
    console.log('   ✅ teste@grupototum.com criado com ID:', testeUserId);
  } else {
    testeUserId = testeUser.id;
    console.log('   ✅ teste@grupototum.com encontrado, ID:', testeUserId);
  }

  // ============================================================
  // 3. Criar cliente de teste
  // ============================================================
  console.log('\n3️⃣  Criando cliente de teste...');
  
  const { data: existingClient } = await supabase
    .from('portal_clients')
    .select('id')
    .eq('slug', 'cliente-teste')
    .maybeSingle();

  let clientId;
  if (existingClient?.id) {
    clientId = existingClient.id;
    console.log('   ✅ Cliente de teste já existe, ID:', clientId);
  } else {
    const { data: newClient, error: clientErr } = await supabase
      .from('portal_clients')
      .insert({
        nome: 'Cliente Teste',
        slug: 'cliente-teste',
        email_responsavel: 'teste@grupototum.com',
        contato_principal: '(11) 99999-9999',
        status: 'ativo',
        cnpj: '12.345.678/0001-90',
        nome_responsavel: 'Usuário Teste',
        telefone: '(11) 99999-9999',
        site: 'https://cliente-teste.com.br',
        ramo_atuacao: 'Tecnologia',
        tempo_mercado: '1-3 anos',
        descricao_negocio: 'Empresa de teste para validação do portal.',
        produtos_servicos: 'Consultoria, Suporte, Desenvolvimento',
        tamanho_empresa: 'PME',
        faturamento_mensal: 'R$ 10k-50k',
        cor_primaria: '#3b82f6',
        cor_secundaria: '#1e293b',
      })
      .select('id')
      .single();
    
    if (clientErr) {
      console.error('   ❌ Erro ao criar cliente:', clientErr.message);
      process.exit(1);
    }
    clientId = newClient.id;
    console.log('   ✅ Cliente de teste criado, ID:', clientId);
  }

  // ============================================================
  // 4. Linkar usuário teste ao cliente via portal_client_users
  // ============================================================
  console.log('\n4️⃣  Linkando teste@grupototum.com ao cliente...');
  
  const { error: linkErr } = await supabase
    .from('portal_client_users')
    .upsert(
      { user_id: testeUserId, client_id: clientId, role: 'cliente' },
      { onConflict: 'user_id,client_id' }
    );
  
  if (linkErr) {
    console.error('   ❌ Erro ao linkar usuário:', linkErr.message);
    process.exit(1);
  }
  console.log('   ✅ Usuário teste linkado ao cliente como cliente\n');

  // ============================================================
  // 5. Criar dados de exemplo para o cliente teste
  // ============================================================
  console.log('5️⃣  Criando dados de exemplo...');

  // Posts de exemplo
  const posts = [
    { subject: 'Por que investir em marketing digital?', tipo: 'porque', published_at: new Date().toISOString(), portal_client_id: clientId, views: 120, likes: 45, engagement_rate: 3.2 },
    { subject: 'Como criar uma estratégia de conteúdo', tipo: 'como', published_at: new Date(Date.now() - 86400000).toISOString(), portal_client_id: clientId, views: 95, likes: 32, engagement_rate: 2.8 },
    { subject: 'Nossos serviços de consultoria', tipo: 'o_que', published_at: new Date(Date.now() - 172800000).toISOString(), portal_client_id: clientId, views: 200, likes: 67, engagement_rate: 4.1 },
  ];

  const { error: postsErr } = await supabase
    .from('wanda_posts')
    .upsert(posts, { onConflict: 'id' });
  
  if (postsErr) {
    console.log('   ⚠️ Posts (pode já existir):', postsErr.message);
  } else {
    console.log('   ✅ 3 posts de exemplo criados');
  }

  // Tarefas de exemplo
  const tarefas = [
    { titulo: 'Revisar estratégia Q2', status: 'pendente', prioridade: 'alta', departamento: 'Marketing', portal_client_id: clientId, data_limite: new Date(Date.now() + 7 * 86400000).toISOString() },
    { titulo: 'Atualizar site institucional', status: 'em_andamento', prioridade: 'media', departamento: 'Desenvolvimento', portal_client_id: clientId, data_limite: new Date(Date.now() + 14 * 86400000).toISOString() },
  ];

  const { error: tarefasErr } = await supabase
    .from('tarefas')
    .upsert(tarefas, { onConflict: 'id' });
  
  if (tarefasErr) {
    console.log('   ⚠️ Tarefas (pode já existir):', tarefasErr.message);
  } else {
    console.log('   ✅ 2 tarefas de exemplo criadas');
  }

  // Projetos de exemplo
  const projetos = [
    { nome: 'Campanha Verão 2025', descricao: 'Campanha principal do verão', cor: '#ef4444', portal_client_id: clientId },
    { nome: 'Rebranding Institucional', descricao: 'Nova identidade visual', cor: '#3b82f6', portal_client_id: clientId },
  ];

  const { error: projetosErr } = await supabase
    .from('projetos')
    .upsert(projetos, { onConflict: 'id' });
  
  if (projetosErr) {
    console.log('   ⚠️ Projetos (pode já existir):', projetosErr.message);
  } else {
    console.log('   ✅ 2 projetos de exemplo criados');
  }

  console.log('\n🎉 Setup concluído com sucesso!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('   Master:   dev@grupototum.com / [senha via SETUP_DEV_PASSWORD]');
  console.log('   Cliente:  teste@grupototum.com / [senha via SETUP_CLIENT_PASSWORD]');
  console.log('\n🌐 Acesse: https://cliente.grupototum.com');
}

setup().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
