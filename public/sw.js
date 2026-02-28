// Service Worker for Push Notifications
// This worker handles push notifications when they arrive

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);
  
  if (!event.data) {
    console.log('[Service Worker] No data in push event');
    return;
  }

  try {
    const data = event.data.json();
    const title = data.title || 'Holiday Reminder';
    const options = {
      body: data.body || 'You have a holiday coming up!',
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/badge-72x72.png',
      data: data.data || {},
      requireInteraction: data.requireInteraction || false,
      tag: data.tag || 'holiday-reminder',
      renotify: data.renotify || false,
      silent: data.silent || false,
      actions: data.actions || [
        { action: 'view', title: 'View Details' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    };

    if (data.image) {
      options.image = data.image;
    }

    if (data.vibrate) {
      options.vibrate = data.vibrate;
    }

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('[Service Worker] Error showing notification:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed:', event);
});
