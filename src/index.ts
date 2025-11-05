import { Hono } from 'hono'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPTransport } from '@hono/mcp'
import * as cheerio from 'cheerio'
import { z } from 'zod'
type Bindings = {
  PASSWORD: string
}
interface MdnDocument {
  mdn_url: string;
  score: number;
  title: string;
  locale: string;
  slug: string;
  popularity: number;
  summary: string;
  highlight: {
    body: string[];
    title: string[];
  };
}

interface MdnSearchResponse {
  documents: MdnDocument[];
}

const app = new Hono<{ Bindings: Bindings }>()

const mcpServer = new McpServer({
  name: 'mdnlookup',
  description: 'A tool to fetch and summarize developer documentation from MDN.',
  version: '1.0.0',
})

mcpServer.tool(
  'mdnlookup',
  'Fetches and summarizes developer documentation from MDN based on a search query.',
  { query: z.string() },
  async ({ query }) => {
    try {
      const searchUrl = `https://developer.mozilla.org/api/v1/search?q=${encodeURIComponent(query)}&locale=en-US`
      const searchRes = await fetch(searchUrl)
      const searchJson = await searchRes.json() satisfies MdnSearchResponse
      const results = searchJson.documents

      if (!results.length) {
        return { content: [{ type: 'text', text: 'No documentation found for this query.' }] }
      }

      const docUrl = `https://developer.mozilla.org${results[0].mdn_url}`
      const docRes = await fetch(docUrl)
      const docHtml = await docRes.text()
      const $ = cheerio.load(docHtml)

      const snippet = $('article p').first().text().trim()

      return {
        content: [{
          type: 'text',
          text: `${snippet}\n\nMore info: ${docUrl}`
        }]
      }
    } catch (error: any) {
      return { content: [{ type: 'text', text: `Error fetching docs: ${error.message}` }] }
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
