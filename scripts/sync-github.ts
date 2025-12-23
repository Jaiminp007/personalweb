import { Octokit } from "@octokit/rest";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
    console.error("Error: GITHUB_TOKEN is not defined in .env");
    process.exit(1);
}

const octokit = new Octokit({
    auth: GITHUB_TOKEN,
});

const DATA_FILE_PATH = path.join(process.cwd(), "data", "portfolio-data.ts");

// Helper to determine technology keywords from topics or language
function mapTopicsToTech(topics: string[], language: string | null): string[] {
    const tech = new Set<string>();
    if (language) tech.add(language);
    topics.forEach((t) => tech.add(t));
    return Array.from(tech);
}

async function fetchReadme(owner: string, repo: string): Promise<string> {
    try {
        const { data } = await octokit.request("GET /repos/{owner}/{repo}/readme", {
            owner,
            repo,
            mediaType: {
                format: "raw",
            },
        });
        return String(data); // returns raw content as string
    } catch (e) {
        return ""; // No readme found or error
    }
}

async function syncGithub() {
    console.log("Starting GitHub Sync...");

    // 1. Get User Profile
    const { data: user } = await octokit.rest.users.getAuthenticated();
    console.log(`Fetched profile for: ${user.login}`);

    // 2. Get Repositories
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
        visibility: "public",
        sort: "updated",
        per_page: 100,
    });
    console.log(`Fetched ${repos.length} repositories.`);

    // Filter out forks if desired, or keep them. Let's keep sources only for now unless specified.
    const sourceRepos = repos.filter((r) => !r.fork);

    const projects = [];

    for (const repo of sourceRepos) {
        if (repo.description) { // Only include repos with descriptions
            console.log(`Processing ${repo.name}...`);
            const readme = await fetchReadme(repo.owner.login, repo.name);

            projects.push({
                name: repo.name,
                description: repo.description,
                longDescription: repo.description, // Can be improved
                readme: readme,
                technologies: mapTopicsToTech(repo.topics || [], repo.language),
                githubUrl: repo.html_url,
                liveUrl: repo.homepage || "",
                featured: repo.stargazers_count > 0, // Simple heuristic for featured
                image: "/projects/placeholder.png", // Placeholder
            });
        }
    }

    // 3. Read existing data to preserve manual fields (experience, education)
    // We need to read the TS file. Since it's TS, we can't just require() it easily in a script without compilation.
    // STRATEGY: We will read the file as text and replace the export, OR we assume this script overwrites relevant sections only.
    // Ideally, we'd import the existing object, update it, and write it back. 
    // Given the complexity of writing back to TS, we'll generate the full file content using JSON.stringify for the data parts
    // but formatted as a TS export.

    // Let's rely on finding the `portfolioData` object structure.

    // For simplicity and robustness in this "dump" request:
    // We will assume Experience, Education, Skills are static or manual for now, 
    // and we ONLY update 'projects' and 'about'.

    // Actually, let's hardcode the preservation of existing Experience/Education/Skills 
    // by importing the file (using tsx which handles .ts imports).

    // Dynamic import of the data file
    // Note: We need to use exact path relative to this script
    const { portfolioData: currentData } = await import("../data/portfolio-data");

    const updatedData = {
        ...currentData,
        about: {
            ...currentData.about,
            name: user.name || user.login,
            bio: user.bio || currentData.about.bio,
            location: user.location || currentData.about.location,
            github: user.html_url,
            twitter: user.twitter_username ? `https://twitter.com/${user.twitter_username}` : currentData.about.twitter,
            avatar: user.avatar_url, // Add avatar url cause why not
        },
        projects: projects,
    };

    // 4. Write back to file
    const fileContent = `export interface Project {
  name: string;
  description: string;
  longDescription: string;
  readme: string;
  technologies: string[];
  githubUrl: string;
  liveUrl: string;
  featured: boolean;
  image: string;
}

export interface Experience {
  company: string;
  role: string;
  duration: string;
  location: string;
  description: string;
  highlights: string[];
  technologies: string[];
}

export interface Education {
  institution: string;
  degree: string;
  duration: string;
  gpa: string;
}

export interface SkillCategory {
  frontend: string[];
  backend: string[];
  tools: string[];
  other: string[];
}

export interface About {
  name: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  linkedin: string;
  github: string;
  twitter: string;
  resumeUrl: string;
  avatar?: string;
}

export interface PortfolioData {
  about: About;
  skills: SkillCategory;
  experience: Experience[];
  education: Education[];
  projects: Project[];
}

export const portfolioData: PortfolioData = ${JSON.stringify(updatedData, null, 2)};
`;

    fs.writeFileSync(DATA_FILE_PATH, fileContent);
    console.log(`Successfully updated ${DATA_FILE_PATH}`);
}

syncGithub().catch((err) => {
    console.error("Sync failed:", err);
    process.exit(1);
});
