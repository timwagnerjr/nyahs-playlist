import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Nyah's Playlist",
  description: "An interactive playlist experience",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
