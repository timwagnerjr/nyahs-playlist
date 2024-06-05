import SpotifyWebApi from "spotify-web-api-node";

const scopes = ["playlist-read-private", "playlist-read-collaborative"];

const spotifyApi = new SpotifyWebApi({
  redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI,
  clientId: process.env.SPOTIFY_CLIENT_ID,
});

export async function GET() {
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizeURL,
    },
  });
}
