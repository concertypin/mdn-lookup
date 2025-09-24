import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { stream } from 'hono/streaming';
import { lookupMDN } from './mdn-lookup.js';
import type { Context } from 'hono';
import type { StreamMessage } from './types.js';

const app = new Hono();

// CORS middleware for Cloudflare Workers compatibility
app.use('*', async (c: Context, next) => {
  await next();
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type');
});

// Handle preflight requests
app.options('*', (c: Context) => {
  return c.text('', 200);
});

// Health check endpoint
app.get('/', (c: Context) => {
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

// Standard lookup endpoint
app.get('/lookup', async (c: Context) => {
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

app.post('/lookup', async (c: Context) => {
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
app.get('/stream-lookup', (c: Context) => {
  const query = c.req.query('q') || c.req.query('query');
  
  if (!query) {
    return c.json({
      success: false,
      message: 'Query parameter "q" or "query" is required'
    }, 400);
  }

  return stream(c, async (stream) => {
    const startMessage: StreamMessage = { type: "start", query };
    await stream.writeln(JSON.stringify(startMessage));
    
    try {
      const progressMessage: StreamMessage = { type: "progress", message: "Searching MDN..." };
      await stream.writeln(JSON.stringify(progressMessage));
      
      const result = await lookupMDN(query);

      if (result.success) {
        const completeMessage: StreamMessage = {
          type: "complete",
          success: true,
          query: result.query,
          title: result.title,
          snippet: result.snippet,
          url: result.url,
          summary: result.summary
        };
        await stream.writeln(JSON.stringify(completeMessage));
      } else {
        const errorMessage: StreamMessage = { type: "error", message: result.message };
        await stream.writeln(JSON.stringify(errorMessage));
      }
    } catch (error) {
      const errorMessage: StreamMessage = { 
        type: "error", 
        message: `Error processing request: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
      await stream.writeln(JSON.stringify(errorMessage));
    }
  });
});

app.post('/stream-lookup', (c: Context) => {
  return stream(c, async (stream) => {
    try {
      const body = await c.req.json();
      const query = body.query || body.q;
      
      if (!query) {
        const errorMessage: StreamMessage = { 
          type: "error", 
          message: "Query field 'query' or 'q' is required in request body" 
        };
        await stream.writeln(JSON.stringify(errorMessage));
        return;
      }

      const startMessage: StreamMessage = { type: "start", query };
      await stream.writeln(JSON.stringify(startMessage));
      
      const progressMessage: StreamMessage = { type: "progress", message: "Searching MDN..." };
      await stream.writeln(JSON.stringify(progressMessage));
      
      const result = await lookupMDN(query);

      if (result.success) {
        const completeMessage: StreamMessage = {
          type: "complete",
          success: true,
          query: result.query,
          title: result.title,
          snippet: result.snippet,
          url: result.url,
          summary: result.summary
        };
        await stream.writeln(JSON.stringify(completeMessage));
      } else {
        const errorMessage: StreamMessage = { type: "error", message: result.message };
        await stream.writeln(JSON.stringify(errorMessage));
      }
    } catch (error) {
      const errorMessage: StreamMessage = { 
        type: "error", 
        message: `Error processing request: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
      await stream.writeln(JSON.stringify(errorMessage));
    }
  });
});

// Export for Cloudflare Workers
export default app;

// Start server if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = parseInt(process.env.PORT || '3000');
  console.log(`Starting MDN Lookup HTTP server on port ${port}`);
  serve({
    fetch: app.fetch,
    port
  });
}