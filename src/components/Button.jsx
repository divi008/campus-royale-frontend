import React from "react";

/**
 * Button component for consistent styling.
 * @param {object} props
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 * @param {any} [props.rest]
 */
const Button = ({ className = "", children, ...rest }) => (
  <button
    className={`px-4 py-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] bg-[#6C5CE7] text-white hover:bg-[#5B4FCF] ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export default Button; 