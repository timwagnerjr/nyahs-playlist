import SpotifyWebApi from "spotify-web-api-node";
import { client } from '../sanity/lib/client';
import { Track } from "../types";

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

export const getSpotifyAccessToken = async (): Promise<void> => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body["access_token"]);
    console.log("Access token:", data.body["access_token"]);
  } catch (error) {
    console.error("Error getting Spotify access token:", error);
    throw new Error("Failed to get access token");
  }
};

interface SpotifyTrack {
  track: {
    id: string;
    name: string;
    album: {
      name: string;
      images: { url: string }[];
    };
    artists: { name: string }[];
    duration_ms: number;
    preview_url: string | null;
  } | null;
  added_by?: {
    display_name?: string;
    id: string;
  };
}

export const getPlaylistTracks = async (accessToken: string): Promise<Track[]> => {
  try {
    spotifyApi.setAccessToken(accessToken);
    const playlistId = process.env.SPOTIFY_PLAYLIST_ID as string;
    const data = await spotifyApi.getPlaylistTracks(playlistId);
    const tracks: SpotifyTrack[] = data.body.items;

    // Fetch descriptions from Sanity
    const trackIds = tracks
      .filter((track) => track.track !== null)
      .map((track) => track.track!.id);
    const query = `*[_type == "track" && spotifyId in $trackIds]{spotifyId, description, addedBy}`;
    const params = { trackIds };
    const fetchedDescriptions = await client.fetch(query, params);

    const descriptionsMap: { [key: string]: { description: string; addedBy: string } } = fetchedDescriptions.reduce((acc: { [x: string]: any; }, desc: { spotifyId: string | number; }) => {
      acc[desc.spotifyId] = desc;
      return acc;
    }, {});

    // Merge tracks with descriptions
    const tracksWithDescriptions: Track[] = tracks.map((track) => ({
      track: track.track,
      added_by: track.added_by,
      description: track.track ? descriptionsMap[track.track.id] : undefined,
    }));

    console.log("Playlist data with descriptions:", tracksWithDescriptions);
    return tracksWithDescriptions;
  } catch (error) {
    // Ensure error is of type Error
    if (error instanceof Error) {
      console.error("Error getting playlist tracks:", error.message, error);
      throw new Error("Failed to fetch playlist tracks");
    } else {
      console.error("Unknown error", error);
      throw new Error("An unknown error occurred");
    }
  }
};
