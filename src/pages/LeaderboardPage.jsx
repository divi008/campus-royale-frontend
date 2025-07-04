import React, { useState, useEffect } from "react";
import { leaderboardAPI } from "../services/api";
import Card from "../components/ui/Card";

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await leaderboardAPI.getLeaderboard();
        setLeaderboard(response.data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-2 pt-12">
        <div className="text-center text-gold text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-2 pt-12">
        <div className="text-center text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-2 pt-12">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-gold text-center mb-8 drop-shadow-gold">
        Leaderboard
      </h1>
      <Card className="bg-cardbg border-2 border-gold shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gold/20">
                <th className="text-gold font-bold text-lg pb-4 pr-4">Rank</th>
                <th className="text-cyan-400 font-bold text-lg pb-4 pr-4">Username</th>
                <th className="text-gold font-bold text-lg pb-4 pr-4">Tokens</th>
                <th className="text-gold font-bold text-lg pb-4">Winnings</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user, index) => (
                <tr key={user._id} className="border-b border-gold/20 last:border-none hover:bg-gold/5 transition-all">
                  <td className="py-3 pr-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-lg ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      'bg-gold/20 text-gold'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-cyan-300 font-semibold text-lg">{user.username}</td>
                  <td className="py-3 pr-4 text-gold font-bold text-lg">{user.tokens.toLocaleString()}</td>
                  <td className="py-3 text-gold font-bold text-lg">{user.winnings.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {leaderboard.length === 0 && (
          <div className="text-center text-textsecondary py-8">
            No users found. Be the first to start betting!
          </div>
        )}
      </Card>
    </div>
  );
};

export default LeaderboardPage; 