import type { ServerConfig } from "./types";

export const config: ServerConfig = {
  host: process.env.HOST ?? "0.0.0.0",
  port: Number(process.env.PORT ?? 8080),
  publicUrl: process.env.PUBLIC_URL,
};

export const TICK_MS = 100; // smooth multiplier
export const ROUND_MS = 10_000; // 10s round for demo
export const BREAK_MS = 3_000; // pause between rounds
export const RAKE_PCT = 0.02; // 2% for demo UI
