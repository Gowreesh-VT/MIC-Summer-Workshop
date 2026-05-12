"use client";

import { useEffect } from "react";

export default function AuthPopupClosePage() {
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.opener?.postMessage({ type: "MIC_AUTH_COMPLETE" }, window.location.origin);
      window.close();
    }, 300);

    return () => window.clearTimeout(timeout);
  }, []);

  return <p className="auth-popup-message">Authentication complete. You can close this window.</p>;
}
