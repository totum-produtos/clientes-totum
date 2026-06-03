"use client";

import React, { useRef } from "react";
import { Check, HelpCircle, Upload, X } from "lucide-react";
import {
  CANAIS_ATENDIMENTO,
  CANAIS_COMUNICACAO,
  CANAIS_VENDA,
  CLASSES_SOCIAIS,
  FATURAMENTOS,
  FormState,
  MESES,
  MODELOS_NEGOCIO,
  OBJETIVOS_MARKETING,
  Persona,
  RAMOS,
  SLAS,
  TAMANHOS,
} from "@/lib/cliente-form-constants";

type ToggleField =
  | "classe_social"
  | "canais_atendimento"
  | "dias_atendimento"
  | "meses_alta_faturamento"
  | "meses_baixa_faturamento"
  | "dias_fortes_semana"
  | "dias_fracos_semana"
  | "canais_comunicacao_possuidos"
  | "canais_vendas";

type Props = {
  step: number;
  form: FormState;
  editMode: boolean;
  isMaster?: boolean;
  update: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  toggleArray: (field: ToggleField, value: string) => void;
  addPersona: () => void;
  removePersona: (idx: number) => void;
  updatePersona: (idx: number, field: keyof Persona, value: string) => void;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
};

const isFilled = (value: unknown) => {
  if (Array.isArray(value)) return value.length > 0;
  return !(value === undefined || value === null || String(value).trim() === "");
};

const requiredByStep: Record<number, Array<[keyof FormState, string]>> = {
  1: [
    ["nome", "Nome da empresa"],
    ["cnpj", "CNPJ"],
    ["ramo_atuacao", "Ramo de atuação"],
    ["email_responsavel", "Email corporativo"],
    ["telefone", "Telefone"],
  ],
  2: [
    ["modelo_negocio", "Modelo de negócio"],
    ["diferencial_competitivo", "Diferencial frente aos concorrentes"],
    ["produto_mais_forte", "Produto ou serviço mais vendido"],
    ["ticket_medio_atual", "Ticket médio atual"],
  ],
  3: [
    ["maior_objetivo_mkt", "Maior objetivo com o marketing digital hoje"],
    ["principal_meta", "Principal meta"],
    ["meses_alta_faturamento", "Meses mais fortes do ano"],
  ],
  4: [
    ["abrangencia_geografica", "Regiões atendidas"],
    ["dores_principais", "Principais dúvidas e objeções"],
    ["base_dados_clientes", "Possui base de clientes ou leads?"],
  ],
  5: [
    ["concorrentes_referencia", "Principais concorrentes"],
    ["referencia_comunicacao", "Referência de comunicação"],
    ["canais_comunicacao_possuidos", "Canais atuais"],
    ["canal_maior_retorno", "Canal que gera mais resultado"],
  ],
  6: [
    ["processo_vendas_estruturado", "Como funciona o processo de vendas?"],
    ["crm_utilizado", "Utiliza CRM?"],
    ["equipe_vendas", "Quantas pessoas vendem?"],
    ["canais_vendas", "Canais utilizados para vender"],
  ],
  7: [["canais_atendimento", "Canais de atendimento"]],
};

export function validateStep(step: number, form: FormState): { ok: boolean; missing: string[] } {
  const missing = (requiredByStep[step] || [])
    .filter(([key]) => !isFilled(form[key]))
    .map(([, label]) => label);
  return { ok: missing.length === 0, missing };
}

