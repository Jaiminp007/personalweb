<script lang="ts">
	import { IconBrandGithub, IconBrandLinkedin, IconMail, IconStar } from '@tabler/icons-svelte';
	import Site from '$lib/config/common';
	import AnchorHeader from '$lib/components/AnchorHeader.svelte';

	const handleEmailClick = () => {
		window.location.href = 'mailto:jk22pate@uwaterloo.ca';
	};

	type str = string; // my IDE yells at me if i use string in the snippet. :shrug:
	type num = number; // my IDE yells at me if i use string in the snippet. :shrug:
</script>

<svelte:head>
	<title>About Me | Jaimin Patel</title>
</svelte:head>

{#snippet GithubProject(title: str, href: str, stars: num)}
	<a {href} id={title.toLowerCase()} target="_blank" rel="noopener noreferrer" class="link">
		{title}
	</a>

	<span class="inline-flex items-center space-x-1 text-sm">
		<!--  <CountUp duration={300} value={stars} />-->
		{stars}
		<IconStar class="ml-1" size={14} />
	</span>
{/snippet}

<div class="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-6">
	<!-- About Me Section -->
	<section class="space-y-6">
		<h1 class="flex items-center gap-3 text-3xl font-bold md:text-4xl">
			<span>About Me</span>
		</h1>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<div class="md:col-span-1">
				<img
					src="/images/jaimin-character.png"
					alt="Pixel-art character portrait of Jaimin Patel"
					class="h-auto w-full rounded-md object-cover shadow-lg transition-transform duration-300 hover:scale-[1.02]"
				/>
			</div>

			<div class="space-y-4 md:col-span-2">
				<p class="text-subtext0 text-base leading-relaxed">
					<b>Hey!</b> I'm Jaimin Patel <a class="link" href={Site.out.github}>(@Jaiminp007)</a> — a
					Computing and Financial Management (CFM) student at UWaterloo and the founder of
					<a class="link" href="https://www.polarline.io/" target="_blank" rel="noopener"
						>Polarline Markets</a
					>.
				</p>

				<p class="text-subtext0 text-base leading-relaxed">
					I build AI-native tools for investment research, fund operations, prediction markets, and
					systematic trading. Polarline’s Scout brings Front Office and Back Office workflows
					together, while
					<a class="link" href="https://github.com/finny-ai/finny" target="_blank" rel="noopener"
						>Finny</a
					> is an AI financial harness that researches strategies and tries to disprove them before they
					meet real capital. I also worked as a Software Engineer Intern at HyperOdd, building prediction
					market infrastructure.
				</p>

				<p class="text-subtext0 text-base leading-relaxed">
					My earlier work includes
					{@render GithubProject('AlgoClash', 'https://github.com/Jaiminp007/AlgoLive', 10)}, a
					real-time AI trading arena;
					{@render GithubProject(
						'Limit Order Book',
						'https://github.com/Jaiminp007/High-Performance-Limit-Order-Book',
						5
					)}, a C++17 matching engine; and reproducible research in the
					<a class="link" href="/projects/research-open-source">Fly Ecosystem</a> project.
				</p>

				<p class="text-subtext0 text-base leading-relaxed">
					When I'm not coding, I enjoy exploring new technologies and participating in hackathons.
					Feel free to <button onclick={handleEmailClick} class="link cursor-pointer"
						>shoot me an email</button
					> if you'd like to chat.
				</p>

				<div class="flex flex-wrap gap-3 pt-2">
					<a
						href={Site.out.github}
						target="_blank"
						rel="noopener noreferrer"
						class="hover:text-accent inline-flex items-center gap-1.5 text-sm transition-colors"
					>
						<IconBrandGithub size={16} />
						GitHub
					</a>

					<span class="text-surface1">*</span>

					<a
						href={Site.out.linkedin}
						target="_blank"
						rel="noopener noreferrer"
						class="hover:text-accent inline-flex items-center gap-1.5 text-sm transition-colors"
					>
						<IconBrandLinkedin size={16} />
						LinkedIn
					</a>

					<span class="text-surface1">*</span>
					<span
						role="button"
						aria-label="Send an email to contact"
						class="hover:text-accent inline-flex cursor-pointer items-center gap-1.5 text-sm transition-colors"
						tabindex="0"
						onclick={handleEmailClick}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								handleEmailClick();
							}
						}}
					>
						<IconMail size={16} />
						jk22pate[at]uwaterloo.ca
					</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Experience Section -->
	<section class="space-y-6">
		<AnchorHeader level="h2" class="flex items-center gap-3 text-2xl font-bold">
			<span>Experience</span>
		</AnchorHeader>

		<div class="space-y-6">
			<div class="prose prose-sm text-subtext0 max-w-none">
				<div class="mb-4">
					<h3 class="text-text text-xl font-semibold">Chief Executive Officer</h3>
					<div class="text-subtext1 flex justify-between">
						<span>Polarline Markets • Toronto, ON</span>
						<span>Aug 2026 – Present</span>
					</div>
					<ul class="mt-2 list-disc space-y-1 pl-5">
						<li>
							Building an AI-native operating system for investment research and fund operations.
						</li>
						<li>
							Developing Scout Front Office and Back Office workflows around research, backtesting,
							and reconciliation.
						</li>
					</ul>
				</div>

				<div class="mb-4">
					<h3 class="text-text text-xl font-semibold">Software Engineer Intern</h3>
					<div class="text-subtext1 flex justify-between">
						<span>HyperOdd • Remote</span>
						<span>May 2026 – Aug 2026</span>
					</div>
					<ul class="mt-2 list-disc space-y-1 pl-5">
						<li>Built prediction market infrastructure for a crypto-native trading platform.</li>
					</ul>
				</div>

				<div class="mb-4">
					<h3 class="text-text text-xl font-semibold">Artificial Intelligence Research Intern</h3>
					<div class="text-subtext1 flex justify-between">
						<span>VantxLab • Toronto, ON</span>
						<span>Dec 2025 – Apr 2026</span>
					</div>
					<ul class="mt-2 list-disc space-y-1 pl-5">
						<li>Built AI-integrated health infrastructure and gamified analytics.</li>
					</ul>
				</div>

				<div class="mb-4">
					<p>
						I’m interested in systems where the evidence matters as much as the output: market
						microstructure, agent evaluation, data integrity, and software that can be inspected and
						reproduced.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Education Section -->
	<section class="space-y-6">
		<AnchorHeader level="h2" class="flex items-center gap-3 text-2xl font-bold">
			<span>Education</span>
		</AnchorHeader>

		<div class="space-y-6">
			<div class="prose prose-sm text-subtext0 max-w-none">
				<div>
					<h3 class="text-text text-xl font-semibold">University of Waterloo</h3>
					<div class="text-subtext1 flex justify-between">
						<span>Computing and Financial Management (CFM) • Waterloo, ON</span>
						<span>Sept 2025 – Present</span>
					</div>
					<p class="mt-2">
						<b>Awards:</b> 1st Place Overall in CFM 101 Market Meet Competition, President’s Scholarship
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Technical Skills Section -->
	<section class="space-y-6">
		<AnchorHeader level="h2" class="flex items-center gap-3 text-2xl font-bold">
			<span>Technical Skills</span>
		</AnchorHeader>

		<div class="space-y-6">
			<div class="text-subtext0 grid grid-cols-1 gap-6 md:grid-cols-2">
				<div class="bg-surface0 rounded-lg p-4">
					<h3 class="text-text mb-2 text-lg font-semibold">Languages</h3>
					<p>C++ (C++17), C, Rust, Python, TypeScript, JavaScript, SQL, HTML/CSS, Bash</p>
				</div>
				<div class="bg-surface0 rounded-lg p-4">
					<h3 class="text-text mb-2 text-lg font-semibold">Frameworks/Tools</h3>
					<p>
						React, React Native, FastAPI, Flask, Node.js, Docker, Git, GitHub Actions, AWS, Linux,
						PostgreSQL, Firebase, Render, n8n, OpenAI API, YouTube API
					</p>
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	/* Offset for fixed navbar when navigating to anchors */
	:global(html) {
		scroll-padding-top: 5rem; /* Adjust based on your navbar height */
	}
</style>
