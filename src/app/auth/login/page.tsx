"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSPAClient, createSPASassClient } from "@/lib/supabase/client";
import { LoginScreen } from "@/components/login-screen";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [magicLinkError, setMagicLinkError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

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
        router.push("/auth/2fa");
      } else {
        router.push("/app");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setGoogleError("");
    setGoogleLoading(true);

    try {
      const supabase = createSPAClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/api/auth/callback?next=/app` },
      });
      if (oauthError) throw oauthError;
      // signInWithOAuth navigates away on success; no need to clear loading here.
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : "Ocorreu um erro inesperado");
      setGoogleLoading(false);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMagicLinkError("");
    setMagicLinkLoading(true);

    try {
      const client = await createSPASassClient();
      const { error: otpError } = await client.loginMagicLink(
        magicLinkEmail,
        `${window.location.origin}/api/auth/callback?next=/app`
      );
      if (otpError) throw otpError;
      setMagicLinkSent(true);
    } catch (err) {
      setMagicLinkError(err instanceof Error ? err.message : "Ocorreu um erro inesperado");
    } finally {
      setMagicLinkLoading(false);
    }
  };

  return (
    <LoginScreen
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
      onGoogleClick={handleGoogleClick}
      googleLoading={googleLoading}
      googleError={googleError}
      magicLinkEmail={magicLinkEmail}
      onMagicLinkEmailChange={setMagicLinkEmail}
      onMagicLinkSubmit={handleMagicLinkSubmit}
      magicLinkLoading={magicLinkLoading}
      magicLinkError={magicLinkError}
      magicLinkSent={magicLinkSent}
      onMagicLinkReset={() => {
        setMagicLinkSent(false);
        setMagicLinkError("");
      }}
    />
  );
}
