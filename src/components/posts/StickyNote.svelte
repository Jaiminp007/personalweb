<!--
  Copyright (c) 2025. Jason Cameron
  All Rights Reserved
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import {
		commentsStore,
		getComments,
		addComment,
		updateComment,
		deleteComment,
		deleteAllComments,
		type Comment
	} from '$lib/stores/comments';

	export let slug: string;

	let comments: Comment[] = [];
	let showLeftHint = false;
	let showRightHint = false;
	let hintX = 0;
	let hintY = 0;
	let debounceTimers: { [id: string]: ReturnType<typeof setTimeout> } = {};
	let newNoteId: string | null = null;

	onMount(() => {
		comments = getComments(slug);

		const unsubscribe = commentsStore.subscribe(() => {
			comments = getComments(slug);
		});

		return unsubscribe;
	});

	function handleEdgeClick(side: 'left' | 'right', event: MouseEvent) {
		// Capture actual click position in pixels
		const xPosition = event.clientX;
		// Calculate Y position relative to the document (scroll + viewport position)
		const yPosition = window.scrollY + event.clientY;

		const newComment = addComment(slug, side, xPosition, yPosition);
		newNoteId = newComment.id;

		setTimeout(() => {
			newNoteId = null;
		}, 400);
	}

	function handleEdgeHover(side: 'left' | 'right', event: MouseEvent) {
		hintX = event.clientX;
		hintY = event.clientY;

		if (side === 'left') {
			showLeftHint = true;
			showRightHint = false;
		} else {
			showRightHint = true;
			showLeftHint = false;
		}
	}

	function handleEdgeLeave() {
		showLeftHint = false;
		showRightHint = false;
	}

	function handleInput(commentId: string, event: Event) {
		const target = event.target as HTMLTextAreaElement;
		const text = target.value;

		if (debounceTimers[commentId]) {
			clearTimeout(debounceTimers[commentId]);
		}
		debounceTimers[commentId] = setTimeout(() => {
			updateComment(slug, commentId, text);
		}, 300);
	}

	function handleDelete(commentId: string) {
		deleteComment(slug, commentId);
	}

	function handleDeleteAll() {
		if (comments.length > 0) {
			deleteAllComments(slug);
		}
	}
</script>

