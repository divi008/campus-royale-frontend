import React, { useContext } from "react";
import { TokenContext } from "../context/TokenContext";
import TokenBar from "./TokenBar";
import { Link, useLocation } from "react-router-dom";

// Import Google Fonts in index.html: Orbitron, Rajdhani, Montserrat

const navLinks = [
  { name: "Home", to: "/" },
  { name: "Leaderboard", to: "/leaderboard" },
  { name: "My Bets", to: "/my-bets" },
];

/**
 * Header displays the app name, current token balance, and profile button.
 */
const Header = () => {
  const { tokens, myBets } = useContext(TokenContext);
  const totalWinnings = myBets.reduce((sum, bet) => sum + (bet.win || 0), 0);
  const location = useLocation();
  return (
    <nav className="navbar-premium sticky top-0 z-30 w-full flex items-center px-4 py-3">
      {/* Left: TokenBar (coins) */}
      <div className="flex items-center gap-2 min-w-[120px] tokenbar-premium">
        <TokenBar tokens={tokens} />
      </div>
      {/* Center: App name - Cinzel, gold, shadow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center w-full pointer-events-none">
        <span className="campus-royale-heading text-5xl md:text-6xl font-extrabold select-none pointer-events-auto">
          CAMPUS ROYALE
        </span>
      </div>
      {/* Nav links - top right, white, neon cyan hover */}
      <div className="flex flex-1 justify-end gap-3 z-10">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`nav-link-premium px-2 py-1 rounded`}
          >
            {link.name}
          </Link>
        ))}
      </div>
      {/* Right: Winnings avatar */}
      <div className="flex items-center gap-2 avatar-premium profile-highlight">
        <Link to="/profile" className="flex items-center gap-2 bg-cardbg/80 px-3 py-1 rounded-full border-4 border-gold shadow-lg hover:scale-105 hover:shadow-gold transition-transform ring-2 ring-gold ring-offset-2">
          <img
            src="https://api.dicebear.com/7.x/pixel-art/svg?seed=User"
            alt="User Avatar"
            className="w-10 h-10 rounded-full border-4 border-gold shadow bg-[#221c3a] object-cover profile-dp-glow"
          />
          <div className="flex flex-col items-start">
            <span className="text-xs text-gold font-bold drop-shadow-gold">Winnings</span>
            <span className="font-display text-lg text-gold font-extrabold drop-shadow-gold tokenbar-bright">₹{totalWinnings.toLocaleString()}</span>
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default Header; 