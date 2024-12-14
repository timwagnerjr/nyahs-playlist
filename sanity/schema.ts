import { type SchemaTypeDefinition } from 'sanity'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    {
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
          type: 'object',
          title: 'Added By',
          fields: [
            {
              name: 'id',
              type: 'string',
              title: 'Spotify User ID',
              validation: Rule => Rule.required()
            },
            {
              name: 'displayName',
              type: 'string',
              title: 'Display Name',
              validation: Rule => Rule.required()
            }
          ]
        },
        {
          name: 'image',
          type: 'string',
          title: 'Image URL',
        },
        {
          name: 'duration_ms',
          type: 'number',
          title: 'Duration (ms)',
        },
        {
          name: 'spotify_url',
          type: 'string',
          title: 'Spotify URL',
        },
        {
          name: 'description',
          type: 'text',
          title: 'Description',
          rows: 3,
        },
        {
          name: 'currentlyInPlaylist',
          type: 'boolean',
          title: 'Currently In Playlist',
          initialValue: true,
        },
        {
          name: 'comments',
          type: 'array',
          title: 'Comments',
          of: [{
            type: 'reference',
            to: [{ type: 'comment' }]
          }],
          readOnly: true,
          options: {
            layout: 'grid'
          }
        }
      ],
      preview: {
        select: {
          title: 'name',
          subtitle: 'album',
          addedBy: 'addedBy.displayName'
        },
        prepare(selection: any) {
          const { title, subtitle, addedBy } = selection;
          return {
            title,
            subtitle: `${subtitle} (Added by: ${addedBy || 'Unknown'})`
          };
        }
      }
    },
    {
      name: 'comment',
      type: 'document',
      title: 'Comment',
      fields: [
        {
          name: 'track',
          type: 'reference',
          to: [{ type: 'track' }],
        },
        {
          name: 'text',
          type: 'text',
          title: 'Comment Text',
        },
        {
          name: 'user',
          type: 'string',
          title: 'User',
        },
        {
          name: 'userAvatar',
          type: 'string',
          title: 'User Avatar URL',
        },
        {
          name: 'createdAt',
          type: 'datetime',
          title: 'Created At',
        },
      ],
    },
  ],
}
