import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { client } from '@/sanity/lib/client';

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY!;
const subject = process.env.VAPID_SUBJECT!;

webpush.setVapidDetails(subject, publicVapidKey, privateVapidKey);

export async function POST(request: Request) {
    try {
        const { subscription, userId } = await request.json();

        // Store subscription in Sanity
        await client.create({
            _type: 'pushSubscription',
            endpoint: subscription.endpoint,
            keys: subscription.keys,
            userId,
        });

        // Send test notification
        await webpush.sendNotification(
            subscription,
            JSON.stringify({
                title: 'Notifications Enabled',
                body: 'You will now receive updates about new songs and comments!'
            })
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving push subscription:', error);
        return NextResponse.json(
            { error: 'Failed to save subscription' },
            { status: 500 }
        );
    }
} 