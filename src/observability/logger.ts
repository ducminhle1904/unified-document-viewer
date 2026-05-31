import pino from "pino";
import type { FastifyLoggerOptions } from "fastify/types/logger.js";
import type { LoggerOptions } from "pino";

const levelLabels: Record<number, string> = {
  10: "TRACE",
  20: "DEBUG",
  30: "INFO",
  40: "WARN",
  50: "ERROR",
  60: "FATAL"
};

const reservedKeys = new Set(["level", "time", "msg", "pid", "hostname"]);

export function createLogger() {
  return pino(createLoggerOptions(), createReadableLogStream());
}

export function createLoggerOptions(): FastifyLoggerOptions & LoggerOptions {
  return {
    enabled: process.env.NODE_ENV !== "test",
    level: process.env.LOG_LEVEL ?? "info",
    base: undefined,
    stream: createReadableLogStream()
  };
}

function createReadableLogStream() {
  return {
    write(line: string) {
      try {
        process.stdout.write(`${formatLogLine(JSON.parse(line))}\n`);
      } catch {
        process.stdout.write(line);
      }
    }
  };
}

function formatLogLine(log: Record<string, unknown>): string {
  const timestamp = typeof log.time === "number" ? new Date(log.time).toISOString() : new Date().toISOString();
  const level = typeof log.level === "number" ? levelLabels[log.level] ?? String(log.level) : "INFO";
  const message = typeof log.msg === "string" ? log.msg : "log event";
  const details = formatDetails(log);

  return details ? `${timestamp} ${level.padEnd(5)} ${message} | ${details}` : `${timestamp} ${level.padEnd(5)} ${message}`;
}

function formatDetails(log: Record<string, unknown>): string {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(log)) {
    if (reservedKeys.has(key)) {
      continue;
    }

    if (key === "req" && isRecord(value)) {
      parts.push(...formatRecord("req", value, ["method", "url", "host", "remoteAddress"]));
      continue;
    }

    if (key === "res" && isRecord(value)) {
      parts.push(...formatRecord("res", value, ["statusCode"]));
      continue;
    }

    if (key === "error" && isRecord(value)) {
      parts.push(...formatRecord("error", value, ["code", "message"]));
      continue;
    }

    parts.push(`${key}=${formatValue(value)}`);
  }

  return parts.join(" ");
}

function formatRecord(prefix: string, value: Record<string, unknown>, preferredKeys: string[]): string[] {
  const entries = preferredKeys
    .filter((key) => value[key] !== undefined)
    .map((key) => `${prefix}.${key}=${formatValue(value[key])}`);

  for (const [key, item] of Object.entries(value)) {
    if (!preferredKeys.includes(key)) {
      entries.push(`${prefix}.${key}=${formatValue(item)}`);
    }
  }

  return entries;
}

function formatValue(value: unknown): string {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return value.map(formatValue).join(",");
  }

  if (isRecord(value)) {
    return JSON.stringify(value);
  }

  return String(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
