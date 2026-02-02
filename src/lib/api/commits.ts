import { measurePerformance } from '$lib/utils/performance';
import { getKV, setKV, isCacheStale } from '$lib/utils/edge-cache';
import type { KVNamespace } from '@cloudflare/workers-types';

export interface CommitLanguage {
	size: number;
	name: string;
	color: string;
}

export interface ProcessedCommit {
	repo: string;
	message: string;
	href: string;
	sha: string;
	date: string;
	additions?: number;
	deletions?: number;
}

export interface CommitData {
	commits: ProcessedCommit[];
	languages: CommitLanguage[];
	totalAdditions: number;
	totalDeletions: number;
	totalCommits: number;
}

const KV_KEY = 'github:commits';
const TTL_MS = 15 * 60 * 1000; // 15 minutes
const GITHUB_USERNAME = 'Jaiminp007';

// Language colors from GitHub
const LANG_COLORS: Record<string, string> = {
	Python: '#3572A5',
	TypeScript: '#3178c6',
	JavaScript: '#f1e05a',
	'C++': '#f34b7d',
	C: '#555555',
	Svelte: '#ff3e00',
	CSS: '#663399',
	HTML: '#e34c26',
	Go: '#00ADD8',
	Rust: '#dea584',
	Java: '#b07219',
	Shell: '#89e051'
};

// Fallback data in case GitHub API fails
const FALLBACK_DATA: CommitData = {
	commits: [
		{
			repo: 'Jaiminp007/AlgoLive',
			message: 'feat: AI trading agent arena',
			href: 'https://github.com/Jaiminp007/AlgoLive',
			sha: 'latest',
			date: new Date().toISOString(),
			additions: 0,
			deletions: 0
		}
	],
	languages: [
		{ size: 400000, name: 'Python', color: '#3572A5' },
		{ size: 300000, name: 'TypeScript', color: '#3178c6' },
		{ size: 200000, name: 'C++', color: '#f34b7d' }
	],
	totalAdditions: 0,
	totalDeletions: 0,
	totalCommits: 0
};

interface GitHubCommit {
	sha: string;
	commit: {
		message: string;
		author: {
			date: string;
		};
	};
	html_url: string;
	stats?: {
		additions: number;
		deletions: number;
	};
}

interface GitHubRepo {
	name: string;
	full_name: string;
	language: string | null;
	size: number;
	pushed_at: string;
}

/**
 * Fetches real commits from GitHub API by checking each repo
 */
async function fetchFromGitHub(): Promise<CommitData> {
	const headers = {
		Accept: 'application/vnd.github.v3+json',
		'User-Agent': 'portfolio-website/1.0'
	};

	// First, fetch user's repos sorted by recently pushed
	const reposResponse = await fetch(
		`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=10`,
		{ headers, signal: AbortSignal.timeout(5000) }
	);

	if (!reposResponse.ok) throw new Error(`GitHub API error: ${reposResponse.status}`);

	const repos: GitHubRepo[] = await reposResponse.json();

	// Fetch latest commits from top repos
	const commits: ProcessedCommit[] = [];
	const commitPromises = repos.slice(0, 5).map(async (repo) => {
		try {
			const commitsResponse = await fetch(
				`https://api.github.com/repos/${repo.full_name}/commits?per_page=3`,
				{ headers, signal: AbortSignal.timeout(3000) }
			);
			if (commitsResponse.ok) {
				const repoCommits: GitHubCommit[] = await commitsResponse.json();
				return repoCommits.map((c) => ({
					repo: repo.full_name,
					message: c.commit.message.split('\n')[0], // First line only
					href: c.html_url,
					sha: c.sha.substring(0, 7),
					date: c.commit.author.date,
					additions: c.stats?.additions,
					deletions: c.stats?.deletions
				}));
			}
		} catch {
			// Ignore individual repo failures
		}
		return [];
	});

	const allCommits = (await Promise.all(commitPromises)).flat();

	// Sort by date and take top 5
	allCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	commits.push(...allCommits.slice(0, 5));

	// Build language breakdown from repos
	const langMap = new Map<string, number>();
	for (const repo of repos) {
		if (repo.language) {
			langMap.set(repo.language, (langMap.get(repo.language) || 0) + repo.size);
		}
	}

	const languages = Array.from(langMap.entries())
		.map(([name, size]) => ({
			name,
			size,
			color: LANG_COLORS[name] || '#888888'
		}))
		.sort((a, b) => b.size - a.size)
		.slice(0, 8);

	return {
		commits,
		languages,
		totalAdditions: 0,
		totalDeletions: 0,
		totalCommits: commits.length
	};
}

/**
 * Fetches the latest commits from GitHub API with KV cache (stale-while-revalidate)
 */
export async function fetchLatestCommits(kv?: KVNamespace): Promise<CommitData> {
	// If KV available, try cache-first approach
	if (kv) {
		const cached = await getKV<CommitData>(kv, KV_KEY);
		if (cached) {
			// Check if stale before refreshing
			if (isCacheStale(cached, TTL_MS)) {
				console.log('[PERF] fetchLatestCommits: Cache stale, refreshing in background');
				void refreshCache(kv);
			} else {
				console.log('[PERF] fetchLatestCommits: Cache fresh, using cached data');
			}
			return cached.data;
		}
	}

	// No KV or no cache - fetch directly
	console.log('[PERF] fetchLatestCommits: NO CACHE - fetching from GitHub...');
	return await refreshCache(kv);
}

async function refreshCache(kv?: KVNamespace): Promise<CommitData> {
	return await measurePerformance('github-api-fetch', async () => {
		try {
			const data = await fetchFromGitHub();
			console.log(`[PERF] github-response: ${data.commits.length} commits fetched`);
			if (kv) await setKV(kv, KV_KEY, data);
			return data;
		} catch (err) {
			console.warn('GitHub fetch failed:', err);
			// Try KV cache if available
			if (kv) {
				const cached = await getKV<CommitData>(kv, KV_KEY);
				if (cached) {
					console.log('Using stale KV cache after fetch failure');
					return cached.data;
				}
			}
			console.log('Using fallback data after fetch failure');
			return FALLBACK_DATA;
		}
	});
}
