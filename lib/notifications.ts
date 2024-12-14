import webpush from 'web-push';
import { client } from '@/sanity/lib/client';

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY!;
const subject = process.env.VAPID_SUBJECT!;

webpush.setVapidDetails(subject, publicVapidKey, privateVapidKey);

export async function sendNotificationToAll(notification: { title: string; body: string }) {
    // Get all subscriptions
    const subscriptions = await client.fetch(`*[_type == "pushSubscription"]`);

    const notifications = subscriptions.map(async (sub: any) => {
        try {
            await webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: sub.keys
                },
                JSON.stringify(notification)
            );
        } catch (error) {
            console.error(`Failed to send notification to ${sub.endpoint}:`, error);
            // If subscription is invalid, remove it
            if ((error as any).statusCode === 410) {
                await client.delete(sub._id);
            }
        }
    });

    await Promise.all(notifications);
} 