export type ServerConfig = {
  host: string;
  port: number;
  publicUrl?: string;
};

export type Ticker = ReturnType<typeof setInterval>;

export type WsOut =
  | { type: "hello"; now: number }
  | { type: "state"; state: GameState }
  | { type: "event"; message: string; ts: number };

export type GameMode = "CRASH"; // room for FIGHTS later

export type GameState = {
  mode: GameMode;
  round: number;
  timeLeftSec: number | null; // null when idle
  next: GameMode;
  crash: {
    liveMultiplier: number; // grows over time
    crashed: boolean;
  };
  investor: {
    bankroll: number;
    jackpot: number;
    liability: number;
    rtpAvg: number;
    rounds: number;
  };
  totals: {
    mainBets: number;
    microBets: number;
    burned: number;
    payouts: number;
    rake: number;
    operator: number;
  };
  flags: {
    riskGuard: boolean;
  };
};
