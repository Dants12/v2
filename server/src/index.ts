import Fastify from "fastify";
import websocket from "fastify-websocket";
import { config } from "./config.js";
import { GameEngine } from "./gameEngine.js";
import type { WsOut } from "./types.js";

const app = Fastify({ logger: true });
app.register(websocket);

const engine = new GameEngine();
engine.startLoop();

app.get("/health", async () => ({ ok: true, ts: Date.now() }));
app.get("/api/state", async () => engine.snapshot());

app.get("/ws", { websocket: true }, (conn, req) => {
  const send = (msg: WsOut) => {
    try { conn.socket.send(JSON.stringify(msg)); } catch { /* client gone */ }
  };

  const unsub = engine.subscribe(send);
  conn.socket.on("close", () => unsub());
});

app.listen({ host: config.host, port: config.port }).then((addr) => {
  app.log.info({ addr, publicUrl: config.publicUrl }, "server started");
});
