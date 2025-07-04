import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { TokenProvider } from "./context/TokenContext";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import MyBetsPage from "./pages/MyBetsPage";
import AnimatedCasinoBackground from "./components/CasinoBackground";

const App = () => {
  return (
    <TokenProvider>
      <AnimatedCasinoBackground />
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/my-bets" element={<MyBetsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Router>
    </TokenProvider>
  );
};

export default App; 