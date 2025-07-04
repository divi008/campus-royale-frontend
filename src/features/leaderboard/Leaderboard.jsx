import React, { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LeaderboardRow from "./LeaderboardRow";

/**
 * @typedef {Object} Player
 * @property {number} rank
 * @property {string} username
 * @property {string} avatarUrl
 * @property {number} points
 * @property {boolean} isCurrentUser
 */

/**
 * Leaderboard component displays a list of top players for a given timeframe.
 * @component
 */
const Leaderboard = () => {
  const [timeframe, setTimeframe] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);

  /**
   * Fetches leaderboard data for the given timeframe.
   * @param {string} timeframe
   * @returns {Promise<Player[]>}
   */
  const fetchLeaderboardData = async (timeframe) => {
    setLoading(true);
    // Simulate network delay
    await new Promise((res) => setTimeout(res, 700));
    // Mock data
    const mock = {
      weekly: [
        { rank: 1, username: "Alice", avatarUrl: "https://i.pravatar.cc/40?img=1", points: 3200, isCurrentUser: false },
        { rank: 2, username: "Bob", avatarUrl: "https://i.pravatar.cc/40?img=2", points: 2900, isCurrentUser: false },
        { rank: 3, username: "Carol", avatarUrl: "https://i.pravatar.cc/40?img=3", points: 2100, isCurrentUser: false },
        { rank: 4, username: "You", avatarUrl: "https://i.pravatar.cc/40?img=4", points: 1800, isCurrentUser: true },
        { rank: 5, username: "Eve", avatarUrl: "https://i.pravatar.cc/40?img=5", points: 1500, isCurrentUser: false },
      ],
      alltime: [
        { rank: 1, username: "Bob", avatarUrl: "https://i.pravatar.cc/40?img=2", points: 12000, isCurrentUser: false },
        { rank: 2, username: "Alice", avatarUrl: "https://i.pravatar.cc/40?img=1", points: 11000, isCurrentUser: false },
        { rank: 3, username: "Carol", avatarUrl: "https://i.pravatar.cc/40?img=3", points: 9000, isCurrentUser: false },
        { rank: 4, username: "You", avatarUrl: "https://i.pravatar.cc/40?img=4", points: 8500, isCurrentUser: true },
        { rank: 5, username: "Mallory", avatarUrl: "https://i.pravatar.cc/40?img=6", points: 8000, isCurrentUser: false },
      ],
    };
    setPlayers(mock[timeframe === "weekly" ? "weekly" : "alltime"]);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboardData(timeframe);
    // eslint-disable-next-line
  }, [timeframe]);

  return (
    <Card className="max-w-xl w-full mx-auto p-4 md:p-8 bg-white shadow rounded-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">Leaderboard</h2>
        <div className="flex gap-2">
          <Button
            variant={timeframe === "weekly" ? "primary" : "secondary"}
            onClick={() => setTimeframe("weekly")}
            className={timeframe === "weekly" ? "" : "bg-gray-100 text-gray-700"}
          >
            Weekly
          </Button>
          <Button
            variant={timeframe === "alltime" ? "primary" : "secondary"}
            onClick={() => setTimeframe("alltime")}
            className={timeframe === "alltime" ? "" : "bg-gray-100 text-gray-700"}
          >
            All-Time
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <span className="text-gray-400 animate-pulse">Loading...</span>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {players.map((player) => (
            <LeaderboardRow key={player.rank} player={player} />
          ))}
        </div>
      )}
    </Card>
  );
};

export default Leaderboard; 