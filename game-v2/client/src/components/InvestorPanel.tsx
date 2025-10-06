import React from "react";

export const InvestorPanel: React.FC<{ rtp:number; rounds:number }>=({ rtp, rounds })=> (
  <div className="card">
    <h3>Investor panel</h3>
    <div className="row" style={{gap:8,marginBottom:6}}>
      <div className="badge">Bankroll 100000 €</div>
      <div className="badge">Jackpot 0 €</div>
      <div className="badge">Liability: 0 €</div>
    </div>
    <div className="row" style={{gap:8}}>
      <div className="badge">RTP (avg): {rtp.toFixed(2)}%</div>
      <div className="badge">Rounds: {rounds}</div>
    </div>
  </div>
);
