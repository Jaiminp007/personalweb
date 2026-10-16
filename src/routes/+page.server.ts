import type { PageServerLoad } from './$types';
import { fetchLatestCommits } from '$lib/api/commits';
import { measurePerformance } from '$lib/utils/performance';

type PolarlinePost = {
	title: string;
	href: string;
	publishedAt: string;
};

function decodeXmlText(value: string): string {
	return value
		.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
		.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (match, entity: string) => {
			if (entity.startsWith('#x'))
				return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
			if (entity.startsWith('#')) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
			return (
				{
					amp: '&',
					lt: '<',
					gt: '>',
					quot: '"',
					apos: "'"
				}[entity.toLowerCase()] ?? match
			);
		})
		.trim();
}

function readXmlTag(item: string, tag: string): string {
	const match = item.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
	return match ? decodeXmlText(match[1]) : '';
}

async function fetchPolarlinePosts(): Promise<PolarlinePost[]> {
	try {
		const response = await fetch('https://www.polarline.io/feed.xml', {
			headers: { accept: 'application/rss+xml, application/xml, text/xml' },
			signal: AbortSignal.timeout(5000)
		});
		if (!response.ok) return [];

		const feed = await response.text();
		return [...feed.matchAll(/<item>([\s\S]*?)<\/item>/g)]
			.map(([, item]) => ({
				title: readXmlTag(item, 'title'),
				href: readXmlTag(item, 'link'),
				publishedAt: readXmlTag(item, 'pubDate')
			}))
			.filter((post) => {
				try {
					const url = new URL(post.href);
					return (
						post.title &&
						post.publishedAt &&
						url.origin === 'https://www.polarline.io' &&
						url.pathname.startsWith('/blog/')
					);
				} catch {
					return false;
				}
			})
			.slice(0, 3);
	} catch {
		return [];
	}
}

export const load: PageServerLoad = async (event) => {
	const kv = event.platform?.env?.NYXCACHE;

	return await measurePerformance('homepage-load-total', async () => {
		const [commitData, polarlinePosts] = await Promise.all([
			fetchLatestCommits(kv),
			measurePerformance('get-polarline-blog', fetchPolarlinePosts)
		]);

		return { commitData, polarlinePosts };
	});
};
