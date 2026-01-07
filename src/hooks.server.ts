import type { Handle } from '@sveltejs/kit';
import redirects from '$lib/config/redirects';

// Keep-alive for Render free tier
// This prevents the server from spinning down due to inactivity
if (process.env.NODE_ENV === 'production') {
	const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes
	const URL = 'https://jaimin-patel.me/';

	// Initial ping
	console.log(`[KEEP-ALIVE] Initializing keep-alive for ${URL}`);

	setInterval(async () => {
		try {
			console.log(`[KEEP-ALIVE] Pinging ${URL}...`);
			const res = await fetch(URL);
			console.log(`[KEEP-ALIVE] Ping status: ${res.status}`);
		} catch (e) {
			console.error('[KEEP-ALIVE] Ping failed:', e);
		}
	}, PING_INTERVAL);
}

// This hook handles redirects for specific paths to their corresponding URLs.
// I.E. A redirect from '/github' to Site.out.github or so.
export const handle: Handle = async ({ event, resolve }) => {
	const url = event.url.pathname.replace(/\/$/, '');
	const redirectTo = redirects[url];
	if (redirectTo) {
		console.log('[REDIRECTS] Handling redirect for:', url);
		return new Response(null, {
			status: 302,
			headers: { Location: redirectTo }
		});
	}

	return resolve(event);
};
