import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TokenProvider } from "./context/TokenContext";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import MyBetsPage from "./pages/MyBetsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AnimatedCasinoBackground from "./components/CasinoBackground";
import AddQuestionPage from './pages/AddQuestionPage';
import SuggestQuestionPage from './pages/SuggestQuestionPage';
import AdminSuggestionsPage from './pages/AdminSuggestionsPage';
import BetPage from './pages/BetPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-gold text-xl">Loading...</div>
    </div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <TokenProvider>
        <AnimatedCasinoBackground />
        <Router>
          <Header />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/add-question" element={<ProtectedRoute><AddQuestionPage /></ProtectedRoute>} />
            <Route path="/suggest-question" element={<ProtectedRoute><SuggestQuestionPage /></ProtectedRoute>} />
            <Route path="/admin/suggestions" element={<ProtectedRoute><AdminSuggestionsPage /></ProtectedRoute>} />
            <Route path="/bet/:id" element={<ProtectedRoute><BetPage /></ProtectedRoute>} />
            <Route path="/my-bets" element={<ProtectedRoute><MyBetsPage /></ProtectedRoute>} />
          </Routes>
        </Router>
      </TokenProvider>
    </AuthProvider>
  );
};

export default App; 