export function ClienteFormSteps({
  step,
  form,
  editMode,
  update,
  toggleArray,
  setForm,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMaterialUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    if (!files.length) return;

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((current) => ({
          ...current,
          material_files: [...current.material_files, reader.result as string].slice(0, 5),
          material_file_names: [...current.material_file_names, file.name].slice(0, 5),
          enviar_materiais_depois: false,
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMaterial = (idx: number) => {
    setForm((current) => ({
      ...current,
      material_files: current.material_files.filter((_, i) => i !== idx),
      material_file_names: current.material_file_names.filter((_, i) => i !== idx),
    }));
  };

  if (step === 1) return (
    <StepShell>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Nome da empresa" required complete={isFilled(form.nome)}><input value={form.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Ex.: Grupo Totum" readOnly={!editMode} required /></Field>
        <Field label="CNPJ" required help="Pedimos o CNPJ para contratos, notas fiscais e identificação correta da empresa." complete={isFilled(form.cnpj)}><input value={form.cnpj} onChange={(e) => update("cnpj", e.target.value)} placeholder="Ex.: 12.345.678/0001-99" readOnly={!editMode} required /></Field>
      </div>
      <Field label="Ramo de atuação" required help="Selecione a categoria que mais se aproxima do seu negócio." complete={isFilled(form.ramo_atuacao)}>
        <OptionGrid values={RAMOS} selected={form.ramo_atuacao} disabled={!editMode} onSelect={(value) => update("ramo_atuacao", value)} />
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Nome do responsável" complete={isFilled(form.nome_responsavel)}><input value={form.nome_responsavel} onChange={(e) => update("nome_responsavel", e.target.value)} placeholder="Ex.: João Silva" readOnly={!editMode} /></Field>
        <Field label="Email corporativo" required complete={isFilled(form.email_responsavel)}><input type="email" value={form.email_responsavel} onChange={(e) => update("email_responsavel", e.target.value)} placeholder="Ex.: contato@empresa.com.br" readOnly={!editMode} required /></Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Telefone" required complete={isFilled(form.telefone)}><input value={form.telefone} onChange={(e) => update("telefone", e.target.value)} placeholder="Ex.: (33) 99999-9999" readOnly={!editMode} required /></Field>
        <Field label="Site" complete={isFilled(form.site)}><input value={form.site} onChange={(e) => update("site", e.target.value)} placeholder="Ex.: www.empresa.com.br" readOnly={!editMode} /></Field>
      </div>
    </StepShell>
  );

  if (step === 2) return (
    <StepShell>
      <Field label="O que sua empresa faz?" complete={isFilled(form.descricao_negocio)}><textarea value={form.descricao_negocio} onChange={(e) => update("descricao_negocio", e.target.value)} placeholder="Explique de forma simples quais produtos ou serviços você oferece." rows={3} readOnly={!editMode} /></Field>
      <Field label="Qual o modelo de negócio?" required help="Como sua empresa gera receita?" complete={isFilled(form.modelo_negocio)}>
        <OptionGrid values={MODELOS_NEGOCIO} selected={form.modelo_negocio} disabled={!editMode} onSelect={(value) => update("modelo_negocio", value)} />
      </Field>
      <Field label="Diferencial frente aos concorrentes" required complete={isFilled(form.diferencial_competitivo)}><textarea value={form.diferencial_competitivo} onChange={(e) => update("diferencial_competitivo", e.target.value)} placeholder="O que faz um cliente escolher sua empresa em vez da concorrência?" rows={3} readOnly={!editMode} required /></Field>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Field label="Produto ou serviço mais vendido" required complete={isFilled(form.produto_mais_forte)}><input value={form.produto_mais_forte} onChange={(e) => update("produto_mais_forte", e.target.value)} placeholder="Ex.: Clareamento dental" readOnly={!editMode} required /></Field>
        <Field label="Produto ou serviço que deseja vender mais" complete={isFilled(form.produto_desejado_forte)}><input value={form.produto_desejado_forte} onChange={(e) => update("produto_desejado_forte", e.target.value)} placeholder="Ex.: Consultoria Premium" readOnly={!editMode} /></Field>
        <Field label="Produto ou serviço com menor desempenho" complete={isFilled(form.produto_mais_fraco)}><input value={form.produto_mais_fraco} onChange={(e) => update("produto_mais_fraco", e.target.value)} placeholder="Ex.: Produto que vende pouco" readOnly={!editMode} /></Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Ticket médio atual" required complete={isFilled(form.ticket_medio_atual)}><input value={form.ticket_medio_atual} onChange={(e) => update("ticket_medio_atual", e.target.value)} placeholder="Ex.: R$ 350,00" readOnly={!editMode} required /></Field>
        <Field label="Ticket médio desejado" complete={isFilled(form.ticket_medio_ideal)}><input value={form.ticket_medio_ideal} onChange={(e) => update("ticket_medio_ideal", e.target.value)} placeholder="Ex.: R$ 700,00" readOnly={!editMode} /></Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Tamanho da empresa" complete={isFilled(form.tamanho_empresa)}>
          <OptionGrid values={TAMANHOS} selected={form.tamanho_empresa} disabled={!editMode} onSelect={(value) => update("tamanho_empresa", value)} />
        </Field>
        <Field label="Faturamento mensal" complete={isFilled(form.faturamento_mensal)}>
          <OptionGrid values={FATURAMENTOS} selected={form.faturamento_mensal} disabled={!editMode} onSelect={(value) => update("faturamento_mensal", value)} />
        </Field>
      </div>
    </StepShell>
  );

  if (step === 3) return (
    <StepShell>
      <Field label="Maior objetivo com o marketing digital hoje" required help="Escolha o resultado que mais deseja alcançar." complete={isFilled(form.maior_objetivo_mkt)}>
        <OptionGrid values={OBJETIVOS_MARKETING} selected={form.maior_objetivo_mkt} disabled={!editMode} onSelect={(value) => update("maior_objetivo_mkt", value)} />
      </Field>
      <Field label="Principal meta" required complete={isFilled(form.principal_meta)}><textarea value={form.principal_meta} onChange={(e) => update("principal_meta", e.target.value)} placeholder="Ex.: Dobrar o número de clientes em 12 meses" rows={2} readOnly={!editMode} required /></Field>
      <Field label="Como você mede essa meta?" complete={isFilled(form.meta_mensuravel)}><textarea value={form.meta_mensuravel} onChange={(e) => update("meta_mensuravel", e.target.value)} placeholder="Ex.: Número de vendas, faturamento, agendamentos" rows={2} readOnly={!editMode} /></Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Checklist label="Meses mais fortes do ano" required values={MESES} selected={form.meses_alta_faturamento} disabled={!editMode} onToggle={(v) => toggleArray("meses_alta_faturamento", v)} />
        <Checklist label="Meses mais fracos do ano" values={MESES} selected={form.meses_baixa_faturamento} disabled={!editMode} onToggle={(v) => toggleArray("meses_baixa_faturamento", v)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Melhor período do mês" complete={isFilled(form.periodo_forte_mes)}><input value={form.periodo_forte_mes} onChange={(e) => update("periodo_forte_mes", e.target.value)} placeholder="Ex.: Dias próximos ao pagamento" readOnly={!editMode} /></Field>
        <Field label="Pior período do mês" complete={isFilled(form.periodo_fraco_mes)}><input value={form.periodo_fraco_mes} onChange={(e) => update("periodo_fraco_mes", e.target.value)} placeholder="Ex.: Última semana do mês" readOnly={!editMode} /></Field>
      </div>
    </StepShell>
  );

  if (step === 4) return (
    <StepShell>
      <Field label="Regiões atendidas" required complete={isFilled(form.abrangencia_geografica)}><input value={form.abrangencia_geografica} onChange={(e) => update("abrangencia_geografica", e.target.value)} placeholder="Ex.: Governador Valadares, Ipatinga e região" readOnly={!editMode} required /></Field>
      <Field label="Cliente ideal" complete={isFilled(form.cliente_ideal)}><textarea value={form.cliente_ideal} onChange={(e) => update("cliente_ideal", e.target.value)} placeholder="Descreva o tipo de cliente que você mais gosta de atender." rows={3} readOnly={!editMode} /></Field>
      <Field label="Principais dúvidas e objeções" required complete={isFilled(form.dores_principais)}><textarea value={form.dores_principais} onChange={(e) => update("dores_principais", e.target.value)} placeholder="Ex.: Preço, prazo, confiança, garantia" rows={3} readOnly={!editMode} required /></Field>
      <Field label="Possui base de clientes ou leads?" required complete={isFilled(form.base_dados_clientes)}>
        <OptionGrid values={["Sim", "Não"]} selected={form.base_dados_clientes} disabled={!editMode} onSelect={(value) => update("base_dados_clientes", value)} />
      </Field>
      <Checklist label="Classe social predominante" values={CLASSES_SOCIAIS} selected={form.classe_social} disabled={!editMode} onToggle={(v) => toggleArray("classe_social", v)} />
    </StepShell>
  );

  if (step === 5) return (
    <StepShell>
      <Field label="Principais concorrentes" required complete={isFilled(form.concorrentes_referencia)}><textarea value={form.concorrentes_referencia} onChange={(e) => update("concorrentes_referencia", e.target.value)} placeholder="Informe empresas que disputam clientes com você." rows={3} readOnly={!editMode} required /></Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Concorrente mais forte" complete={isFilled(form.concorrente_mais_forte)}><textarea value={form.concorrente_mais_forte} onChange={(e) => update("concorrente_mais_forte", e.target.value)} placeholder="Qual concorrente você considera mais difícil de enfrentar?" rows={3} readOnly={!editMode} /></Field>
        <Field label="Onde você perde para os concorrentes?" complete={isFilled(form.pontos_fracos_concorrencia)}><textarea value={form.pontos_fracos_concorrencia} onChange={(e) => update("pontos_fracos_concorrencia", e.target.value)} placeholder="Ex.: Preço, estrutura, marca, localização" rows={3} readOnly={!editMode} /></Field>
      </div>
      <Field label="Referência de comunicação" required complete={isFilled(form.referencia_comunicacao)}><input value={form.referencia_comunicacao} onChange={(e) => update("referencia_comunicacao", e.target.value)} placeholder="Empresas que você admira pela comunicação." readOnly={!editMode} required /></Field>
      <Field label="Como você enxerga seu mercado?" complete={isFilled(form.visao_mercado)}><input value={form.visao_mercado} onChange={(e) => update("visao_mercado", e.target.value)} placeholder="Ex.: Muito competitivo, em crescimento, pouco explorado" readOnly={!editMode} /></Field>
      <Checklist label="Canais atuais" required values={CANAIS_COMUNICACAO} selected={form.canais_comunicacao_possuidos} disabled={!editMode} onToggle={(v) => toggleArray("canais_comunicacao_possuidos", v)} />
      <Field label="Canal que gera mais resultado" required complete={isFilled(form.canal_maior_retorno)}><input value={form.canal_maior_retorno} onChange={(e) => update("canal_maior_retorno", e.target.value)} placeholder="Ex.: Instagram" readOnly={!editMode} required /></Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Ações de marketing que deram certo" complete={isFilled(form.acoes_passadas)}><textarea value={form.acoes_passadas} onChange={(e) => update("acoes_passadas", e.target.value)} placeholder="Ex.: Campanha de indicação, tráfego pago" rows={2} readOnly={!editMode} /></Field>
        <Field label="Já trabalhou com agência?" complete={isFilled(form.trabalhou_agencia)}>
          <OptionGrid values={["Sim", "Não"]} selected={form.trabalhou_agencia} disabled={!editMode} onSelect={(value) => update("trabalhou_agencia", value)} />
        </Field>
      </div>
    </StepShell>
  );

  if (step === 6) return (
    <StepShell>
      <Field label="Como funciona o processo de vendas?" required complete={isFilled(form.processo_vendas_estruturado)}><textarea value={form.processo_vendas_estruturado} onChange={(e) => update("processo_vendas_estruturado", e.target.value)} placeholder="Explique o caminho desde o primeiro contato até o fechamento." rows={3} readOnly={!editMode} required /></Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Utiliza CRM?" required complete={isFilled(form.crm_utilizado)}>
          <OptionGrid values={["Sim", "Não", "Não sei"]} selected={form.crm_utilizado} disabled={!editMode} onSelect={(value) => update("crm_utilizado", value)} />
        </Field>
        <Field label="Quantas pessoas vendem?" required complete={isFilled(form.equipe_vendas)}><input value={form.equipe_vendas} onChange={(e) => update("equipe_vendas", e.target.value)} placeholder="Ex.: 1 vendedor, 3 consultores" readOnly={!editMode} required /></Field>
      </div>
      <Field label="Existe funil de vendas?" complete={isFilled(form.funil_vendas_conversao)}><textarea value={form.funil_vendas_conversao} onChange={(e) => update("funil_vendas_conversao", e.target.value)} placeholder="Explique rapidamente." rows={2} readOnly={!editMode} /></Field>
      <Checklist label="Canais utilizados para vender" required values={CANAIS_VENDA} selected={form.canais_vendas} disabled={!editMode} onToggle={(v) => toggleArray("canais_vendas", v)} />
      <Field label="CAC" complete={isFilled(form.custo_aquisicao_cac)}><input value={form.custo_aquisicao_cac} onChange={(e) => update("custo_aquisicao_cac", e.target.value)} placeholder="Se souber, informe quanto custa adquirir um cliente." readOnly={!editMode} /></Field>
    </StepShell>
  );

  if (step === 7) return (
    <StepShell>
      <Checklist label="Canais de atendimento" required values={CANAIS_ATENDIMENTO} selected={form.canais_atendimento} disabled={!editMode} onToggle={(v) => toggleArray("canais_atendimento", v)} />
      <Field label="SLA de resposta" complete={isFilled(form.sla_resposta)}>
        <OptionGrid values={SLAS} selected={form.sla_resposta} disabled={!editMode} onSelect={(value) => update("sla_resposta", value)} />
      </Field>
      <Field label="Observações adicionais" complete={isFilled(form.informacoes_adicionais)}><textarea value={form.informacoes_adicionais} onChange={(e) => update("informacoes_adicionais", e.target.value)} placeholder="Informações que considera importantes para a equipe Totum." rows={3} readOnly={!editMode} /></Field>

      <div className="totum-upload">
        <div>
          <p className="text-lg font-light text-white">Identidade Visual e Materiais de Marketing</p>
          <p className="mt-2 text-sm text-white-soft">Envie logos, apresentações, fotos ou materiais que ajudem a Totum a personalizar sua estratégia. Isso não bloqueia a finalização.</p>
        </div>
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,application/pdf" multiple onChange={handleMaterialUpload} className="hidden" disabled={!editMode} />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="totum-dropzone">
          <Upload className="h-8 w-8 text-rausch" />
          <span>Arraste seus arquivos aqui ou clique para selecionar</span>
          <small>Até 5 arquivos, 10MB cada. PNG, JPG ou PDF.</small>
        </button>
        {form.material_file_names.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {form.material_file_names.map((name, idx) => (
              <div key={`${name}-${idx}`} className="flex items-center justify-between gap-3 rounded-md border border-border-strong bg-navy-elevated px-3 py-2 text-sm text-white-soft">
                <span className="truncate">{name}</span>
                <button type="button" onClick={() => removeMaterial(idx)} className="text-danger hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="flex items-start gap-3 text-sm text-white-soft">
          <input
            type="checkbox"
            checked={form.enviar_materiais_depois}
            onChange={(e) => update("enviar_materiais_depois", e.target.checked)}
            className="mt-1 h-4 w-4 accent-rausch"
          />
          <span>
            Prefiro enviar esses materiais posteriormente.
            {form.enviar_materiais_depois && <em className="mt-1 block text-xs not-italic text-muted-soft">Tudo bem. Enviaremos um lembrete por email e sua estratégia será parcialmente personalizada até lá.</em>}
          </span>
        </label>
      </div>
    </StepShell>
  );

  return null;
}

function StepShell({ children }: { children: React.ReactNode }) {
  return <div className="typeform-question-stack">{children}</div>;
}

function Field({
  label,
  required,
  help,
  complete,
  children,
}: {
  label: string;
  required?: boolean;
  help?: string;
  complete?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="typeform-question">
      <label className="totum-label">
        <span>{label} {required && <b>*</b>}</span>
        <span className="flex items-center gap-2">
          {help && (
            <span className="group relative inline-flex">
              <HelpCircle className="h-4 w-4 text-muted-soft" />
              <span className="pointer-events-none absolute right-0 top-6 z-20 hidden w-64 rounded-md border border-border-strong bg-navy-card p-3 text-xs normal-case tracking-normal text-white-soft shadow-brand group-hover:block">
                {help}
              </span>
            </span>
          )}
          {complete && <Check className="h-4 w-4 text-success" />}
        </span>
      </label>
      {children}
    </section>
  );
}

function OptionGrid({
  values,
  selected,
  disabled,
  onSelect,
}: {
  values: string[];
  selected: string;
  disabled?: boolean;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="typeform-option-grid">
      {values.map((value, idx) => {
        const active = selected === value;
        return (
          <button
            key={value}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(value)}
            className={`typeform-option ${active ? "is-active" : ""}`}
          >
            <span className="typeform-option-key">{String.fromCharCode(65 + (idx % 26))}</span>
            <span>{value}</span>
            {active && <Check className="ml-auto h-4 w-4 text-success" />}
          </button>
        );
      })}
    </div>
  );
}

function Checklist({
  label,
  required,
  values,
  selected,
  disabled,
  onToggle,
}: {
  label: string;
  required?: boolean;
  values: string[];
  selected: string[];
  disabled?: boolean;
  onToggle: (value: string) => void;
}) {
  return (
    <section className="typeform-question">
      <label className="totum-label">
        <span>{label} {required && <b>*</b>}</span>
        {selected.length > 0 && <Check className="h-4 w-4 text-success" />}
      </label>
      <div className="typeform-option-grid">
        {values.map((value) => {
          const active = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(value)}
              className={`typeform-option ${active ? "is-active" : ""}`}
            >
              <span className="typeform-option-key">{active ? "✓" : "+"}</span>
              {value}
            </button>
          );
        })}
      </div>
    </section>
  );
}
