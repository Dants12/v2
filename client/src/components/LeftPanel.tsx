import React from "react";
import { Badge, Field } from "./UiBits";

type Props = {
  wsOnline: boolean;
  stateMode: string;
  timeLeft: number | null;
};

export const LeftPanel: React.FC<Props> = ({ wsOnline, stateMode, timeLeft }) => {
  return (
    <div className="card">
      <div className="row" style={{justifyContent:"space-between"}}>
        <h3>Clash Demo</h3>
        <div className="row" style={{gap:8}}>
          <Badge>{wsOnline ? "WS online" : "WS offline"}</Badge>
          <Badge>state→</Badge>
        </div>
      </div>

      <div className="card" style={{marginTop:12}}>
        <div className="row" style={{justifyContent:"space-between",marginBottom:6}}>
          <div className="small">Time left</div>
          <div className="small">Next</div>
        </div>
        <div className="row" style={{justifyContent:"space-between",alignItems:"center"}}>
          <div className="kpi" style={{fontSize:22}}>{timeLeft ?? "—"}</div>
          <div className="kpi" style={{fontSize:22}}>{stateMode}</div>
        </div>
        <div className="row" style={{gap:8, marginTop:12}}>
          <button className="btn">Crash</button>
          <button className="btn">Winner</button>
          <button className="btn prim">Start</button>
          <button className="btn danger">Reset</button>
          <button className="btn">Round →</button>
        </div>
      </div>

      <div className="card" style={{marginTop:12}}>
        <h3>Wallet & Mode</h3>
        <div className="row" style={{justifyContent:"space-between"}}>
          <div>
            <div className="small">Balance</div>
            <div className="kpi">$741.77</div>
          </div>
          <div className="col" style={{alignItems:"flex-end"}}>
            <div className="small">Add $</div>
            <div className="row" style={{gap:8}}>
              <button className="btn">+50</button>
              <button className="btn">+100</button>
              <button className="btn">+250</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop:12}}>
        <h3>Main bet</h3>
        <Field label="Amount">
          <input className="input" placeholder="50" />
        </Field>
        <div className="row" style={{gap:8, marginTop:10}}>
          <button className="btn">Side A</button>
          <button className="btn">Side B</button>
        </div>
        <div className="row" style={{gap:8, marginTop:10}}>
          <button className="btn prim">Bet</button>
          <button className="btn danger">Cashout</button>
        </div>
      </div>

      <div className="card" style={{marginTop:12}}>
        <h3>Micro-bets</h3>
        <div className="row" style={{gap:8, marginBottom:8}}>
          <button className="btn">A</button>
          <button className="btn">B</button>
          <button className="btn">Speed</button>
          <button className="btn">Defense</button>
        </div>
        <div className="row" style={{gap:8}}>
          <button className="btn">+1</button>
          <button className="btn">+5</button>
          <button className="btn">+10</button>
          <button className="btn">+25</button>
        </div>
        <div className="row" style={{gap:30,marginTop:10}}>
          <div className="small">A Speed 0</div>
          <div className="small">B Speed 0</div>
        </div>
      </div>
    </div>
  );
};
