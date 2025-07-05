import React, { useContext, useState, useRef, useEffect } from "react";
import { useToken } from "../context/TokenContext";
import { questionsAPI } from "../services/api";
import Card from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";

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

const HomePage = () => {
  const { deductTokens, tokens, addBet, creditTokens } = useToken();
  const { user } = useAuth();
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState(null);

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
    setTimeout(() => setConfetti([]), 1800);
  };

  // Firework burst for winnings
  const triggerFirework = () => {
    const fireworkArr = [];
    const centerX = window.innerWidth / 2 - 32;
    const centerY = window.innerHeight / 2 - 32;
    const colors = ['#FFD700', '#00eaff', '#FF2D55', '#A259FF', '#39FF14', '#FFAC1C'];
    for (let i = 0; i < 36; i++) {
      const angle = (Math.PI * 2 * i) / 36 + Math.random() * 0.1;
      const distance = 220 + Math.random() * 60;
      const x = centerX;
      const y = centerY;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      fireworkArr.push({
        id: 'fw-' + Math.random().toString(36).slice(2),
        x,
        y,
        dx,
        dy,
        color: colors[i % colors.length],
        delay: Math.random() * 0.05,
        size: 48,
        firework: true,
      });
    }
    setConfetti(fireworkArr);
    setTimeout(() => setConfetti([]), 1400);
  };

  // Starburst effect
  const triggerStarburst = () => {
    const starArr = [];
    const centerX = window.innerWidth / 2 - 32;
    const centerY = window.innerHeight / 2 - 32;
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 * i) / 24 + Math.random() * 0.1;
      const distance = 180 + Math.random() * 40;
      const x = centerX;
      const y = centerY;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      starArr.push({
        id: 'star-' + Math.random().toString(36).slice(2),
        x,
        y,
        dx,
        dy,
        color: '#fff',
        delay: Math.random() * 0.05,
        size: 40,
        star: true,
      });
    }
    setConfetti(starArr);
    setTimeout(() => setConfetti([]), 1200);
  };

  // Emoji burst effect
  const triggerEmojiBurst = () => {
    const emojiArr = [];
    const emojis = ['🎉', '✨', '💰', '🏆', '🔥', '👑'];
    const centerX = window.innerWidth / 2 - 32;
    const centerY = window.innerHeight / 2 - 32;
    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 * i) / 18 + Math.random() * 0.1;
      const distance = 160 + Math.random() * 60;
      const x = centerX;
      const y = centerY;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      emojiArr.push({
        id: 'emoji-' + Math.random().toString(36).slice(2),
        x,
        y,
        dx,
        dy,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        delay: Math.random() * 0.1,
        size: 48,
        emojiBurst: true,
      });
    }
    setConfetti(emojiArr);
    setTimeout(() => setConfetti([]), 1200);
  };

  // Snowfall/falling effect
  const triggerSnowfall = () => {
    const snowArr = [];
    const width = window.innerWidth;
    const height = window.innerHeight;
    const emojis = ['🎉', '✨', '💰', '🏆', '🔥', '👑'];
    for (let i = 0; i < 32; i++) {
      const x = Math.random() * (width - 48);
      const y = -48;
      const dy = height + 64;
      const type = Math.random();
      if (type < 0.33) {
        // Confetti
        snowArr.push({
          id: 'snow-cf-' + Math.random().toString(36).slice(2),
          x,
          y,
          dx: 0,
          dy,
          color: i % 2 === 0 ? '#FFD700' : '#00eaff',
          delay: Math.random() * 0.5,
          size: 36 + Math.random() * 24,
          snow: true,
        });
      } else if (type < 0.66) {
        // Star
        snowArr.push({
          id: 'snow-star-' + Math.random().toString(36).slice(2),
          x,
          y,
          dx: 0,
          dy,
          color: '#fff',
          delay: Math.random() * 0.5,
          size: 32 + Math.random() * 20,
          snow: true,
          star: true,
        });
      } else {
        // Emoji
        snowArr.push({
          id: 'snow-emoji-' + Math.random().toString(36).slice(2),
          x,
          y,
          dx: 0,
          dy,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          delay: Math.random() * 0.5,
          size: 40 + Math.random() * 20,
          snow: true,
          emojiBurst: true,
        });
      }
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
  };

  const handleEditClick = (question) => {
    setEditingQuestion({ ...question, options: question.options.map(opt => ({ ...opt })) });
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

  const handleEditSave = async () => {
    try {
      await questionsAPI.update(editingQuestion._id, {
        title: editingQuestion.title,
        description: editingQuestion.description,
        options: editingQuestion.options.map(opt => ({ label: opt.label, odds: Number(opt.odds) }))
      });
      setQuestions((qs) => qs.map(q => q._id === editingQuestion._id ? editingQuestion : q));
      setEditModalOpen(false);
      setEditingQuestion(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update question';
      alert(errorMsg);
    }
  };

  const handleDeleteClick = (question) => {
    setDeletingQuestion(question);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingQuestion) return;
    try {
      await questionsAPI.delete(deletingQuestion._id);
      setQuestions((qs) => qs.filter(q => q._id !== deletingQuestion._id));
      setMessage('Question deleted');
    } catch (err) {
      setMessage('Failed to delete question');
    } finally {
      setDeleteModalOpen(false);
      setDeletingQuestion(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-2 pt-12 pb-16">
      {message && (
        <div className="mb-4 text-center text-base font-display text-gold font-bold animate-pulse drop-shadow-gold">{message}</div>
      )}
      {loading ? (
        <div className="text-center text-gold text-xl">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="text-center text-gold text-xl">No questions available</div>
      ) : (
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {questions.map((question) => {
            const options = question.options;
            const multipliers = calculateMultipliers(options);
            const chances = calculateChances(options);
            const totalBets = options.reduce((sum, o) => sum + o.votes, 0);
            const isExpanded = expanded === question._id;
            return (
              <div key={question._id} className="mb-12">
                <div
                  className="transition-all duration-500"
                  onClick={() => handleExpand(question._id)}
                >
                  <Card ref={el => cardRefs.current[question._id] = el} className={`cursor-pointer select-none bg-cardbg border-2 border-gold shadow-lg hover:shadow-gold transition-all duration-300 ${isExpanded ? 'ring-2 ring-gold' : ''}`}>
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <h3 className="text-2xl md:text-3xl font-display font-bold text-gold drop-shadow-gold tracking-wide break-words max-w-[60vw]">{question.title}</h3>
                      <span className="text-xs text-gold bg-[#facc1533] px-3 py-1 rounded-full font-bold shadow">{totalBets} bets</span>
                      {user && user.role === 'admin' && (
                        <div className="flex gap-2 ml-2">
                          <button
                            onClick={e => { e.stopPropagation(); handleEditClick(question); }}
                            className="px-3 py-1 bg-gold text-black font-bold rounded shadow hover:bg-yellow-400 border-2 border-gold transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteClick(question); }}
                            className="px-3 py-1 bg-red-500 text-white font-bold rounded shadow hover:bg-red-600 border-2 border-red-400 transition"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-textsecondary mb-3 text-base font-sans">{question.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm mb-2 justify-center">
                      {options.map((opt, i) => (
                        <div key={opt.label} className="flex flex-col items-center min-w-[120px] max-w-[160px] w-full sm:w-auto break-words">
                          <span className="font-bold break-words text-center" style={{ color: '#00eaff', fontFamily: 'inherit' }}>{opt.label}</span>
                          <span className="mt-1 px-2 py-0.5 rounded-full text-xs font-bold shadow bg-[#00eaff22] text-[#00eaff]">{opt.votes} bets</span>
                          <span className="text-textsecondary">x{multipliers[i].multiplier}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
                {/* Expandable details */}
                <div
                  className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[320px] mt-4' : 'max-h-0'} `}
                >
                  {isExpanded && (
                    <Card className="bg-cardbg border-2 border-gold shadow-lg">
                      <div className="flex flex-wrap gap-4 mb-4 mt-2 justify-center">
                        {multipliers.map((opt, i) => (
                          <button
                            key={opt.label}
                            className={`flex-1 min-w-[120px] max-w-[180px] px-4 py-2 rounded-xl font-bold border-2 transition-all duration-200 text-lg font-display tracking-wide mb-2 sm:mb-0 ${selectedOption[question._id] === opt.label
                              ? (i % 2 === 0
                                ? 'bg-[#39FF14] border-[#39FF14] text-black shadow-lg'
                                : 'bg-[#FFAC1C] border-[#FFAC1C] text-black shadow-lg')
                              : 'bg-transparent border-cardbg text-[#00eaff] hover:bg-cardbg/60'}`}
                            style={{ fontFamily: 'inherit', color: selectedOption[question._id] === opt.label ? undefined : '#00eaff' }}
                            onClick={() => handleSelectOption(question._id, opt.label)}
                          >
                            {opt.label} <span className="ml-2 text-xs font-bold">x{opt.multiplier}</span>
                            <span className="ml-2 text-xs text-textsecondary">{options[i].votes} bets</span>
                          </button>
                        ))}
                      </div>
                      {selectedOption[question._id] && (
                        <div className="flex flex-col gap-3 mt-4 mb-8 pb-8 min-h-[180px] sm:min-h-[140px] w-full">
                          <div className="flex flex-col sm:flex-row items-center gap-3 w-full flex-wrap">
                            <span className="text-gold font-bold text-lg">Bet:</span>
                            <input
                              type="range"
                              min="1"
                              max={tokens}
                              value={betAmounts[question._id] || 1}
                              onChange={e => handleAmountChange(question._id, e.target.value)}
                              className="flex-1 h-2 bg-gradient-to-r from-gold/30 to-transparent rounded-lg appearance-none cursor-pointer outline-none transition-all duration-200 min-w-[120px] max-w-[200px]"
                              style={{ accentColor: '#FFD700' }}
                            />
                            <input
                              type="number"
                              min="1"
                              max={tokens}
                              value={betAmounts[question._id] || 1}
                              onChange={e => handleAmountChange(question._id, e.target.value)}
                              className="w-20 p-2 rounded bg-gray-900 border border-gold text-gold text-center font-bold"
                            />
                            <span className="flex items-center gap-1 text-gold font-bold text-lg">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 inline-block"><circle cx="12" cy="12" r="10" fill="#FFD700" /><text x="12" y="16" textAnchor="middle" fontSize="12" fill="#222" fontWeight="bold">₹</text></svg>
                              {betAmounts[question._id] || 1}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row items-center gap-4 w-full flex-wrap">
                            <span className="text-base text-gold font-display font-semibold">
                              Win: {betAmounts[question._id] && multipliers.find((o) => o.label === selectedOption[question._id]) ? (parseInt(betAmounts[question._id], 10) * multipliers.find((o) => o.label === selectedOption[question._id]).multiplier).toLocaleString() : 0} tokens
                            </span>
                            <button
                              className={`px-6 py-2 rounded-xl font-bold shadow-lg border-2 font-display text-lg tracking-wide transition-all ${placed[question._id]
                                ? 'bg-gold border-gold text-velvetgreen animate-pulse'
                                : confirming[question._id]
                                  ? 'bg-[#00eaff] border-[#00eaff] text-black hover:brightness-110'
                                  : selectedOption[question._id]
                                    ? (multipliers.findIndex((o) => o.label === selectedOption[question._id]) % 2 === 0
                                      ? 'bg-[#39FF14] border-[#39FF14] text-black hover:brightness-110'
                                      : 'bg-[#FFAC1C] border-[#FFAC1C] text-black hover:brightness-110')
                                    : 'bg-cardbg border-gold text-gold hover:brightness-110'}`}
                              onClick={() => setConfirming((prev) => ({ ...prev, [question._id]: true }))}
                              disabled={placed[question._id]}
                            >
                              {placed[question._id] ? 'Bet Placed!' : 'Confirm'}
                            </button>
                          </div>
                          {confirming[question._id] && (
                            <div className="mt-2 p-4 rounded-xl glass border-2 border-gold">
                              <div className="mb-2 text-textsecondary font-display">Confirm your bet:</div>
                              <div className="mb-2 text-xl font-bold text-gold font-display">
                                {selectedOption[question._id]} @ x{multipliers.find((o) => o.label === selectedOption[question._id])?.multiplier}
                              </div>
                              <div className="mb-2 text-gold font-display">
                                Amount: <span className="font-bold">{betAmounts[question._id]}</span> tokens
                              </div>
                              <div className="mb-2 text-gold font-display">
                                Potential Win: <span className="font-bold">{betAmounts[question._id] && multipliers.find((o) => o.label === selectedOption[question._id]) ? (parseInt(betAmounts[question._id], 10) * multipliers.find((o) => o.label === selectedOption[question._id]).multiplier).toLocaleString() : 0}</span> tokens
                              </div>
                              <button
                                className="mt-2 px-6 py-2 rounded-xl font-bold font-display text-lg border-2 border-[#FFFF33] bg-[#FFFF33] text-black shadow-lg hover:brightness-110 transition-all"
                                onClick={() => handleConfirm(question._id)}
                              >
                                Place Bet
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  )}
                </div>
              </div>
            );
          })}
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
            }}
          />
        )
      ))}
      {/* Edit Modal */}
      {editModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-2 overflow-y-auto">
          <div className="relative z-[1000] w-full max-w-xl bg-black/95 p-4 sm:p-8 rounded-lg border-2 border-gold shadow-2xl max-h-[95vh] overflow-y-auto">
            <button onClick={() => setEditModalOpen(false)} className="absolute top-2 right-2 text-gold text-2xl font-bold hover:text-yellow-400">✕</button>
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
    </div>
  );
};

export default HomePage; 