import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { lookupMDN } from "./mdn-lookup.js";

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
  async ({ query }: { query: string }) => {
    const result = await lookupMDN(query);
    
    if (result.success) {
      return {
        content: [{
          type: "text",
          text: `${result.snippet}\n\nMore info: ${result.url}`
        }]
      };
    } else {
      return { 
        content: [{ 
          type: "text", 
          text: result.message || "Error fetching docs" 
        }] 
      };
    }
  }
);

// Start server via stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);