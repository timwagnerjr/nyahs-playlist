"use client";

import { useState } from "react";
import { client } from "../sanity/lib/client";
import Spinner from "./Spinner";
import { Track as TrackType, User } from "../types";

interface DescriptionProps {
  track: TrackType;
  user: User;
  description: TrackType["description"];
  setDescription: (description: TrackType["description"]) => void;
}

export default function Description({
  track,
  user,
  description,
  setDescription,
}: DescriptionProps) {
  const [newDescription, setNewDescription] = useState(
    description ? description.description : ""
  );
  const [isLoading, setIsLoading] = useState(false);

  if (!track.track) {
    return (
      <div className="bg-gray-700 p-4 rounded-lg">
        Track data is unavailable.
      </div>
    );
  }

  const handleAddDescription = async () => {
    if (!newDescription.trim()) return;

    if (!track.track) {
      console.error("Track data is unavailable.");
      return;
    }

    const descriptionData = {
      _id: track.track.id, // Use the Spotify ID as the Sanity document ID
      _type: "track",
      spotifyId: track.track.id,
      name: track.track.name,
      album: track.track.album.name,
      artists: track.track.artists.map((artist) => artist.name),
      addedBy: user.display_name || user.id,
      description: newDescription,
      image: track.track.album.images[0]?.url || "", // Assuming the first image is the album cover
    };

    setIsLoading(true);

    try {
      await client.createOrReplace(descriptionData);
      setDescription(descriptionData);
    } catch (err) {
      console.error("Error adding description:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Why I Like This Song</h3>
      <div>
        {description ? (
          <p className="text-gray-300">{description.description}</p>
        ) : (
          <div className="flex flex-col md:flex-row items-start md:items-center">
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Add why you like this song"
              className="bg-gray-700 w-full text-white p-2 rounded-lg flex-1 mb-2 md:mb-0 md:mr-2 focus:outline-none focus:ring-2 focus:ring-spotify-green"
            />
            <button
              onClick={handleAddDescription}
              className="bg-spotify-green text-white p-2 rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? <Spinner /> : "Add Description"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
