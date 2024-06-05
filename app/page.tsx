import { cookies } from "next/headers";
import { getPlaylistTracks } from "../lib/spotify";
import Playlist from "./playlist";
import { Track, User } from "../types";

export default async function Home() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("spotify_access_token")?.value;
  const user = cookieStore.get("spotify_user")?.value;

  // Log the retrieved access token and user
  console.log("Retrieved Access Token:", accessToken);
  console.log("Retrieved User:", user);

  const playlistUrl = `https://open.spotify.com/playlist/${process.env.SPOTIFY_PLAYLIST_ID}`;

  if (!accessToken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-5xl font-bold mb-4 text-center">Our Playlist</h1>
        <p className="text-xl mb-6 text-center">
          Happy Birthday, Nyah! 🎂 To celebrate, I&apos;ve created a special
          playlist for us to share. I&apos;ve added the first 15 songs that have
          a vibe I think we both like. Now it&apos;s your turn to add your
          favorites! Add songs, tell me why you like them, then we can discuss
          them!
        </p>
        <p className="text-xl mb-6 text-center">
          To get started, log in with your Spotify account. You can add songs,
          leave comments, and discuss each track with me. Can&apos;t wait to see
          what add and hear what you think!
        </p>

        <a
          href="/api/auth/login"
          className="bg-spotify-green mb-4 text-white py-2 px-4 rounded-lg text-xl hover:bg-spotify-green-dark transition duration-300"
        >
          Login with Spotify
        </a>
        <a
          href={playlistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white py-2 px-4 text-md transition duration-300 mb-4"
        >
          View Playlist on Spotify
        </a>
      </div>
    );
  }

  let parsedUser: User;
  try {
    parsedUser = JSON.parse(user as string);
  } catch (error) {
    console.error("Error parsing user:", error);
    return <p>Error: Invalid user data</p>;
  }

  const tracks: Track[] = await getPlaylistTracks(accessToken);

  return (
    <div className="container mx-auto">
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-2">
        <Playlist tracks={tracks} user={parsedUser} />
      </div>
    </div>
  );
}
