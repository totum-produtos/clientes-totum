"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Upload,
  Link2,
  Package,
} from "lucide-react";
import { createSPASassClient } from "@/lib/supabase/client";
import { persistOrThrow } from "@/lib/persist";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAllClientsIdNomeSlug } from "@/services/db/clients";
import {
  getBioProfileFull,
  getBioLinks,
  getBioProducts,
  insertBioProfile,
  updateBioProfile,
  insertBioLink,
  updateBioLink,
  deleteBioLink,
  insertBioProduct,
  updateBioProduct,
  deleteBioProduct,
} from "@/services/db/bio";
import { uploadBioAsset as uploadBioAssetService, getBioAssetPublicUrl } from "@/services/db/files";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Tables } from "@/lib/types";

type ClienteOption = { id: string; nome: string; slug: string };
type BioProfile = Tables<"bio_profiles">;
type BioLink = Tables<"bio_links">;
type BioProduct = Tables<"bio_products">;

// Compartilhado por handleUploadImage/handleUploadProductImage — só o
// prefixo do path e o que fazer com a URL final diferem entre os dois.
async function uploadBioAsset(clientId: string, file: File, prefix: string): Promise<string> {
  const supabase = await createSPASassClient();
  const sb = supabase.getSupabaseClient();
  const path = `${clientId}/${prefix}-${Date.now()}.${file.name.split(".").pop()}`;
  const { error: uploadError } = await uploadBioAssetService(sb, path, file, { cacheControl: "3600", upsert: true });
  if (uploadError) throw uploadError;
  const { data } = getBioAssetPublicUrl(sb, path);
  return data.publicUrl;
}

// Compartilhado por handleMoveLink/handleMoveProduct — calcula a troca de
// posição; quem persiste o novo `ordem` é o caller (update tipado por tabela).
function computeSwap<T extends { id: string; ordem: number }>(
  items: T[],
  index: number,
  direction: -1 | 1,
): { a: T; b: T } | null {
  const target = index + direction;
  if (target < 0 || target >= items.length) return null;
  return { a: items[index], b: items[target] };
}

