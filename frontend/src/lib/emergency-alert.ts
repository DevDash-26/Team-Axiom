/** Browser OS toast for a newly published emergency. No service worker or FCM. */

const PREVIEW_MAX = 140;

export function showEmergencyBrowserAlert(title: string, body: string): void {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }
  const preview = body.trim().slice(0, PREVIEW_MAX);
  if (Notification.permission === "granted") {
    new Notification(title, { body: preview });
    return;
  }
  if (Notification.permission !== "default") {
    return;
  }
  void Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      new Notification(title, { body: preview });
    }
  });
}
