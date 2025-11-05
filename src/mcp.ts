import { McpServer, type ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import z from "zod"
import { MdnDocumentSchema, MdnSearchResponseSchema } from './schema';
export const mcpServer = new McpServer({
    name: 'mdnlookup',
    description: 'A tool to fetch and summarize developer documentation from MDN.',
    version: '1.0.0',
});
type Unpromise<T> = T extends Promise<infer U> ? U : T
type ToolReturn = Unpromise<ReturnType<ToolCallback>>

const outputSchema = { result: MdnDocumentSchema.array() }
/**
 * @license https://github.com/BabyManisha/mdn-lookup Most of the code is written by Baby Manisha Sunkara. Thanks to her for open sourcing it. Below is the license.
 * ISC License
 * Copyright (c) 2024 Baby Manisha Sunkara (https://babymanisha.com)
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
mcpServer.registerTool(
    'mdnlookup',
    {
        title: 'MDN Documentation Lookup',
        description: 'Fetches and summarizes developer documentation from MDN based on a search query.',
        annotations: {
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
            readOnlyHint: true,
            title: 'MDN Documentation Lookup',
        },
        inputSchema: {
            query: z.string(),
            limit: z.number().min(1).optional().default(5)
        },
        outputSchema: outputSchema
    },
    async ({ query, limit }, ext) => {
        const searchUrl = `https://developer.mozilla.org/api/v1/search?q=${encodeURIComponent(query)}&locale=en-US`
        console.log(`Fetching MDN docs from: ${searchUrl}`)
        const searchRes = await fetch(searchUrl)
        console.log("Completed fetch from MDN, parsing...")
        const searchJson = MdnSearchResponseSchema.safeParse(await searchRes.json())

        if (!searchJson.success) {
            console.log("Oh hell no, parsing failed:", searchJson.error)
            return { content: [{ type: 'text', text: `Failed to parse MDN search response: ${searchJson.error.message}` }], isError: true } satisfies ToolReturn
        }
        const results = searchJson.data.documents

        if (!results.length) {
            console.log("No results found for query.")
            return { content: [{ type: 'text', text: 'No documentation found for this query.' }], isError: false }
        }
        return {
            content: [],
            structuredContent: { result: results.slice(0, limit) },
        } satisfies ToolReturn
    }
)