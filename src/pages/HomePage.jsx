import React, { useContext, useState, useRef, useEffect } from "react";
import { useToken } from "../context/TokenContext";
import { questionsAPI } from "../services/api";
import Card from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaSpinner } from 'react-icons/fa';
import LoadingSpinner from "../components/LoadingSpinner";

const DUMMY_BETS = [
  {
    id: 1,
    title: "Will the campus fest be postponed?",
    description: "Rumors are swirling about the annual fest. Place your bet!",
    options: [
      { label: "Yes", tokens: 12 },
      { label: "No", tokens: 8 },
    ],
  },
  {
    id: 2,
    title: "Who will win the inter-college football final?",
    description: "Bet on your favorite team!",
    options: [
      { label: "Team Alpha", tokens: 20 },
      { label: "Team Beta", tokens: 15 },
    ],
  },
  {
    id: 3,
    title: "Will the canteen introduce a new menu item this month?",
    description: "A hot topic among foodies!",
    options: [
      { label: "Yes", tokens: 10 },
      { label: "No", tokens: 5 },
    ],
  },
];

function calculateMultipliers(options) {
  const total = options.reduce((sum, o) => sum + (typeof o.tokens === 'number' ? o.tokens : 0), 0) || 1;
  return options.map((opt) => {
    let base = 1.5;
    let optTokens = typeof opt.tokens === 'number' ? opt.tokens : 0;
    let multiplier = (total / (optTokens + 1)) * base;
    multiplier = Math.max(1.2, Math.min(multiplier, 5));
    if (isNaN(multiplier) || !isFinite(multiplier)) multiplier = 1.0;
    return { ...opt, multiplier: parseFloat(multiplier.toFixed(2)) };
  });
}

function calculateChances(options) {
  const total = options.reduce((sum, o) => sum + o.tokens, 0) || 1;
  return options.map((opt) => ({ ...opt, chance: Math.round((opt.tokens / total) * 100) }));
}

const FLUO_GREEN = '#39FF14';
const FLUO_ORANGE = '#FFAC1C';
const CYAN = '#00eaff';

const TAGS = [
  'Placement', 'Sports', 'Event', 'Person', '#other'
];

