/**
 * Push notification service using Web Push API
 */

import webpush from 'web-push';

// Configure web-push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:notifications@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushNotificationPayload,
): Promise<boolean> {
  try {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    };

    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));

    console.log('Push notification sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return false;
  }
}

export function generateHolidayPushPayload(
  holidayName: string,
  daysUntil: number,
): PushNotificationPayload {
  const message =
    daysUntil === 0
      ? `Today is ${holidayName}!`
      : daysUntil === 1
        ? `Tomorrow is ${holidayName}!`
        : `${holidayName} is in ${daysUntil} days!`;

  return {
    title: 'Holiday Reminder',
    body: message,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: {
      holidayName,
      daysUntil,
      timestamp: Date.now(),
    },
  };
}
