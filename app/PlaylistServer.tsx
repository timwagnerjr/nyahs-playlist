import { Track, User } from "../types";
import PlaylistClient from "./PlaylistClient";

interface PlaylistServerProps {
  tracks: Track[];
  user: User;
  playlistId: string;
}

export default function PlaylistServer({
  tracks,
  user,
  playlistId,
}: PlaylistServerProps) {
  const totalDuration = tracks.reduce(
    (sum, track) => sum + (track.track ? track.track.duration_ms : 0),
    0
  );

  const totalMinutes = Math.floor(totalDuration / 60000);
  const totalSeconds = Math.floor((totalDuration % 60000) / 1000);

  return (
    <div className="bg-gray-900 text-white p-2 min-h-screen">
      <h1 className="text-2xl font-bold mb-2 text-left">
        Daddy & Nyah&apos;s Song List
      </h1>
      <div className="text-left mb-6">
        <p className="text-lg mb-2">
          {tracks.length} songs | {totalMinutes}m {totalSeconds < 10 ? "0" : ""}
          {totalSeconds}s play time
        </p>
        <a
          href={`https://open.spotify.com/playlist/${playlistId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-spotify-green hover:underline"
        >
          See playlist on Spotify
        </a>
      </div>
      <div className="grid gap-6">
        {tracks.map((track, index) => (
          <PlaylistClient
            key={track.track?.id || index}
            track={track}
            user={user}
          />
        ))}
      </div>
    </div>
  );
}
