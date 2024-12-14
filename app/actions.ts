'use server'

import { client } from '../sanity/lib/client';
import { revalidatePath } from 'next/cache';

export async function updateDescription(trackId: string, description: string, userId: string) {
    try {
        await client.patch(`track.${trackId}`)
            .set({ description })
            .commit();

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error updating description:', error);
        return { success: false, error };
    }
}

export async function addComment(trackId: string, text: string, userId: string) {
    try {
        await client.create({
            _type: 'comment',
            track: {
                _type: 'reference',
                _ref: `track.${trackId}`
            },
            text,
            user: userId,
            createdAt: new Date().toISOString()
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error adding comment:', error);
        return { success: false, error };
    }
}

export async function getComments(trackId: string) {
    try {
        const comments = await client.fetch(`
      *[_type == "comment" && track._ref == $trackId] | order(createdAt desc) {
        _id,
        text,
        user,
        createdAt
      }
    `, { trackId: `track.${trackId}` });

        return { success: true, comments };
    } catch (error) {
        console.error('Error fetching comments:', error);
        return { success: false, error };
    }
} 