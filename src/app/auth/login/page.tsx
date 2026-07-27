"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSPASassClient } from "@/lib/supabase/client";
import { SignInPage } from "@/components/ui/sign-in";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMFAPrompt, setShowMFAPrompt] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const client = await createSPASassClient();
      const { error: signInError } = await client.loginEmail(email, password);
      if (signInError) throw signInError;

      const supabase = client.getSupabaseClient();
      const { data: mfaData, error: mfaError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (mfaError) throw mfaError;

      if (mfaData.nextLevel === "aal2" && mfaData.nextLevel !== mfaData.currentLevel) {
        setShowMFAPrompt(true);
      } else {
        router.push("/app");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showMFAPrompt) router.push("/auth/2fa");
  }, [showMFAPrompt, router]);

  return (
    <SignInPage
      brandTagline="Marketing para Resultados"
      email={email}
      password={password}
      showPassword={showPassword}
      loading={loading}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onTogglePassword={() => setShowPassword((v) => !v)}
      onSubmit={handleSubmit}
      onResetPassword={() => router.push("/auth/forgot-password")}
      footer={
        <div className="text-center text-sm text-muted-soft space-y-2">
          <div>
            <Link href="/auth/magic-link" className="text-totum-secondary hover:text-totum-secondary/80 font-medium transition-colors">
              Entrar sem senha (Magic Link)
            </Link>
          </div>
          <div>
            Não tem acesso?{" "}
            <Link href="/auth/register" className="text-rausch hover:text-rausch-light font-medium transition-colors">
              Falar com a Totum
            </Link>
          </div>
        </div>
      }
    />
  );
}
