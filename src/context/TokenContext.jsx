import React, { createContext, useState } from "react";

export const TokenContext = createContext();

/**
 * TokenProvider manages the user's token balance and bet history.
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export const TokenProvider = ({ children }) => {
  const [tokens, setTokens] = useState(100);
  const [myBets, setMyBets] = useState([]); // Array of { betId, question, option, amount, multiplier, win, timestamp }

  /**
   * Deduct tokens from the user's balance.
   * @param {number} amount
   * @returns {boolean} success
   */
  const deductTokens = (amount) => {
    if (tokens >= amount) {
      setTokens((t) => t - amount);
      return true;
    }
    return false;
  };

  /**
   * Credit winnings to the user's balance.
   * @param {number} amount
   */
  const creditTokens = (amount) => {
    setTokens((t) => t + amount);
  };

  /**
   * Add a bet to the user's bet history and optionally credit winnings.
   * @param {object} bet
   * @param {boolean} creditWin
   */
  const addBet = (bet, creditWin = false) => {
    setMyBets((prev) => [
      { ...bet, timestamp: new Date().toISOString() },
      ...prev,
    ]);
    if (creditWin && bet.win) {
      creditTokens(bet.win);
    }
  };

  return (
    <TokenContext.Provider value={{ tokens, deductTokens, creditTokens, myBets, addBet }}>
      {children}
    </TokenContext.Provider>
  );
}; 