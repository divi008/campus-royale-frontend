import React, { useContext } from "react";
import { TokenContext } from "../context/TokenContext";
import Card from "../components/ui/Card";

const MyBetsPage = () => {
  const { myBets } = useContext(TokenContext);

  return (
    <div className="max-w-2xl mx-auto px-2 py-8">
      <h2 className="text-2xl font-bold neon-purple mb-6">My Bets</h2>
      {myBets.length === 0 ? (
        <div className="text-[#bdb4e6] text-center">No bets placed yet.</div>
      ) : (
        <div className="space-y-4">
          {myBets.map((bet, idx) => (
            <Card key={idx} className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold neon-purple mb-1">{bet.question}</div>
                <div className="text-sm text-[#bdb4e6] mb-1">
                  <span className={
                    bet.option.toLowerCase() === "yes"
                      ? "text-green-400 font-bold"
                      : bet.option.toLowerCase() === "no"
                      ? "text-red-400 font-bold"
                      : "neon-purple font-bold"
                  }>
                    {bet.option}
                  </span>{" "}
                  | Bet: <span className="font-semibold text-blue-200">{bet.amount}</span> tokens
                  {" "}| Multiplier: <span className="font-semibold neon-blue">x{bet.multiplier}</span>
                  {" "}| Win: <span className="font-semibold neon-blue">{bet.win}</span> tokens
                </div>
                <div className="text-xs text-[#bdb4e6]">{new Date(bet.timestamp).toLocaleString()}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBetsPage; 