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
    external_urls: {
      spotify: string;
    };
  } | null;
  added_by?: {
    id: string;
    display_name?: string;
  };
}

interface SanityTrack {
  _id: string;
  spotifyId: string;
  name: string;
  album: string;
  artists: string[];
  image: string;
  duration_ms: number;
  spotify_url: string;
  currentlyInPlaylist?: boolean;
  addedBy?: {
    id: string;
    displayName: string;
  };
}

async function syncTracksToSanity(tracks: SpotifyTrack[]): Promise<void> {
  const transaction = client.transaction();

  // Get existing tracks from Sanity
  const existingTracks = await client.fetch<SanityTrack[]>(`*[_type == "track"]{
    _id, 
    spotifyId,
    addedBy,
    name,
    album,
    artists,
    image,
    duration_ms,
    spotify_url,
    currentlyInPlaylist
  }`);

  // Create maps for efficient lookups
  const existingTrackMap = new Map(
    existingTracks.map(track => [track.spotifyId, track])
  );

  // Create set of track IDs currently in the playlist
  const playlistTrackIds = new Set(
    tracks.map(track => track.track?.id).filter(Boolean)
  );

  // Update tracks that are no longer in the playlist
  existingTracks.forEach((track) => {
    const isInPlaylist = playlistTrackIds.has(track.spotifyId);
    if (track.currentlyInPlaylist && !isInPlaylist) {
      transaction.patch(track._id, {
        set: { currentlyInPlaylist: false }
      });
    }
  });

  // Process current playlist tracks
  for (const track of tracks) {
    if (!track.track) continue;

    const existingTrack = existingTrackMap.get(track.track.id);
    const newTrackData = {
      name: track.track.name,
      album: track.track.album.name,
      artists: track.track.artists.map(artist => artist.name),
      image: track.track.album.images[0]?.url,
      duration_ms: track.track.duration_ms,
      spotify_url: track.track.external_urls.spotify,
    };

    if (!existingTrack) {
      // Create new track if it doesn't exist
      transaction.create({
        _id: `track.${track.track.id}`,
        _type: 'track',
        spotifyId: track.track.id,
        ...newTrackData,
        addedBy: {
          id: track.added_by?.id || 'Unknown',
          displayName: track.added_by?.display_name || track.added_by?.id || 'Unknown'
        },
        currentlyInPlaylist: true,
      });
    } else if (!existingTrack.currentlyInPlaylist) {
      // Just update playlist status if track exists but isn't marked as in playlist
      transaction.patch(existingTrack._id, {
        set: { currentlyInPlaylist: true }
      });
    }
  }

  try {
    await transaction.commit();
    console.log('Successfully synced tracks to Sanity');
  } catch (error) {
    console.error('Error syncing tracks to Sanity:', error);
    throw error;
  }
}

interface SanityTrackWithComments {
  _id: string;
  spotifyId: string;
  name: string;
  commentCount: number;
  comments: any[]; // or define a proper Comment type if needed
}

async function deduplicateTracks(): Promise<void> {
  console.log('Starting deduplication...');

  const tracksWithComments = await client.fetch<SanityTrackWithComments[]>(`
    *[_type == "track"] {
      _id,
      spotifyId,
      name,
      "commentCount": count(*[_type == "comment" && references(^._id)]),
      "comments": *[_type == "comment" && references(^._id)]
    }
  `);

  console.log('Total tracks before deduplication:', tracksWithComments.length);

  // Group tracks by spotifyId with proper typing
  const groupedTracks = tracksWithComments.reduce<Record<string, SanityTrackWithComments[]>>((acc, track) => {
    if (!track.spotifyId) {
      console.log('Track without spotifyId:', track._id);
      return acc;
    }
    if (!acc[track.spotifyId]) {
      acc[track.spotifyId] = [];
    }
    acc[track.spotifyId].push(track);
    return acc;
  }, {});

  // Log duplicates for inspection with proper typing
  Object.entries(groupedTracks).forEach(([spotifyId, tracks]: [string, SanityTrackWithComments[]]) => {
    if (tracks.length > 1) {
      console.log(`\nFound ${tracks.length} duplicates for spotifyId: ${spotifyId}`);
      tracks.forEach((track: SanityTrackWithComments) => {
        console.log(`- ${track._id}: "${track.name}" (${track.commentCount} comments)`);
      });
    }
  });

  // Find duplicates and determine which to keep
  const transaction = client.transaction();
  let deletedCount = 0;

  for (const spotifyId in groupedTracks) {
    const tracks = groupedTracks[spotifyId];
    if (tracks.length <= 1) continue;

    // Sort by:
    // 1. Has comments (most important)
    // 2. ID format (prefer track.{spotifyId} format)
    // 3. Comment count (if both have comments)
    tracks.sort((a: any, b: any) => {
      // First, prefer tracks with comments
      if (a.commentCount > 0 && b.commentCount === 0) return -1;
      if (b.commentCount > 0 && a.commentCount === 0) return 1;

      // Then prefer track.{spotifyId} format
      const aHasPreferredId = a._id === `track.${spotifyId}`;
      const bHasPreferredId = b._id === `track.${spotifyId}`;
      if (aHasPreferredId && !bHasPreferredId) return -1;
      if (bHasPreferredId && !aHasPreferredId) return 1;

      // Finally, if both have comments, keep the one with more
      return b.commentCount - a.commentCount;
    });

    // Keep the first one after sorting
    const keepTrack = tracks[0];

    // Delete the rest
    tracks.slice(1).forEach((track: any) => {
      console.log(`Deleting duplicate track: ${track._id} (SpotifyId: ${spotifyId})`);
      transaction.delete(track._id);
      deletedCount++;
    });
  }

  try {
    await transaction.commit();
    console.log(`\nDeduplication complete. Deleted ${deletedCount} duplicate tracks.`);

    const remainingTracks = await client.fetch('count(*[_type == "track"])');
    console.log('Total tracks after deduplication:', remainingTracks);
  } catch (error) {
    console.error('Error deduplicating tracks:', error);
    throw error;
  }
}