function swapInPlace<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export default function AdminBioPage() {
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [clientesLoading, setClientesLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState("");

  const [profile, setProfile] = useState<BioProfile | null>(null);
  const [links, setLinks] = useState<BioLink[]>([]);
  const [products, setProducts] = useState<BioProduct[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedClient = clientes.find((c) => c.id === selectedClientId) || null;

  const loadClientes = useCallback(async () => {
    setClientesLoading(true);
    try {
      const supabase = await createSPASassClient();
      const sb = supabase.getSupabaseClient();
      const { data } = await getAllClientsIdNomeSlug(sb);
      setClientes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setClientesLoading(false);
    }
  }, []);

  const loadBioData = useCallback(async (clientId: string) => {
    setDataLoading(true);
    setError(null);
    try {
      const supabase = await createSPASassClient();
      const sb = supabase.getSupabaseClient();
      const { data: profileData } = await getBioProfileFull(sb, clientId);
      setProfile(profileData);

      if (profileData) {
        const [{ data: linksData }, { data: productsData }] = await Promise.all([
          getBioLinks(sb, profileData.id),
          getBioProducts(sb, profileData.id),
        ]);
        setLinks(linksData || []);
        setProducts(productsData || []);
      } else {
        setLinks([]);
        setProducts([]);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao carregar dados da bio.");
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  useEffect(() => {
    if (selectedClientId) loadBioData(selectedClientId);
    else {
      setProfile(null);
      setLinks([]);
      setProducts([]);
    }
  }, [selectedClientId, loadBioData]);

  async function handleCreateProfile() {
    if (!selectedClient) return;
    setCreating(true);
    setError(null);
    try {
      const supabase = await createSPASassClient();
      const sb = supabase.getSupabaseClient();
      await persistOrThrow(
        insertBioProfile(sb, { client_id: selectedClient.id, display_name: selectedClient.nome }),
        { db: sb, source: "admin/bio:criar-perfil", metadata: { clientId: selectedClient.id } },
      );
      await loadBioData(selectedClient.id);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao criar bio.");
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveProfile(patch: Partial<BioProfile>) {
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      const supabase = await createSPASassClient();
      const sb = supabase.getSupabaseClient();
      await persistOrThrow(
        updateBioProfile(sb, profile.id, patch),
        { db: sb, source: "admin/bio:salvar-perfil", metadata: { profileId: profile.id } },
      );
      setProfile({ ...profile, ...patch });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadImage(
    file: File,
    field: "avatar_url" | "logo_url",
  ) {
    if (!profile) return;
    setUploadingField(field);
    setError(null);
    try {
      const publicUrl = await uploadBioAsset(profile.client_id, file, field);
      await handleSaveProfile({ [field]: publicUrl });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro no upload da imagem.");
    } finally {
      setUploadingField(null);
    }
  }

  // ---- Links ----
  async function handleAddLink() {
    if (!profile) return;
    const supabase = await createSPASassClient();
    const sb = supabase.getSupabaseClient();
    try {
      await persistOrThrow(
        insertBioLink(sb, { bio_id: profile.id, label: "Novo link", url: "https://", ordem: links.length }),
        { db: sb, source: "admin/bio:add-link", metadata: { bioId: profile.id } },
      );
      await loadBioData(profile.client_id);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao adicionar link.");
    }
  }

  async function handleUpdateLink(id: string, patch: Partial<BioLink>) {
    const supabase = await createSPASassClient();
    const sb = supabase.getSupabaseClient();
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    try {
      await persistOrThrow(
        updateBioLink(sb, id, patch),
        { db: sb, source: "admin/bio:update-link", metadata: { linkId: id } },
      );
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao salvar link.");
    }
  }

  async function handleDeleteLink(id: string) {
    if (!profile) return;
    const supabase = await createSPASassClient();
    const sb = supabase.getSupabaseClient();
    try {
      await persistOrThrow(
        deleteBioLink(sb, id),
        { db: sb, source: "admin/bio:delete-link", metadata: { linkId: id } },
      );
      await loadBioData(profile.client_id);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao remover link.");
    }
  }

  async function handleMoveLink(index: number, direction: -1 | 1) {
    const swap = computeSwap(links, index, direction);
    if (!swap) return;
    setLinks((prev) => swapInPlace(prev, index, direction));
    await Promise.all([
      handleUpdateLink(swap.a.id, { ordem: swap.b.ordem }),
      handleUpdateLink(swap.b.id, { ordem: swap.a.ordem }),
    ]);
  }

  // ---- Products ----
  async function handleAddProduct() {
    if (!profile) return;
    const supabase = await createSPASassClient();
    const sb = supabase.getSupabaseClient();
    try {
      await persistOrThrow(
        insertBioProduct(sb, { bio_id: profile.id, nome: "Novo produto", ordem: products.length }),
        { db: sb, source: "admin/bio:add-product", metadata: { bioId: profile.id } },
      );
      await loadBioData(profile.client_id);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao adicionar produto.");
    }
  }

  async function handleUpdateProduct(id: string, patch: Partial<BioProduct>) {
    const supabase = await createSPASassClient();
    const sb = supabase.getSupabaseClient();
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    try {
      await persistOrThrow(
        updateBioProduct(sb, id, patch),
        { db: sb, source: "admin/bio:update-product", metadata: { productId: id } },
      );
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao salvar produto.");
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!profile) return;
    const supabase = await createSPASassClient();
    const sb = supabase.getSupabaseClient();
    try {
      await persistOrThrow(
        deleteBioProduct(sb, id),
        { db: sb, source: "admin/bio:delete-product", metadata: { productId: id } },
      );
      await loadBioData(profile.client_id);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao remover produto.");
    }
  }

  async function handleMoveProduct(index: number, direction: -1 | 1) {
    const swap = computeSwap(products, index, direction);
    if (!swap) return;
    setProducts((prev) => swapInPlace(prev, index, direction));
    await Promise.all([
      handleUpdateProduct(swap.a.id, { ordem: swap.b.ordem }),
      handleUpdateProduct(swap.b.id, { ordem: swap.a.ordem }),
    ]);
  }

  async function handleUploadProductImage(file: File, productId: string) {
    if (!profile) return;
    setUploadingField(`product-${productId}`);
    try {
      const publicUrl = await uploadBioAsset(profile.client_id, file, `product-${productId}`);
      await handleUpdateProduct(productId, { image_url: publicUrl });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro no upload da imagem.");
    } finally {
      setUploadingField(null);
    }
  }

  return (
    <div className="min-h-screen bg-surface-soft pb-16">
      <PageHeader title="Link na Bio — Gestão" description="Configure a página pública de link na bio de cada cliente" />

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        <div className="bg-canvas rounded-lg border border-hairline shadow-airbnb p-5">
          <label className="block text-xs font-semibold text-muted-soft mb-1.5">Cliente</label>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            disabled={clientesLoading}
            className="w-full px-3 py-2 rounded-md border border-hairline bg-surface-soft text-sm text-ink"
          >
            <option value="">Selecione um cliente…</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-danger-text">{error}</p>}

        {!selectedClientId ? (
          <EmptyState
            icon={Link2}
            title="Selecione um cliente"
            description="Escolha um cliente acima para configurar a bio dele."
            variant="card"
          />
        ) : dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : !profile ? (
          <EmptyState
            icon={Link2}
            title="Este cliente ainda não tem bio"
            description="Crie a página de link na bio para começar a configurar."
            variant="card"
            action={
              <button
                onClick={handleCreateProfile}
                disabled={creating}
                className="flex items-center gap-2 px-4 py-2 bg-rausch text-white rounded-md text-sm font-medium hover:bg-rausch-active transition-colors disabled:opacity-50"
              >
                {creating ? <LoadingSpinner size="sm" inverted /> : <Plus className="w-4 h-4" />}
                Criar bio
              </button>
            }
          />
        ) : (
          <>
            {/* Identidade */}
            <div className="bg-canvas rounded-lg border border-hairline shadow-airbnb p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-ink">Identidade</h3>
                <div className="flex items-center gap-3">
                  {selectedClient && (
                    <Link
                      href={`/bio/${selectedClient.slug}`}
                      target="_blank"
                      className="flex items-center gap-1.5 text-xs font-medium text-rausch hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Ver página pública
                    </Link>
                  )}
                  <label className="flex items-center gap-1.5 text-xs font-medium text-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.is_active}
                      onChange={(e) => handleSaveProfile({ is_active: e.target.checked })}
                    />
                    Ativa
                  </label>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-soft mb-1.5">Nome exibido</label>
                  <input
                    type="text"
                    defaultValue={profile.display_name}
                    onBlur={(e) => handleSaveProfile({ display_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-hairline bg-surface-soft text-sm text-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-soft mb-1.5">Headline</label>
                  <input
                    type="text"
                    defaultValue={profile.headline || ""}
                    onBlur={(e) => handleSaveProfile({ headline: e.target.value || null })}
                    className="w-full px-3 py-2 rounded-md border border-hairline bg-surface-soft text-sm text-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-soft mb-1.5">Cor primária</label>
                  <input
                    type="color"
                    defaultValue={profile.cor_primaria || "#111827"}
                    onChange={(e) => handleSaveProfile({ cor_primaria: e.target.value })}
                    className="w-full h-9 rounded-md border border-hairline bg-surface-soft"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-soft mb-1.5">Cor de fundo</label>
                  <input
                    type="color"
                    defaultValue={profile.cor_fundo || "#ffffff"}
                    onChange={(e) => handleSaveProfile({ cor_fundo: e.target.value })}
                    className="w-full h-9 rounded-md border border-hairline bg-surface-soft"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-soft mb-1.5">Avatar</label>
                  <label className="flex items-center gap-2 px-3 py-2 rounded-md border border-hairline bg-surface-soft text-sm text-muted cursor-pointer">
                    <Upload className="w-4 h-4" />
                    {uploadingField === "avatar_url" ? "Enviando…" : profile.avatar_url ? "Trocar imagem" : "Enviar imagem"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleUploadImage(e.target.files[0], "avatar_url")}
                    />
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-soft mb-1.5">Logo</label>
                  <label className="flex items-center gap-2 px-3 py-2 rounded-md border border-hairline bg-surface-soft text-sm text-muted cursor-pointer">
                    <Upload className="w-4 h-4" />
                    {uploadingField === "logo_url" ? "Enviando…" : profile.logo_url ? "Trocar imagem" : "Enviar imagem"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleUploadImage(e.target.files[0], "logo_url")}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-hairline">
                <label className="flex items-center gap-2 text-sm font-medium text-ink cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={profile.lead_capture_enabled}
                    onChange={(e) => handleSaveProfile({ lead_capture_enabled: e.target.checked })}
                  />
                  Captura de leads ativa
                </label>
                {profile.lead_capture_enabled && (
                  <input
                    type="text"
                    defaultValue={profile.lead_capture_titulo || ""}
                    onBlur={(e) => handleSaveProfile({ lead_capture_titulo: e.target.value || null })}
                    placeholder="Título do formulário (ex: Deixe seu contato)"
                    className="w-full px-3 py-2 rounded-md border border-hairline bg-surface-soft text-sm text-ink"
                  />
                )}
              </div>
              {saving && <p className="text-xs text-muted-soft">Salvando…</p>}
            </div>

            {/* Links */}
            <div className="bg-canvas rounded-lg border border-hairline shadow-airbnb p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                  <Link2 className="w-4 h-4" /> Links
                </h3>
                <button
                  onClick={handleAddLink}
                  className="flex items-center gap-1.5 text-xs font-medium text-rausch hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar link
                </button>
              </div>
              {links.length === 0 ? (
                <p className="text-sm text-muted-soft py-4 text-center">Nenhum link ainda.</p>
              ) : (
                <div className="space-y-2">
                  {links.map((link, i) => (
                    <div key={link.id} className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <button onClick={() => handleMoveLink(i, -1)} disabled={i === 0} className="text-muted-soft disabled:opacity-30">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleMoveLink(i, 1)} disabled={i === links.length - 1} className="text-muted-soft disabled:opacity-30">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        defaultValue={link.label}
                        onBlur={(e) => handleUpdateLink(link.id, { label: e.target.value })}
                        placeholder="Rótulo"
                        className="flex-1 px-3 py-2 rounded-md border border-hairline bg-surface-soft text-sm text-ink"
                      />
                      <input
                        type="text"
                        defaultValue={link.url}
                        onBlur={(e) => handleUpdateLink(link.id, { url: e.target.value })}
                        placeholder="https://…"
                        className="flex-[2] px-3 py-2 rounded-md border border-hairline bg-surface-soft text-sm text-ink"
                      />
                      <label className="flex items-center gap-1.5 text-xs text-muted-soft">
                        <input
                          type="checkbox"
                          checked={link.is_active}
                          onChange={(e) => handleUpdateLink(link.id, { is_active: e.target.checked })}
                        />
                        Ativo
                      </label>
                      <button onClick={() => handleDeleteLink(link.id)} className="p-2 text-muted-soft hover:text-danger-text">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Produtos */}
            <div className="bg-canvas rounded-lg border border-hairline shadow-airbnb p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                  <Package className="w-4 h-4" /> Produtos
                </h3>
                <button
                  onClick={handleAddProduct}
                  className="flex items-center gap-1.5 text-xs font-medium text-rausch hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar produto
                </button>
              </div>
              {products.length === 0 ? (
                <p className="text-sm text-muted-soft py-4 text-center">Nenhum produto ainda.</p>
              ) : (
                <div className="space-y-3">
                  {products.map((product, i) => (
                    <div key={product.id} className="rounded-lg border border-hairline p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex flex-col mt-1.5">
                          <button onClick={() => handleMoveProduct(i, -1)} disabled={i === 0} className="text-muted-soft disabled:opacity-30">
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleMoveProduct(i, 1)} disabled={i === products.length - 1} className="text-muted-soft disabled:opacity-30">
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex-1 grid gap-2 sm:grid-cols-2">
                          <input
                            type="text"
                            defaultValue={product.nome}
                            onBlur={(e) => handleUpdateProduct(product.id, { nome: e.target.value })}
                            placeholder="Nome do produto"
                            className="px-3 py-2 rounded-md border border-hairline bg-surface-soft text-sm text-ink"
                          />
                          <input
                            type="text"
                            defaultValue={product.preco_label || ""}
                            onBlur={(e) => handleUpdateProduct(product.id, { preco_label: e.target.value || null })}
                            placeholder="Preço (ex: R$ 97)"
                            className="px-3 py-2 rounded-md border border-hairline bg-surface-soft text-sm text-ink"
                          />
                          <textarea
                            defaultValue={product.descricao || ""}
                            onBlur={(e) => handleUpdateProduct(product.id, { descricao: e.target.value || null })}
                            placeholder="Descrição"
                            rows={2}
                            className="sm:col-span-2 px-3 py-2 rounded-md border border-hairline bg-surface-soft text-sm text-ink resize-none"
                          />
                          <input
                            type="text"
                            defaultValue={product.cta_label || ""}
                            onBlur={(e) => handleUpdateProduct(product.id, { cta_label: e.target.value || null })}
                            placeholder="Texto do botão (ex: Comprar)"
                            className="px-3 py-2 rounded-md border border-hairline bg-surface-soft text-sm text-ink"
                          />
                          <input
                            type="text"
                            defaultValue={product.cta_url || ""}
                            onBlur={(e) => handleUpdateProduct(product.id, { cta_url: e.target.value || null })}
                            placeholder="Link do botão"
                            className="px-3 py-2 rounded-md border border-hairline bg-surface-soft text-sm text-ink"
                          />
                          <label className="flex items-center gap-2 px-3 py-2 rounded-md border border-hairline bg-surface-soft text-xs text-muted cursor-pointer">
                            <Upload className="w-4 h-4" />
                            {uploadingField === `product-${product.id}`
                              ? "Enviando…"
                              : product.image_url
                                ? "Trocar imagem"
                                : "Enviar imagem"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => e.target.files?.[0] && handleUploadProductImage(e.target.files[0], product.id)}
                            />
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-muted-soft">
                            <input
                              type="checkbox"
                              checked={product.is_active}
                              onChange={(e) => handleUpdateProduct(product.id, { is_active: e.target.checked })}
                            />
                            Ativo
                          </label>
                        </div>
                        <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-muted-soft hover:text-danger-text">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
