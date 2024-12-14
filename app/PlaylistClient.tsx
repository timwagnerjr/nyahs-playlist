"use client";

import { useState } from "react";
import Track from "../components/Track";
import { Track as TrackType, User } from "../types";

interface PlaylistClientProps {
  track: TrackType;
  user: User;
}

export default function PlaylistClient({ track, user }: PlaylistClientProps) {
  const [description, setDescription] = useState<string | undefined>(
    track.description
  );
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  return (
    <Track
      track={track}
      selectedTrack={selectedTrack}
      setSelectedTrack={setSelectedTrack}
      user={user}
      description={description}
      setDescription={(desc) => {
        setDescription(desc);
      }}
    />
  );
}
