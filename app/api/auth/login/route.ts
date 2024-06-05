import { NextRequest, NextResponse } from 'next/server';
import SpotifyWebApi from 'spotify-web-api-node';
import crypto from 'crypto';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI,
});

export async function GET(req: NextRequest) {
  // Generate a random state parameter for security purposes
  const state = crypto.randomBytes(16).toString('hex');

  const scopes = ['user-read-private', 'user-read-email', 'playlist-read-private'];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

  // Optionally store the state in cookies or session to validate it later
  const response = NextResponse.redirect(authorizeURL);
  response.cookies.set('spotify_auth_state', state, {
    path: '/',
    maxAge: 3600, // 1 hour
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  // Disable caching for this response
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Surrogate-Control', 'no-store');

  return response;
}
