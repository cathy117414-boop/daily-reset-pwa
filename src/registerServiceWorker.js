// Shared by the static Pages app and the hosted React app.
export function registerPwaUpdates(base = '/') {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return () => {};
  let disposed = false;
  let registration;
  let reloading = false;
  let hadController = Boolean(navigator.serviceWorker.controller);
  let updatePending = false;
  const canReload = () => document.visibilityState === 'visible'
    && !document.querySelector('[role="dialog"]')
    && !document.activeElement?.matches('input, textarea, select, [contenteditable="true"]');
  const reloadWhenSafe = () => {
    if (!updatePending || reloading || !canReload()) return;
    reloading = true;
    window.location.reload();
  };
  const onControllerChange = () => {
    if (!hadController) { hadController = true; return; }
    updatePending = true;
    reloadWhenSafe();
  };
  const check = () => {
    reloadWhenSafe();
    if (document.visibilityState === 'visible') registration?.update().catch(() => {});
  };
  navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
  document.addEventListener('visibilitychange', check);
  window.addEventListener('pageshow', check);
  window.addEventListener('online', check);
  const timer = window.setInterval(check, 60_000);
  const safeReloadTimer = window.setInterval(reloadWhenSafe, 1000);
  const start = async () => {
    try {
      registration = await navigator.serviceWorker.register(`${base}sw.js`, { updateViaCache: 'none' });
      if (disposed) return;
      if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      await registration.update();
    } catch {
      // Normal when offline; the active worker and saved plan continue to work.
    }
  };
  if (document.readyState === 'complete') void start();
  else window.addEventListener('load', start, { once: true });
  return () => {
    disposed = true;
    window.removeEventListener('load', start);
    window.removeEventListener('pageshow', check);
    window.removeEventListener('online', check);
    document.removeEventListener('visibilitychange', check);
    navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    window.clearInterval(timer);
    window.clearInterval(safeReloadTimer);
  };
}
