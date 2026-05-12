"use client";
import React, { useRef } from "react";
import { AlertCircle, Check, Plus, Trash2, Upload, X } from "lucide-react";
import {
  CANAIS, CLASSES_SOCIAIS, DIAS, FATURAMENTOS, FormState, GENEROS,
  Persona, RAMOS, SLAS, TAMANHOS, TEMPOS_MERCADO, TONS_VOZ,
} from "@/lib/cliente-form-constants";

type Props = {
  step: number;
  form: FormState;
  editMode: boolean;
  update: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  toggleArray: (field: "classe_social" | "canais_atendimento" | "dias_atendimento", value: string) => void;
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

  // STEP 1
  if (step === 1) return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Nome da empresa" editMode={editMode}><input value={form.nome} onChange={e => update("nome", e.target.value)} placeholder="Ex: Totum Digital" className="input-field" readOnly={!editMode} /></Field>
        <Field label="CNPJ" editMode={editMode}><input value={form.cnpj} onChange={e => update("cnpj", e.target.value)} placeholder="00.000.000/0000-00" className="input-field" readOnly={!editMode} /></Field>
      </div>
      <Field label="Nome do responsável" editMode={editMode}><input value={form.nome_responsavel} onChange={e => update("nome_responsavel", e.target.value)} placeholder="Nome completo" className="input-field" readOnly={!editMode} /></Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Email corporativo" editMode={editMode}><input type="email" value={form.email_responsavel} onChange={e => update("email_responsavel", e.target.value)} placeholder="email@empresa.com" className="input-field" readOnly={!editMode} /></Field>
        <Field label="Telefone" editMode={editMode}><input value={form.telefone} onChange={e => update("telefone", e.target.value)} placeholder="(00) 00000-0000" className="input-field" readOnly={!editMode} /></Field>
      </div>
      <Field label="Site" editMode={editMode}><input value={form.site} onChange={e => update("site", e.target.value)} placeholder="https://www.empresa.com" className="input-field" readOnly={!editMode} /></Field>
    </div>
  );

  // STEP 2
  if (step === 2) return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Ramo de atuação" editMode={editMode}>
          <select value={form.ramo_atuacao} onChange={e => update("ramo_atuacao", e.target.value)} className="input-field" disabled={!editMode}>
            <option value="">Selecione</option>{RAMOS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Tempo de mercado" editMode={editMode}>
          <select value={form.tempo_mercado} onChange={e => update("tempo_mercado", e.target.value)} className="input-field" disabled={!editMode}>
            <option value="">Selecione</option>{TEMPOS_MERCADO.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Descrição do negócio" editMode={editMode}><textarea value={form.descricao_negocio} onChange={e => update("descricao_negocio", e.target.value)} placeholder="O que a empresa faz?" rows={3} className="input-field resize-none" readOnly={!editMode} /></Field>
      <Field label="Produtos/Serviços oferecidos" editMode={editMode}><textarea value={form.produtos_servicos} onChange={e => update("produtos_servicos", e.target.value)} placeholder="Liste os principais produtos ou serviços" rows={3} className="input-field resize-none" readOnly={!editMode} /></Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

  // STEP 3
  if (step === 3) return (
    <div className="space-y-5">
      <Field label="Nicho principal" editMode={editMode}><input value={form.nicho_principal} onChange={e => update("nicho_principal", e.target.value)} placeholder="Ex: Mães de primeira viagem" className="input-field" readOnly={!editMode} /></Field>
      <Field label="Dores principais" editMode={editMode}><textarea value={form.dores_principais} onChange={e => update("dores_principais", e.target.value)} placeholder="Liste 3-5 dores do público" rows={3} className="input-field resize-none" readOnly={!editMode} /></Field>
      <Field label="Desejos/Objetivos" editMode={editMode}><textarea value={form.desejos_objetivos} onChange={e => update("desejos_objetivos", e.target.value)} placeholder="O que o público deseja alcançar?" rows={3} className="input-field resize-none" readOnly={!editMode} /></Field>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Field label="Gênero" editMode={editMode}>
          <select value={form.genero_alvo} onChange={e => update("genero_alvo", e.target.value)} className="input-field" disabled={!editMode}>
            <option value="">Selecione</option>{GENEROS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </Field>
        <Field label="Localização" editMode={editMode}><input value={form.localizacao_alvo} onChange={e => update("localizacao_alvo", e.target.value)} placeholder="Ex: Brasil" className="input-field" readOnly={!editMode} /></Field>
        <Field label="Classe social" editMode={editMode}>
          <div className="flex flex-wrap gap-2">
            {CLASSES_SOCIAIS.map(c => (
              <button key={c} type="button" onClick={() => editMode && toggleArray("classe_social", c)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${form.classe_social.includes(c) ? "bg-rausch text-white shadow" : "bg-surface-strong text-body"}`}>{c}</button>
            ))}
          </div>
        </Field>
      </div>
      <Field label="Tom de voz da marca" editMode={editMode}>
        <select value={form.tom_voz} onChange={e => update("tom_voz", e.target.value)} className="input-field" disabled={!editMode}>
          <option value="">Selecione</option>{TONS_VOZ.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>
    </div>
  );

  // STEP 4
  if (step === 4) return (
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

  // STEP 5
  if (step === 5) return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-ink mb-2">Canais de atendimento</label>
        <div className="flex flex-wrap gap-2">{CANAIS.map(c => (
          <button key={c} type="button" onClick={() => editMode && toggleArray("canais_atendimento", c)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${form.canais_atendimento.includes(c) ? "bg-rausch text-white shadow" : "bg-surface-strong text-body"}`}>{c}</button>
        ))}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="CRM utilizado" editMode={editMode}>
          <select value={form.crm_utilizado} onChange={e => update("crm_utilizado", e.target.value)} className="input-field" disabled={!editMode}>
            <option value="">Selecione</option>
            {["uPixel","HubSpot","Pipedrive","Salesforce","RD Station","Outro"].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
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
      <Field label="Informações adicionais" editMode={editMode}><textarea value={form.informacoes_adicionais} onChange={e => update("informacoes_adicionais", e.target.value)} placeholder="Algo mais que devamos saber?" rows={3} className="input-field resize-none" readOnly={!editMode} /></Field>
    </div>
  );

  // STEP 6
  if (step === 6) return (
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

  // STEP 7
  if (step === 7) return (
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

  // STEP 8
  if (step === 8) return (
    <div className="space-y-5">
      <Field label="Missão" editMode={editMode}><textarea value={form.caracteristicas_marca.missao} onChange={e => setForm(f => ({ ...f, caracteristicas_marca: { ...f.caracteristicas_marca, missao: e.target.value } }))} placeholder="Qual é a missão da marca?" rows={3} className="input-field resize-none" readOnly={!editMode} /></Field>
      <Field label="Visão" editMode={editMode}><textarea value={form.caracteristicas_marca.visao} onChange={e => setForm(f => ({ ...f, caracteristicas_marca: { ...f.caracteristicas_marca, visao: e.target.value } }))} placeholder="Qual é a visão de futuro?" rows={3} className="input-field resize-none" readOnly={!editMode} /></Field>
      <Field label="Valores" editMode={editMode}><textarea value={form.caracteristicas_marca.valores} onChange={e => setForm(f => ({ ...f, caracteristicas_marca: { ...f.caracteristicas_marca, valores: e.target.value } }))} placeholder="Quais são os valores principais?" rows={3} className="input-field resize-none" readOnly={!editMode} /></Field>
      <Field label="Personalidade da marca" editMode={editMode}><textarea value={form.caracteristicas_marca.personalidade} onChange={e => setForm(f => ({ ...f, caracteristicas_marca: { ...f.caracteristicas_marca, personalidade: e.target.value } }))} placeholder="Se a marca fosse uma pessoa, como ela seria?" rows={3} className="input-field resize-none" readOnly={!editMode} /></Field>
    </div>
  );

  // STEP 9
  return (
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
}

function Field({ label, editMode: _editMode, children }: { label: string; editMode: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-2">{label}</label>
      {children}
    </div>
  );
}
