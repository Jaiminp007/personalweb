import { NextResponse } from "next/server";
import { createMcpClient } from "@/lib/mcp-client";
import OpenAI from "openai";

const SYSTEM_PROMPT = `
You are "Jaimin's Brain" - an AI assistant embedded in Jaimin's portfolio website. 
Your name is "Jaimin's Brain".

**CRITICAL FORMATTING INSTRUCTIONS:**
1. **Markdown Only**: Always format your response in Markdown.
2. **Lists**: When listing projects or skills, ALWAYS use bullet points (-) or numbered lists relative to the context.
3. **Bold Text**: Use **bold** for project names, key technologies, and important terms.
4. **Links**: Use [Link Text](URL) for GitHub and Live URLs.
5. **Tables**: Use Markdown tables if comparing items or listing many technical specs.
6. **Code**: Use \`code ticks\` for technology names or commands.

Your personality:
- Friendly, enthusiastic, and knowledgeable.
- You speak in first person ("I built...", "My project...").

Your behavior:
- Use tools to fetch data.
- If the user asks about projects generally, give a PROPERLY FORMATTED list.
- If the user asks for "details", usage 'get_project_details' and explain the architecture/simulation depth.
`;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const userMessage = messages[messages.length - 1];

        if (!process.env.GITHUB_TOKEN && !process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
            // Fallback for demo/dev if no keys
            return NextResponse.json({
                message: "API Key not configured. Please set GITHUB_TOKEN or ANTHROPIC_API_KEY."
            });
        }

        // Initialize OpenAI client for GitHub Models or standard OpenAI
        const openai = new OpenAI({
            baseURL: "https://models.inference.ai.azure.com",
            apiKey: process.env.GITHUB_TOKEN,
        });

        // Connect to MCP Server
        let client;
        try {
            client = await createMcpClient();
        } catch (e) {
            console.error("Failed to connect to MCP server:", e);
            return NextResponse.json({ message: "Failed to connect to knowledge base." }, { status: 500 });
        }

        const { tools: mcpTools } = await client.listTools();

        // Convert MCP tools to OpenAI format
        const openaiTools: any[] = mcpTools.map((tool) => ({
            type: "function",
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.inputSchema,
            },
        }));

        const conversation = [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map((m: any) => ({
                role: m.role,
                content: m.content,
            })),
        ];

        // First call to LLM
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: conversation as any,
            tools: openaiTools,
            tool_choice: "auto",
        });

        const responseMessage = response.choices[0].message;

        // Handle tool calls
        if (responseMessage.tool_calls) {
            const toolCalls = responseMessage.tool_calls;
            conversation.push(responseMessage as any);

            for (const toolCall of toolCalls) {
                const toolName = (toolCall as any).function.name;
                const toolArgs = JSON.parse((toolCall as any).function.arguments);

                console.log(`Executing tool: ${toolName}`);

                try {
                    const result = await client.callTool({
                        name: toolName,
                        arguments: toolArgs,
                    });

                    conversation.push({
                        tool_call_id: toolCall.id,
                        role: "tool",
                        name: toolName,
                        content: JSON.stringify(result.content),
                    } as any);
                } catch (error: any) {
                    conversation.push({
                        tool_call_id: toolCall.id,
                        role: "tool",
                        name: toolName,
                        content: `Error executing tool: ${error.message}`,
                    } as any);
                }
            }

            // Second call to LLM with tool content
            const secondResponse = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: conversation as any,
            });

            await client.close();
            return NextResponse.json({ message: secondResponse.choices[0].message.content });
        }

        await client.close();
        return NextResponse.json({ message: responseMessage.content });

    } catch (error) {
        console.error("API Error Detailed:", error);
        return NextResponse.json(
            { message: `Internal server error: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 }
        );
    }
}
