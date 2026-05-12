export function installAuthPopupListener(onAuthenticated: () => void) {
  function handleAuthMessage(event: MessageEvent) {
    if (event.origin !== window.location.origin) {
      return;
    }

    if (event.data?.type !== "MIC_AUTH_COMPLETE") {
      return;
    }

    window.setTimeout(() => {
      onAuthenticated();
    }, 250);
  }

  window.addEventListener("message", handleAuthMessage);

  return () => window.removeEventListener("message", handleAuthMessage);
}