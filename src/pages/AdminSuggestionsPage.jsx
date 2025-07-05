import React, { useState, useEffect } from 'react';
import { suggestionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminSuggestionsPage = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [approveModal, setApproveModal] = useState({ show: false, suggestion: null, formData: {} });

  useEffect(() => {
    fetchSuggestions();
  }, [filter]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const status = filter === 'all' ? null : filter;
      const response = await suggestionsAPI.getAll(status);
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setMessage({ type: 'error', text: 'Failed to load suggestions' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (suggestion) => {
    setApproveModal({
      show: true,
      suggestion,
      formData: {
        title: suggestion.questionText,
        description: `Suggested by ${suggestion.suggestedBy.username}`,
        options: suggestion.options.map((option, index) => ({
          label: option,
          odds: suggestion.multipliers[index] || 1.5,
          votes: 0
        }))
      }
    });
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    setMessage({ type: '', text: '' });

    try {
      await suggestionsAPI.approve(approveModal.suggestion._id, approveModal.formData);
      setMessage({ type: 'success', text: 'Suggestion approved and question created!' });
      setApproveModal({ show: false, suggestion: null, formData: {} });
      fetchSuggestions();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to approve suggestion';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReject = async (suggestionId) => {
    if (!window.confirm('Are you sure you want to reject this suggestion?')) {
      return;
    }

    setLoadingAction(true);
    setMessage({ type: '', text: '' });

    try {
      await suggestionsAPI.reject(suggestionId);
      setMessage({ type: 'success', text: 'Suggestion rejected' });
      fetchSuggestions();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reject suggestion';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoadingAction(false);
    }
  };

  const updateFormData = (field, value) => {
    setApproveModal(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value
      }
    }));
  };

  const updateOption = (index, field, value) => {
    setApproveModal(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        options: prev.formData.options.map((option, i) => 
          i === index ? { ...option, [field]: value } : option
        )
      }
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200';
      case 'approved': return 'bg-green-500/20 border-green-500/50 text-green-200';
      case 'rejected': return 'bg-red-500/20 border-red-500/50 text-red-200';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-200';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
            <p className="text-white">You need admin privileges to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Loading Spinner */}
      <LoadingSpinner 
        isVisible={loadingAction} 
        message="Processing..." 
      />
      
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h1 className="text-3xl font-bold text-gold mb-8 text-center">
            Question Suggestions
          </h1>

          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-500/20 border border-green-500/50 text-green-200' 
                : 'bg-red-500/20 border border-red-500/50 text-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Filter */}
          <div className="mb-6 flex justify-center">
            <div className="flex gap-2 bg-white/10 rounded-lg p-1">
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    filter === status
                      ? 'bg-gold text-black font-semibold'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Suggestions List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gold text-xl">Loading...</div>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-white text-xl">No suggestions found</div>
            </div>
          ) : (
            <div className="space-y-6">
              {suggestions.map((suggestion) => (
                <div key={suggestion._id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gold mb-2">
                        {suggestion.questionText}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-300">
                        <span>By: {suggestion.suggestedBy.username}</span>
                        <span>{formatDate(suggestion.createdAt)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(suggestion.status)}`}>
                          {suggestion.status}
                        </span>
                      </div>
                    </div>
                    
                    {suggestion.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(suggestion)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(suggestion._id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suggestion.options.map((option, index) => (
                      <div key={index} className="bg-white/5 rounded p-3">
                        <div className="text-white font-medium">{option}</div>
                        <div className="text-gray-300 text-sm">
                          Multiplier: {suggestion.multipliers[index] || 1.5}x
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {approveModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gold mb-6">Approve Suggestion</h2>
            
            <form onSubmit={handleApproveSubmit} className="space-y-6">
              <div>
                <label className="block text-gold font-semibold mb-2">Question Title</label>
                <input
                  type="text"
                  value={approveModal.formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-gold font-semibold mb-2">Description</label>
                <textarea
                  value={approveModal.formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-gold font-semibold mb-2">Options & Odds</label>
                <div className="space-y-3">
                  {approveModal.formData.options.map((option, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={option.label}
                          onChange={(e) => updateOption(index, 'label', e.target.value)}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
                          placeholder={`Option ${index + 1}`}
                          required
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          value={option.odds}
                          onChange={(e) => updateOption(index, 'odds', parseFloat(e.target.value) || 1.5)}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
                          step="0.1"
                          min="1.0"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setApproveModal({ show: false, suggestion: null, formData: {} })}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gold hover:bg-yellow-500 disabled:bg-gray-500 text-black font-bold rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {loading ? 'Approving...' : 'Approve & Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSuggestionsPage; 