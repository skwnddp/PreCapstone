import React from "react";
import "./Neon.css";

const Neon = ({ children }) => {
  return (
    <div>
      <div className="background-glow"></div>
      <div className="neon-text">{children}</div>
    </div>
  );
};

export default Neon;