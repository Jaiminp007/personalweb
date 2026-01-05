import {
	type Icon,
	IconBrandBluesky,
	IconBrandGithub,
	IconBrandInstagram,
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
	url: dev ? 'http://localhost:5173' : 'https://jaiminpatel.dev',
	description:
		"I'm a first-year Computing and Financial Management (CFM) student at UWaterloo and a Part-time Software Engineer at VantxLab. I specialize in building high-frequency trading systems and multi-agent AI architectures.",
	tags: [
		'Jaimin Patel',
		'Software Engineer',
		'Waterloo',
		'Canada',
		'VantxLab',
		'AlgoClash',
		'CFM',
		'High Frequency Trading',
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
			name: 'VantxLab',
			url: 'https://vantxlab.com'
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
		linkedin: 'https://linkedin.com/in/jaimin-kamal-patel',
		calcom: 'https://cal.com/jaimin-patel-e3fsrw',
		wakatime: 'https://wakatime.com/@Jaimin_Patel',
		bluesky: 'https://bsky.app/profile/jaimin.bsky.social', // Placeholder
		instagram: 'https://instagram.com/jaiminpatel', // Placeholder
		x: 'https://x.com/JaiminPate25520' // Placeholder
	},
	repo: {
		url: 'https://github.com/JasonLovesDoggo/nyx',
		commitBaseUrl: 'https://github.com/JasonLovesDoggo/nyx/commit/'
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
