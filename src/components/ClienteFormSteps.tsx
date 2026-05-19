"use client";
import React, { useRef } from "react";
import { AlertCircle, Check, Plus, Trash2, Upload, X } from "lucide-react";
import {
  CANAIS, CLASSES_SOCIAIS, DIAS, FATURAMENTOS, FormState,
  Persona, RAMOS, SLAS, TAMANHOS, TONS_VOZ, FINALIDADES, MESES, SEMANAS, VISIOES_MERCADO
} from "@/lib/cliente-form-constants";

type Props = {
  step: number;
  form: FormState;
  editMode: boolean;
  update: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  toggleArray: (field: "classe_social" | "canais_atendimento" | "dias_atendimento" | "meses_alta_faturamento" | "meses_baixa_faturamento" | "dias_fortes_semana" | "dias_fracos_semana" | "canais_comunicacao_possuidos" | "canais_vendas", value: string) => void;
  addPersona: () => void;
  removePersona: (idx: number) => void;
  updatePersona: (idx: number, field: keyof Persona, value: string) => void;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
};

export function ClienteFormSteps({
  step, form, editMode, update, toggleArray, addPersona, removePersona, updatePersona, setForm,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(f => ({ ...f, key_visual_images: [...f.key_visual_images, reader.result as string] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    setForm(f => ({ ...f, key_visual_images: f.key_visual_images.filter((_, i) => i !== idx) }));
  };

  // STEP 1 - Informações da Empresa
  if (step === 1) return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Nome da empresa" editMode={editMode} required><input value={form.nome} onChange={e => update("nome", e.target.value)} placeholder="Ex: Totum Digital" className="input-field" readOnly={!editMode} required /></Field>
        <Field label="CNPJ" editMode={editMode} required><input value={form.cnpj} onChange={e => update("cnpj", e.target.value)} placeholder="00.000.000/0000-00" className="input-field" readOnly={!editMode} required /></Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Ramo de atuação" editMode={editMode} required>
          <select value={form.ramo_atuacao} onChange={e => update("ramo_atuacao", e.target.value)} className="input-field" disabled={!editMode} required>
            <option value="">Selecione</option>{RAMOS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Nome do responsável" editMode={editMode}><input value={form.nome_responsavel} onChange={e => update("nome_responsavel", e.target.value)} placeholder="Nome completo" className="input-field" readOnly={!editMode} /></Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Email corporativo" editMode={editMode} required><input type="email" value={form.email_responsavel} onChange={e => update("email_responsavel", e.target.value)} placeholder="email@empresa.com" className="input-field" readOnly={!editMode} required /></Field>
        <Field label="Telefone" editMode={editMode} required><input value={form.telefone} onChange={e => update("telefone", e.target.value)} placeholder="(00) 00000-0000" className="input-field" readOnly={!editMode} required /></Field>
      </div>
      <Field label="Site" editMode={editMode}><input value={form.site} onChange={e => update("site", e.target.value)} placeholder="https://www.empresa.com" className="input-field" readOnly={!editMode} /></Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t pt-5">
        <Field label="Como chegou até a gente" editMode={editMode}><input value={form.como_chegou} onChange={e => update("como_chegou", e.target.value)} placeholder="Ex: Indicação" className="input-field" readOnly={!editMode} /></Field>
        <Field label="Finalidade do briefing" editMode={editMode} required>
          <select value={form.finalidade_briefing} onChange={e => update("finalidade_briefing", e.target.value)} className="input-field" disabled={!editMode} required>
            <option value="">Selecione</option>{FINALIDADES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
      </div>
    </div>
  );

  // STEP 2 - Sobre o Negócio
  if (step === 2) return (
    <div className="space-y-5">
      <Field label="O que a empresa faz? (Descrição)" editMode={editMode}><textarea value={form.descricao_negocio} onChange={e => update("descricao_negocio", e.target.value)} placeholder="Descreva o negócio" rows={3} className="input-field resize-none" readOnly={!editMode} /></Field>
      <Field label="Qual o modelo de negócio?" editMode={editMode}><textarea value={form.modelo_negocio} onChange={e => update("modelo_negocio", e.target.value)} placeholder="B2B, B2C, Franquia..." rows={2} className="input-field resize-none" readOnly={!editMode} /></Field>
      <Field label="Diferencial frente aos concorrentes" editMode={editMode}><textarea value={form.diferencial_competitivo} onChange={e => update("diferencial_competitivo", e.target.value)} rows={2} className="input-field resize-none" readOnly={!editMode} /></Field>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t pt-5">
        <Field label="Produto mais forte" editMode={editMode}><input value={form.produto_mais_forte} onChange={e => update("produto_mais_forte", e.target.value)} className="input-field" readOnly={!editMode} /></Field>
        <Field label="Produto desejado forte" editMode={editMode}><input value={form.produto_desejado_forte} onChange={e => update("produto_desejado_forte", e.target.value)} className="input-field" readOnly={!editMode} /></Field>
        <Field label="Produto mais fraco" editMode={editMode}><input value={form.produto_mais_fraco} onChange={e => update("produto_mais_fraco", e.target.value)} className="input-field" readOnly={!editMode} /></Field>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t pt-5">
        <Field label="Ticket médio Atual" editMode={editMode}><input value={form.ticket_medio_atual} onChange={e => update("ticket_medio_atual", e.target.value)} placeholder="Ex: R$ 5.000" className="input-field" readOnly={!editMode} /></Field>
        <Field label="Ticket médio Ideal" editMode={editMode}><input value={form.ticket_medio_ideal} onChange={e => update("ticket_medio_ideal", e.target.value)} placeholder="Ex: R$ 8.000" className="input-field" readOnly={!editMode} /></Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t pt-5">
        <Field label="Tamanho da empresa" editMode={editMode}>
          <select value={form.tamanho_empresa} onChange={e => update("tamanho_empresa", e.target.value)} className="input-field" disabled={!editMode}>
            <option value="">Selecione</option>{TAMANHOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Faturamento mensal" editMode={editMode}>
          <select value={form.faturamento_mensal} onChange={e => update("faturamento_mensal", e.target.value)} className="input-field" disabled={!editMode}>
            <option value="">Selecione</option>{FATURAMENTOS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
      </div>
    </div>
  );

  // STEP 3 - Objetivos e Sazonalidade
  if (step === 3) return (
    <div className="space-y-5">
      <h3 className="font-medium text-ink">Objetivos e Metas</h3>
      <Field label="Maior objetivo com o marketing digital hoje" editMode={editMode}><textarea value={form.maior_objetivo_mkt} onChange={e => update("maior_objetivo_mkt", e.target.value)} rows={2} className="input-field resize-none" readOnly={!editMode} /></Field>
      <Field label="Principal meta" editMode={editMode}><textarea value={form.principal_meta} onChange={e => update("principal_meta", e.target.value)} rows={2} className="input-field resize-none" readOnly={!editMode} /></Field>
      <Field label="É possível mensurar a meta? Como?" editMode={editMode}><textarea value={form.meta_mensuravel} onChange={e => update("meta_mensuravel", e.target.value)} rows={2} className="input-field resize-none" readOnly={!editMode} /></Field>

      <div className="border-t pt-5 mt-5">
        <h3 className="font-medium text-ink mb-4">Sazonalidade</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Meses de aumento de faturamento" editMode={editMode}>
            <div className="flex flex-wrap gap-2">
              {MESES.map(c => (
                <button key={c} type="button" onClick={() => editMode && toggleArray("meses_alta_faturamento", c)} className={`px-2 py-1 rounded text-xs font-medium transition-all ${form.meses_alta_faturamento?.includes(c) ? "bg-rausch text-white shadow" : "bg-surface-strong text-body"}`}>{c}</button>
              ))}
            </div>
          </Field>
          <Field label="Meses de baixa de faturamento" editMode={editMode}>
            <div className="flex flex-wrap gap-2">
              {MESES.map(c => (
                <button key={c} type="button" onClick={() => editMode && toggleArray("meses_baixa_faturamento", c)} className={`px-2 py-1 rounded text-xs font-medium transition-all ${form.meses_baixa_faturamento?.includes(c) ? "bg-rausch text-white shadow" : "bg-surface-strong text-body"}`}>{c}</button>
              ))}
            </div>
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <Field label="Período mais forte do mês" editMode={editMode}>
            <select value={form.periodo_forte_mes} onChange={e => update("periodo_forte_mes", e.target.value)} className="input-field" disabled={!editMode}>
              <option value="">Selecione</option>{SEMANAS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Período mais fraco do mês" editMode={editMode}>
            <select value={form.periodo_fraco_mes} onChange={e => update("periodo_fraco_mes", e.target.value)} className="input-field" disabled={!editMode}>
              <option value="">Selecione</option>{SEMANAS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <Field label="Dias mais fortes da semana" editMode={editMode}>
            <div className="flex flex-wrap gap-2">
              {DIAS.map(c => (
                <button key={c} type="button" onClick={() => editMode && toggleArray("dias_fortes_semana", c)} className={`px-2 py-1 rounded text-xs font-medium transition-all ${form.dias_fortes_semana?.includes(c) ? "bg-rausch text-white shadow" : "bg-surface-strong text-body"}`}>{c}</button>
              ))}
            </div>
          </Field>
          <Field label="Dias mais fracos da semana" editMode={editMode}>
            <div className="flex flex-wrap gap-2">
              {DIAS.map(c => (
                <button key={c} type="button" onClick={() => editMode && toggleArray("dias_fracos_semana", c)} className={`px-2 py-1 rounded text-xs font-medium transition-all ${form.dias_fracos_semana?.includes(c) ? "bg-rausch text-white shadow" : "bg-surface-strong text-body"}`}>{c}</button>
              ))}
            </div>
          </Field>
        </div>
      </div>
    </div>
  );

  // STEP 4 - Público-Alvo
  if (step === 4) return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Field label="Homens (%)" editMode={editMode}><input value={form.porcentagem_homens} onChange={e => update("porcentagem_homens", e.target.value)} className="input-field" readOnly={!editMode} /></Field>
        <Field label="Mulheres (%)" editMode={editMode}><input value={form.porcentagem_mulheres} onChange={e => update("porcentagem_mulheres", e.target.value)} className="input-field" readOnly={!editMode} /></Field>
        <Field label="Abrangência geográfica" editMode={editMode}><input value={form.abrangencia_geografica} onChange={e => update("abrangencia_geografica", e.target.value)} className="input-field" readOnly={!editMode} /></Field>
      </div>
      <Field label="Cliente ideal na carteira (Como ele é?)" editMode={editMode}><textarea value={form.cliente_ideal} onChange={e => update("cliente_ideal", e.target.value)} rows={3} className="input-field resize-none" readOnly={!editMode} /></Field>
      <Field label="Principais dúvidas e dores ao contatar a empresa" editMode={editMode}><textarea value={form.dores_principais} onChange={e => update("dores_principais", e.target.value)} rows={3} className="input-field resize-none" readOnly={!editMode} /></Field>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t pt-5">
        <Field label="Existe uma base de dados destes clientes?" editMode={editMode}>
          <select value={form.base_dados_clientes} onChange={e => update("base_dados_clientes", e.target.value)} className="input-field" disabled={!editMode}>
            <option value="">Selecione</option>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
          </select>
        </Field>
        <Field label="Tamanho da base" editMode={editMode}><input value={form.tamanho_base} onChange={e => update("tamanho_base", e.target.value)} className="input-field" readOnly={!editMode} /></Field>
      </div>
      <div className="pt-5 border-t">
        <Field label="Classe social (Renda média)" editMode={editMode}>
          <div className="flex flex-wrap gap-2">
            {CLASSES_SOCIAIS.map(c => (
              <button key={c} type="button" onClick={() => editMode && toggleArray("classe_social", c)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${form.classe_social.includes(c) ? "bg-rausch text-white shadow" : "bg-surface-strong text-body"}`}>{c}</button>
            ))}
          </div>
        </Field>
      </div>
    </div>
  );

  // STEP 5 - Concorrência e Comunicação
  if (step === 5) return (
    <div className="space-y-5">
      <h3 className="font-medium text-ink">Concorrência</h3>
      <Field label="Principais concorrentes" editMode={editMode}><textarea value={form.concorrentes_referencia} onChange={e => update("concorrentes_referencia", e.target.value)} rows={2} className="input-field resize-none" readOnly={!editMode} /></Field>
      <Field label="Qual concorrente é o mais forte? Por quê?" editMode={editMode}><textarea value={form.concorrente_mais_forte} onChange={e => update("concorrente_mais_forte", e.target.value)} rows={2} className="input-field resize-none" readOnly={!editMode} /></Field>
      <Field label="Referência de comunicação bacana" editMode={editMode}><textarea value={form.referencia_comunicacao} onChange={e => update("referencia_comunicacao", e.target.value)} rows={2} className="input-field resize-none" readOnly={!editMode} /></Field>
      <Field label="Onde seus produtos/serviços perdem dos concorrentes?" editMode={editMode}><textarea value={form.pontos_fracos_concorrencia} onChange={e => update("pontos_fracos_concorrencia", e.target.value)} rows={2} className="input-field resize-none" readOnly={!editMode} /></Field>
      <Field label="Como você enxerga o mercado" editMode={editMode}>
        <select value={form.visao_mercado} onChange={e => update("visao_mercado", e.target.value)} className="input-field" disabled={!editMode}>
          <option value="">Selecione</option>{VISIOES_MERCADO.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>

      <div className="border-t pt-5 mt-5 space-y-5">
        <h3 className="font-medium text-ink">Comunicação e Marketing</h3>
        <Field label="Canais de comunicação que já possui" editMode={editMode}>
          <div className="flex flex-wrap gap-2">
            {CANAIS.map(c => (
              <button key={c} type="button" onClick={() => editMode && toggleArray("canais_comunicacao_possuidos", c)} className={`px-2 py-1 rounded text-xs font-medium transition-all ${form.canais_comunicacao_possuidos?.includes(c) ? "bg-rausch text-white shadow" : "bg-surface-strong text-body"}`}>{c}</button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Qual canal dá mais retorno?" editMode={editMode}><input value={form.canal_maior_retorno} onChange={e => update("canal_maior_retorno", e.target.value)} className="input-field" readOnly={!editMode} /></Field>
          <Field label="Canais preferência de contato" editMode={editMode}><input value={form.canais_preferencia_contato} onChange={e => update("canais_preferencia_contato", e.target.value)} className="input-field" readOnly={!editMode} /></Field>
        </div>
        <Field label="Estes canais são monitorados e atualizados?" editMode={editMode}><textarea value={form.monitoramento_canais} onChange={e => update("monitoramento_canais", e.target.value)} rows={2} className="input-field resize-none" readOnly={!editMode} /></Field>
        <Field label="Ações de marketing efetivas no passado" editMode={editMode}><textarea value={form.acoes_passadas} onChange={e => update("acoes_passadas", e.target.value)} rows={2} className="input-field resize-none" readOnly={!editMode} /></Field>
        <Field label="Já existiu plano de marketing na empresa?" editMode={editMode}><textarea value={form.plano_marketing_existente} onChange={e => update("plano_marketing_existente", e.target.value)} rows={2} className="input-field resize-none" readOnly={!editMode} /></Field>
        <Field label="A empresa já trabalhou com agência? Como foi?" editMode={editMode}><textarea value={form.trabalhou_agencia} onChange={e => update("trabalhou_agencia", e.target.value)} rows={2} className="input-field resize-none" readOnly={!editMode} /></Field>
        <Field label="Equipe ou colaborador dedicado ao marketing?" editMode={editMode}><textarea value={form.equipe_marketing} onChange={e => update("equipe_marketing", e.target.value)} rows={2} className="input-field resize-none" readOnly={!editMode} /></Field>
      </div>
    </div>
  );

  // STEP 6 - Processo de Vendas
  if (step === 6) return (
    <div className="space-y-5">
      <Field label="Como é o processo de vendas? É estruturado?" editMode={editMode}><textarea value={form.processo_vendas_estruturado} onChange={e => update("processo_vendas_estruturado", e.target.value)} rows={3} className="input-field resize-none" readOnly={!editMode} /></Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Utiliza CRM para vendas?" editMode={editMode}><input value={form.crm_utilizado} onChange={e => update("crm_utilizado", e.target.value)} className="input-field" readOnly={!editMode} /></Field>
        <Field label="Pessoas dedicadas à venda (quantas)?" editMode={editMode}><input value={form.equipe_vendas} onChange={e => update("equipe_vendas", e.target.value)} className="input-field" readOnly={!editMode} /></Field>
      </div>
      <Field label="Existe funil desenhado? Porcentagem de conversão?" editMode={editMode}><textarea value={form.funil_vendas_conversao} onChange={e => update("funil_vendas_conversao", e.target.value)} rows={2} className="input-field resize-none" readOnly={!editMode} /></Field>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Canais utilizados para vender" editMode={editMode}>
          <div className="flex flex-wrap gap-2">
            {CANAIS.map(c => (
              <button key={c} type="button" onClick={() => editMode && toggleArray("canais_vendas", c)} className={`px-2 py-1 rounded text-xs font-medium transition-all ${form.canais_vendas?.includes(c) ? "bg-rausch text-white shadow" : "bg-surface-strong text-body"}`}>{c}</button>
            ))}
          </div>
        </Field>
        <Field label="Custo de aquisição de clientes (CAC)" editMode={editMode}><input value={form.custo_aquisicao_cac} onChange={e => update("custo_aquisicao_cac", e.target.value)} className="input-field" readOnly={!editMode} /></Field>
      </div>
    </div>
  );

  // STEP 7 - Identidade Visual
  if (step === 7) return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Cor primária" editMode={editMode}>
          <div className="flex items-center gap-3">
            <input type="color" value={form.cor_primaria} onChange={e => update("cor_primaria", e.target.value)} className="w-12 h-12 rounded-none border cursor-pointer" disabled={!editMode} />
            <input value={form.cor_primaria} onChange={e => update("cor_primaria", e.target.value)} className="input-field font-mono uppercase" readOnly={!editMode} />
          </div>
        </Field>
        <Field label="Cor secundária" editMode={editMode}>
          <div className="flex items-center gap-3">
            <input type="color" value={form.cor_secundaria} onChange={e => update("cor_secundaria", e.target.value)} className="w-12 h-12 rounded-none border cursor-pointer" disabled={!editMode} />
            <input value={form.cor_secundaria} onChange={e => update("cor_secundaria", e.target.value)} className="input-field font-mono uppercase" readOnly={!editMode} />
          </div>
        </Field>
      </div>
      <Field label="Fontes utilizadas" editMode={editMode}><input value={form.fontes} onChange={e => update("fontes", e.target.value)} placeholder="Ex: Inter, Montserrat" className="input-field" readOnly={!editMode} /></Field>
      <div className="bg-warning-bg border border-warning-bg rounded-md p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-warning-text shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-warning-text">Faça o upload dos arquivos na página &quot;Arquivos do Cliente&quot;</p>
          <p className="text-xs text-warning-text mt-1">Envie o logo e materiais de comunicação/marketing na aba &quot;Arquivos do Cliente&quot;.</p>
        </div>
      </div>
      <Field label="Key visual / Elementos gráficos" editMode={editMode}>
        <textarea value={form.key_visual_desc} onChange={e => update("key_visual_desc", e.target.value)} placeholder="Descreva os elementos visuais principais" rows={3} className="input-field resize-none" readOnly={!editMode} />
      </Field>
      <div>
        <label className="block text-sm font-medium text-ink mb-2">Imagens do Key Visual</label>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={!editMode} />
        {editMode && (
          <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-hairline rounded-md text-sm text-muted hover:border-rausch hover:text-rausch transition-colors w-full justify-center">
            <Upload className="w-4 h-4" /> Clique para fazer upload de imagens
          </button>
        )}
        {form.key_visual_images.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {form.key_visual_images.map((img, i) => (
              <div key={i} className="relative w-24 h-24 rounded-md overflow-hidden border group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`key visual ${i}`} className="w-full h-full object-cover" />
                {editMode && (
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-danger text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Field label="Personalidade visual" editMode={editMode}><textarea value={form.personalidade_visual} onChange={e => update("personalidade_visual", e.target.value)} placeholder="Como a marca deve ser percebida visualmente?" rows={3} className="input-field resize-none" readOnly={!editMode} /></Field>
    </div>
  );

  // STEP 8 - Operação e Contatos
  if (step === 8) return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-ink mb-2">Canais de atendimento (suporte/operação)</label>
        <div className="flex flex-wrap gap-2">{CANAIS.map(c => (
          <button key={c} type="button" onClick={() => editMode && toggleArray("canais_atendimento", c)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${form.canais_atendimento.includes(c) ? "bg-rausch text-white shadow" : "bg-surface-strong text-body"}`}>{c}</button>
        ))}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="SLA de resposta" editMode={editMode}>
          <select value={form.sla_resposta} onChange={e => update("sla_resposta", e.target.value)} className="input-field" disabled={!editMode}>
            <option value="">Selecione</option>{SLAS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Horário início" editMode={editMode}><input type="time" value={form.horario_inicio} onChange={e => update("horario_inicio", e.target.value)} className="input-field" readOnly={!editMode} /></Field>
        <Field label="Horário fim" editMode={editMode}><input type="time" value={form.horario_fim} onChange={e => update("horario_fim", e.target.value)} className="input-field" readOnly={!editMode} /></Field>
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-2">Dias de atendimento</label>
        <div className="flex flex-wrap gap-2">{DIAS.map(d => (
          <button key={d} type="button" onClick={() => editMode && toggleArray("dias_atendimento", d)} className={`w-12 h-12 rounded-md text-sm font-medium transition-all ${form.dias_atendimento.includes(d) ? "bg-rausch text-white shadow" : "bg-surface-strong text-body"}`}>{d}</button>
        ))}</div>
      </div>
      <Field label="Observações Adicionais" editMode={editMode}><textarea value={form.informacoes_adicionais} onChange={e => update("informacoes_adicionais", e.target.value)} placeholder="Algo mais que devamos saber?" rows={3} className="input-field resize-none" readOnly={!editMode} /></Field>
    </div>
  );

  // STEP 9 - Persona
  if (step === 9) return (
    <div className="space-y-6">
      {form.personas.map((persona, idx) => (
        <div key={idx} className="border rounded-md p-5 space-y-4 relative">
          {form.personas.length > 1 && editMode && (
            <button type="button" onClick={() => removePersona(idx)} className="absolute top-3 right-3 p-1.5 text-danger-text hover:bg-danger-bg rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <h4 className="text-sm font-semibold text-ink">Persona {idx + 1}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome" editMode={editMode}><input value={persona.nome} onChange={e => updatePersona(idx, "nome", e.target.value)} placeholder="Ex: Ana, a empresária" className="input-field" readOnly={!editMode} /></Field>
            <Field label="Idade" editMode={editMode}><input value={persona.idade} onChange={e => updatePersona(idx, "idade", e.target.value)} placeholder="Ex: 32 anos" className="input-field" readOnly={!editMode} /></Field>
          </div>
          <Field label="Ocupação" editMode={editMode}><input value={persona.ocupacao} onChange={e => updatePersona(idx, "ocupacao", e.target.value)} placeholder="Ex: Empresária, mãe, freelancer" className="input-field" readOnly={!editMode} /></Field>
          <Field label="Objetivos" editMode={editMode}><textarea value={persona.objetivos} onChange={e => updatePersona(idx, "objetivos", e.target.value)} placeholder="O que essa persona quer alcançar?" rows={2} className="input-field resize-none" readOnly={!editMode} /></Field>
          <Field label="Dores" editMode={editMode}><textarea value={persona.dores} onChange={e => updatePersona(idx, "dores", e.target.value)} placeholder="Quais são as principais dores?" rows={2} className="input-field resize-none" readOnly={!editMode} /></Field>
        </div>
      ))}
      {editMode && (
        <button type="button" onClick={addPersona} className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-hairline rounded-md text-sm text-muted hover:border-rausch hover:text-rausch transition-colors w-full justify-center">
          <Plus className="w-4 h-4" /> Adicionar outra persona
        </button>
      )}
    </div>
  );

  // STEP 10 - Círculo Dourado
  if (step === 10) return (
    <div className="space-y-5">
      <div className="bg-danger-bg border border-danger-bg rounded-md p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-danger text-white flex items-center justify-center text-sm font-bold">P</div>
          <h4 className="font-semibold text-danger-text">Porquê</h4>
        </div>
        <p className="text-xs text-danger-text mb-2">Propósito, causa, crença — por que a empresa existe?</p>
        <textarea value={form.circulo_dourado.porque} onChange={e => setForm(f => ({ ...f, circulo_dourado: { ...f.circulo_dourado, porque: e.target.value } }))} placeholder="Ex: Acreditamos que toda empresa merece comunicação de qualidade..." rows={3} className="input-field resize-none bg-canvas" readOnly={!editMode} />
      </div>
      <div className="bg-surface-soft border border-hairline rounded-md p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-surface-soft text-ink flex items-center justify-center text-sm font-bold">Q</div>
          <h4 className="font-semibold text-rausch">O que</h4>
        </div>
        <p className="text-xs text-rausch mb-2">Produto, serviço, resultado — o que a empresa oferece?</p>
        <textarea value={form.circulo_dourado.o_que} onChange={e => setForm(f => ({ ...f, circulo_dourado: { ...f.circulo_dourado, o_que: e.target.value } }))} placeholder="Ex: Criamos estratégias de marketing digital..." rows={3} className="input-field resize-none bg-canvas" readOnly={!editMode} />
      </div>
      <div className="bg-success-bg border border-success/20 rounded-md p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-success text-white flex items-center justify-center text-sm font-bold">C</div>
          <h4 className="font-semibold text-success-text">Como</h4>
        </div>
        <p className="text-xs text-success-text mb-2">Processo, diferencial, método — como a empresa entrega?</p>
        <textarea value={form.circulo_dourado.como} onChange={e => setForm(f => ({ ...f, circulo_dourado: { ...f.circulo_dourado, como: e.target.value } }))} placeholder="Ex: Através de uma metodologia própria..." rows={3} className="input-field resize-none bg-canvas" readOnly={!editMode} />
      </div>
    </div>
  );

  // STEP 11 - Características da Marca
  if (step === 11) return (
    <div className="space-y-5">
      <Field label="Tom de voz da marca" editMode={editMode}>
        <select value={form.tom_voz} onChange={e => update("tom_voz", e.target.value)} className="input-field" disabled={!editMode}>
          <option value="">Selecione</option>{TONS_VOZ.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Missão" editMode={editMode}><textarea value={form.caracteristicas_marca.missao} onChange={e => setForm(f => ({ ...f, caracteristicas_marca: { ...f.caracteristicas_marca, missao: e.target.value } }))} placeholder="Qual é a missão da marca?" rows={3} className="input-field resize-none" readOnly={!editMode} /></Field>
      <Field label="Visão" editMode={editMode}><textarea value={form.caracteristicas_marca.visao} onChange={e => setForm(f => ({ ...f, caracteristicas_marca: { ...f.caracteristicas_marca, visao: e.target.value } }))} placeholder="Qual é a visão de futuro?" rows={3} className="input-field resize-none" readOnly={!editMode} /></Field>
      <Field label="Valores" editMode={editMode}><textarea value={form.caracteristicas_marca.valores} onChange={e => setForm(f => ({ ...f, caracteristicas_marca: { ...f.caracteristicas_marca, valores: e.target.value } }))} placeholder="Quais são os valores principais?" rows={3} className="input-field resize-none" readOnly={!editMode} /></Field>
      <Field label="Personalidade da marca" editMode={editMode}><textarea value={form.caracteristicas_marca.personalidade} onChange={e => setForm(f => ({ ...f, caracteristicas_marca: { ...f.caracteristicas_marca, personalidade: e.target.value } }))} placeholder="Se a marca fosse uma pessoa, como ela seria?" rows={3} className="input-field resize-none" readOnly={!editMode} /></Field>
    </div>
  );

  // STEP 12 - PUV
  if (step === 12) return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-rausch/5 to-rausch/5 border border-hairline rounded-md p-6">
        <h4 className="font-semibold text-ink mb-2 flex items-center gap-2">
          <Check className="w-5 h-5 text-rausch" />
          Proposta Única de Valor (PUV)
        </h4>
        <p className="text-sm text-body mb-4">O que torna esse cliente único? Por que alguém deveria escolhê-lo?</p>
        <textarea value={form.puv} onChange={e => update("puv", e.target.value)} placeholder="Ex: Somos o único estúdio de design que combina estratégia de marca com execução em 48h..." rows={5} className="input-field resize-none bg-canvas" readOnly={!editMode} />
      </div>
    </div>
  );

  return null;
}

function Field({ label, editMode: _editMode, required, children }: { label: string; editMode: boolean; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-2">
        {label} {required && <span className="text-rausch">*</span>}
      </label>
      {children}
    </div>
  );
}
