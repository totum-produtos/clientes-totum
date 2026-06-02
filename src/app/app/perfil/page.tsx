"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import {
  User, Camera, Check, Lock, Globe, Clock, Phone, Briefcase,
  FileText, ChevronDown, ChevronUp, Eye, EyeOff, AlertCircle
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const IDIOMAS = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "en-US", label: "English (US)" },
  { value: "es", label: "Español" },
];

const TIMEZONES = [
  { value: "America/Sao_Paulo", label: "São Paulo (GMT-3)" },
  { value: "America/New_York", label: "New York (GMT-5)" },
  { value: "America/Los_Angeles", label: "Los Angeles (GMT-8)" },
  { value: "Europe/London", label: "London (GMT+0)" },
  { value: "Europe/Paris", label: "Paris (GMT+1)" },
  { value: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
];

export default function PerfilPage() {
  const { user, profile, refreshData } = useGlobal();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [expanded, setExpanded] = useState<string[]>(["dados"]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    telefone: "",
    cargo: "",
    timezone: "America/Sao_Paulo",
    idioma: "pt-BR",
  });

  const [senhaForm, setSenhaForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [senhaLoading, setSenhaLoading] = useState(false);
  const [senhaMessage, setSenhaMessage] = useState("");
  const [senhaError, setSenhaError] = useState("");

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        telefone: profile.telefone || "",
        cargo: profile.cargo || "",
        timezone: profile.timezone || "America/Sao_Paulo",
        idioma: profile.idioma || "pt-BR",
      });
    }
  }, [profile]);

  const toggleSection = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true); setMessage(""); setError("");
    try {
      const supabase = await createSPASassClient();
      const { error: upsertError } = await supabase.getSupabaseClient()
        .from("profiles")
        .upsert({
          id: user.id,
          display_name: form.display_name,
          bio: form.bio,
          telefone: form.telefone,
          cargo: form.cargo,
          timezone: form.timezone,
          idioma: form.idioma,
        }, { onConflict: "id" });

      if (upsertError) throw upsertError;
      setMessage("Perfil atualizado com sucesso!");
      refreshData();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true); setError("");
    try {
      const supabase = await createSPASassClient();
      const sb = supabase.getSupabaseClient();
      const filePath = `${user.id}/avatar-${Date.now()}.${file.name.split('.').pop()}`;

      const { error: uploadError } = await sb.storage.from("avatars").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = sb.storage.from("avatars").getPublicUrl(filePath);

      await sb.from("profiles").upsert({ id: user.id, avatar_url: publicUrl }, { onConflict: "id" });

      setMessage("Foto atualizada!");
      refreshData();
    } catch (err: any) {
      setError(err.message || "Erro ao fazer upload");
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSenhaError(""); setSenhaMessage("");

    if (senhaForm.newPassword !== senhaForm.confirmPassword) {
      setSenhaError("As senhas não coincidem");
      return;
    }
    if (senhaForm.newPassword.length < 6) {
      setSenhaError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setSenhaLoading(true);
    try {
      const supabase = await createSPASassClient();
      const { error } = await supabase.getSupabaseClient().auth.updateUser({
        password: senhaForm.newPassword,
      });
      if (error) throw error;
      setSenhaMessage("Senha alterada com sucesso!");
      setSenhaForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setSenhaError(err.message || "Erro ao alterar senha");
    } finally {
      setSenhaLoading(false);
    }
  };

  const initials = user?.email
    ? user.email.split("@")[0].slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="min-h-screen bg-surface-soft pb-12">
      {/* Header */}
      <div className="bg-canvas border-b border-hairline">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <h1 className="text-display-lg font-cereal text-ink">Perfil</h1>
          <p className="text-body-sm text-muted mt-1">Gerencie seus dados pessoais e preferências</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {(error || message) && (
          <div className={`mb-6 p-4 rounded-md text-sm flex items-center gap-2 ${message ? "bg-success-bg text-success-text border border-success-bg" : "bg-danger-bg text-danger-text border border-danger-bg"}`}>
            {message ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message || error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Card — Profile Summary */}
          <div className="lg:col-span-4">
            <div className="bg-canvas rounded-md border border-hairline shadow-airbnb p-6 sticky top-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-28 h-28 rounded-full object-cover border-2 border-hairline" />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-rausch/10 flex items-center justify-center text-rausch text-3xl font-bold">
                      {initials}
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 w-9 h-9 bg-rausch text-on-primary rounded-full flex items-center justify-center shadow-airbnb hover:bg-rausch-active transition-colors"
                  >
                    {uploading ? (
                      <LoadingSpinner size="sm" inverted />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </div>

                <h2 className="mt-4 text-title-md font-cereal text-ink text-center">
                  {profile?.display_name || user?.email?.split("@")[0] || "Usuário"}
                </h2>
                <p className="text-body-sm text-muted text-center mt-1">{user?.email}</p>
                {profile?.cargo && (
                  <span className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-surface-soft rounded-full text-caption text-muted">
                    <Briefcase className="w-3 h-3" /> {profile.cargo}
                  </span>
                )}

                <div className="w-full mt-6 pt-6 border-t border-hairline-soft space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Membro desde</span>
                    <span className="text-ink font-medium">
                      {user?.registered_at ? new Date(user.registered_at).toLocaleDateString("pt-BR") : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Função</span>
                    <span className="text-ink font-medium capitalize">{user?.role || "—"}</span>
                  </div>
                  {profile?.idioma && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Idioma</span>
                      <span className="text-ink font-medium">
                        {IDIOMAS.find(i => i.value === profile.idioma)?.label || profile.idioma}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right — Forms */}
          <div className="lg:col-span-8 space-y-4">
            {/* Dados Pessoais */}
            <Section id="dados" label="Dados Pessoais" icon={User} expanded={expanded} toggle={toggleSection}>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-caption text-ink mb-1.5">Nome de exibição</label>
                    <input
                      value={form.display_name}
                      onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                      placeholder="Como você quer ser chamado"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-caption text-ink mb-1.5">Telefone</label>
                    <input
                      value={form.telefone}
                      onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
                      placeholder="(00) 00000-0000"
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-caption text-ink mb-1.5">Cargo / Função</label>
                  <input
                    value={form.cargo}
                    onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))}
                    placeholder="Ex: Diretor de Marketing"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-caption text-ink mb-1.5">Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Conte um pouco sobre você..."
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
              </div>
            </Section>

            {/* Preferências */}
            <Section id="prefs" label="Preferências" icon={Globe} expanded={expanded} toggle={toggleSection}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-caption text-ink mb-1.5">Idioma</label>
                  <select

                    value={form.idioma}
                    onChange={e => setForm(f => ({ ...f, idioma: e.target.value }))}
                    className="input-field"
                  >
                    {IDIOMAS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-caption text-ink mb-1.5">Fuso horário</label>
                  <select

                    value={form.timezone}
                    onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}
                    className="input-field"
                  >
                    {TIMEZONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
            </Section>

            {/* Segurança */}
            <Section id="seg" label="Segurança" icon={Lock} expanded={expanded} toggle={toggleSection}>
              <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
                {(senhaError || senhaMessage) && (
                  <div className={`p-3 rounded-md text-sm ${senhaMessage ? "bg-success-bg text-success-text" : "bg-danger-bg text-danger-text"}`}>
                    {senhaMessage || senhaError}
                  </div>
                )}
                <div>
                  <label className="block text-caption text-ink mb-1.5">Nova senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={senhaForm.newPassword}
                      onChange={e => setSenhaForm(f => ({ ...f, newPassword: e.target.value }))}
                      placeholder="Mínimo 6 caracteres"
                      className="input-field pr-10"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-soft hover:text-ink">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-caption text-ink mb-1.5">Confirmar nova senha</label>
                  <input
                    type="password"
                    value={senhaForm.confirmPassword}
                    onChange={e => setSenhaForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder="Digite novamente"
                    className="input-field"
                  />
                </div>
                <button
                  type="submit"
                  disabled={senhaLoading}
                  className="btn-secondary text-button-sm"
                >
                  {senhaLoading ? "Alterando..." : "Alterar senha"}
                </button>
              </form>
            </Section>

            {/* Save */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Check className="w-4 h-4" /> Salvar alterações</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ id, label, icon: Icon, expanded, toggle, children }: any) {
  const isOpen = expanded.includes(id);
  return (
    <div className="bg-canvas rounded-md border border-hairline shadow-airbnb overflow-hidden">
      <button onClick={() => toggle(id)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-soft transition-colors">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-ink" />
          <h3 className="text-title-sm font-cereal text-ink">{label}</h3>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
      </button>
      {isOpen && <div className="px-6 pb-6 border-t border-hairline-soft">{children}</div>}
    </div>
  );
}
