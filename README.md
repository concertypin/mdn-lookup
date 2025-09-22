# <img src="images/logo.png" alt="logo" height="48"/> mdnlookup

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2Fbabymanisha%2Fmdn-lookup)

A tool to fetch and summarize developer documentation from [MDN Web Docs](https://developer.mozilla.org/).

**MDNlookup** is a developer productivity tool that streamlines access to [MDN Web Docs](https://developer.mozilla.org/) documentation directly from your development environment.
Designed for seamless integration with MCP-compatible clients and editors like VS Code, mdnlookup enables developers to quickly search for and retrieve concise, relevant documentation summaries for web APIs, JavaScript methods, and other web technologies—without leaving their workflow.

By exposing an MCP-compatible tool server over Streamable HTTP, mdnlookup makes it easy to automate documentation lookups and integrate them into custom toolchains or editor extensions. This helps developers save time, reduce context switching, and stay focused on coding.

## Features

- Search MDN for documentation using a query string.
- Returns a summary (first paragraph) and a link to the full documentation.
- Exposes an MCP-compatible tool server over Streamable HTTP.

## Available Tools

### mdnlookup

- **Description:** Fetches and summarizes developer documentation from MDN based on a search query.
- **Parameters:**
    - `query` (string): The search term or API/method name you want documentation for.
    - `limit` (number, optional): The maximum number of results to return (default is 5).

## Installation

Clone the repository and install dependencies:

```sh
git clone https://github.com/babymanisha/mdn-lookup.git
cd mdn-lookup
pnpm install
```

## Usage

This tool is designed to be used as an MCP tool server. You can run the server locally.

```sh
pnpm dev
```

Or, you can also deploy it to Cloudflare Workers.

```sh
pnpm run deploy
```

It will start an MCP server over Streamable HTTP, ready to accept requests.

### Example: Configure in MCP Client

```json
{
    "mcpServers": {
        "server1": {
            "type": "http",
            "url": "http://localhost:5173/mcp" // Or your deployed URL
        }
    }
}
```

VS Code (mcp.json)

```json
{
    "servers": {
        "mdnlookup": {
            "type": "http",
            "url": "http://localhost:5173/mcp",
            // Optional: If your server requires authentication
            "headers": {
                "X-API-Key": "your-api-key"
            }
        }
    },
    "inputs": []
}
```

## Example: Using the Tool

You can use the `mdnlookup` tool by sending a request from any MCP-compatible client:

```json
{
    "tool": "mdnlookup",
    "params": {
        "query": "Array.prototype.map",
        "limit": 5 // Optional, default is 5
    }
}
```

...Or simple shell script.

```sh
./test_query.sh WebXR
```

The response will look like:

```json
{
    "content": [],
    "structuredContent": {
        "result": [
            {
                "mdn_url": "https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API/Fundamentals",
                "score": 72.50494,
                "title": "Fundamentals of WebXR",
                "locale": "en-us",
                "slug": "web/api/webxr_device_api/fundamentals",
                "popularity": 0.0003701797219308471,
                "summary": "WebXR, with the WebXR Device API at its core, provides the functionality needed to bring both augmented and virtual reality (AR and VR) to the web. Together, these technologies are referred to as mixed reality (MR) or cross reality (XR). Mixed reality is a large and complex subject, with much to learn and many other APIs to bring together to create an engaging experience for users.",
                "highlight": {
                    "body": [
                        "<mark>WebXR</mark>, with the <mark>WebXR</mark> Device API at its core, provides the functionality needed to bring both augmented and virtual reality",
                        "That led to the birth of <mark>WebXR</mark>.",
                        "<mark>WebXR</mark> application life cycle\nStarting up and shutting down a <mark>WebXR</mark> session\nMovement, orientation, and motion: A <mark>WebXR</mark> example"
                    ],
                    "title": ["Fundamentals of <mark>WebXR</mark>"]
                }
            },
            {
                "mdn_url": "https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API",
                "score": 72.48302,
                "title": "WebXR Device API",
                "locale": "en-us",
                "slug": "web/api/webxr_device_api",
                "popularity": 0.0014612698655553928,
                "summary": "WebXR is a group of standards which are used together to support rendering 3D scenes to hardware designed for presenting virtual worlds (virtual reality, or VR), or for adding graphical imagery to the real world, (augmented reality, or AR). The WebXR Device API implements the core of the WebXR feature set, managing the selection of output devices, render the 3D scene to the chosen device at the appropriate frame rate, and manage motion vectors created using input controllers.",
                "highlight": {
                    "body": [
                        "The <mark>WebXR</mark> Device API implements the core of the <mark>WebXR</mark> feature set, managing the selection of output devices, render the 3D",
                        "Foundations and basics\nFundamentals of <mark>WebXR</mark>\nMatrix math for the <mark>web</mark>\n<mark>WebXR</mark> application life cycle\nCreating a mixed reality",
                        "experience\nStarting up and shutting down a <mark>WebXR</mark> session\nGeometry and reference spaces in <mark>WebXR</mark>\nSpatial tracking in <mark>WebXR</mark>"
                    ],
                    "title": ["<mark>WebXR</mark> Device API"]
                }
            }
        ]
    }
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
You can optionally set `PASSWORD` environment variable. If set, the server will require `X-API-Key` header with the correct password for authentication.

## License

ISC

## See Also

- [mdn-lookup listing on MCP.so](https://mcp.so/server/mdn-lookup/Baby%20Manisha%20Sunkara)

--

Thanks

Happy Coding!!

[Baby Manisha Sunkara 👩🏻‍💻](https://babymanisha.com)
