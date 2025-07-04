import React, { useContext, useState, useRef, useEffect } from "react";
import { useToken } from "../context/TokenContext";
import { useAuth } from "../context/AuthContext";
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
  const { tokens, winnings } = useToken();
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        {isAuthenticated && user ? (
          <>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link-premium px-2 py-1 rounded`}
              >
                {link.name}
              </Link>
            ))}
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="nav-link-premium px-2 py-1 rounded"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="nav-link-premium px-2 py-1 rounded"
            >
              Register
            </Link>
          </>
        )}
      </div>
      {/* Right: Avatar Dropdown */}
      {isAuthenticated && user && (
        <div className="relative ml-4" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((open) => !open)}
            className="flex items-center gap-2 bg-cardbg/80 px-3 py-1 rounded-full border-4 border-gold shadow-lg hover:scale-105 hover:shadow-gold transition-transform ring-2 ring-gold ring-offset-2 focus:outline-none"
          >
            <img
              src="https://api.dicebear.com/7.x/pixel-art/svg?seed=User"
              alt="User Avatar"
              className="w-10 h-10 rounded-full border-4 border-gold shadow bg-[#221c3a] object-cover profile-dp-glow"
            />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-black border border-gold rounded-lg shadow-lg z-50 py-2">
              <div className="px-4 py-2 text-gold font-bold text-sm">Winnings: <span className="font-extrabold">₹{winnings.toLocaleString()}</span></div>
              <Link to="/profile" className="block px-4 py-2 text-gold hover:bg-gold/10">Profile</Link>
              {user.role === 'admin' && (
                <Link to="/add-question" className="block px-4 py-2 text-gold hover:bg-gold/10">Add Question</Link>
              )}
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-gold hover:bg-gold/10"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Header; 