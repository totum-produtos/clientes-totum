import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicBio } from "@/lib/bio/public-data";
import { TrackedLink } from "@/components/bio/TrackedLink";
import { BioPageViewBeacon } from "@/components/bio/BioPageViewBeacon";
import { LeadForm } from "@/components/bio/LeadForm";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const bio = await getPublicBio(slug);
  if (!bio) return { title: "Link não encontrado" };
  return {
    title: bio.profile.display_name,
    description: bio.profile.headline || undefined,
    openGraph: {
      title: bio.profile.display_name,
      description: bio.profile.headline || undefined,
      images: bio.profile.avatar_url ? [bio.profile.avatar_url] : undefined,
    },
  };
}

export default async function BioPublicPage({ params }: PageProps) {
  const { slug } = await params;
  const bio = await getPublicBio(slug);
  if (!bio) notFound();

  const primary = bio.profile.cor_primaria || "#111827";

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-10"
      style={{ backgroundColor: bio.profile.cor_fundo || "#ffffff" }}
    >
      <BioPageViewBeacon slug={slug} />
      <div className="w-full max-w-md flex flex-col items-center">
        {bio.profile.avatar_url ? (
          <Image
            src={bio.profile.avatar_url}
            alt={bio.profile.display_name}
            width={88}
            height={88}
            className="rounded-full object-cover w-[88px] h-[88px] border-4 border-white shadow-md"
          />
        ) : (
          <div
            className="w-[88px] h-[88px] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md"
            style={{ backgroundColor: primary }}
          >
            {bio.profile.display_name.charAt(0).toUpperCase()}
          </div>
        )}

        <h1 className="mt-4 text-xl font-bold text-gray-900 text-center">{bio.profile.display_name}</h1>
        {bio.profile.headline && (
          <p className="mt-1 text-sm text-gray-500 text-center max-w-sm">{bio.profile.headline}</p>
        )}

        {bio.links.length > 0 && (
          <div className="w-full mt-6 space-y-3">
            {bio.links.map((link) => (
              <TrackedLink
                key={link.id}
                slug={slug}
                targetType="link"
                targetId={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3 px-4 rounded-xl font-medium text-white shadow-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: primary }}
              >
                {link.label}
              </TrackedLink>
            ))}
          </div>
        )}

        {bio.products.length > 0 && (
          <div className="w-full mt-8">
            <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Produtos</h2>
            <div className="grid grid-cols-2 gap-3">
              {bio.products.map((product) => (
                <TrackedLink
                  key={product.id}
                  slug={slug}
                  targetType="product"
                  targetId={product.id}
                  href={`/bio/${slug}/produto/${product.id}`}
                  className="rounded-xl border border-gray-200 overflow-hidden bg-white hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 relative">
                    {product.image_url && (
                      <Image
                        src={product.image_url}
                        alt={product.nome}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.nome}</p>
                    {product.preco_label && (
                      <p className="text-xs text-gray-500">{product.preco_label}</p>
                    )}
                  </div>
                </TrackedLink>
              ))}
            </div>
          </div>
        )}

        {bio.profile.lead_capture_enabled && (
          <LeadForm slug={slug} titulo={bio.profile.lead_capture_titulo} primaryColor={primary} />
        )}
      </div>
    </div>
  );
}
