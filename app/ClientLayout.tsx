"use client";

import { ReactNode } from "react";
import { useUser } from "@/lib/hooks";
import NotificationSetup from "./NotificationSetup";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const user = useUser();

  return (
    <>
      {user && <NotificationSetup user={user} />}
      {children}
    </>
  );
}
