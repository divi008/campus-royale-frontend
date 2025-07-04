import React from "react";

/**
 * TokenBar displays the user's current token balance with a gold chip and shine.
 * @param {{ tokens: number }} props
 */
const TokenBar = ({ tokens }) => (
  <div className="flex items-center gap-2 px-5 py-1 rounded-full font-semibold shadow border-2 border-gold bg-cardbg/80 relative overflow-hidden tokenbar-bright">
    {/* Gold coin icon with shine */}
    <span className="inline-block relative">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#facc15" stroke="#eab308" strokeWidth="2" />
        <text x="12" y="17" textAnchor="middle" fontSize="13" fill="#23191c" fontFamily="'Playfair Display', 'DM Serif Display', serif">₹</text>
      </svg>
      <span className="absolute left-1 top-1 w-3 h-3 rounded-full bg-white/60 animate-shine opacity-70" />
    </span>
    <span className="font-display text-lg tracking-wide text-gold font-bold drop-shadow-gold tokenbar-bright">{tokens} tokens</span>
  </div>
);

export default TokenBar; 