export interface Track {
  track: {
    id: string;
    name: string;
    album: {
      name: string;
      images: { url: string }[];
    };
    artists: { name: string }[];
    duration_ms: number;
    spotify_url: string;
  } | null;
  added_by?: {
    id: string;
    displayName: string;
  };
  description?: string;
  currentlyInPlaylist?: boolean;
  comments?: Comment[];
}

export interface Comment {
  _id: string;
  _type: string;
  track: {
    _ref: string;
    _type: string;
  };
  text: string;
  user: string;
  userDisplayName?: string;
  userAvatar?: string;
  createdAt: string;
}

export interface User {
  display_name: string;
  id: string;
}
