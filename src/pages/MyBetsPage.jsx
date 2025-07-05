import React, { useState, useEffect } from 'react';
import { betsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const MyBetsPage = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchBets = async () => {
      try {
        setLoading(true);
        const res = await betsAPI.myBets();
        setBets(res.data);
      } catch (err) {
        setBets([]);
        setMessage('Failed to load bet history');
      } finally {
        setLoading(false);
      }
    };
    fetchBets();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Loading Spinner */}
      <LoadingSpinner 
        isVisible={loadingAction} 
        message="Loading..." 
      />
      
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h1 className="text-3xl font-bold text-gold mb-8 text-center">My Bet History</h1>

          {message && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200">
              {message}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="text-gold text-xl">Loading...</div>
            </div>
          ) : bets.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-gold text-xl font-bold mb-2">No bets found</div>
              <div className="text-gray-400">Start betting to see your history here!</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gold border-b border-gold">
                    <th className="py-3 px-4 font-bold">Question</th>
                    <th className="py-3 px-4 font-bold">Option</th>
                    <th className="py-3 px-4 font-bold">Amount</th>
                    <th className="py-3 px-4 font-bold">Odds</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold">Winnings</th>
                  </tr>
                </thead>
                <tbody>
                  {bets.map(bet => (
                    <tr key={bet._id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-white">
                        {bet.questionId && bet.questionId.title ? bet.questionId.title : 'Question'}
                      </td>
                      <td className="py-3 px-4 text-cyan-300 font-medium">{bet.option}</td>
                      <td className="py-3 px-4 text-gold font-bold">{bet.amount} tokens</td>
                      <td className="py-3 px-4 text-gold">x{bet.odds}</td>
                      <td className="py-3 px-4">
                        {bet.resolved ? (
                          bet.won ? (
                            <span className="text-green-400 font-bold">✅ Won</span>
                          ) : (
                            <span className="text-red-400 font-bold">❌ Lost</span>
                          )
                        ) : (
                          <span className="text-yellow-400 font-bold">⏳ Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {bet.resolved && bet.won ? (
                          <span className="text-green-400 font-bold">+{bet.winnings} tokens</span>
                        ) : bet.resolved ? (
                          <span className="text-red-400">-{bet.amount} tokens</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBetsPage; 