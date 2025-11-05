import { Hono } from 'hono'
import { McpServer, ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPTransport } from '@hono/mcp'
import * as cheerio from 'cheerio'
import z from 'zod/v3'
type Bindings = {
  PASSWORD: string
}
const MdnDocumentSchema = z.object({
  mdn_url: z.string(),
  score: z.number(),
  title: z.string(),
  locale: z.string(),
  slug: z.string(),
  popularity: z.number(),
  summary: z.string(),
  highlight: z.object({
    body: z.array(z.string()),
    title: z.array(z.string()),
  }),
})

type MdnDocument = z.infer<typeof MdnDocumentSchema>

const MdnSearchResponseSchema = z.object({
  documents: z.array(MdnDocumentSchema),
})



const app = new Hono<{ Bindings: Bindings }>()

const mcpServer = new McpServer({
  name: 'mdnlookup',
  description: 'A tool to fetch and summarize developer documentation from MDN.',
  version: '1.0.0',
})
type ToolReturn = ReturnType<ToolCallback>

/**
 * @license https://github.com/BabyManisha/mdn-lookup Most of the code is written by Baby Manisha Sunkara. Thanks to her for open sourcing it. Below is the license.
 * ISC License
 * Copyright (c) 2024 Baby Manisha Sunkara (https://babymanisha.com)
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
mcpServer.tool(
  'mdnlookup',
  'Fetches and summarizes developer documentation from MDN based on a search query.',
  { query: z.string() } satisfies z.ZodRawShape,
  {
    idempotentHint: true,
    openWorldHint: true,
    readOnlyHint: true,
    title: 'MDN Documentation Lookup',
  },
  async ({ query }) => {
    try {
      const searchUrl = `https://developer.mozilla.org/api/v1/search?q=${encodeURIComponent(query)}&locale=en-US`
      const searchRes = await fetch(searchUrl)
      const searchJson = await MdnSearchResponseSchema.parseAsync(await searchRes.text())
      const results = searchJson.documents

      if (!results.length) {
        return { content: [{ type: 'text', text: 'No documentation found for this query.' }], isError: false }
      }

      const docUrl = `https://developer.mozilla.org${results[0].mdn_url}`
      const docRes = await fetch(docUrl)
      const docHtml = await docRes.text()
      const $ = cheerio.load(docHtml)

      const snippet = $('article p').first().text().trim()

      return {
        content: [{
          type: 'text',
          text: snippet
        }, {
          type: 'resource_link',
          uri: docUrl,
          name: results[0].title,
          title: "MDN Documentation for more details",
        }]
      } satisfies ToolReturn
    } catch (error) {
      return { content: [{ type: 'text', text: `Error fetching docs: ${error ?? "Unknown"}` }], isError: true } satisfies ToolReturn
    }
  }
)

app.all('/mcp', async (c) => {
  const apiKey = c.req.header('X-API-Key')
  if (apiKey !== c.env.PASSWORD) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const transport = new StreamableHTTPTransport()
  mcpServer.connect(transport)
  return transport.handleRequest(c)
})

export default app
