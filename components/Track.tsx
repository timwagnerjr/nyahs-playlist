"use client";

import { useState } from "react";
import Link from "next/link";
import Description from "./Description";
import Comments from "./Comments";
import { Track as TrackType, User } from "../types";

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
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);

  if (!track.track) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg flex flex-col items-start">
        Track data is unavailable.
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg flex flex-col items-start">
      <div className="flex flex-row items-top w-full">
        <img
          src={track.track.album.images[0].url}
          alt={track.track.album.name}
          className="w-20 h-20 rounded shadow-lg mr-4 mt-1"
        />
        <div className="flex-1">
          <div className="text-lg md:text-xl font-semibold">
            {track.track.name}
          </div>

          <p className="text-gray-400">
            {track.track.artists.map((artist) => artist.name).join(", ")}
          </p>
          <p className="text-gray-400">{track.track.album.name}</p>
          <p className="text-gray-500 text-sm">
            Added by: {track.added_by?.display_name || track.added_by?.id}
          </p>
        </div>
      </div>
      <audio
        controls
        src={track.track.preview_url || ""}
        className="mt-4 w-full"
      ></audio>
      <div className="mt-4 w-full">
        <Description
          track={track}
          user={user}
          description={description}
          setDescription={setDescription}
        />
        <button
          onClick={() => setIsCommentsVisible(!isCommentsVisible)}
          className="text-spotify-green hover:underline mt-2"
        >
          {isCommentsVisible ? "Hide Thoughts" : "Show Thoughts"}
        </button>
        {isCommentsVisible && <Comments trackId={track.track.id} user={user} />}
      </div>
    </div>
  );
}
