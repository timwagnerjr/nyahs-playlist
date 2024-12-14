"use client";

import { useState, useEffect } from "react";
import Description from "./Description";
import Comments from "./Comments";
import { Track as TrackType, User } from "../types";
import Image from "next/image";

interface TrackProps {
  track: TrackType;
  user: User;
  description: TrackType["description"];
  setDescription: (description: TrackType["description"]) => void;
  selectedTrack: string | null;
  setSelectedTrack: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function Track({
  track,
  user,
  description,
  setDescription,
}: TrackProps) {
  if (!track.track) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg flex flex-col items-start">
        Track data is unavailable.
      </div>
    );
  }

  return (
    <div
      className={`p-4 ${track.currentlyInPlaylist ? "bg-gray-800" : "bg-gray-800"} rounded-lg flex flex-col items-start`}
    >
      <div className="flex flex-row items-top w-full">
        <Image
          src={track.track.album.images[0].url}
          alt={track.track.album.name}
          width={80}
          height={80}
          className="w-20 h-20 rounded shadow-lg mr-4 mt-1"
        />
        <div className="flex-1">
          {track.currentlyInPlaylist && (
            <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-spotify-green text-black rounded-full mb-1">
              In Playlist
            </span>
          )}
          <div className="text-lg md:text-xl font-semibold">
            {track.track.name}
          </div>
          <p className="text-gray-400">
            {track.track.artists.map((artist) => artist.name).join(", ")}
          </p>
          <p className="text-gray-400">{track.track.album.name}</p>
          <p className="text-gray-500 text-sm">
            Added by: {track.added_by?.displayName || track.added_by?.id}
          </p>
        </div>
      </div>
      <a
        href={track.track.spotify_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 text-spotify-green hover:underline inline-flex items-center gap-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
        Listen on Spotify
      </a>
      <div className="mt-4 w-full">
        <Description
          track={track}
          user={user}
          description={description}
          setDescription={setDescription}
        />
        <div className="mt-4 border-t border-gray-700 pt-4">
          <h3 className="text-lg font-semibold mb-4">Thoughts</h3>
          <Comments
            trackId={track.track.id}
            trackName={track.track.name}
            user={user}
            initialComments={track.comments}
          />
        </div>
      </div>
    </div>
  );
}
