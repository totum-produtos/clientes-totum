"use client";

// Error boundary de último recurso: captura erros lançados no próprio
// root layout. Como substitui o <html>/<body>, usa estilos inline para
// não depender de nenhum CSS que possa ter falhado ao carregar.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0d14",
          color: "#f5f5f7",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ maxWidth: 480, padding: "2rem", textAlign: "center" }}>
          <p
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.22em",
              fontSize: 12,
              color: "#FF385C",
              margin: 0,
            }}
          >
            Erro inesperado
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 300, margin: "1rem 0 0.75rem" }}>
            Algo deu errado.
          </h1>
          <p style={{ color: "#b8b8c0", lineHeight: 1.6, margin: "0 0 2rem" }}>
            Tivemos um problema ao carregar esta página. Você pode tentar de novo
            — se persistir, entre em contato com a Totum.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "#FF385C",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "0.75rem 1.5rem",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
          {error?.digest && (
            <p style={{ marginTop: 24, fontSize: 11, color: "#6b6b75" }}>
              Código do erro: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
