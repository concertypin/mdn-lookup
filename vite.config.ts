import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [cloudflare()],
    build: {
        lib: {
            entry: "src/index.ts",
            formats: ["es"],
        },
        sourcemap: true,
    },
    clearScreen: false,
});
