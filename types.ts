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
    preview_url: string | null;
  } | null;
  added_by?: {
    display_name?: string;
    id: string;
  };
    description?: {
        description: string;
        addedBy: string;
    };
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
  createdAt: string;
}

export interface User {
  display_name: string;
  id: string;
}