async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing Spotify credentials');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  const data = await response.json();
  return data.access_token;
}

interface SpotifyUserData {
  id: string;
  displayName: string;
}

interface SpotifyPlaylistTrack {
  track?: {
    id: string;
  };
  added_by?: {
    id: string;
  };
}

export async function migrateAddedByField(): Promise<void> {
  console.log('Starting addedBy field migration...');

  try {
    const accessToken = await getSpotifyToken();

    const playlistId = process.env.SPOTIFY_PLAYLIST_ID;
    if (!playlistId) {
      throw new Error('Missing playlist ID');
    }

    const playlistResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!playlistResponse.ok) {
      throw new Error('Failed to fetch playlist tracks');
    }

    const playlistData = await playlistResponse.json();

    // Create a map of track IDs to their added_by data
    const spotifyTracks = new Map<string, SpotifyUserData>(
      (playlistData.items as SpotifyPlaylistTrack[]).map(item => [
        item.track?.id || '',
        {
          id: item.added_by?.id || 'Unknown',
          displayName: item.added_by?.id || 'Unknown'
        }
      ])
    );

    // Get user display names
    for (const [_, userData] of spotifyTracks) {
      try {
        const response = await fetch(
          `https://api.spotify.com/v1/users/${userData.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          userData.displayName = data.display_name || userData.id;
        }
      } catch (error) {
        console.error(`Failed to fetch user data for ${userData.id}:`, error);
      }
    }

    // Update Sanity documents
    const tracks = await client.fetch(`*[_type == "track"]`);
    const transaction = client.transaction();

    tracks.forEach((track: any) => {
      const spotifyUserData = spotifyTracks.get(track.spotifyId);

      if (spotifyUserData) {
        transaction.patch(track._id, {
          set: {
            addedBy: {
              id: spotifyUserData.id,
              displayName: spotifyUserData.displayName
            }
          }
        });
      }
    });

    await transaction.commit();
    console.log(`Migration complete. Updated ${tracks.length} tracks.`);
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

export const getPlaylistTracks = async (accessToken: string): Promise<Track[]> => {
  try {
    // Sync with Spotify
    try {
      spotifyApi.setAccessToken(accessToken);
      const playlistId = process.env.SPOTIFY_PLAYLIST_ID as string;
      const spotifyData = await spotifyApi.getPlaylistTracks(playlistId);

      await syncTracksToSanity(spotifyData.body.items);
    } catch (error) {
      console.error("Error during Spotify sync:", error);
      throw new Error("Failed during Spotify sync");
    }

    // Fetch from Sanity
    try {
      const query = `*[_type == "track"] {
        spotifyId,
        createdAt,
        name,
        album,
        artists,
        "addedBy": {
          "id": addedBy.id,
          "displayName": addedBy.displayName
        },
        image,
        duration_ms,
        spotify_url,
        description,
        currentlyInPlaylist,
        "comments": *[_type == "comment" && references(^._id)] {
          _id,
          _type,
          text,
          user,
          createdAt,
          track->{
            _id,
            spotifyId
          }
        }
      } | order(currentlyInPlaylist desc, createdAt desc)`;

      const sanityTracks = await client.fetch(query);

      // Convert Sanity format to our Track type
      const tracks: Track[] = sanityTracks.map((sanityTrack: any) => ({
        track: {
          id: sanityTrack.spotifyId,
          name: sanityTrack.name,
          album: {
            name: sanityTrack.album,
            images: [{ url: sanityTrack.image }]
          },
          artists: sanityTrack.artists.map((name: string) => ({ name })),
          duration_ms: sanityTrack.duration_ms,
          spotify_url: sanityTrack.spotify_url,
        },
        added_by: {
          id: sanityTrack.addedBy.id,
          displayName: sanityTrack.addedBy.displayName
        },
        description: sanityTrack.description,
        currentlyInPlaylist: sanityTrack.currentlyInPlaylist,
        comments: sanityTrack.comments,
      }));

      return tracks;
    } catch (error) {
      console.error("Error fetching from Sanity:", error);
      throw new Error("Failed to fetch from Sanity");
    }
  } catch (error) {
    console.error("Top level error in getPlaylistTracks:", error);
    throw error;
  }
};
