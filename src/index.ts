import { Hono } from "hono";
import { StreamableHTTPTransport } from "@hono/mcp";
import { mcpServer } from "./mcp";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

type Bindings = {
    PASSWORD: string | undefined;
};

let app = new Hono<{ Bindings: Bindings }>();

app = app.use(
    cors({
        origin: "*",
        allowHeaders: ["X-API-Key", "Content-Type", "Accept"],
    })
);
app = app.use(logger());

app = app.all(
    "/mcp",
    async (c, next) => {
        const apiKey = c.req.header("X-API-Key");
        if (c.env.PASSWORD && apiKey !== c.env.PASSWORD) {
            return c.json({ error: "Unauthorized" }, 401);
        } else return next();
    },
    async (c) => {
        const transport = new StreamableHTTPTransport();

        mcpServer.connect(transport);
        return transport.handleRequest(c);
    }
);

app = app.get("/", (c) => c.text("Oh hi! I'm operational."));
export default app;
