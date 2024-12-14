import "./globals.css";
import { ReactNode } from "react";
import { Metadata } from "next";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "Nyah's Playlist",
  description: "A collaborative playlist for Nyah",
  manifest: "/manifest.json",
  themeColor: "#1db954",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
