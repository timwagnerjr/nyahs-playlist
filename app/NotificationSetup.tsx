"use client";

import { useEffect, useState } from "react";
import { User } from "@/types";

export default function NotificationSetup({ user }: { user: User }) {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        setupPushSubscription();
      }
    }
  };

  const setupPushSubscription = async () => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });

        await fetch("/api/push-subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subscription,
            userId: user.id,
          }),
        });
      } catch (error) {
        console.error("Error subscribing to push notifications:", error);
      }
    }
  };

  if (permission === "default") {
    return (
      <button
        onClick={requestPermission}
        className="fixed bottom-4 right-4 bg-spotify-green text-black px-4 py-2 rounded-full shadow-lg hover:bg-opacity-90 transition-colors"
      >
        Enable Notifications
      </button>
    );
  }

  return null;
}
