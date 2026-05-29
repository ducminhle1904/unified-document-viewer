import pino from "pino";

export function createLogger() {
  return pino({
    enabled: process.env.NODE_ENV !== "test",
    level: process.env.LOG_LEVEL ?? "info",
    base: undefined
  });
}
