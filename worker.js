import app from './server.js';

// Cloudflare Workers entry point
export default {
  async fetch(request, env, ctx) {
    return app.fetch(request, env, ctx);
  },
};