"use client";

import { useState, useEffect } from "react";
import { client } from "../sanity/lib/client";
import Spinner from "./Spinner";
import { Comment, User } from "../types";

interface CommentsProps {
  trackId: string;
  user: User;
}

export default function Comments({ trackId, user }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchComments(trackId);
  }, [trackId]);

  const fetchComments = async (trackId: string) => {
    const query = `*[_type == "comment" && track._ref == $trackId] | order(createdAt asc)`;
    const params = { trackId };
    try {
      const fetchedComments = await client.fetch<Comment[]>(query, params);
      setComments(fetchedComments);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      _id: "", // Will be assigned by Sanity
      _type: "comment",
      track: {
        _ref: trackId,
        _type: "reference",
      },
      text: newComment,
      user: user.display_name || user.id,
      createdAt: new Date().toISOString(),
    };

    setIsLoading(true);

    try {
      await client.create(comment);
      setComments([...comments, comment]);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg mt-4">
      <h3 className="text-lg font-semibold mb-2">Thoughts</h3>
      <div className="mb-4 space-y-2">
        {comments.map((comment, index) => (
          <div
            key={index}
            className={`flex flex-col ${comment.user === user.display_name || comment.user === user.id ? "items-end" : "items-start"}`}
          >
            <p className="text-gray-400 text-sm mb-1">{comment.user}</p>
            <div
              className={`max-w-xs p-3 rounded-lg text-white ${
                comment.user === user.display_name || comment.user === user.id
                  ? "bg-blue-500"
                  : "bg-gray-600"
              }`}
            >
              <p>{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-center">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a thought"
          className="bg-gray-700 text-white p-2 w-full rounded-lg flex-1 mb-2 md:mb-0 md:mr-2 focus:outline-none focus:ring-2 focus:ring-spotify-green"
        />
        <button
          onClick={handleAddComment}
          className="bg-spotify-green text-white p-2 rounded-lg"
          disabled={isLoading}
        >
          {isLoading ? <Spinner /> : "Add Thought"}
        </button>
      </div>
    </div>
  );
}
