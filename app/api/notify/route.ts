import { NextResponse } from 'next/server';
import { sendNotificationToAll } from '@/lib/notifications';

export async function POST(request: Request) {
    try {
        const { type, trackName, commenter } = await request.json();

        let notification;
        if (type === 'comment') {
            notification = {
                title: 'New Comment',
                body: `${commenter} commented on ${trackName}!`
            };
        } else if (type === 'song') {
            notification = {
                title: 'New Song Added',
                body: `${commenter} added ${trackName} to the playlist!`
            };
        }

        if (notification) {
            await sendNotificationToAll(notification);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json(
            { error: 'Failed to send notification' },
            { status: 500 }
        );
    }
} 