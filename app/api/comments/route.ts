import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get('trackId');

    if (!trackId) {
        return NextResponse.json({ error: 'Track ID is required' }, { status: 400 });
    }

    console.log('Fetching comments for track:', trackId);

    try {
        // Fetch comments directly using the track ID
        const comments = await client.fetch(
            `*[_type == "comment" && track._ref == $trackId] | order(createdAt desc)`,
            { trackId }
        );
        console.log('Found comments:', comments.length);

        return NextResponse.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const body = await request.json();
    const { trackId, text, user, userDisplayName } = body;

    if (!trackId || !text || !user) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        // First check if the track exists
        const track = await client.fetch(
            `*[_type == "track" && (spotifyId == $trackId || _id == $fullTrackId)][0]`,
            {
                trackId,
                fullTrackId: `track.${trackId}`
            }
        );

        if (!track) {
            return NextResponse.json(
                { error: 'Track not found' },
                { status: 404 }
            );
        }

        // Create comment using the track's _id
        const comment = await client.create({
            _type: 'comment',
            track: {
                _type: 'reference',
                _ref: track._id
            },
            text,
            user: user,
            userDisplayName: userDisplayName,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json(comment);
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json(
            { error: 'Failed to create comment' },
            { status: 500 }
        );
    }
} 