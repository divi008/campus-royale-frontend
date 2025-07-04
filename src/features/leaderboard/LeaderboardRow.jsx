import React from "react";

/**
 * @typedef {Object} Player
 * @property {number} rank
 * @property {string} username
 * @property {string} avatarUrl
 * @property {number} points
 * @property {boolean} isCurrentUser
 */

/**
 * Renders a single row in the leaderboard.
 * @param {{ player: Player }} props
 */
const LeaderboardRow = ({ player }) => {
  const rankColors = [
    "text-red-500 bg-red-50 border-red-200",      // 1st: primary red
    "text-purple-400 bg-purple-50 border-purple-200", // 2nd: purple
    "text-gray-400 bg-gray-50 border-gray-200",   // 3rd: secondary/gray
  ];
  const badgeClass =
    player.rank <= 3
      ? `border ${rankColors[player.rank - 1]} font-bold px-2 py-1 rounded-full text-xs mr-3`
      : "border border-gray-200 text-gray-400 bg-gray-50 font-semibold px-2 py-1 rounded-full text-xs mr-3";

  return (
    <div
      className={`flex items-center gap-3 py-3 px-2 sm:px-4 ${player.isCurrentUser ? "border-2 border-purple-500 bg-purple-50" : ""}`}
    >
      <span className={badgeClass} style={{ minWidth: 32, textAlign: "center" }}>{player.rank}</span>
      <img
        src={player.avatarUrl}
        alt={player.username}
        className="w-9 h-9 rounded-full object-cover border border-gray-200"
      />
      <span className={`flex-1 font-medium text-gray-800 truncate ${player.isCurrentUser ? "text-purple-700" : ""}`}>{player.username}</span>
      <span className="font-bold text-gray-700 text-sm tabular-nums">{player.points.toLocaleString()}</span>
    </div>
  );
};

export default LeaderboardRow; 