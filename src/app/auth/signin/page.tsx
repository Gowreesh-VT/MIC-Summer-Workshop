"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function GoogleGlyph() {
  return (
    <svg aria-hidden="true" className="google-glyph" viewBox="0 0 24 24">
      <path
        d="M21.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.4c-.2 1.2-.9 2.3-2 3v2.7h3.3c1.9-1.8 2.9-4.4 2.9-7.7z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 5-.9 6.7-2.5l-3.3-2.7c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3v2.8C4.7 19.8 8.1 22 12 22z"
        fill="#34A853"
      />
      <path
        d="M6.4 13.7a6 6 0 0 1 0-3.4V7.5H3a10 10 0 0 0 0 9l3.4-2.8z"
        fill="#FBBC04"
      />
      <path
        d="M12 6.2c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17 3.1 14.7 2 12 2 8.1 2 4.7 4.2 3 7.5l3.4 2.8c.8-2.3 3-4.1 5.6-4.1z"
        fill="#EA4335"
      />
    </svg>
  );
}

function SignInCard() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/auth/popup-close";
  const error = searchParams.get("error");

  return (
    <main className="auth-shell">
      <div className="stars-container" />
      <div className="neon-grid" />
      <div className="synth-sun" />
      <div className="scanline-overlay" />

      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-logo-frame">
          <Image src="/stitch/mic-logo.png" alt="MIC Logo" width={72} height={72} priority />
        </div>
        <span className="tag tag-primary">Player Login</span>
        <h1 id="auth-title">Enter The Arcade</h1>
        <p>
          Sign in with Google to save your interest and continue to the mobile
          number confirmation step.
        </p>
        {error ? (
          <p className="auth-error">Google login failed. Please try again.</p>
        ) : null}
        <button
          className="google-login-button"
          onClick={() => signIn("google", { callbackUrl })}
          type="button"
        >
          <GoogleGlyph />
          <span>Continue With Google</span>
        </button>
        <p className="auth-footnote">MIC Workshop Registration Portal</p>
      </section>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<main className="auth-shell" />}>
      <SignInCard />
    </Suspense>
  );
}
