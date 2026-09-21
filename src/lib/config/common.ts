import {
	type Icon,
	IconBrandBluesky,
	IconBrandGithub,
	IconBrandLinkedin,
	IconBrandX
} from '@tabler/icons-svelte';
import { dev } from '$app/environment';
import Wakatime from '$lib/icons/Wakatime.svelte';

interface Site {
	name: string;
	shortName: string;
	url: string;
	description: string;
	tags: string[];
	seo: {
		author: string;
		birthDate: string;
		worksFor: {
			name: string;
			url: string;
		};
		location: {
			city: string;
			region: string;
			country: string;
		};
	};
	abacus: { instance: string; namespace: string; key: string };
	out: {
		github: string;
		linkedin: string;
		calcom: string;
		wakatime: string;
		bluesky: string;
		instagram: string;
		x: string;
	};
	repo: { url: string; commitBaseUrl: string };
}

const Site: Site = {
	name: 'Jaimin Patel',
	shortName: 'jam',
	url: dev ? 'http://localhost:5173' : 'https://www.jaimin-patel.me',
	description:
		"I'm a Computing and Financial Management student at UWaterloo and the founder of Polarline Markets. I build AI-native tools for investment research, fund operations, prediction markets, and systematic trading.",
	tags: [
		'Jaimin Patel',
		'Founder',
		'Software Engineer',
		'Waterloo',
		'Canada',
		'Polarline Markets',
		'Finny',
		'HyperOdd',
		'AlgoClash',
		'CFM',
		'Prediction Markets',
		'Systematic Trading',
		'AI Agents',
		'Full Stack Developer',
		'Python',
		'C++',
		'React',
		'Quant'
	],
	seo: {
		author: 'Jaimin Patel',
		birthDate: '2005-01-01', // Placeholder date
		worksFor: {
			name: 'Polarline Markets',
			url: 'https://www.polarline.io'
		},
		location: {
			city: 'Waterloo',
			region: 'Ontario',
			country: 'Canada'
		}
	},
	abacus: {
		instance: 'https://abacus.jasoncameron.dev',
		namespace: 'jaiminpatel',
		key: 'portfolio'
	},
	out: {
		github: 'https://github.com/Jaiminp007',
		linkedin: 'https://www.linkedin.com/in/jaimin-patel007',
		calcom: 'https://cal.com/jaimin-patel-e3fsrw',
		wakatime: 'https://wakatime.com/@Jaimin_Patel',
		bluesky: 'https://bsky.app/profile/jaimin.bsky.social', // Placeholder
		instagram: 'https://instagram.com/jaiminpatel', // Placeholder
		x: 'https://x.com/JaiminPate25520' // Placeholder
	},
	repo: {
		url: 'https://github.com/Jaiminp007/personalweb',
		commitBaseUrl: 'https://github.com/Jaiminp007/personalweb/commit/'
	}
};

export default Site;

export const Socials = [
	{
		url: Site.out.github,
		label: 'GitHub',
		icon: IconBrandGithub,
		footer: true
	},
	{
		url: Site.out.linkedin,
		label: 'LinkedIn',
		icon: IconBrandLinkedin,
		footer: true
	},
	{
		url: Site.out.x,
		label: 'X',
		icon: IconBrandX,
		footer: true
	},
	{
		url: Site.out.bluesky,
		label: 'Bluesky',
		icon: IconBrandBluesky,
		footer: false
	},

	{
		url: Site.out.wakatime,
		label: 'WakaTime',
		icon: Wakatime as unknown as Icon,
		footer: false
	}
];
