import React from "react";
import Button from "./Button";
import Card from "./ui/Card";

/**
 * @typedef {Object} BetOption
 * @property {string} label
 * @property {number} tokens
 * @property {number} multiplier
 */

/**
 * @typedef {Object} BetCardProps
 * @property {string} title
 * @property {string} description
 * @property {BetOption[]} options
 * @property {function(optionLabel: string): void} onPlaceBet
 * @property {function(e: React.ChangeEvent<HTMLInputElement>): void} onAmountChange
 * @property {string} betAmount
 */

/**
 * BetCard displays a betting topic with options, multipliers, and tokens per option.
 * @param {BetCardProps} props
 */
const BetCard = ({ title, description, options, onPlaceBet, onAmountChange, betAmount }) => {
  // Helper to get color classes for Yes/No
  const getOptionColor = (label) => {
    if (label.toLowerCase() === "yes") return "text-green-400 border-green-400 shadow-green-400/40";
    if (label.toLowerCase() === "no") return "text-red-400 border-red-400 shadow-red-400/40";
    return "neon-purple border-[#a259ff]";
  };

  return (
    <Card className="mb-6">
      <h3 className="text-lg font-bold neon-purple mb-1 drop-shadow">{title}</h3>
      <p className="text-[#bdb4e6] mb-4 text-sm">{description}</p>
      <div className="space-y-2 mb-4">
        {options.map((opt) => (
          <div
            key={opt.label}
            className={`flex items-center justify-between bg-[#221c3a]/60 rounded p-2 border ${getOptionColor(opt.label)} glass`}
          >
            <span className={`font-medium ${getOptionColor(opt.label)}`}>{opt.label}</span>
            <span className="text-xs text-blue-200">{opt.tokens} tokens</span>
            <span className="text-xs font-semibold ml-2 neon-blue">x{opt.multiplier}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-2 items-center">
        <input
          type="number"
          min="1"
          value={betAmount}
          onChange={onAmountChange}
          placeholder="Enter amount"
          className="flex-1 border border-[#a259ff] bg-[#18122B]/70 text-[#F3F3FB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a259ff] glass"
        />
        {betAmount && options[0] && (
          <span className="text-xs neon-blue font-semibold">
            Win: {(parseInt(betAmount, 10) * options[0].multiplier).toLocaleString()} tokens
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {options.map((opt) => (
          <Button
            key={opt.label}
            onClick={() => onPlaceBet(opt.label)}
            className={`flex-1 rounded-lg ${getOptionColor(opt.label)} border`}
          >
            Place Bet on {opt.label} <span className="ml-1 text-xs">(x{opt.multiplier})</span>
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default BetCard; 