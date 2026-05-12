// src/hooks/useClienteForm.ts
"use client";
import { useCallback, useState } from "react";
import { DEFAULT_FORM_STATE, FormState, Persona } from "@/lib/cliente-form-constants";

export function useClienteForm(initial?: Partial<FormState>) {
  const [form, setForm] = useState<FormState>({ ...DEFAULT_FORM_STATE, ...initial });

  const update = useCallback(<K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm(f => ({ ...f, [field]: value }));
  }, []);

  const toggleArray = useCallback((field: "classe_social" | "canais_atendimento" | "dias_atendimento", value: string) => {
    setForm(f => {
      const arr = f[field];
      return { ...f, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  }, []);

  const addPersona = useCallback(() => {
    setForm(f => ({ ...f, personas: [...f.personas, { nome: "", idade: "", ocupacao: "", objetivos: "", dores: "" }] }));
  }, []);

  const removePersona = useCallback((idx: number) => {
    setForm(f => ({ ...f, personas: f.personas.filter((_, i) => i !== idx) }));
  }, []);

  const updatePersona = useCallback((idx: number, field: keyof Persona, value: string) => {
    setForm(f => ({ ...f, personas: f.personas.map((p, i) => i === idx ? { ...p, [field]: value } : p) }));
  }, []);

  const resetForm = useCallback(() => {
    setForm({ ...DEFAULT_FORM_STATE, ...initial });
  }, [initial]);

  return { form, setForm, update, toggleArray, addPersona, removePersona, updatePersona, resetForm };
}
