import {
    McpServer,
    type ToolCallback,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { MdnDocumentSchema, MdnSearchResponseSchema } from "./schema";

export const mcpServer = new McpServer({
    name: "mdnlookup",
    description:
        "A tool to fetch and summarize developer documentation from MDN.",
    version: "1.0.0",
});
type Unpromise<T> = T extends Promise<infer U> ? U : T;
type ToolReturn = Unpromise<ReturnType<ToolCallback>>;

const outputSchema = { result: MdnDocumentSchema.array() };

mcpServer.registerTool(
    "mdnlookup",
    {
        title: "MDN Documentation Lookup",
        description:
            "Fetches and summarizes developer documentation from MDN based on a search query.",
        annotations: {
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
            readOnlyHint: true,
            title: "MDN Documentation Lookup",
        },
        inputSchema: {
            query: z.string(),
            limit: z.number().min(1).optional().default(5),
        },
        outputSchema: outputSchema,
    },
    async ({ query, limit }, ext) => {
        const searchUrl = `https://developer.mozilla.org/api/v1/search?q=${encodeURIComponent(query)}&locale=en-US`;
        const searchRes = await fetch(searchUrl);
        const searchJson = MdnSearchResponseSchema.safeParse(
            await searchRes.json()
        );

        if (!searchJson.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to parse MDN search response: ${searchJson.error.message}`,
                    },
                ],
                isError: true,
            } satisfies ToolReturn;
        }
        const results = searchJson.data.documents.map((i) => {
            return {
                ...i,
                mdn_url: `https://developer.mozilla.org${i.mdn_url}`,
            } satisfies (typeof searchJson.data.documents)[number];
        });

        if (!results.length) {
            console.log("No results found for query.");
            return {
                content: [
                    {
                        type: "text",
                        text: "No documentation found for this query.",
                    },
                ],
                isError: false,
            } satisfies ToolReturn;
        }
        return {
            content: [],
            structuredContent: { result: results.slice(0, limit) },
        } satisfies ToolReturn;
    }
);
