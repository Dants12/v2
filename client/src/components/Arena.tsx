import React from "react";

export const Arena: React.FC<{ multiplier: number }>=({ multiplier })=>{
  // Move rocket diagonally based on multiplier (demo only)
  const x = Math.min(100, (multiplier - 1) * 18);
  const y = Math.min(100, (multiplier - 1) * 10);
  return (
    <div className="card" style={{gridColumn:"2 / 3"}}>
      <h3>Dual Crash · Arena</h3>
      <div className="canvasWrap">
        <img className="rocket" src="data:image/svg+xml;utf8,<?xml version='1.0' encoding='UTF-8'?><svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 64 64'><path fill='%23ff598a' d='M34 4c12 4 17 24 17 24l-9 9s-20-5-24-17S22 0 34 4z'/><circle cx='44' cy='24' r='5' fill='%23c7f7ff'/><path fill='%2380e1c1' d='M12 52l6-6l10 2l-8 8z'/></svg>" style={{ transform:`translate(${x*6}px,-${y*4}px)` }} />
      </div>
    </div>
  );
};
