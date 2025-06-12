# <img src="images/logo.png" alt="logo" height="24"/> mdnlookup 

A tool to fetch and summarize developer documentation from [MDN Web Docs](https://developer.mozilla.org/).

## Features

- Search MDN for documentation using a query string.
- Returns a summary (first paragraph) and a link to the full documentation.
- Exposes an MCP-compatible tool server over stdio.

## Installation

Clone the repository and install dependencies:

```sh
git clone https://github.com/yourusername/mdn-lookup.git
cd mdn-lookup
npm install
```

## Usage

This tool is designed to be used as an MCP tool server. You can run it directly:

```sh
node index.js
```

It will start an MCP server over stdio, ready to accept requests.

### Example: Configure in MCP Client 
```
{
  "mcpServers": {
    "SmartDeveloperAssistant": {
      "command": "node",
      "args": [
        "</absolute/path/to>/mdn-lookup/index.js"
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
                "args": ["</absolute/path/to>/mdn-lookup/index.js"]
            }
        },
        "inputs": []
    },
```

### Example: Querying the Tool

If you have an MCP-compatible client, you can send a request like:

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

--

Thanks

Happy Coding!!

[Baby Manisha Sunkara 👩🏻‍💻](https://babymanisha.com)

