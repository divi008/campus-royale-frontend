import React from "react";

const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white/10 backdrop-blur-md border border-gold rounded-xl shadow-lg p-7 md:p-8 ${className}`}>
      {children}
    </div>
  );
};

export default Card; 