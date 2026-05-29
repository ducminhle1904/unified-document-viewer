import { createApp } from "./app.js";
import { loadConfig } from "./config/env.js";

const config = loadConfig();
const app = await createApp({ config });

await app.listen({
  port: config.PORT,
  host: "0.0.0.0"
});
