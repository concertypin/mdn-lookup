import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { stream } from 'hono/streaming';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = new Hono();

// CORS middleware for Cloudflare Workers compatibility
app.use('*', async (c, next) => {
  await next();
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type');
});

// Handle preflight requests
app.options('*', (c) => {
  return c.text('', 200);
});

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    name: 'mdnlookup',
    description: 'A tool to fetch and summarize developer documentation from MDN.',
    version: '1.0.0',
    endpoints: {
      '/lookup': 'GET or POST - Search MDN documentation',
      '/stream-lookup': 'GET or POST - Search MDN documentation with streaming response'
    }
  });
});

// Core MDN lookup function
async function lookupMDN(query) {
  try {
    const searchUrl = `https://developer.mozilla.org/api/v1/search?q=${encodeURIComponent(query)}&locale=en-US`;
    const searchRes = await axios.get(searchUrl);
    const results = searchRes.data.documents;

    if (!results.length) {
      return {
        success: false,
        message: "No documentation found for this query.",
        query
      };
    }

    const docUrl = `https://developer.mozilla.org${results[0].mdn_url}`;
    const docRes = await axios.get(docUrl);
    const $ = cheerio.load(docRes.data);
    
    // Extracting just the first paragraph for quick overview
    const snippet = $('article p').first().text().trim();

    return {
      success: true,
      query,
      title: results[0].title,
      snippet,
      url: docUrl,
      summary: results[0].summary || snippet
    };
  } catch (error) {
    return {
      success: false,
      message: `Error fetching docs: ${error.message}`,
      query
    };
  }
}

// Standard lookup endpoint
app.get('/lookup', async (c) => {
  const query = c.req.query('q') || c.req.query('query');
  
  if (!query) {
    return c.json({
      success: false,
      message: 'Query parameter "q" or "query" is required'
    }, 400);
  }

  const result = await lookupMDN(query);
  return c.json(result);
});

app.post('/lookup', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const query = body.query || body.q;
  
  if (!query) {
    return c.json({
      success: false,
      message: 'Query field "query" or "q" is required in request body'
    }, 400);
  }

  const result = await lookupMDN(query);
  return c.json(result);
});

// Streaming lookup endpoint
app.get('/stream-lookup', (c) => {
  const query = c.req.query('q') || c.req.query('query');
  
  if (!query) {
    return c.json({
      success: false,
      message: 'Query parameter "q" or "query" is required'
    }, 400);
  }

  return stream(c, async (stream) => {
    await stream.writeln(`{"type": "start", "query": "${query}"}`);
    
    try {
      await stream.writeln(`{"type": "progress", "message": "Searching MDN..."}`);
      
      const searchUrl = `https://developer.mozilla.org/api/v1/search?q=${encodeURIComponent(query)}&locale=en-US`;
      const searchRes = await axios.get(searchUrl);
      const results = searchRes.data.documents;

      if (!results.length) {
        await stream.writeln(`{"type": "error", "message": "No documentation found for this query."}`);
        return;
      }

      await stream.writeln(`{"type": "progress", "message": "Found ${results.length} results, fetching content..."}`);

      const docUrl = `https://developer.mozilla.org${results[0].mdn_url}`;
      const docRes = await axios.get(docUrl);
      const $ = cheerio.load(docRes.data);
      
      const snippet = $('article p').first().text().trim();

      const result = {
        type: "complete",
        success: true,
        query,
        title: results[0].title,
        snippet,
        url: docUrl,
        summary: results[0].summary || snippet
      };

      await stream.writeln(JSON.stringify(result));
    } catch (error) {
      await stream.writeln(`{"type": "error", "message": "Error fetching docs: ${error.message}"}`);
    }
  });
});

app.post('/stream-lookup', (c) => {
  return stream(c, async (stream) => {
    try {
      const body = await c.req.json();
      const query = body.query || body.q;
      
      if (!query) {
        await stream.writeln(`{"type": "error", "message": "Query field 'query' or 'q' is required in request body"}`);
        return;
      }

      await stream.writeln(`{"type": "start", "query": "${query}"}`);
      await stream.writeln(`{"type": "progress", "message": "Searching MDN..."}`);
      
      const searchUrl = `https://developer.mozilla.org/api/v1/search?q=${encodeURIComponent(query)}&locale=en-US`;
      const searchRes = await axios.get(searchUrl);
      const results = searchRes.data.documents;

      if (!results.length) {
        await stream.writeln(`{"type": "error", "message": "No documentation found for this query."}`);
        return;
      }

      await stream.writeln(`{"type": "progress", "message": "Found ${results.length} results, fetching content..."}`);

      const docUrl = `https://developer.mozilla.org${results[0].mdn_url}`;
      const docRes = await axios.get(docUrl);
      const $ = cheerio.load(docRes.data);
      
      const snippet = $('article p').first().text().trim();

      const result = {
        type: "complete",
        success: true,
        query,
        title: results[0].title,
        snippet,
        url: docUrl,
        summary: results[0].summary || snippet
      };

      await stream.writeln(JSON.stringify(result));
    } catch (error) {
      await stream.writeln(`{"type": "error", "message": "Error processing request: ${error.message}"}`);
    }
  });
});

// Export for Cloudflare Workers
export default app;

// Start server if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env.PORT || 3000;
  console.log(`Starting MDN Lookup HTTP server on port ${port}`);
  serve({
    fetch: app.fetch,
    port
  });
}