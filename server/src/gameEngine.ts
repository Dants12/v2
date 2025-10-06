import { BREAK_MS, RAKE_PCT, ROUND_MS, TICK_MS } from "./config";
import type { GameState, WsOut } from "./types";

export class GameEngine {
  private state: GameState;
  private timer?: NodeJS.Timeout;
  private between?: NodeJS.Timeout;
  private tickers = new Set<(msg: WsOut) => void>();

  constructor() {
    this.state = this.initialState();
  }

  private initialState(): GameState {
    return {
      mode: "CRASH",
      round: 0,
      timeLeftSec: null,
      next: "CRASH",
      crash: {
        liveMultiplier: 1.0,
        crashed: false,
      },
      investor: {
        bankroll: 100000,
        jackpot: 0,
        liability: 0,
        rtpAvg: 0,
        rounds: 0,
      },
      totals: {
        mainBets: 0,
        microBets: 0,
        burned: 0,
        payouts: 0,
        rake: 0,
        operator: 0,
      },
      flags: { riskGuard: false },
    };
  }

  subscribe(send: (msg: WsOut) => void) {
    this.tickers.add(send);
    send({ type: "hello", now: Date.now() });
    send({ type: "state", state: this.state });
    return () => this.tickers.delete(send);
  }

  private broadcast(msg: WsOut) {
    for (const fn of this.tickers) fn(msg);
  }

  startLoop() {
    if (this.timer || this.between) return; // already running
    this.nextRound();
  }

  private nextRound() {
    this.state.round += 1;
    this.state.timeLeftSec = Math.ceil(ROUND_MS / 1000);
    this.state.crash.liveMultiplier = 1.0;
    this.state.crash.crashed = false;
    this.state.investor.rounds += 1;

    const start = Date.now();

    this.broadcast({
      type: "event",
      message: `Round #${this.state.round} start` ,
      ts: Date.now(),
    });
    this.broadcast({ type: "state", state: this.state });

    this.timer = setInterval(() => {
      const elapsed = Date.now() - start;

      // smooth expo-ish growth for demo
      const growth = 1 + Math.pow(elapsed / ROUND_MS, 1.5) * 3.5;
      this.state.crash.liveMultiplier = Math.max(1, Number(growth.toFixed(2)));

      // fake crash chance increases with time
      const p = elapsed / ROUND_MS;
      const crashNow = Math.random() < p * 0.04; // gentle

      this.state.timeLeftSec = Math.max(0, Math.ceil((ROUND_MS - elapsed) / 1000));

      if (crashNow || elapsed >= ROUND_MS) {
        this.state.crash.crashed = true;
        this.state.timeLeftSec = 0;

        // update simple financials for UI (demo numbers)
        const rake = Math.round(this.state.totals.mainBets * RAKE_PCT);
        this.state.totals.rake += rake;
        this.state.totals.operator += rake;
        this.broadcast({ type: "state", state: this.state });

        clearInterval(this.timer!);
        this.timer = undefined;

        this.broadcast({
          type: "event",
          message: `Round #${this.state.round} crashed at x${this.state.crash.liveMultiplier.toFixed(2)}`,
          ts: Date.now(),
        });

        this.between = setTimeout(() => {
          this.between = undefined;
          this.nextRound();
        }, BREAK_MS);
      } else {
        // live tick
        this.broadcast({ type: "state", state: this.state });
      }
    }, TICK_MS);
  }

  snapshot(): GameState {
    return this.state;
  }
}
