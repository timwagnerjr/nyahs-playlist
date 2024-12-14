/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co", // Spotify image domain
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.spotify.com", // Spotify API domain
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
