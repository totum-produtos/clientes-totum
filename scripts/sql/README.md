# scripts/sql

Scripts SQL ad-hoc de inspeção e manutenção pontual (debug, amostragem,
correções manuais aplicadas uma vez). **Não** são migrations — o schema
versionado vive em `supabase/migrations/`.

Movidos da raiz do repositório em 2026-09-10 para reduzir ruído. Mantidos
por valor de referência; podem ser removidos quando não forem mais úteis.

| Prefixo | Uso |
|---------|-----|
| `check_*`, `inspect_*`, `investigate_*`, `list_*`, `count_*` | consultas de leitura para diagnóstico |
| `sample_*` | inserção de dados de exemplo |
| `link_user`, `update_*` | correções pontuais já aplicadas |
