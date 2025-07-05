import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionsAPI, betsAPI } from '../services/api';
import { useToken } from '../context/TokenContext';

const BetPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tokens, deductTokens, creditTokens } = useToken();
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [amount, setAmount] = useState(1);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    questionsAPI.getAll().then(res => {
      const q = res.data.find(q => q._id === id);
      if (!q) navigate('/');
      setQuestion(q);
    });
  }, [id, navigate]);

  if (!question) return <div className="min-h-screen flex items-center justify-center text-gold text-2xl">Loading...</div>;

  if (question.isResolved) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
          <h1 className="text-3xl font-bold text-gold mb-2">{question.title}</h1>
          <p className="text-white mb-6">{question.description}</p>
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-green-700 text-gold font-bold rounded-full text-lg mb-2">Result Declared</span>
            <div className="text-xl text-gold font-bold mt-2">Correct Answer: {question.correctOption}</div>
          </div>
          <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-gold text-black font-bold rounded-lg">Back</button>
        </div>
      </div>
    );
  }

  const multipliers = question.options.map(opt => opt.odds || 1.5);

  const handlePlaceBet = async () => {
    setMessage('');
    try {
      await betsAPI.placeBet({
        questionId: question._id,
        option: question.options[selectedOption].label,
        amount: parseInt(amount, 10)
      });
      deductTokens(parseInt(amount, 10));
      setMessage('Bet placed successfully!');
      setConfirming(false);
      // Redirect to home page after placing bet
      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to place bet');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        <button onClick={() => navigate(-1)} className="mb-4 text-gold font-bold">&larr; Back</button>
        <h1 className="text-3xl font-bold text-gold mb-2">{question.title}</h1>
        <p className="text-white mb-6">{question.description}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {question.options.map((opt, i) => (
            <button
              key={opt.label}
              className={`rounded-xl p-6 font-bold text-lg border-2 transition-all duration-200 flex flex-col items-center justify-center aspect-square ${selectedOption === i ? 'bg-gold text-black border-gold shadow-lg' : 'bg-gray-900/80 text-cyan-300 border-cyan-400 hover:bg-cyan-900/40'}`}
              onClick={() => setSelectedOption(i)}
            >
              <span>{opt.label}</span>
              <span className="mt-2 text-base font-semibold">x{multipliers[i]}</span>
              <span className="text-xs text-gray-400 mt-1">{opt.votes} bets</span>
            </button>
          ))}
        </div>
        {selectedOption !== null && (
          <div className="mt-6 bg-black/40 rounded-xl p-6 border border-gold flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="text-gold font-bold text-lg">Amount:</label>
              <input
                type="number"
                min="1"
                max={tokens}
                value={amount}
                onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-24 p-2 rounded bg-gray-900 border border-gold text-gold text-center font-bold"
              />
              <span className="text-gold font-bold text-lg">tokens</span>
            </div>
            <div className="text-gold font-display font-semibold">
              Potential Win: <span className="font-bold">{amount && multipliers[selectedOption] ? (parseInt(amount, 10) * multipliers[selectedOption]).toLocaleString() : 0}</span> tokens
            </div>
            <button
              className="px-8 py-4 bg-gold hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors text-xl"
              onClick={() => setConfirming(true)}
            >
              Confirm
            </button>
          </div>
        )}
        {confirming && (
          <div className="mt-8 p-6 bg-gray-900/80 border-2 border-gold rounded-xl flex flex-col gap-4">
            <div className="text-white font-display mb-2">Confirm your bet:</div>
            <div className="text-xl font-bold text-gold">{question.options[selectedOption].label} @ x{multipliers[selectedOption]}</div>
            <div className="text-gold">Amount: <span className="font-bold">{amount}</span> tokens</div>
            <div className="text-gold">Potential Win: <span className="font-bold">{amount && multipliers[selectedOption] ? (parseInt(amount, 10) * multipliers[selectedOption]).toLocaleString() : 0}</span> tokens</div>
            <div className="flex gap-4 mt-2">
              <button className="px-6 py-2 bg-gray-700 text-white rounded-lg" onClick={() => setConfirming(false)}>Cancel</button>
              <button
                className="px-6 py-2 bg-gold text-black font-bold rounded-lg"
                onClick={handlePlaceBet}
              >
                Place Bet
              </button>
            </div>
            {message && <div className="text-red-400 font-bold mt-2">{message}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default BetPage; 