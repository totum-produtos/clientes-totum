"use client";

import React, { useState } from "react";

interface LeadFormProps {
  slug: string;
  titulo?: string | null;
  primaryColor: string;
}

export function LeadForm({ slug, titulo, primaryColor }: LeadFormProps) {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [empresa, setEmpresa] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || (!whatsapp.trim() && !email.trim())) {
      setError("Preencha o nome e pelo menos um contato (WhatsApp ou e-mail).");
      return;
    }
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/bio/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, nome, whatsapp, email, empresa }),
      });
      const data = await res.json().catch(() => ({}) as { error?: string });
      if (!res.ok) {
        setError(data.error || "Não foi possível enviar. Tente novamente.");
        setStatus("idle");
        return;
      }
      setStatus("sent");
    } catch {
      setError("Não foi possível enviar. Tente novamente.");
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div className="w-full mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5 text-center">
        <p className="text-sm font-medium text-gray-900">Recebemos seu contato!</p>
        <p className="text-xs text-gray-500 mt-1">Em breve alguém vai falar com você.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5">
      <h2 className="text-sm font-bold text-gray-900 mb-3">{titulo || "Deixe seu contato"}</h2>
      <div className="space-y-2">
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome"
          required
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900"
        />
        <input
          type="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="WhatsApp"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900"
        />
        {/* honeypot — invisível pra gente real; bots costumam preencher todo campo */}
        <input
          type="text"
          value={empresa}
          onChange={(e) => setEmpresa(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          className="absolute opacity-0 pointer-events-none w-0 h-0"
          aria-hidden="true"
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full mt-3 py-2.5 rounded-lg font-medium text-white text-sm disabled:opacity-60"
        style={{ backgroundColor: primaryColor }}
      >
        {status === "sending" ? "Enviando…" : "Enviar"}
      </button>
    </form>
  );
}
