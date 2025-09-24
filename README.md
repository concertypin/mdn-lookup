# <img src="images/logo.png" alt="logo" height="48"/> mdnlookup 

A tool to fetch and summarize developer documentation from [MDN Web Docs](https://developer.mozilla.org/).

**MDNlookup** is a developer productivity tool that streamlines access to [MDN Web Docs](https://developer.mozilla.org/) documentation directly from your development environment. 
Designed for seamless integration with MCP-compatible clients and editors like VS Code, mdnlookup enables developers to quickly search for and retrieve concise, relevant documentation summaries for web APIs, JavaScript methods, and other web technologies—without leaving their workflow.

By exposing an MCP-compatible tool server over stdio, mdnlookup makes it easy to automate documentation lookups and integrate them into custom toolchains or editor extensions. This helps developers save time, reduce context switching, and stay focused on coding.

## Features

- Search MDN for documentation using a query string.
- Returns a summary (first paragraph) and a link to the full documentation.
- Exposes an MCP-compatible tool server over stdio.
- **HTTP API** with streaming support using Hono framework.
- **TypeScript** codebase with type safety and modern tooling.
- **Cloudflare Workers** compatible for edge deployment with Vite bundling.

## Available Tools

### mdnlookup

- **Description:** Fetches and summarizes developer documentation from MDN based on a search query.
- **Parameters:**
  - `query` (string): The search term or API/method name you want documentation for.

## Installation

Clone the repository and install dependencies:

```sh
git clone https://github.com/yourusername/mdn-lookup.git
cd mdn-lookup
npm install
```

## Build

This project uses TypeScript with Vite for bundling:

```sh
npm run build
```

This will:
- Compile TypeScript files to JavaScript in the `dist/` directory
- Bundle the Cloudflare Worker entry point in the `dist-worker/` directory

## Usage

### MCP Tool Server (stdio)

This tool is designed to be used as an MCP tool server. Build and run:

```sh
npm run build
npm start
# or directly:
node dist/mcp-server.js
```

It will start an MCP server over stdio, ready to accept requests.

### HTTP API Server

You can also run the tool as an HTTP server using Hono:

```sh
npm run build
npm run serve
# or directly:
node dist/server.js
```

For development with auto-rebuild:

```sh
npm run dev
```

This will start an HTTP server on port 3000 (or the PORT environment variable) with the following endpoints:

- `GET /` - API information and available endpoints
- `GET /lookup?q=<query>` - Search MDN documentation
- `POST /lookup` - Search MDN documentation (JSON body: `{"query": "search term"}`)
- `GET /stream-lookup?q=<query>` - Search MDN with streaming response
- `POST /stream-lookup` - Search MDN with streaming response (JSON body)

#### HTTP API Examples

**Simple lookup:**
```bash
curl "http://localhost:3000/lookup?q=Array.prototype.map"
```

**POST request:**
```bash
curl -X POST http://localhost:3000/lookup \
  -H "Content-Type: application/json" \
  -d '{"query": "fetch API"}'
```

**Streaming response:**
```bash
curl "http://localhost:3000/stream-lookup?q=Promise"
```

The streaming endpoints return newline-delimited JSON with progress updates and final results.

### Example: Configure in MCP Client 
```
{
  "mcpServers": {
    "SmartDeveloperAssistant": {
      "command": "node",
      "args": [
        "</absolute/path/to>/mdn-lookup/dist/mcp-server.js"
      ]
    }
  }
}
```

VS Code (.vscode/settings.json)
``` 
"mcp": {
        "servers": {
            "mdnlookup": {
                "type": "stdio",
                "command": "node",
                "args": ["</absolute/path/to>/mdn-lookup/dist/mcp-server.js"]
            }
        },
        "inputs": []
    },
```

## Run with Docker

You can use Docker to run the mdnlookup MCP server without installing Node.js or dependencies locally or using https://hub.docker.com/r/babymanisha/mdnlookup

**Pull the Docker image from Docker Hub:**
```sh
docker pull babymanisha/mdnlookup:latest
```

**Or build the Docker image locally:**
```sh
docker build -t mdnlookup .
```

**Run the server:**
```sh
docker run -i babymanisha/mdnlookup:latest
```
_or, if you built locally:_
```sh
docker run -i mdnlookup
```

This will start the MCP server over stdio inside the container, ready to be used by any MCP-compatible client or editor (such as VS Code).

To configure VS Code to use the Dockerized server, set the command to:
```json
{
  "mcpServers": {
    "mdnlookup": {
      "command": "docker",
      "args": [
        "run", "-i", "mdnlookup"
      ]
    }
  }
}
```

## Deploy to Cloudflare Workers

The HTTP server is compatible with Cloudflare Workers for edge deployment using Vite for bundling:

1. **Install Wrangler CLI:**
   ```sh
   npm install -g wrangler
   ```

2. **Configure your Cloudflare account:**
   ```sh
   wrangler login
   ```

3. **Build and deploy to Cloudflare Workers:**
   ```sh
   npm run build
   wrangler deploy
   ```

The project includes:
- `wrangler.toml` configuration file
- Vite bundling for optimized Worker deployment
- TypeScript support with proper build pipeline

**Example deployed usage:**
```bash
curl "https://your-worker.your-subdomain.workers.dev/lookup?q=WebGL"
```

## Example: Using the Tool

You can use the `mdnlookup` tool by sending a request from any MCP-compatible client:

```json
{
  "tool": "mdnlookup",
  "params": {
    "query": "Array.prototype.map"
  }
}
```

The response will look like:

```json
{
  "content": [
    {
      "type": "text",
      "text": "The map() method creates a new array populated with the results of calling a provided function on every element in the calling array.\n\nMore info: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map"
    }
  ]
}
```

### Example Results

Below are screenshots of the tool in action for various queries:

#### Promises

![Promises Example](images/1.promises.png)

#### Async/Await

![Async/Await Example](images/2.asyncawait.png)

#### Node.js

![Node.js Example](images/3.node.png)

#### OAuth

![OAuth Example](images/4.oauth.png)

## Configuration

No additional configuration is required. The tool uses the MDN public API and fetches documentation in English.

## License

ISC

## See Also

- [mdn-lookup listing on MCP.so](https://mcp.so/server/mdn-lookup/Baby%20Manisha%20Sunkara)

--

Thanks

Happy Coding!!

[Baby Manisha Sunkara 👩🏻‍💻](https://babymanisha.com)

