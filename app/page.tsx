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

  if (!accessToken) {
    return <p>Error: No access token</p>;
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
      <Playlist tracks={tracks} user={parsedUser} />
    </div>
  );
}
