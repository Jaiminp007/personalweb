<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	const breadcrumbs = $derived(page.url.pathname.split('/').filter(Boolean).slice(0, 4));
	let command = $state('');

	function handleKeydown(e) {
		if (e.key === 'Enter' && command.trim()) {
			let input = command.trim();

			if (input.startsWith('~')) {
				// Treat ~ as root
				input = input.replace(/^~/, '');
				if (!input.startsWith('/')) input = '/' + input;
				goto(input);
			} else if (input.startsWith('/')) {
				// Absolute path
				goto(input);
			} else {
				// Relative to current page
				let current = page.url.pathname;
				if (!current.endsWith('/')) current += '/';
				goto(current + input);
			}
			command = '';
		}
	}
</script>

{#snippet breadcrumb({ text, href = undefined })}
	<li class="inline-flex items-center">
		{#if href}
			<a class="animation-wiggle hover:text-accent" {href}>{text}</a>
		{:else}
			<span aria-current="page">{text}</span>
		{/if}
	</li>
{/snippet}

<nav aria-label="Breadcrumbs">
	<ul class="text-md flex items-center">
		<li class="inline-flex items-center">
			<a class="animation-wiggle text-accent hover:text-accent/40" href="/">~</a>
		</li>

		{#each breadcrumbs as text, i ('Bred' + i)}
			<li class="mx-0.5 inline-flex items-center">/</li>
			{@const href = '/' + breadcrumbs.slice(0, i + 1).join('/')}

			{#if i === breadcrumbs.length - 1}
				{@render breadcrumb({ text })}
			{:else}
				{@render breadcrumb({ text, href })}
			{/if}
		{/each}
		<li class="mx-0.5 inline-flex items-center" aria-hidden="true">/</li>

		<li class="ml-1 inline-flex items-center relative">
			<input 
				type="text" 
				bind:value={command}
				onkeydown={handleKeydown}
				class="bg-transparent border-none outline-none text-accent caret-accent min-w-[1ch] p-0 m-0 cursor-blink placeholder-transparent focus:ring-0"
				style="width: {Math.max(1, command.length)}ch;"
				aria-label="Command input"
        spellcheck="false"
			/>
		</li>
	</ul>
</nav>

<style>
	/* Optional: styling to match the previous blinking block cursor if possible 
	   But standard caret is usually preferred for inputs. 
	   If we want the block caret back, we'd need custom caret styling which is tricky cross-browser. 
	   For now, standard caret with accent color.
	*/
</style>
