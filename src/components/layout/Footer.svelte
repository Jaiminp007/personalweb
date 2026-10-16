<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Site, { Socials } from '$lib/config/common';
	import { IconClock, IconGitCommit } from '@tabler/icons-svelte';
	import { persistentWritable } from '$lib/stores/persistance';

	const { value } = $props();

	const year = new Date().getFullYear();
	const shortSha = env.PUBLIC_COMMIT_SHA ? env.PUBLIC_COMMIT_SHA.substring(0, 7) : '';
	const commitLinkUrl = env.PUBLIC_COMMIT_SHA
		? `${Site.repo.commitBaseUrl}${env.PUBLIC_COMMIT_SHA}`
		: '#';

	let timeOnSite = $state('00:00');

	const totalTimeOnSite = persistentWritable<number>('total-time-on-site', {
		defaultValue: 0
	});

	function formatTime(seconds: number): string {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		if (hours > 0) {
			return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
		}
		return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	onMount(() => {
		if (browser) {
			const sessionStart = Date.now();
			const initialTime = $totalTimeOnSite;

			const interval = setInterval(() => {
				const sessionElapsed = Math.floor((Date.now() - sessionStart) / 1000);
				timeOnSite = formatTime(initialTime + sessionElapsed);
			}, 1000);

			const saveTime = () => {
				const sessionElapsed = Math.floor((Date.now() - sessionStart) / 1000);
				$totalTimeOnSite = initialTime + sessionElapsed;
			};

			window.addEventListener('beforeunload', saveTime);

			return () => {
				clearInterval(interval);
				window.removeEventListener('beforeunload', saveTime);
				saveTime();
			};
		}
	});
</script>

<div class="relative m-auto mx-5 mb-5">
	<!-- Raised webring section that morphs into the footer -->

	<!-- Main footer with smooth connection to the raised section -->
	<footer
		class="bg-crust text-subtext0 border-surface0/20 flex h-auto flex-col items-center justify-center gap-y-3 rounded-lg border p-5 text-sm md:flex-row md:justify-between md:gap-y-0"
	>
		<div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 md:justify-start">
			<span class="whitespace-nowrap">© {year} Jaimin Patel</span>
		</div>

		<div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 md:justify-end">
			<div class="flex items-center gap-1.5" title="How long you have been surfing my site">
				<IconClock size={14} class="text-subtext1" />
				<span class="text-accent font-mono text-xs">{timeOnSite}</span>
			</div>

			<a
				href="https://abacus.jasoncameron.dev"
				target="_blank"
				rel="noopener noreferrer"
				class="text-subtext1 hover:text-accent transition-colors duration-200"
				title="View Site Analytics"
			>
				{value} views
			</a>

			{#if env.PUBLIC_COMMIT_SHA && env.PUBLIC_COMMIT_SHA !== 'dev'}
				<span class="text-surface0 hidden sm:inline">-</span>
				<a
					href={commitLinkUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="text-subtext1 hover:text-accent flex items-center gap-x-1 transition-colors duration-200"
					title="View deployment commit ({env.PUBLIC_COMMIT_SHA})"
				>
					<IconGitCommit size={18} stroke={1.5} class="flex-shrink-0" />
					<span>{shortSha}</span>
				</a>
				<span class="text-surface0 hidden sm:inline">-</span>
			{/if}

			<div class="flex items-center gap-x-3">
				{#each Socials.filter((item) => item.footer) as item (item.url)}
					{@const Icon = item.icon}
					<a
						href={item.url}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={item.label}
						class="text-subtext1 hover:text-accent transition-colors duration-200"
					>
						<Icon stroke={1.5} />
					</a>
				{/each}
			</div>
		</div>
	</footer>
</div>
