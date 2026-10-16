import { cp, mkdtemp, rename, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../games/orbit/dist/', import.meta.url));
const staticRoot = fileURLToPath(new URL('../static/', import.meta.url));
const destination = join(staticRoot, 'game');

// Refuse to replace an existing build with a missing or incomplete game build.
if (!(await stat(join(dist, 'index.html')).catch(() => null))?.isFile()) {
	throw new Error('Build Orbit before syncing: games/orbit/dist/index.html is missing.');
}

const staging = await mkdtemp(join(staticRoot, '.orbit-staging-'));
try {
	await cp(dist, staging, { recursive: true });
	await rm(destination, { recursive: true, force: true });
	await rename(staging, destination);
} finally {
	await rm(staging, { recursive: true, force: true });
}

console.log('Orbit production assets synced to static/game.');
