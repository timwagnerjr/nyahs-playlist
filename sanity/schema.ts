import { type SchemaTypeDefinition } from 'sanity';

const track: SchemaTypeDefinition = {
  name: 'track',
  type: 'document',
  title: 'Track',
  fields: [
    {
      name: 'spotifyId',
      type: 'string',
      title: 'Spotify ID',
    },
    {
      name: 'name',
      type: 'string',
      title: 'Name',
    },
    {
      name: 'album',
      type: 'string',
      title: 'Album',
    },
    {
      name: 'artists',
      type: 'array',
      of: [{ type: 'string' }],
      title: 'Artists',
    },
    {
      name: 'addedBy',
      type: 'string',
      title: 'Added By',
    },
    {
      name: 'description',
      type: 'text',
      title: 'Description',
    },
    {
      name: 'image',
      type: 'url',
      title: 'Image',
    },
  ],
};

const comment: SchemaTypeDefinition = {
  name: 'comment',
  type: 'document',
  title: 'Comment',
  fields: [
    {
      name: 'track',
      type: 'reference',
      to: [{ type: 'track' }],
      title: 'Track',
    },
    {
      name: 'text',
      type: 'text',
      title: 'Text',
    },
    {
      name: 'user',
      type: 'string',
      title: 'User',
    },
    {
      name: 'createdAt',
      type: 'datetime',
      title: 'Created At',
      options: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
        calendarTodayLabel: 'Today',
      },
    },
  ],
};

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [track, comment],
};
