import React from "react";

const Button = ({ children, onClick, className = "", ...rest }) => {
  return (
    <button
      onClick={onClick}
      className={`glass glow-blue neon-purple px-4 py-2 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#a259ff] ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button; 