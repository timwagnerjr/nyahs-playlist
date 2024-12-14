"use client";

import { useState } from "react";
import { Track, User } from "../types";
import { updateDescription } from "../app/actions";

interface DescriptionProps {
  track: Track;
  user: User;
  description?: string;
  setDescription: (description: string | undefined) => void;
}

export default function Description({
  track,
  user,
  description,
  setDescription,
}: DescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState(description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log("User ID:", user.id);
  console.log("Track added by:", track.added_by);
  console.log("Is owner:", user.id === track.added_by?.id);

  const isOwner = user.id === track.added_by?.id;

  const handleSubmit = async () => {
    if (!track.track) return;

    setIsSubmitting(true);
    try {
      const result = await updateDescription(
        track.track.id,
        newDescription,
        user.id
      );
      if (result.success) {
        setDescription(newDescription);
        setIsEditing(false);
      } else {
        console.error("Failed to update description");
      }
    } catch (error) {
      console.error("Error updating description:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!track.track) return null;

  return (
    <div className="bg-gray-700 p-4 rounded">
      <h3 className="text-lg font-semibold mb-4">Why I Like This Song</h3>
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <label htmlFor="song-description" className="sr-only">
            Why you like this song
          </label>
          <textarea
            id="song-description"
            value={newDescription || ""}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded mb-2"
            rows={3}
            placeholder="Tell us why you like this song..."
            aria-label="Song description"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="text-spotify-green hover:underline"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setNewDescription(description || "");
              }}
              className="text-gray-400 hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-700 rounded">
          <p className="text-gray-300">
            {description ||
              "No description yet. Add one to explain why you like this song!"}
          </p>
          {user && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-spotify-green hover:underline mt-2"
            >
              {description ? "Edit" : "Add Description"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
