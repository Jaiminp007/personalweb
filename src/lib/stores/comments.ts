/*
 * Copyright (c) 2025. Jason Cameron
 * All Rights Reserved
 */

import { persistentWritable } from './persistance';
import { get } from 'svelte/store';

export interface Comment {
    id: string;
    text: string;
    side: 'left' | 'right';
    xPosition: number; // percentage from left
    yPosition: number; // percentage from top
    createdAt: number;
}

interface CommentsStore {
    [slug: string]: Comment[];
}

/**
 * Store for managing post comments, persisted in localStorage.
 * Each post (identified by slug) can have multiple comments.
 */
export const commentsStore = persistentWritable<CommentsStore>('post-comments', {
    defaultValue: {}
});

/**
 * Generate a unique ID for a comment.
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all comments for a specific post.
 * @param slug - The post slug
 * @returns Array of comments or empty array
 */
export function getComments(slug: string): Comment[] {
    const comments = get(commentsStore);
    return comments[slug] || [];
}

/**
 * Add a new comment to a post.
 * @param slug - The post slug
 * @param side - Which side of the content ('left' or 'right')
 * @param xPosition - Horizontal position as percentage from left
 * @param yPosition - Vertical position as percentage from top
 * @returns The new comment object
 */
export function addComment(slug: string, side: 'left' | 'right', xPosition: number, yPosition: number): Comment {
    const newComment: Comment = {
        id: generateId(),
        text: '',
        side,
        xPosition,
        yPosition,
        createdAt: Date.now()
    };

    commentsStore.update((comments) => ({
        ...comments,
        [slug]: [...(comments[slug] || []), newComment]
    }));

    return newComment;
}

/**
 * Update a comment's text.
 * @param slug - The post slug
 * @param commentId - The comment ID
 * @param text - The new text
 */
export function updateComment(slug: string, commentId: string, text: string): void {
    commentsStore.update((comments) => ({
        ...comments,
        [slug]: (comments[slug] || []).map((c) => (c.id === commentId ? { ...c, text } : c))
    }));
}

/**
 * Delete a comment.
 * @param slug - The post slug
 * @param commentId - The comment ID
 */
export function deleteComment(slug: string, commentId: string): void {
    commentsStore.update((comments) => ({
        ...comments,
        [slug]: (comments[slug] || []).filter((c) => c.id !== commentId)
    }));
}

/**
 * Delete all comments for a post.
 * @param slug - The post slug
 */
export function deleteAllComments(slug: string): void {
    commentsStore.update((comments) => ({
        ...comments,
        [slug]: []
    }));
}
