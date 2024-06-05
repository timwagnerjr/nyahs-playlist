import { cookies } from "next/headers";
import { getPlaylistTracks } from "../lib/spotify";
import Playlist from "./playlist";

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

  const tracks = await getPlaylistTracks(accessToken);

  return (
    <div className="container mx-auto">
      <Playlist tracks={tracks} user={JSON.parse(user)} />
    </div>
  );
}
