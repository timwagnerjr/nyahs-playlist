import { NextResponse } from 'next/server';
import SpotifyWebApi from "spotify-web-api-node";

async function getSpotifyToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('Missing Spotify credentials');
    }

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

    const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
        }),
    });

    const data = await response.json();
    return data.access_token;
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const accessToken = await getSpotifyToken();

        // Fetch user profile from Spotify
        const response = await fetch(
            `https://api.spotify.com/v1/users/${params.id}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            console.error('Spotify API error:', await response.text());
            return NextResponse.json(
                { error: 'Failed to fetch user profile' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json({
            displayName: data.display_name,
            imageUrl: data.images?.[0]?.url || null
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user profile' },
            { status: 500 }
        );
    }
} 