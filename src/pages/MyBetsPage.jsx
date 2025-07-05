import React, { useEffect, useState } from 'react';
import { betsAPI } from '../services/api';

const MyBetsPage = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const res = await betsAPI.myBets();
        setBets(res.data);
      } catch (err) {
        setBets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBets();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        <h1 className="text-3xl font-bold text-gold mb-8 text-center">My Bet History</h1>
        {loading ? (
          <div className="text-center text-gold text-xl">Loading...</div>
        ) : bets.length === 0 ? (
          <div className="text-center text-white text-lg">No bets found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gold border-b border-gold">
                  <th className="py-2 px-3">Question</th>
                  <th className="py-2 px-3">Option</th>
                  <th className="py-2 px-3">Amount</th>
                  <th className="py-2 px-3">Odds</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Winnings</th>
                </tr>
              </thead>
              <tbody>
                {bets.map(bet => (
                  <tr key={bet._id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-2 px-3">{bet.questionId && bet.questionId.title ? bet.questionId.title : bet.questionId}</td>
                    <td className="py-2 px-3">{bet.option}</td>
                    <td className="py-2 px-3">{bet.amount}</td>
                    <td className="py-2 px-3">x{bet.odds}</td>
                    <td className="py-2 px-3">
                      {bet.resolved ? (
                        bet.won ? <span className="text-green-400 font-bold">Won</span> : <span className="text-red-400 font-bold">Lost</span>
                      ) : <span className="text-yellow-400 font-bold">Pending</span>}
                    </td>
                    <td className="py-2 px-3">{bet.winnings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBetsPage; 