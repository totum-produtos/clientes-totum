import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getPublicBioProduct } from "@/lib/bio/public-data";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string; productId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, productId } = await params;
  const data = await getPublicBioProduct(slug, productId);
  if (!data) return { title: "Produto não encontrado" };
  return {
    title: `${data.product.nome} — ${data.profile.display_name}`,
    description: data.product.descricao || undefined,
    openGraph: {
      title: data.product.nome,
      description: data.product.descricao || undefined,
      images: data.product.image_url ? [data.product.image_url] : undefined,
    },
  };
}

export default async function BioProductPage({ params }: PageProps) {
  const { slug, productId } = await params;
  const data = await getPublicBioProduct(slug, productId);
  if (!data) notFound();

  const primary = data.profile.cor_primaria || "#111827";

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        <Link href={`/bio/${slug}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
          <div className="aspect-square bg-gray-100 relative">
            {data.product.image_url && (
              <Image src={data.product.image_url} alt={data.product.nome} fill className="object-cover" />
            )}
          </div>
          <div className="p-5">
            <h1 className="text-lg font-bold text-gray-900">{data.product.nome}</h1>
            {data.product.preco_label && (
              <p className="text-base font-semibold mt-1" style={{ color: primary }}>
                {data.product.preco_label}
              </p>
            )}
            {data.product.descricao && (
              <p className="text-sm text-gray-600 mt-3 whitespace-pre-line">{data.product.descricao}</p>
            )}
            {data.product.cta_url && (
              <a
                href={data.product.cta_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3 px-4 rounded-xl font-medium text-white shadow-sm hover:opacity-90 transition-opacity mt-5"
                style={{ backgroundColor: primary }}
              >
                {data.product.cta_label || "Ver oferta"}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
