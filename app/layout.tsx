import "./globals.css";

export const metadata = {
  title: "Nyah's Playlist",
  description: "An interactive playlist experience",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
