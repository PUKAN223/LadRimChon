"use client";

/**
 * Native Browser & Service Worker Push Notification Helper
 * Supports PWA on iOS 16.4+, Android Chrome, Windows, and macOS.
 */

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return "denied";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<
  NotificationPermission
> {
  if (!isNotificationSupported()) return "denied";
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return "denied";
  }
}

export async function sendSystemNotification({
  title,
  body,
  url,
  tag,
}: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}) {
  if (!isNotificationSupported()) return;
  if (Notification.permission !== "granted") return;

  const options: NotificationOptions & { vibrate?: number[] } = {
    body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    tag: tag || "ladrimchon-notification",
    data: { url: url || "/" },
    vibrate: [200, 100, 200],
  };

  // 1. Try ServiceWorker showNotification (PWA standard for background & mobile lockscreen)
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && "showNotification" in registration) {
        await registration.showNotification(title, options);
        return;
      }
    } catch {
      // fallback to window.Notification
    }
  }

  // 2. Fallback to standard Window Notification
  try {
    const n = new Notification(title, options);
    if (url) {
      n.onclick = (e) => {
        e.preventDefault();
        window.focus();
        window.location.href = url;
        n.close();
      };
    }
  } catch {
    // Ignore notification failures on unsupported environments
  }
}
