import React, { useContext, useState, useRef } from "react";
import { TokenContext } from "../context/TokenContext";
import Card from "../components/ui/Card";

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
  const total = options.reduce((sum, o) => sum + o.tokens, 0) || 1;
  return options.map((opt) => {
    let base = 1.5;
    let multiplier = (total / (opt.tokens + 1)) * base;
    multiplier = Math.max(1.2, Math.min(multiplier, 5));
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
  const { deductTokens, tokens, addBet, creditTokens } = useContext(TokenContext);
  const [message, setMessage] = useState("");
  const [betOptions, setBetOptions] = useState(() => {
    return DUMMY_BETS.reduce((acc, bet) => {
      acc[bet.id] = bet.options.map((opt) => ({ ...opt }));
      return acc;
    }, {});
  });
  const [betAmounts, setBetAmounts] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [selectedOption, setSelectedOption] = useState({});
  const [confirming, setConfirming] = useState({});
  const [placed, setPlaced] = useState({});
  const [confetti, setConfetti] = useState([]);
  const cardRefs = useRef({});

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

  const handleConfirm = (betId) => {
    const amount = parseInt(betAmounts[betId], 10);
    if (!amount || amount <= 0) {
      setMessage("Enter a valid amount!");
      setTimeout(() => setMessage(""), 2000);
      return;
    }
    if (deductTokens(amount)) {
      setBetOptions((prev) => {
        const updated = { ...prev };
        updated[betId] = updated[betId].map((opt) =>
          opt.label === selectedOption[betId] ? { ...opt, tokens: opt.tokens + amount } : opt
        );
        return updated;
      });
      const bet = DUMMY_BETS.find((b) => b.id === betId);
      const optionsWithUpdatedTokens = betOptions[bet.id].map((opt) =>
        opt.label === selectedOption[bet.id] ? { ...opt, tokens: opt.tokens + amount } : opt
      );
      const multipliers = calculateMultipliers(optionsWithUpdatedTokens);
      const option = multipliers.find((o) => o.label === selectedOption[bet.id]);
      const winAmount = amount * option.multiplier;
      addBet({
        betId,
        question: bet.title,
        option: selectedOption[bet.id],
        amount,
        multiplier: option.multiplier,
        win: winAmount,
      }, true);
      setMessage(`Bet placed on "${selectedOption[bet.id]}"! (-${amount} tokens, +${winAmount} win)`);
      setConfirming((prev) => ({ ...prev, [betId]: false }));
      setPlaced((prev) => ({ ...prev, [betId]: true }));
      triggerCelebration(winAmount > 0);
      animateCard(betId);
      setTimeout(() => setPlaced((prev) => ({ ...prev, [betId]: false })), 2000);
    } else {
      setMessage("Not enough tokens!");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-2 pt-12">
      {message && (
        <div className="mb-4 text-center text-base font-display text-gold font-bold animate-pulse drop-shadow-gold">{message}</div>
      )}
      {DUMMY_BETS.map((bet) => {
        const options = betOptions[bet.id];
        const multipliers = calculateMultipliers(options);
        const chances = calculateChances(options);
        const totalBets = options.reduce((sum, o) => sum + o.tokens, 0);
        const isExpanded = expanded === bet.id;
        return (
          <div key={bet.id} className="mb-12">
            <div
              className="transition-all duration-500"
              onClick={() => handleExpand(bet.id)}
            >
              <Card ref={el => cardRefs.current[bet.id] = el} className={`cursor-pointer select-none bg-cardbg border-2 border-gold shadow-lg hover:shadow-gold transition-all duration-300 ${isExpanded ? 'ring-2 ring-gold' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-gold drop-shadow-gold tracking-wide">{bet.title}</h3>
                  <span className="text-xs text-gold bg-[#facc1533] px-3 py-1 rounded-full font-bold shadow">{totalBets} bets</span>
                </div>
                <p className="text-textsecondary mb-3 text-base font-sans">{bet.description}</p>
                <div className="flex gap-6 text-sm mb-2">
                  {options.map((opt, i) => (
                    <div key={opt.label} className="flex flex-col items-center">
                      <span className="font-bold" style={{ color: '#00eaff', fontFamily: 'inherit' }}>{opt.label}</span>
                      <span className="mt-1 px-2 py-0.5 rounded-full text-xs font-bold shadow bg-[#00eaff22] text-[#00eaff]">{opt.tokens} bets</span>
                      <span className="text-textsecondary">x{multipliers[i].multiplier}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            {/* Expandable details */}
            <div
              className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[500px] mt-4' : 'max-h-0'} `}
            >
              {isExpanded && (
                <Card className="bg-cardbg border-2 border-gold shadow-lg">
                  <div className="flex gap-4 mb-4 mt-2">
                    {multipliers.map((opt, i) => (
                      <button
                        key={opt.label}
                        className={`flex-1 px-4 py-2 rounded-xl font-bold border-2 transition-all duration-200 text-lg font-display tracking-wide ${selectedOption[bet.id] === opt.label
                          ? (i % 2 === 0
                            ? 'bg-[#39FF14] border-[#39FF14] text-black shadow-lg'
                            : 'bg-[#FFAC1C] border-[#FFAC1C] text-black shadow-lg')
                          : 'bg-transparent border-cardbg text-[#00eaff] hover:bg-cardbg/60'}`}
                        style={{ fontFamily: 'inherit', color: selectedOption[bet.id] === opt.label ? undefined : '#00eaff' }}
                        onClick={() => handleSelectOption(bet.id, opt.label)}
                      >
                        {opt.label} <span className="ml-2 text-xs font-bold">x{opt.multiplier}</span>
                        <span className="ml-2 text-xs text-textsecondary">{options[i].tokens} bets</span>
                      </button>
                    ))}
                  </div>
                  {selectedOption[bet.id] && (
                    <div className="flex flex-col gap-3">
                      <input
                        type="number"
                        min="1"
                        value={betAmounts[bet.id] || ""}
                        onChange={(e) => handleAmountChange(bet.id, e.target.value)}
                        placeholder="Enter amount"
                        className="border-2 border-gold bg-cardbg text-gold rounded-xl px-4 py-3 text-lg font-display focus:outline-none focus:ring-2 focus:ring-gold glass"
                      />
                      <div className="flex items-center gap-4">
                        <span className="text-base text-gold font-display font-semibold">
                          Win: {betAmounts[bet.id] && multipliers.find((o) => o.label === selectedOption[bet.id]) ? (parseInt(betAmounts[bet.id], 10) * multipliers.find((o) => o.label === selectedOption[bet.id]).multiplier).toLocaleString() : 0} tokens
                        </span>
                        <button
                          className={`px-6 py-2 rounded-xl font-bold shadow-lg border-2 font-display text-lg tracking-wide transition-all ${placed[bet.id]
                            ? 'bg-gold border-gold text-velvetgreen animate-pulse'
                            : confirming[bet.id]
                              ? 'bg-[#00eaff] border-[#00eaff] text-black hover:brightness-110'
                              : selectedOption[bet.id]
                                ? (multipliers.findIndex((o) => o.label === selectedOption[bet.id]) % 2 === 0
                                  ? 'bg-[#39FF14] border-[#39FF14] text-black hover:brightness-110'
                                  : 'bg-[#FFAC1C] border-[#FFAC1C] text-black hover:brightness-110')
                                : 'bg-cardbg border-gold text-gold hover:brightness-110'}`}
                          onClick={() => setConfirming((prev) => ({ ...prev, [bet.id]: true }))}
                          disabled={placed[bet.id]}
                        >
                          {placed[bet.id] ? 'Bet Placed!' : 'Confirm'}
                        </button>
                      </div>
                      {confirming[bet.id] && (
                        <div className="mt-2 p-4 rounded-xl glass border-2 border-gold">
                          <div className="mb-2 text-textsecondary font-display">Confirm your bet:</div>
                          <div className="mb-2 text-xl font-bold text-gold font-display">
                            {selectedOption[bet.id]} @ x{multipliers.find((o) => o.label === selectedOption[bet.id])?.multiplier}
                          </div>
                          <div className="mb-2 text-gold font-display">
                            Amount: <span className="font-bold">{betAmounts[bet.id]}</span> tokens
                          </div>
                          <div className="mb-2 text-gold font-display">
                            Potential Win: <span className="font-bold">{betAmounts[bet.id] && multipliers.find((o) => o.label === selectedOption[bet.id]) ? (parseInt(betAmounts[bet.id], 10) * multipliers.find((o) => o.label === selectedOption[bet.id]).multiplier).toLocaleString() : 0}</span> tokens
                          </div>
                          <button
                            className="mt-2 px-6 py-2 rounded-xl font-bold font-display text-lg border-2 border-[#FFFF33] bg-[#FFFF33] text-black shadow-lg hover:brightness-110 transition-all"
                            onClick={() => handleConfirm(bet.id)}
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
    </div>
  );
};

export default HomePage; 