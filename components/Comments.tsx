"use client";

import { useState, useEffect } from "react";
import { Comment, User } from "@/types";
import DefaultAvatar from "./DefaultAvatar";

interface CommentsProps {
  trackId: string;
  trackName: string;
  user: User;
  initialComments?: Comment[];
}

export default function Comments({
  trackId,
  trackName,
  user,
  initialComments = [],
}: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userImages, setUserImages] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch user images for all unique users in comments
    const uniqueUsers = [...new Set(comments.map((comment) => comment.user))];

    uniqueUsers.forEach(async (userId) => {
      try {
        // Decode any URL-encoded characters in the user ID
        const decodedUserId = decodeURIComponent(userId);

        // Remove any special characters that might be in the display name
        const cleanUserId = decodedUserId.replace(/[^\w-]/g, "");

        const response = await fetch(`/api/user/${cleanUserId}`);
        if (!response.ok) throw new Error("Failed to fetch user profile");
        const data = await response.json();
        if (data.imageUrl) {
          setUserImages((prev) => ({
            ...prev,
            [userId]: data.imageUrl,
          }));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    });
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackId,
          text: newComment,
          user: user.id,
          userDisplayName: user.display_name,
        }),
      });

      if (!response.ok) throw new Error("Failed to post comment");

      // After successful post, fetch updated comments
      const commentsResponse = await fetch(`/api/comments?trackId=${trackId}`);
      if (!commentsResponse.ok) throw new Error("Failed to fetch comments");
      const updatedComments = await commentsResponse.json();
      setComments(updatedComments);

      // Trigger notification for new comment
      await fetch("/api/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "comment",
          trackName,
          commenter: user.display_name,
        }),
      });

      setNewComment(""); // Clear input
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="space-y-4 mb-4">
        {comments.map((comment) => (
          <div key={comment._id} className="bg-gray-800 p-3 rounded flex gap-3">
            <div className="flex-shrink-0">
              {userImages[comment.user] ? (
                <img
                  src={userImages[comment.user]}
                  alt={comment.userDisplayName || comment.user}
                  className="w-8 h-8 rounded-full bg-gray-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <DefaultAvatar />
                </div>
              )}
            </div>
            <div className="flex-grow">
              <p className="text-sm text-gray-400 mb-1">
                {comment.userDisplayName || comment.user} •{" "}
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
              <p className="text-gray-200">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full p-2 mb-2 bg-gray-800 text-white rounded"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="text-spotify-green hover:text-spotify-green-dark"
        >
          {isLoading ? "Posting..." : "Post Comment"}
        </button>
      </form>
    </div>
  );
}
