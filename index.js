import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";
import * as cheerio from "cheerio";
import { z } from "zod";

// Initialize MCP server
const server = new McpServer({
  name: "mdnlookup",
  description: "A tool to fetch and summarize developer documentation from MDN.",
  version: "1.0.0"
});

// Tool: Fetch documentation from MDN
server.tool(
  "mdnlookup",
  "Fetches and summarizes developer documentation from MDN based on a search query.",
  { query: z.string() },
  async ({ query }) => {
    try {
      const searchUrl = `https://developer.mozilla.org/api/v1/search?q=${encodeURIComponent(query)}&locale=en-US`;
      const searchRes = await axios.get(searchUrl);
      const results = searchRes.data.documents;

      if (!results.length) {
        return { content: [{ type: "text", text: "No documentation found for this query." }] };
      }

      const docUrl = `https://developer.mozilla.org${results[0].mdn_url}`;
      const docRes = await axios.get(docUrl);
      const $ = cheerio.load(docRes.data);
      
      // Extracting just the first paragraph for quick overview
      const snippet = $('article p').first().text().trim();

      return {
        content: [{
          type: "text",
          text: `${snippet}\n\nMore info: ${docUrl}`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error fetching docs: ${error.message}` }] };
    }
  }
);

// Start server via stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
