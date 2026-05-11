"use client";

import { useEffect } from "react";

export default function AuthPopupClosePage() {
  useEffect(() => {
    window.opener?.postMessage({ type: "MIC_AUTH_COMPLETE" }, window.location.origin);
    window.close();
  }, []);

  return <p className="auth-popup-message">Authentication complete. You can close this window.</p>;
}
