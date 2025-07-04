import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { betsAPI } from '../services/api';

const TokenContext = createContext();

export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
};

export const TokenProvider = ({ children }) => {
  const { user, updateUser } = useAuth();
  const [bets, setBets] = useState([]);

  const deductTokens = (amount) => {
    if (!user || user.tokens < amount) return false;
    
    const updatedUser = { ...user, tokens: user.tokens - amount };
    updateUser(updatedUser);
    return true;
  };

  const creditTokens = (amount) => {
    if (!user) return false;
    
    const updatedUser = { ...user, tokens: user.tokens + amount };
    updateUser(updatedUser);
    return true;
  };

  const addBet = async (betData, isWin = false) => {
    try {
      const response = await betsAPI.placeBet(betData);
      const { bet, tokens } = response.data;
      
      // Update user tokens
      const updatedUser = { ...user, tokens };
      updateUser(updatedUser);
      
      // Add bet to local state
      setBets(prev => [...prev, bet]);
      
      return { success: true, bet };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to place bet' 
      };
    }
  };

  const value = {
    tokens: user?.tokens || 0,
    winnings: user?.winnings || 0,
    bets,
    deductTokens,
    creditTokens,
    addBet,
  };

  return (
    <TokenContext.Provider value={value}>
      {children}
    </TokenContext.Provider>
  );
}; 