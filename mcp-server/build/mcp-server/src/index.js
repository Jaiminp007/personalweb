import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { portfolioData } = require("../../data/portfolio-data.js");
const server = new Server({
    name: "jaimins-brain",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Helper function to search projects
const searchProjects = (query) => {
    const lowerQuery = query.toLowerCase();
    return portfolioData.projects.filter((p) => p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.technologies.some((t) => t.toLowerCase().includes(lowerQuery)));
};
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "search_projects",
                description: "Search through projects. Returns SUMMARIES only. Use get_project_details for full info.",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "Search query",
                        },
                    },
                    required: ["query"],
                },
            },
            {
                name: "get_all_projects",
                description: "Returns a SUMMARY list of all projects. Does NOT include full details. Use get_project_details for deep dives.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "get_project_details",
                description: "Get detailed info including FULL README, architecture, and simulation details about a specific project by name",
                inputSchema: {
                    type: "object",
                    properties: {
                        projectName: {
                            type: "string",
                            description: "Name of the project",
                        },
                    },
                    required: ["projectName"],
                },
            },
            {
                name: "get_about_info",
                description: "Returns bio, skills, contact info, social links",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "get_experience",
                description: "Returns work experience history",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "get_education",
                description: "Returns education history",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "get_skills_by_category",
                description: "Returns skills grouped by category (frontend, backend, tools, etc.)",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "search_by_technology",
                description: "Find all projects using a specific technology",
                inputSchema: {
                    type: "object",
                    properties: {
                        technology: {
                            type: "string",
                            description: "Technology name to search for",
                        },
                    },
                    required: ["technology"],
                },
            },
        ],
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    switch (name) {
        case "search_projects": {
            const { query } = z.object({ query: z.string() }).parse(args);
            const results = searchProjects(query).map((p) => ({
                name: p.name,
                description: p.description,
                technologies: p.technologies,
                githubUrl: p.githubUrl,
                liveUrl: p.liveUrl,
                NOTE: "For full details, architecture, and README, use get_project_details tool."
            }));
            return {
                content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
            };
        }
        case "get_all_projects": {
            const projectsSummary = portfolioData.projects.map((p) => ({
                name: p.name,
                description: p.description,
                technologies: p.technologies,
                githubUrl: p.githubUrl,
                liveUrl: p.liveUrl
            }));
            return {
                content: [
                    { type: "text", text: JSON.stringify(projectsSummary, null, 2) },
                ],
            };
        }
        case "get_project_details": {
            const { projectName } = z
                .object({ projectName: z.string() })
                .parse(args);
            // Try exact match first
            let project = portfolioData.projects.find((p) => p.name.toLowerCase() === projectName.toLowerCase());
            // If not found, try partial match
            if (!project) {
                project = portfolioData.projects.find((p) => p.name.toLowerCase().includes(projectName.toLowerCase()));
            }
            if (!project) {
                return {
                    content: [
                        { type: "text", text: `Project '${projectName}' not found. Please try a different name or search_projects.` },
                    ],
                    isError: true,
                };
            }
            return {
                content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
            };
        }
        case "get_about_info": {
            return {
                content: [
                    { type: "text", text: JSON.stringify(portfolioData.about, null, 2) },
                ],
            };
        }
        case "get_experience": {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(portfolioData.experience, null, 2),
                    },
                ],
            };
        }
        case "get_education": {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(portfolioData.education, null, 2),
                    },
                ],
            };
        }
        case "get_skills_by_category": {
            return {
                content: [
                    { type: "text", text: JSON.stringify(portfolioData.skills, null, 2) },
                ],
            };
        }
        case "search_by_technology": {
            const { technology } = z.object({ technology: z.string() }).parse(args);
            const results = searchProjects(technology);
            return {
                content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
});
const transport = new StdioServerTransport();
await server.connect(transport);
