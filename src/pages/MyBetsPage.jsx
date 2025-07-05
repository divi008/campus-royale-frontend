import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToken } from '../context/TokenContext';
import { useAuth } from '../context/AuthContext';
import { questionsAPI } from '../services/api';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/LoadingSpinner';

const MyBetsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bets, loadUserBets } = useToken();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Load user bets first
        await loadUserBets();
        
        // Fetch all questions
        const response = await questionsAPI.getAll();
        const allQuestions = response.data;
        
        // Filter questions where user has placed bets
        const userBetQuestionIds = bets.map(bet => bet.questionId);
        const userBetQuestions = allQuestions.filter(question => 
          userBetQuestionIds.includes(question._id)
        );
        
        setQuestions(userBetQuestions);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setMessage('Failed to load your bets');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bets.length]); // Re-run when bets array length changes

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-gold text-xl">
          Please login to view your bets
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Loading Spinner */}
      <LoadingSpinner 
        isVisible={loadingAction} 
        message="Loading..." 
      />
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gold">
              🎯 My Bets ({bets.length})
            </h1>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gold text-black font-bold rounded hover:bg-yellow-400 transition"
            >
              ← Back to All Questions
            </button>
          </div>

          {message && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200">
              {message}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="text-gold text-xl">Loading your bets...</div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-gold text-xl font-bold mb-2">No bets placed yet</div>
              <div className="text-gray-400 mb-4">Place some bets to see them here!</div>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gold text-black font-bold rounded hover:bg-yellow-400 transition"
              >
                Browse Questions
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question) => {
                // Find user's bet for this question
                const userBet = bets.find(bet => bet.questionId === question._id);
                
                return (
                  <div
                    key={question._id}
                    className="bg-white/5 rounded-lg p-6 border border-white/10 hover:border-gold/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/bet/${question._id}`)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gold mb-2">
                          {question.title}
                        </h3>
                        <p className="text-gray-300 mb-2">{question.description}</p>
                        
                        {/* User's Bet Info */}
                        {userBet && (
                          <div className="bg-gold/20 border border-gold/50 rounded-lg p-3 mb-3">
                            <div className="text-gold font-bold">
                              Your Bet: {userBet.option} @ x{userBet.odds}
                            </div>
                            <div className="text-gold">
                              Amount: {userBet.amount} tokens
                            </div>
                            {userBet.resolved && (
                              <div className={`font-bold ${userBet.won ? 'text-green-400' : 'text-red-400'}`}>
                                {userBet.won ? '✅ Won!' : '❌ Lost'}
                                {userBet.winnings > 0 && ` (+${userBet.winnings} tokens)`}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-300">
                          <span className={`px-2 py-1 rounded-full text-xs border ${
                            question.isResolved 
                              ? 'bg-green-500/20 border-green-500/50 text-green-200' 
                              : 'bg-blue-500/20 border-blue-500/50 text-blue-200'
                          }`}>
                            {question.isResolved ? 'Resolved' : 'Live'}
                          </span>
                          {question.isResolved && question.correctOption && (
                            <span className="text-gold">Answer: {question.correctOption}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Question Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {question.options.map((option, index) => (
                        <div 
                          key={option.label} 
                          className={`bg-white/5 rounded p-3 border ${
                            userBet && userBet.option === option.label 
                              ? 'border-gold bg-gold/10' 
                              : 'border-white/20'
                          }`}
                        >
                          <div className="text-white font-medium">{option.label}</div>
                          <div className="text-gray-300 text-sm">
                            Odds: {option.odds || 1.5}x | {option.votes || 0} bets
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBetsPage; 