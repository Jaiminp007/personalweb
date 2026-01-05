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
}

export const experienceTimeline: ExperienceTimelineItem[] = [
	{
		company: 'VantxLab',
		role: 'Part-time Software Engineer',
		url: 'https://vantxlab.com', // Placeholder if unknown
		logoUrl: '/logos/vantxlab.svg',
		logoAlt: 'VantxLab Logo',
		startDate: '2024-01-01', // Placeholder date
		details: 'Engineering scalable software solutions.',
		logoScale: 1.0
	},
	{
		company: 'AlgoClash',
		role: 'Founder',
		url: 'https://algoclash.com', // Placeholder
		logoUrl: '/projects/algoclash.png',
		logoAlt: 'AlgoClash Logo',
		startDate: '2023-01-01', // Placeholder date
		details: 'Founder of AlgoClash, a high-frequency trading arena for AI agents.',
		logoScale: 1.0
	},
	{
		company: 'UWaterloo',
		role: 'CFM Student',
		url: 'https://uwaterloo.ca/computing-financial-management/',
		logoUrl: '/logos/Uwaterloo.svg',
		logoAlt: 'UWaterloo Logo',
		startDate: '2024-09-01',
		details: 'First-year Computing and Financial Management (CFM) student.',
		logoScale: 1.0
	}
];
