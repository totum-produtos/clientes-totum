# Diagnóstico Comercial: exemplo e instruções

A página `/app/inteligencia` lê a seção `diagnostico_comercial` dentro de
`portal_client_plans.content`, a mesma tabela e o mesmo mecanismo de rascunho
e publicação da Central de Planejamentos. Não existe tabela nova, endpoint
novo, nem RLS nova para isso.

## Como cadastrar um cliente

1. Entre como `master` em `/app/admin/planejamentos`.
2. Abra o plano do cliente, ou crie um novo.
3. No editor (`/app/admin/planejamentos/[id]/editar`), cole um JSON contendo
   a chave `diagnostico_comercial`, no formato abaixo. Pode conviver com as
   outras seções do plano (`bmad`, `plano_acao`, etc.) no mesmo objeto.
4. Clique em Validar. O validador (`src/lib/planejamento/schema.ts`) recusa
   campo fora do formato, com a mensagem exata do que está errado.
5. Salve e publique.

O dado real de cada cliente entra por aqui, nunca commitado no repositório.
O que segue abaixo é só um exemplo com números fictícios, para referência de
formato e para popular um ambiente de desenvolvimento.

## Exemplo, números fictícios

```json
{
  "diagnostico_comercial": {
    "data_analise": "2026-06-25",
    "status_comercial": "piloto",
    "perfil": {
      "timeSizeComercial": 2,
      "timeSizeOperacional": 3,
      "faturamentoAtual": "R$20k a R$30k",
      "metaFaturamento": "R$80k a R$100k",
      "ticketMedio": "R$1.200 a R$1.800",
      "modelo": "misto",
      "canaisEntrada": ["indicação", "WhatsApp", "Instagram", "tráfego pago"],
      "volumeLeadsMes": "50 a 150/mês",
      "crmAtual": "CRM interno + planilhas"
    },
    "spin": {
      "situacao": "Exemplo: informação distribuída entre várias ferramentas, sem integração central.",
      "problemas": [
        "Leads se perdem depois do primeiro contato",
        "Follow-up depende de memória"
      ],
      "implicacoes": [
        "Estimativa de 10 a 30 leads perdidos por mês"
      ],
      "necessidades": [
        "Pipeline único com etapas e responsáveis claros"
      ]
    },
    "scores": {
      "fitGeral": 80,
      "urgencia": 70,
      "potencialReceita": 75,
      "maturidadeDigital": 50
    },
    "produto_recomendado": {
      "entrada": "Site Essencial ou LP Pro",
      "precoEntrada": "R$987 a R$2.997",
      "upsell": "Plano Essencial Mensal",
      "precoUpsell": "R$2.497/mês",
      "justificativa": "Ciclo de venda curto, entrega clara, upsell imediato para recorrência."
    },
    "plano_semanal": [
      {
        "semana": 1,
        "titulo": "Centralizar pipeline",
        "acoes": ["Mapear etapas do pipeline comercial", "Migrar leads ativos"]
      },
      {
        "semana": 2,
        "titulo": "Qualificação estruturada",
        "acoes": ["Alinhar script de qualificação", "Medir entradas e travamentos"]
      }
    ],
    "metricas_comerciais": [
      { "nome": "Leads 100% no pipeline", "meta": "100%", "como": "Nenhum lead fora do CRM" },
      { "nome": "Tempo de proposta", "meta": "até 2h", "como": "Timestamp diagnóstico vs proposta" }
    ],
    "gaps": [
      "Motivos de perda de lead não são registrados sistematicamente"
    ],
    "observacoes": "Exemplo fictício, para referência de formato."
  }
}
```

## Campos e validação

Todos os campos de `diagnostico_comercial` são opcionais, exceto onde
indicado. A tela renderiza só o que existir e mostra um estado vazio por aba
quando faltar.

| Campo | Obrigatório se presente | Validação |
|:--|:--|:--|
| `status_comercial` | não | `"ativo"`, `"piloto"` ou `"prospecto"` |
| `scores.fitGeral`, `urgencia`, `potencialReceita`, `maturidadeDigital` | os quatro juntos, se `scores` existir | número entre 0 e 100 |
| `produto_recomendado.entrada` | sim, se `produto_recomendado` existir | texto não vazio |
| `plano_semanal[].semana` | sim, por item | número |
| `plano_semanal[].titulo` | sim, por item | texto não vazio |
| `plano_semanal[].acoes` | sim, por item | lista |
| `metricas_comerciais[].nome` | sim, por item | texto não vazio |
| `metricas_comerciais[].meta` | sim, por item | texto não vazio |
| `gaps` | não | lista |

Casos de teste em `src/lib/planejamento/schema.test.ts`.

## Onde a tela vive

`/app/inteligencia`, atrás do login e restrita a `role === 'master'`. É dado
de cozinha: faturamento, CAC, gaps internos. O cliente nunca vê essa tela.
