# SSO para zap.grupototum.com (painel Evolution API)

**Criado:** 2026-09-13
**Status:** implementado no app, pendente configuração de infra (Vercel + VPS)

## Problema

`zap.grupototum.com` fica atrás de um forward-auth do Traefik (`zap-auth-guard`).
Sem cookie válido, o guard redireciona para `https://cliente.grupototum.com/login`,
que não existia (404). O usuário precisava colar o token manualmente.

## Como funciona agora

```
Usuário → zap.grupototum.com
  ↓ (sem cookie zap_token)
Traefik → zap-auth-guard → 302 cliente.grupototum.com/login?redirect_to=https://zap.grupototum.com
  ↓
/login (src/app/login/page.tsx, server)
  ├─ com sessão Supabase → /api/auth/zap-token?redirect_to=…
  │     → valida role master → assina JWT HS256 → Set-Cookie zap_token → 302 zap.grupototum.com
  └─ sem sessão → /auth/login?redirect_to=…
        → login (email+senha / Google / magic link)
        → pós-login volta para /login?redirect_to=… → mesmo caminho acima
```

Nas próximas visitas o cookie já existe, o guard responde 200 e o painel abre direto.

## Arquivos

| Arquivo | Papel |
|---|---|
| `src/lib/zap-token.ts` | Geração do JWT, validação do `redirect_to`, atributos do cookie (puro, testável) |
| `src/lib/zap-token.test.ts` | Testes, inclusive uma réplica do `verifyJwt` do guard |
| `src/app/api/auth/zap-token/route.ts` | GET (browser: cookie + redirect) e POST (JSON) |
| `src/app/login/page.tsx` | Ponte: decide entre emitir token ou mandar para o login |
| `src/app/auth/login/page.tsx` | Passa `redirect_to` adiante no pós-login (3 pontos) |

## JWT e cookie

| Item | Valor |
|---|---|
| Algoritmo | HS256, segredo em `ZAP_JWT_SECRET` (igual ao `JWT_SECRET` do guard) |
| Payload | `{ sub: user_id, email, iat, exp: iat + 90 dias }` |
| Cookie | `zap_token`, `Domain=.grupototum.com`, `Path=/`, `Max-Age=7776000`, `Secure`, `SameSite=Lax`, `HttpOnly` |

`HttpOnly=true` é seguro aqui: o Traefik lê o header `Cookie`, que o browser envia
mesmo para cookies HttpOnly. Só JavaScript perde acesso, o que protege contra XSS.

## Quem recebe o token

Só usuários com role `master` em `user_roles` (equipe Totum). O painel do WhatsApp é
interno da agência; `admin` e `cliente` são usuários dos clientes e recebem 403.
Para ampliar, edite `ZAP_ALLOWED_ROLES` em `src/lib/zap-token.ts`.

## Validação do redirect_to

Aceito só `https://` com hostname igual a `grupototum.com` ou terminando em
`.grupototum.com`. Qualquer outra coisa cai em `https://zap.grupototum.com`.

## Configuração de infra (fora do repo)

1. **Vercel** → Environment Variables → `ZAP_JWT_SECRET` = mesmo valor do guard. Redeploy.
2. **VPS** `/opt/zap-auth/docker-compose.yml`:
   ```yaml
   - LOGIN_URL=https://cliente.grupototum.com/login?redirect_to=https://zap.grupototum.com
   ```
   depois `cd /opt/zap-auth && docker compose up -d --force-recreate`.
3. **Supabase Auth** → URL Configuration → confirmar que o padrão de redirect permite
   `https://cliente.grupototum.com/api/auth/callback?next=*` (o Google e o magic link
   agora carregam `next=/login?redirect_to=…` codificado).

## Limitações conhecidas

- Usuário com MFA (`/auth/2fa`) termina em `/app`, não no zap. Basta acessar
  `zap.grupototum.com` de novo: já logado, o `/login` emite o token na hora.
- O guard lê o **primeiro** cookie cujo valor começa com `eyJ`. Nenhum outro cookie
  em `.grupototum.com` deve ter esse prefixo, senão ele é validado no lugar do `zap_token`.
- Sem revogação: o token vale 90 dias mesmo após logout no portal. Para revogar,
  troque o `JWT_SECRET` do guard e o `ZAP_JWT_SECRET` na Vercel.

## Como testar

1. Logado como `master`, abrir `https://cliente.grupototum.com/login` → deve cair em `zap.grupototum.com` com o cookie `zap_token` setado.
2. Deslogado, abrir `https://zap.grupototum.com` → login → após logar, cair no zap.
3. Logado como `cliente`, abrir `/login` → volta para `/app?zap_error=forbidden`.
4. `/login?redirect_to=https://evil.com` → redireciona para `zap.grupototum.com`, nunca para o evil.