<!-- Delete All button - only show when there are comments -->
{#if comments.length > 0}
	<button class="delete-all-btn" on:click={handleDeleteAll} aria-label="Delete all notes">
		Delete All
	</button>
{/if}

<!-- Full-width margin zones: from edge of page to edge of content -->
<div
	class="edge-zone left"
	role="button"
	tabindex="0"
	aria-label="Add note on left side"
	on:click={(e) => handleEdgeClick('left', e)}
	on:keydown={(e) => e.key === 'Enter' && handleEdgeClick('left', e as unknown as MouseEvent)}
	on:mousemove={(e) => handleEdgeHover('left', e)}
	on:mouseleave={handleEdgeLeave}
>
	{#if showLeftHint}
		<div class="add-hint" style="left: {hintX}px; top: {hintY}px;">
			<span class="plus-icon">+</span>
		</div>
	{/if}
</div>

<div
	class="edge-zone right"
	role="button"
	tabindex="0"
	aria-label="Add note on right side"
	on:click={(e) => handleEdgeClick('right', e)}
	on:keydown={(e) => e.key === 'Enter' && handleEdgeClick('right', e as unknown as MouseEvent)}
	on:mousemove={(e) => handleEdgeHover('right', e)}
	on:mouseleave={handleEdgeLeave}
>
	{#if showRightHint}
		<div class="add-hint" style="left: {hintX}px; top: {hintY}px;">
			<span class="plus-icon">+</span>
		</div>
	{/if}
</div>

<!-- Render all sticky notes -->
{#each comments as comment (comment.id)}
	<div
		class="sticky-note {comment.side}"
		class:new-note={comment.id === newNoteId}
		style="left: {comment.xPosition}px; top: {comment.yPosition}px;"
	>
		<button class="delete-btn" on:click={() => handleDelete(comment.id)} aria-label="Delete note">
			×
		</button>
		<textarea
			class="note-textarea"
			placeholder="Write here..."
			value={comment.text}
			on:input={(e) => handleInput(comment.id, e)}
			rows="2"
			spellcheck="false"
		></textarea>
	</div>
{/each}

<style>
	.delete-all-btn {
		position: fixed;
		top: 80px;
		right: 20px;
		padding: 0.5rem 1rem;
		background: rgba(220, 53, 69, 0.9);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.85rem;
		font-weight: 500;
		cursor: pointer;
		z-index: 100;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		transition: all 0.2s ease;
	}

	.delete-all-btn:hover {
		background: rgba(200, 35, 51, 1);
		transform: scale(1.02);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.edge-zone {
		position: fixed;
		top: 0;
		bottom: 0;
		cursor: pointer;
		z-index: 50;
	}

	/* Left zone: from left edge to where content starts */
	/* Content is max-w-4xl (896px) centered, so margin is (100vw - 896px) / 2 */
	.edge-zone.left {
		left: 0;
		/* Use calc to extend to where content starts */
		width: calc((100vw - min(896px, 100vw - 2rem)) / 2);
	}

	/* Right zone: from where content ends to right edge */
	.edge-zone.right {
		right: 0;
		width: calc((100vw - min(896px, 100vw - 2rem)) / 2);
	}

	.add-hint {
		position: fixed;
		transform: translate(-50%, -50%);
		display: flex;
		align-items: center;
		justify-content: center;
		animation: pulse 1.5s ease-in-out infinite;
		pointer-events: none;
	}

	.plus-icon {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--current-accent-color);
		color: var(--color-base);
		border-radius: 50%;
		font-size: 1.25rem;
		font-weight: bold;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.7;
			transform: translate(-50%, -50%) scale(1);
		}
		50% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1.1);
		}
	}

	.sticky-note {
		position: absolute;
		width: 120px;
		padding: 0.5rem;
		background: var(--current-accent-color);
		border-radius: 4px;
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.15),
			2px 2px 0 rgba(0, 0, 0, 0.05);
		z-index: 60;
		transform-origin: center;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.sticky-note.left {
		transform: rotate(-2deg);
	}

	.sticky-note.right {
		transform: rotate(2deg);
	}

	.sticky-note:hover {
		transform: rotate(0deg) scale(1.02);
		box-shadow:
			0 6px 16px rgba(0, 0, 0, 0.2),
			2px 2px 0 rgba(0, 0, 0, 0.05);
	}

	.sticky-note.new-note {
		animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes popIn {
		0% {
			opacity: 0;
			transform: scale(0.3) rotate(0deg);
		}
		100% {
			opacity: 1;
			transform: scale(1) rotate(-2deg);
		}
	}

	.sticky-note.right.new-note {
		animation: popInRight 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes popInRight {
		0% {
			opacity: 0;
			transform: scale(0.3) rotate(0deg);
		}
		100% {
			opacity: 1;
			transform: scale(1) rotate(2deg);
		}
	}

	.delete-btn {
		position: absolute;
		top: 4px;
		right: 4px;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.2);
		color: var(--color-base);
		border: none;
		border-radius: 50%;
		cursor: pointer;
		font-size: 1rem;
		line-height: 1;
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	.sticky-note:hover .delete-btn {
		opacity: 1;
	}

	.delete-btn:hover {
		background: rgba(0, 0, 0, 0.4);
	}

	.note-textarea {
		width: 100%;
		background: transparent;
		border: none;
		resize: none;
		font-family: 'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive, sans-serif;
		font-size: 0.8rem;
		color: var(--color-base);
		line-height: 1.4;
	}

	.note-textarea::placeholder {
		color: color-mix(in oklch, var(--color-base) 60%, transparent);
	}

	.note-textarea:focus {
		outline: none;
	}

	/* Hide on screens too narrow for margins */
	@media (max-width: 960px) {
		.edge-zone,
		.sticky-note,
		.delete-all-btn {
			display: none;
		}
	}
</style>