const HomePage = () => {
  const { deductTokens, tokens, addBet, creditTokens, bets } = useToken();
  const { user, setUser } = useAuth();
  const [message, setMessage] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [betAmounts, setBetAmounts] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [selectedOption, setSelectedOption] = useState({});
  const [confirming, setConfirming] = useState({});
  const [placed, setPlaced] = useState({});
  const [confetti, setConfetti] = useState([]);
  const cardRefs = useRef({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [customEditTag, setCustomEditTag] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState(null);
  const navigate = useNavigate();
  const [resolveModal, setResolveModal] = useState({ open: false, question: null });
  const [resolveOption, setResolveOption] = useState('');
  const [resolveMsg, setResolveMsg] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [loadingAction, setLoadingAction] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(null);

  // Fetch questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await questionsAPI.getAll();
        setQuestions(response.data);
      } catch (error) {
        console.error('Failed to fetch questions:', error);
        setMessage('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Comprehensive filtering and sorting logic:
  const filteredQuestions = questions.filter(question => {
    // Status filter
    if (filterStatus === 'live' && question.isResolved) return false;
    if (filterStatus === 'resolved' && !question.isResolved) return false;
    
    // Tag filter
    if (selectedTags.length > 0) {
      const questionTags = question.tags || [];
      if (!selectedTags.some(tag => questionTags.includes(tag))) return false;
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = question.title.toLowerCase().includes(query);
      const matchesDescription = question.description?.toLowerCase().includes(query);
      const matchesTags = (question.tags || []).some(tag => tag.toLowerCase().includes(query));
      if (!matchesTitle && !matchesDescription && !matchesTags) return false;
    }
    
    return true;
  });

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        // Most Popular: sort by total votes/bets
        const aTotal = a.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;
        const bTotal = b.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;
        return bTotal - aTotal;
      case 'recent':
        // Recently Added: sort by creation date
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // Get all unique tags from questions
  const allTags = [...new Set(questions.flatMap(q => q.tags || []))].sort();

  // Search suggestions
  const searchSuggestions = questions
    .filter(q => {
      const query = searchQuery.toLowerCase();
      return q.title.toLowerCase().includes(query) || 
             q.description?.toLowerCase().includes(query) ||
             (q.tags || []).some(tag => tag.toLowerCase().includes(query));
    })
    .slice(0, 5);

  const handleExpand = (betId) => {
    setExpanded(expanded === betId ? null : betId);
    setSelectedOption({});
    setConfirming({});
    setMessage("");
  };

  const handleAmountChange = (betId, value) => {
    setBetAmounts((prev) => ({ ...prev, [betId]: value.replace(/[^0-9]/g, "") }));
  };

  const handleSelectOption = (betId, label) => {
    setSelectedOption((prev) => ({ ...prev, [betId]: label }));
    setConfirming((prev) => ({ ...prev, [betId]: false }));
  };

  // Confetti burst from center (larger, more pieces)
  const triggerConfetti = () => {
    const confettiArr = [];
    const centerX = window.innerWidth / 2 - 48;
    const centerY = window.innerHeight / 2 - 48;
    for (let i = 0; i < 60; i++) {
      const angle = (Math.PI * 2 * i) / 60 + Math.random() * 0.2;
      const distance = 320 + Math.random() * 120;
      const x = centerX;
      const y = centerY;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance + 200;
      confettiArr.push({
        id: Math.random().toString(36).slice(2),
        x,
        y,
        dx,
        dy,
        color: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#00eaff' : '#FF2D55',
        delay: Math.random() * 0.1,
        size: 64,
      });
    }
    setConfetti(confettiArr);
    setTimeout(() => setConfetti([]), 2200);
  };

  // Firework burst effect
  const triggerFirework = () => {
    const fireworkArr = [];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    for (let i = 0; i < 40; i++) {
      const angle = (Math.PI * 2 * i) / 40;
      const distance = 200 + Math.random() * 100;
      fireworkArr.push({
        id: Math.random().toString(36).slice(2),
        x: centerX,
        y: centerY,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        color: i % 4 === 0 ? '#FFD700' : i % 4 === 1 ? '#00eaff' : i % 4 === 2 ? '#FF2D55' : '#39FF14',
        delay: Math.random() * 0.2,
        size: 32,
        firework: true,
      });
    }
    setConfetti(fireworkArr);
    setTimeout(() => setConfetti([]), 1800);
  };

  // Starburst effect
  const triggerStarburst = () => {
    const starArr = [];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const distance = 150 + Math.random() * 80;
      starArr.push({
        id: Math.random().toString(36).slice(2),
        x: centerX,
        y: centerY,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        color: '#FFD700',
        delay: Math.random() * 0.15,
        size: 40 + Math.random() * 20,
        star: true,
      });
    }
    setConfetti(starArr);
    setTimeout(() => setConfetti([]), 2000);
  };

  // Emoji burst effect
  const triggerEmojiBurst = () => {
    const emojiArr = [];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const emojis = ['🎉', '🎊', '🎈', '🎆', '🎇', '✨', '💫', '🌟', '⭐', '🔥'];
    for (let i = 0; i < 25; i++) {
      const angle = (Math.PI * 2 * i) / 25;
      const distance = 180 + Math.random() * 100;
      emojiArr.push({
        id: Math.random().toString(36).slice(2),
        x: centerX,
        y: centerY,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        color: '#FFD700',
        delay: Math.random() * 0.1,
        size: 48 + Math.random() * 24,
        emojiBurst: true,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      });
    }
    setConfetti(emojiArr);
    setTimeout(() => setConfetti([]), 2200);
  };

  // Snowfall effect
  const triggerSnowfall = () => {
    const snowArr = [];
    for (let i = 0; i < 50; i++) {
      snowArr.push({
        id: Math.random().toString(36).slice(2),
        x: Math.random() * window.innerWidth,
        y: -50,
        dx: 0,
        dy: window.innerHeight + 100,
        color: '#FFFFFF',
        delay: Math.random() * 2,
        size: 40 + Math.random() * 20,
        snow: true,
        emojiBurst: true,
      });
    }
    setConfetti(snowArr);
    setTimeout(() => setConfetti([]), 2200);
  };

  // Random celebration effect (add snowfall)
  const triggerCelebration = (win) => {
    const r = Math.random();
    if (r < 0.18) {
      triggerConfetti();
    } else if (r < 0.36) {
      triggerFirework();
    } else if (r < 0.52) {
      triggerStarburst();
    } else if (r < 0.68) {
      triggerEmojiBurst();
    } else if (r < 0.85) {
      triggerSnowfall();
    } else {
      triggerConfetti();
      setTimeout(triggerFirework, 300);
    }
  };

  // Card bounce effect
  const animateCard = (betId) => {
    const ref = cardRefs.current[betId];
    if (ref) {
      ref.classList.remove('animate-bounce');
      void ref.offsetWidth;
      ref.classList.add('animate-bounce');
      setTimeout(() => ref.classList.remove('animate-bounce'), 700);
    }
  };

  const handleConfirm = async (questionId) => {
    const amount = parseInt(betAmounts[questionId], 10);
    if (!amount || amount <= 0) {
      setMessage("Enter a valid amount!");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    setLoadingAction(true);
    try {
      const result = await addBet({
        questionId,
        option: selectedOption[questionId],
        amount
      });

      if (result.success) {
        setMessage(`Bet placed on "${selectedOption[questionId]}"! (-${amount} tokens)`);
        setConfirming((prev) => ({ ...prev, [questionId]: false }));
        setPlaced((prev) => ({ ...prev, [questionId]: true }));
        triggerCelebration(true);
        animateCard(questionId);
        setTimeout(() => setPlaced((prev) => ({ ...prev, [questionId]: false })), 2000);
      } else {
        setMessage(result.error || "Failed to place bet!");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (error) {
      setMessage("Failed to place bet!");
      setTimeout(() => setMessage(""), 2000);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEditClick = (question) => {
    setEditingQuestion({ ...question, options: question.options.map(opt => ({ ...opt })) });
    setCustomEditTag('');
    setEditModalOpen(true);
  };

  const handleEditOptionChange = (idx, field, value) => {
    setEditingQuestion((q) => ({
      ...q,
      options: q.options.map((opt, i) => i === idx ? { ...opt, [field]: value } : opt)
    }));
  };

  const addEditOption = () => {
    setEditingQuestion((q) => ({
      ...q,
      options: [...q.options, { label: '', odds: 1 }]
    }));
  };

  const removeEditOption = (idx) => {
    setEditingQuestion((q) => ({
      ...q,
      options: q.options.filter((_, i) => i !== idx)
    }));
  };

  const addCustomEditTag = () => {
    if (customEditTag.trim() && !editingQuestion.tags?.includes(customEditTag.trim())) {
      setEditingQuestion(q => ({
        ...q,
        tags: [...(q.tags || []), customEditTag.trim()]
      }));
      setCustomEditTag('');
    }
  };

  const removeEditTag = (tagToRemove) => {
    setEditingQuestion(q => ({
      ...q,
      tags: (q.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleEditSave = async () => {
    setLoadingAction(true);
    try {
      await questionsAPI.update(editingQuestion._id, {
        title: editingQuestion.title,
        description: editingQuestion.description,
        options: editingQuestion.options.map(opt => ({ label: opt.label, odds: Number(opt.odds) })),
        tags: editingQuestion.tags || []
      });
      setQuestions((qs) => qs.map(q => q._id === editingQuestion._id ? editingQuestion : q));
      setEditModalOpen(false);
      setEditingQuestion(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update question';
      alert(errorMsg);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteClick = (question) => {
    setDeletingQuestion(question);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingQuestion) return;
    setLoadingAction(true);
    try {
      await questionsAPI.delete(deletingQuestion._id);
      setQuestions((qs) => qs.filter(q => q._id !== deletingQuestion._id));
      setMessage('Question deleted');
    } catch (err) {
      setMessage('Failed to delete question');
    } finally {
      setDeleteModalOpen(false);
      setDeletingQuestion(null);
      setLoadingAction(false);
    }
  };

  // Handler for resolve
  const handleResolve = async () => {
    if (!resolveOption) return setResolveMsg('Select the correct option');
    setResolveMsg('');
    setLoadingAction(true);
    try {
      await api.post(`/questions/${resolveModal.question._id}/resolve`, { correctOption: resolveOption });
      setResolveMsg('Question resolved and winnings credited!');
      // Fetch updated user profile
      const profile = await api.get('/profile');
      setUser(profile.data);
      setTimeout(() => setResolveModal({ open: false, question: null }), 1500);
    } catch (err) {
      setResolveMsg(err.response?.data?.message || 'Failed to resolve question');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUnresolve = async () => {
    setResolveMsg('');
    setLoadingAction(true);
    try {
      await api.post(`/questions/${resolveModal.question._id}/unresolve`);
      setResolveMsg('Question unresolved and bets reset!');
      setTimeout(() => setResolveModal({ open: false, question: null }), 1500);
    } catch (err) {
      setResolveMsg(err.response?.data?.message || 'Failed to unresolve question');
    } finally {
      setLoadingAction(false);
    }
  };

  // Add enter key handler for search:
  const handleSearchEnter = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      // If there are search suggestions, navigate to the first one
      if (searchSuggestions.length > 0) {
        const firstResult = searchSuggestions[0];
        setSearchQuery('');
        navigate(`/bet/${firstResult._id}`);
      }
    }
  };

  // Handle admin dropdown toggle
  const toggleAdminDropdown = (questionId, e) => {
    e.stopPropagation();
    setAdminDropdownOpen(adminDropdownOpen === questionId ? null : questionId);
  };

  // Close admin dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setAdminDropdownOpen(null);
    };
    
    if (adminDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [adminDropdownOpen]);

  return (
    <div className="max-w-2xl mx-auto px-2 pt-12 pb-16">
      {message && (
        <div className="mb-4 text-center text-base font-display text-gold font-bold animate-pulse drop-shadow-gold">{message}</div>
      )}
      {loading ? (
        <div className="text-center text-gold text-xl">Loading questions...</div>
      ) : sortedQuestions.length === 0 ? (
        <div className="text-center text-gold text-xl py-8">
          {searchQuery.trim() || selectedTags.length > 0 || filterStatus !== 'all' ? (
            <div>
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-bold">Nothing to show</div>
              <div className="text-sm text-gray-400 mt-2">Try adjusting your search or filters</div>
            </div>
          ) : (
            <div>
              <div className="text-2xl mb-2">📝</div>
              <div className="font-bold">No questions available</div>
              <div className="text-sm text-gray-400 mt-2">Check back later for new betting questions</div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full px-0 py-8 relative z-10">
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search questions, descriptions, or tags..."
                className="w-full p-3 pr-10 rounded-lg bg-gray-900 border-2 border-gold text-gold placeholder-gray-400 focus:border-[#00eaff] focus:outline-none"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchEnter}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gold">
                🔍
              </div>
              {/* Search Suggestions */}
              {searchQuery.trim() && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-gray-900 border-2 border-gold rounded-lg mt-1 z-50 max-h-60 overflow-y-auto">
                  {searchSuggestions.map(question => (
                    <button
                      key={question._id}
                      className="w-full p-3 text-left text-gold hover:bg-gray-800 border-b border-gold/20 last:border-b-0"
                      onClick={() => {
                        setSearchQuery('');
                        // Navigate to the betting page
                        navigate(`/bet/${question._id}`);
                      }}
                    >
                      <div className="font-bold">{question.title}</div>
                      {question.description && (
                        <div className="text-sm text-gray-400 truncate">{question.description}</div>
                      )}
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {question.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-1 rounded-full bg-[#00eaff] text-black text-xs font-bold">
                              {tag}
                            </span>
                          ))}
                          {question.tags.length > 2 && (
                            <span className="px-2 py-1 rounded-full bg-gray-700 text-gold text-xs">
                              +{question.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filters and Sort */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-900 border-2 border-gold text-gold focus:border-[#00eaff] focus:outline-none"
              >
                <option value="all">All Questions</option>
                <option value="live">⏳ Live</option>
                <option value="resolved">✔️ Resolved</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-900 border-2 border-gold text-gold focus:border-[#00eaff] focus:outline-none"
              >
                <option value="recent">🕒 Recently Added</option>
                <option value="popular">🔥 Most Popular</option>
              </select>

              {/* Tag Filter */}
              <div className="relative">
                <select
                  value=""
                  onChange={e => {
                    if (e.target.value && !selectedTags.includes(e.target.value)) {
                      setSelectedTags([...selectedTags, e.target.value]);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-900 border-2 border-gold text-gold focus:border-[#00eaff] focus:outline-none"
                >
                  <option value="">🏷️ Filter by Tag</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Tag Filters */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <span 
                    key={tag} 
                    className="px-3 py-1 rounded-full bg-[#00eaff] text-black font-bold text-sm shadow flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => setSelectedTags(tags => tags.filter(t => t !== tag))}
                      className="text-black hover:text-red-600 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => setSelectedTags([])}
                  className="px-3 py-1 rounded-full bg-gray-700 text-gold font-bold text-sm hover:bg-gray-600"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-6 w-full relative z-10">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-gold text-4xl" />
              </div>
            ) : sortedQuestions.map((question) => (
              <div
                key={question._id}
                id={`question-${question._id}`}
                className="relative z-20 bg-cardbg border-2 border-gold shadow-lg hover:shadow-gold transition-all duration-300 rounded-2xl flex flex-col items-center justify-start p-6 cursor-pointer select-none w-full mx-0 h-auto"
                onClick={() => navigate(`/bet/${question._id}`)}
              >
                {/* Admin Dropdown Menu */}
                {user && user.role === 'admin' && (
                  <div className="absolute top-4 right-4 z-30">
                    <button
                      onClick={(e) => toggleAdminDropdown(question._id, e)}
                      className="text-gold hover:text-yellow-400 transition-colors p-1"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {adminDropdownOpen === question._id && (
                      <div className="absolute right-0 top-8 bg-gray-900 border-2 border-gold rounded-lg shadow-xl z-40 min-w-32">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditClick(question); setAdminDropdownOpen(null); }}
                          className="w-full px-3 py-2 text-left text-gold hover:bg-gray-800 border-b border-gold/20 text-sm"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(question); setAdminDropdownOpen(null); }}
                          className="w-full px-3 py-2 text-left text-red-400 hover:bg-gray-800 border-b border-gold/20 text-sm"
                        >
                          🗑️ Delete
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setResolveModal({ open: true, question }); setResolveOption(''); setResolveMsg(''); setAdminDropdownOpen(null); }}
                          className="w-full px-3 py-2 text-left text-blue-400 hover:bg-gray-800 border-b border-gold/20 text-sm"
                        >
                          ✅ Resolve
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setResolveModal({ open: true, question }); setResolveOption(''); setResolveMsg(''); handleUnresolve(); setAdminDropdownOpen(null); }}
                          className="w-full px-3 py-2 text-left text-gray-400 hover:bg-gray-800 text-sm"
                        >
                          🔄 Unresolve
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {/* Animated status badge */}
                <div className="absolute bottom-4 left-4 z-30">
                  {question.isResolved ? (
                    <span className="inline-block px-3 py-1 bg-green-700 text-gold font-bold rounded-full text-xs animate-bounce">✔️ Resolved</span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-blue-700 text-gold font-bold rounded-full text-xs animate-pulse">⏳ Live</span>
                  )}
                  {question.isResolved && (
                    <div className="text-xs text-gold font-bold mt-1">Answer: {question.correctOption}</div>
                  )}
                </div>
                <h3 className="text-2xl md:text-3xl font-display font-bold text-gold drop-shadow-gold tracking-wide break-words text-center mb-2 w-full">{question.title}</h3>
                <p className="text-textsecondary mb-3 text-base font-sans text-center w-full">{question.description}</p>
                <div className="flex flex-wrap gap-4 text-sm mb-2 justify-center w-full">
                  {question.options.map((opt, i) => (
                    <div key={opt.label} className="flex flex-col items-center min-w-[100px] max-w-[140px] w-full sm:w-auto break-words">
                      <span className="font-bold break-words text-center" style={{ color: '#00eaff', fontFamily: 'inherit' }}>{opt.label}</span>
                      <span className="mt-1 px-2 py-0.5 rounded-full text-xs font-bold shadow bg-[#00eaff22] text-[#00eaff]">{opt.votes} bets</span>
                      <span className="text-textsecondary">x{opt.odds || 1.5}</span>
                    </div>
                  ))}
                </div>
                {/* Tags */}
                {question.tags && question.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-4">
                    {question.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="px-2 py-1 rounded-full bg-[#00eaff] text-black font-bold text-xs shadow animate-pulse"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {confetti.map(c => (
        c.snow && c.emojiBurst ? (
          <div
            key={c.id}
            className="confetti emoji-confetti snow-confetti"
            style={{
              left: c.x,
              top: c.y,
              fontSize: c.size,
              animationDelay: `${c.delay}s`,
              '--dy': `${c.dy}px`,
              zIndex: 9999,
              position: 'fixed'
            }}
          >{c.emoji}</div>
        ) : c.snow && c.star ? (
          <div
            key={c.id}
            className="confetti star-confetti snow-confetti"
            style={{
              left: c.x,
              top: c.y,
              width: c.size,
              height: c.size,
              animationDelay: `${c.delay}s`,
              '--dy': `${c.dy}px`,
              zIndex: 9999,
              position: 'fixed'
            }}
          >
            <svg width={c.size} height={c.size} viewBox="0 0 40 40"><polygon points="20,2 25,15 39,15 28,24 32,38 20,30 8,38 12,24 1,15 15,15" fill="#fff" stroke="#FFD700" strokeWidth="2"/></svg>
          </div>
        ) : c.snow ? (
          <div
            key={c.id}
            className="confetti snow-confetti"
            style={{
              left: c.x,
              top: c.y,
              background: c.color,
              borderRadius: '50%',
              width: c.size,
              height: c.size,
              boxShadow: `0 0 16px 2px ${c.color}99` ,
              animationDelay: `${c.delay}s`,
              '--dy': `${c.dy}px`,
              zIndex: 9999,
              position: 'fixed'
            }}
          />
        ) : c.emojiBurst ? (
          <div
            key={c.id}
            className="confetti emoji-confetti"
            style={{
              left: c.x,
              top: c.y,
              fontSize: c.size,
              animationDelay: `${c.delay}s`,
              '--dx': `${c.dx}px`,
              '--dy': `${c.dy}px`,
              zIndex: 9999,
              position: 'fixed'
            }}
          >{c.emoji}</div>
        ) : c.star ? (
          <div
            key={c.id}
            className="confetti star-confetti"
            style={{
              left: c.x,
              top: c.y,
              width: c.size,
              height: c.size,
              animationDelay: `${c.delay}s`,
              '--dx': `${c.dx}px`,
              '--dy': `${c.dy}px`,
              zIndex: 9999,
              position: 'fixed'
            }}
          >
            <svg width={c.size} height={c.size} viewBox="0 0 40 40"><polygon points="20,2 25,15 39,15 28,24 32,38 20,30 8,38 12,24 1,15 15,15" fill="#fff" stroke="#FFD700" strokeWidth="2"/></svg>
          </div>
        ) : (
          <div
            key={c.id}
            className={c.firework ? "confetti firework" : "confetti"}
            style={{
              left: c.x,
              top: c.y,
              background: c.color,
              borderRadius: '50%',
              width: c.size,
              height: c.size,
              boxShadow: `0 0 24px 4px ${c.color}99` ,
              animationDelay: `${c.delay}s`,
              '--dx': `${c.dx}px`,
              '--dy': `${c.dy}px`,
              zIndex: 9999,
              position: 'fixed'
            }}
          />
        )
      ))}
      {/* Edit Modal */}
      {editModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-2 overflow-y-auto">
          <div className="relative z-[1000] w-full max-w-xl bg-black/95 p-4 sm:p-8 rounded-lg border-2 border-gold shadow-2xl max-h-[95vh] overflow-y-auto">
            <button onClick={() => { setEditModalOpen(false); setCustomEditTag(''); }} className="absolute top-2 right-2 text-gold text-2xl font-bold hover:text-yellow-400">✕</button>
            <h2 className="text-2xl font-extrabold text-gold mb-4">Edit Question</h2>
            <div className="mb-4">
              <label className="block text-gold font-semibold mb-2">Title</label>
              <input type="text" className="w-full p-2 rounded bg-gray-900 border border-gold text-gold" value={editingQuestion.title} onChange={e => setEditingQuestion(q => ({ ...q, title: e.target.value }))} />
            </div>
            <div className="mb-4">
              <label className="block text-gold font-semibold mb-2">Description</label>
              <textarea className="w-full p-2 rounded bg-gray-900 border border-gold text-gold" value={editingQuestion.description} onChange={e => setEditingQuestion(q => ({ ...q, description: e.target.value }))} />
            </div>
            <div className="mb-4">
              <label className="block text-gold font-semibold mb-2">Options</label>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                {editingQuestion.options.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-gray-800/80 p-2 rounded-lg border border-gold/40 mb-2">
                    <input
                      type="text"
                      placeholder={`Option ${idx + 1} name`}
                      className="flex-1 p-2 rounded bg-gray-900 border border-gold text-gold"
                      value={opt.label}
                      onChange={e => handleEditOptionChange(idx, 'label', e.target.value)}
                    />
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Odds"
                      className="w-24 p-2 rounded bg-gray-900 border border-gold text-gold"
                      value={opt.odds ?? 1.5}
                      onChange={e => handleEditOptionChange(idx, 'odds', e.target.value)}
                      onBlur={e => { if (!e.target.value) handleEditOptionChange(idx, 'odds', 1.5); }}
                    />
                    {editingQuestion.options.length > 2 && (
                      <button type="button" onClick={() => removeEditOption(idx)} className="text-red-400 font-bold px-2 text-xl hover:text-red-600" title="Remove option">✕</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addEditOption} className="flex items-center gap-2 mt-2 px-4 py-2 bg-gold text-black rounded font-bold hover:bg-yellow-400 transition shadow-gold/50 border-2 border-gold">
                  <span className="text-xl font-bold">+</span> <span>Add Option</span>
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gold font-semibold mb-2">
                Tags <span className="text-xs text-gray-400">(Select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {TAGS.map(tag => (
                  <button
                    type="button"
                    key={tag}
                    className={`px-3 py-1 rounded-full font-bold border-2 transition-all text-xs ${editingQuestion.tags?.includes(tag) ? 'bg-[#00eaff] border-[#00eaff] text-black shadow' : 'bg-cardbg border-[#00eaff] text-[#00eaff] hover:bg-[#00eaff22]'}`}
                    onClick={() => setEditingQuestion(q => ({
                      ...q,
                      tags: q.tags?.includes(tag)
                        ? q.tags.filter(t => t !== tag)
                        : [...(q.tags || []), tag]
                    }))}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {/* Custom Tag Input */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Add custom tag (e.g., CSE2024, Branch2025)"
                  className="flex-1 p-2 rounded bg-gray-900 border border-gold text-gold text-sm"
                  value={customEditTag}
                  onChange={e => setCustomEditTag(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCustomEditTag())}
                />
                <button
                  type="button"
                  onClick={addCustomEditTag}
                  className="px-4 py-2 bg-[#00eaff] text-black font-bold rounded hover:bg-[#00eaffcc] transition text-sm"
                >
                  Add
                </button>
              </div>

              {/* Selected Tags Display */}
              {(editingQuestion.tags || []).length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {(editingQuestion.tags || []).map(tag => (
                    <span 
                      key={tag} 
                      className="px-2 py-1 rounded-full bg-[#00eaff] text-black font-bold text-xs shadow flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeEditTag(tag)}
                        className="text-black hover:text-red-600 font-bold text-sm"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleEditSave} className="w-full py-2 bg-gold text-black font-extrabold rounded hover:bg-yellow-400 transition">Save Changes</button>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && deletingQuestion && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-2 overflow-y-auto">
          <div className="relative z-[1000] w-full max-w-md bg-black/95 p-6 rounded-lg border-2 border-gold shadow-2xl max-h-[95vh] overflow-y-auto">
            <button onClick={() => setDeleteModalOpen(false)} className="absolute top-2 right-2 text-gold text-2xl font-bold hover:text-yellow-400">✕</button>
            <h2 className="text-xl font-extrabold text-gold mb-4">Delete Question</h2>
            <div className="mb-4 text-gold">Are you sure you want to delete <span className="font-bold">{deletingQuestion.title}</span>?</div>
            <div className="flex gap-4 justify-end">
              <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 rounded bg-gray-700 text-gold border border-gold font-bold hover:bg-gray-800">Cancel</button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 rounded bg-red-500 text-white border border-red-400 font-bold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
      {/* Resolve Modal */}
      {resolveModal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-cardbg border-2 border-gold rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gold mb-4">Resolve Question</h2>
            <div className="mb-4">
              <label className="block text-gold font-semibold mb-2">Select the correct option:</label>
              <select
                className="w-full p-3 rounded border border-gold bg-gray-900 text-gold"
                value={resolveOption}
                onChange={e => setResolveOption(e.target.value)}
              >
                <option value="">-- Select --</option>
                {resolveModal.question.options.map(opt => (
                  <option key={opt.label} value={opt.label}>{opt.label}</option>
                ))}
              </select>
            </div>
            {resolveMsg && <div className="mb-4 text-center text-gold font-bold">{resolveMsg}</div>}
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setResolveModal({ open: false, question: null })}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                className="px-4 py-2 bg-gold text-black font-bold rounded-lg"
              >
                Resolve
              </button>
              <button
                onClick={handleUnresolve}
                className="px-4 py-2 bg-gray-500 text-white font-bold rounded-lg"
              >
                Unresolve
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading Spinner */}
      <LoadingSpinner 
        isVisible={loadingAction} 
        message="Processing your bet..." 
      />
    </div>
  );
};

export default HomePage; 