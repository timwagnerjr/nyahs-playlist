import SpotifyWebApi from "spotify-web-api-node";
import { client } from "../sanity/lib/client";

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

export const getSpotifyAccessToken = async () => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body["access_token"]);
    console.log("Access token:", data.body["access_token"]);
  } catch (error) {
    console.error("Error getting Spotify access token:", error);
    throw new Error("Failed to get access token");
  }
};

export const getPlaylistTracks = async (accessToken) => {
  try {
    spotifyApi.setAccessToken(accessToken);
    const playlistId = process.env.SPOTIFY_PLAYLIST_ID;
    const data = await spotifyApi.getPlaylistTracks(playlistId);
    const tracks = data.body.items;

    // Fetch descriptions from Sanity
    const trackIds = tracks.map((track) => track.track.id);
    const query = `*[_type == "track" && spotifyId in $trackIds]{spotifyId, description, addedBy}`;
    const params = { trackIds };
    const fetchedDescriptions = await client.fetch(query, params);

    const descriptionsMap = fetchedDescriptions.reduce((acc, desc) => {
      acc[desc.spotifyId] = desc;
      return acc;
    }, {});

    // Merge tracks with descriptions
    const tracksWithDescriptions = tracks.map((track) => ({
      ...track,
      description: descriptionsMap[track.track.id] || null,
    }));

    console.log("Playlist data with descriptions:", tracksWithDescriptions);
    return tracksWithDescriptions;
  } catch (error) {
    console.error("Error getting playlist tracks:", error.message, error);
    throw new Error("Failed to fetch playlist tracks");
  }
};
