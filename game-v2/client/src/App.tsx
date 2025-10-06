import React, { useEffect, useState } from "react";
import { LeftPanel } from "./components/LeftPanel";
import { Arena } from "./components/Arena";
import { InvestorPanel } from "./components/InvestorPanel";
import { RoundTotals } from "./components/RoundTotals";

const WS_PATH = (location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/ws";

export default function App(){
  const [wsOnline, setWsOnline] = useState(false);
  const [mode, setMode] = useState("CRASH");
  const [timeLeft, setTimeLeft] = useState<number|null>(null);
  const [mult, setMult] = useState(1);
  const [rounds, setRounds] = useState(0);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let retry = 0;
    const connect = () => {
      ws = new WebSocket(WS_PATH);
      ws.onopen = () => { setWsOnline(true); retry = 0; };
      ws.onclose = () => { setWsOnline(false); setTimeout(connect, Math.min(5000, 500*(++retry))); };
      ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if(msg.type === "state"){
          setMode(msg.state.mode);
          setTimeLeft(msg.state.timeLeftSec);
          setMult(msg.state.crash.liveMultiplier);
          setRounds(msg.state.investor.rounds);
        }
      };
    };
    connect();
    return () => { ws?.close(); };
  }, []);

  return (
    <div className="app">
      <LeftPanel wsOnline={wsOnline} stateMode={mode} timeLeft={timeLeft} />
      <Arena multiplier={mult} />
      <div className="card" style={{gridColumn:"3 / 4"}}>
        <InvestorPanel rtp={97.0} rounds={rounds} />
        <div className="card" style={{marginTop:12}}>
          <RoundTotals />
        </div>
        <div className="card" style={{marginTop:12}}>
          <h3>Events</h3>
          <div className="small">Live feed will appear here (kept minimal for demo).</div>
        </div>
      </div>
    </div>
  );
}
