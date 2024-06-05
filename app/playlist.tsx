"use client";

import { useState, useEffect } from "react";
import Track from "../components/Track";

export default function Playlist({ tracks, user }) {
  const [error, setError] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [totalDuration, setTotalDuration] = useState(0);

  useEffect(() => {
    const total = tracks.reduce(
      (sum, track) => sum + track.track.duration_ms,
      0
    );
    setTotalDuration(total);
  }, [tracks]);

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (error) return <p>Error: {error}</p>;
  if (!tracks.length) return <p>Loading...</p>;

  const totalMinutes = Math.floor(totalDuration / 60000);
  const totalSeconds = Math.floor((totalDuration % 60000) / 1000);

  return (
    <div className="bg-gray-900 text-white p-4 min-h-screen">
      <h1 className="text-4xl font-bold mb-2 text-center">Nyah's Playlist</h1>
      <div className="text-center mb-6">
        <p className="text-lg">Total songs: {tracks.length}</p>
        <p className="text-lg">
          Total duration: {totalMinutes}m {totalSeconds < 10 ? "0" : ""}
          {totalSeconds}s
        </p>
      </div>
      <div className="grid gap-6">
        {tracks.map((track, index) => (
          <Track
            key={index}
            track={track}
            selectedTrack={selectedTrack}
            setSelectedTrack={setSelectedTrack}
            user={user}
            description={track.description}
            setDescription={(desc) => {
              // Update description in the track
              track.description = desc;
            }}
          />
        ))}
      </div>
    </div>
  );
}
