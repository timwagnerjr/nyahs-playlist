import { NextRequest, NextResponse } from 'next/server';
import SpotifyWebApi from 'spotify-web-api-node';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code') || null;

  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI,
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  try {
    const data = await spotifyApi.authorizationCodeGrant(code as string);
    const { access_token, refresh_token, expires_in } = data.body;

    // Set access token to fetch user profile
    spotifyApi.setAccessToken(access_token);

    // Fetch user profile
    const userProfile = await spotifyApi.getMe();

    // Log the tokens and user profile to verify they are being retrieved
    console.log('Access Token:', access_token);
    console.log('Refresh Token:', refresh_token);
    console.log('User Profile:', userProfile.body);

    // Store the tokens and user profile in cookies for this example (in a real app, use a more secure method)
    const response = NextResponse.redirect(
      new URL('/', process.env.NEXT_PUBLIC_BASE_URL)
    );
    response.cookies.set('spotify_access_token', access_token, {
      path: '/',
      maxAge: expires_in,
    });
    response.cookies.set('spotify_refresh_token', refresh_token, { path: '/' });
    response.cookies.set('spotify_user', JSON.stringify(userProfile.body), {
      path: '/',
      maxAge: expires_in,
    });

    return response;
  } catch (error) {
    console.error('Error getting Tokens:', error);
    return NextResponse.redirect(
      new URL('/error', process.env.NEXT_PUBLIC_BASE_URL)
    );
  }
}
