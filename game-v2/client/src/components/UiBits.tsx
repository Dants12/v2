import React from "react";

export const Badge: React.FC<React.PropsWithChildren<{ tone?: "ok"|"danger" }>> = ({ tone, children }) => (
  <span className="badge" style={ tone==="ok" ? { borderColor:"#2b8", color:"#bff" } : tone==="danger" ? { borderColor:"#b66", color:"#ffd6d9" } : {} }>
    {children}
  </span>
);

export const Field: React.FC<{ label: string; right?: React.ReactNode; children?: React.ReactNode }>=({label,right,children})=> (
  <div className="col">
    <div className="row" style={{justifyContent:"space-between"}}>
      <div className="small">{label}</div>
      {right && <div className="small">{right}</div>}
    </div>
    {children}
  </div>
);
