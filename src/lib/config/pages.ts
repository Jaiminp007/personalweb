import { IconBrandGithub, IconBrandLinkedin, IconBrandX } from '@tabler/icons-svelte';
import Site from '$lib/config/common';

export const Home = {
	socialLinks: [
		{
			href: Site.out.github,
			text: 'GitHub',
			icon: IconBrandGithub
		},
		{
			href: Site.out.linkedin,
			text: 'LinkedIn',
			icon: IconBrandLinkedin
		},
		{ href: Site.out.x, text: '', icon: IconBrandX }
	]
};

export interface ExperienceTimelineItem {
	company: string;
	role: string;
	url: string;
	logoUrl: string;
	logoAlt: string;
	startDate: string;
	endDate?: string; // optional endDate. If present, it's a past role.
	details?: string; // Optional details for expansion
	logoScale?: number; // Optional logo scale multiplier
	logoTreatment?: 'light-mark';
}

export const experienceTimeline: ExperienceTimelineItem[] = [
	{
		company: 'Polarline Markets',
		role: 'Founder',
		url: 'https://www.polarline.io',
		logoUrl: '/logos/polarline-wordmark.png',
		logoAlt: 'Polarline Markets logo',
		startDate: '2026-08-01',
		details: 'Building an AI-native operating system for investment research and fund operations.',
		logoScale: 1.0,
		logoTreatment: 'light-mark'
	},
	{
		company: 'HyperOdd',
		role: 'Software Engineer Intern',
		url: 'https://hyperodd.com',
		logoUrl: '/logos/hyperodd-wordmark.png',
		logoAlt: 'HyperOdd logo',
		startDate: '2026-05-01',
		endDate: '2026-08-31',
		details: 'Built prediction market infrastructure.',
		logoScale: 1.0,
		logoTreatment: 'light-mark'
	},
	{
		company: 'VantxLab',
		role: 'Artificial Intelligence Research Intern',
		url: 'https://vantxlab.com',
		logoUrl: '/logos/vantxlab.svg',
		logoAlt: 'VantxLab logo',
		startDate: '2025-12-01',
		endDate: '2026-04-30',
		details: 'Built AI-integrated health infrastructure and gamified analytics.',
		logoScale: 1.0
	},
	{
		company: 'UWaterloo',
		role: 'CFM Student',
		url: 'https://uwaterloo.ca/computing-financial-management/',
		logoUrl: '/logos/Uwaterloo.svg',
		logoAlt: 'UWaterloo logo',
		startDate: '2025-08-01',
		details:
			'Computing and Financial Management student building at the intersection of software and markets.',
		logoScale: 1.0
	}
];
