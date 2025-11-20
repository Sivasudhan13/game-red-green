import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { toast } from "react-toastify";
import WalletSection from "../components/WalletSection";
import GameBoard from "../components/GameBoard";
import GameHistory from "../components/GameHistory";
import BetModal from "../components/BetModal";

const GamePage = () => {
  const { user, loading, updateUser } = useAuth();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [history, setHistory] = useState([]);
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [notifiedBets, setNotifiedBets] = useState(new Set());
  const [databaseConnected, setDatabaseConnected] = useState(true);
  const [gameLoading, setGameLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      // Allow viewing game but require login to bet
    }
  }, [user, loading]);

  useEffect(() => {
    fetchCurrentGame();
    fetchHistory();
    const gameInterval = setInterval(fetchCurrentGame, 1000);
    const timerInterval = setInterval(() => {
      if (game) {
        const now = new Date();
        const endTime = new Date(game.endTime);
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeRemaining(remaining);

        if (remaining === 0 && game.status === "live") {
          // Game ended, fetch new game
          setTimeout(fetchCurrentGame, 2000);
        }
      }
    }, 1000);

    return () => {
      clearInterval(gameInterval);
      clearInterval(timerInterval);
    };
  }, [game]);

  // Check for bet results and show notifications
  useEffect(() => {
    if (!user) return;

    let notifiedBetsSet = new Set(notifiedBets);

    const checkBetResults = async () => {
      try {
        const res = await api.get("/game/recent-result");
        if (res.data.hasResult) {
          const bet = res.data.bet;
          const betId = bet.id;

          // Only notify once per bet
          if (notifiedBetsSet.has(betId)) {
            return;
          }

          // Mark as notified
          notifiedBetsSet.add(betId);
          setNotifiedBets(new Set(notifiedBetsSet));

          // Refresh user data to get updated wallet balance
          try {
            const userRes = await api.get("/auth/me");
            if (userRes.data.user) {
              updateUser(userRes.data.user);
            }
          } catch (err) {
            console.error("Error fetching user:", err);
          }

          // Show notification based on result
          if (bet.status === "won") {
            toast.success(
              `🎉 Congratulations! You won ₹${bet.winAmount.toFixed(2)}!`,
              {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                style: {
                  background: "#10b981",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: "bold",
                },
              }
            );
          } else if (bet.status === "lost") {
            toast.error(
              `😔 You lost ₹${bet.amount.toFixed(2)}. Better luck next time!`,
              {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                style: {
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: "bold",
                },
              }
            );
          }

          // Refresh history to show latest results
          fetchHistory();
        }
      } catch (error) {
        // Silently fail - user might not have placed a bet
        console.error("Error checking bet results:", error);
      }
    };

    // Check for results every 2 seconds
    const resultInterval = setInterval(checkBetResults, 2000);

    return () => {
      clearInterval(resultInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, notifiedBets]);

  const fetchCurrentGame = async () => {
    try {
      const res = await api.get("/game/current");
      if (res.data && res.data.game) {
        setGame(res.data.game);
        setDatabaseConnected(res.data.databaseConnected !== false);
        setGameLoading(false);
        const now = new Date();
        const endTime = new Date(res.data.game.endTime);
        setTimeRemaining(Math.max(0, Math.floor((endTime - now) / 1000)));
      }
    } catch (error) {
      console.error("Error fetching game:", error);
      setGameLoading(false);
      // Create a fallback game structure
      const now = new Date();
      const endTime = new Date(now.getTime() + 60 * 1000);
      setGame({
        id: "error",
        gameId: "ERROR",
        status: "live",
        timeRemaining: Math.max(0, Math.floor((endTime - now) / 1000)),
        startTime: now,
        endTime: endTime,
        winningColor: null,
        winningNumber: null,
        totalBets: { red: 0, green: 0, violet: 0 },
        totalAmount: { red: 0, green: 0, violet: 0 },
      });
      setDatabaseConnected(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get("/game/history?limit=20");
      if (res.data && res.data.games) {
        setHistory(res.data.games);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      // Set empty array on error to prevent undefined errors
      setHistory([]);
    }
  };

  const handleColorClick = (color) => {
    if (!user) {
      toast.info("Please login to place a bet");
      navigate("/login");
      return;
    }
    setSelectedColor(color);
    setShowBetModal(true);
  };

  const handlePlaceBet = async (amount) => {
    try {
      await api.post("/game/bet", {
        color: selectedColor,
        amount: amount,
      });
      toast.success("Bet placed successfully!");
      setShowBetModal(false);

      // Refresh user data to update wallet
      const userRes = await api.get("/auth/me");
      if (userRes.data.user) {
        updateUser(userRes.data.user);
      }

      // Refresh game data
      fetchCurrentGame();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place bet");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-bet-red text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Win Go</h1>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-sm">Welcome, {user.name}</span>
                  {user.role === "admin" && (
                    <button
                      onClick={() => navigate("/admin")}
                      className="px-3 py-1 bg-white text-bet-red rounded font-semibold text-sm"
                    >
                      Admin
                    </button>
                  )}
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      window.location.reload();
                    }}
                    className="px-3 py-1 bg-white text-bet-red rounded font-semibold text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-3 py-1 bg-white text-bet-red rounded font-semibold text-sm"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="px-3 py-1 bg-white text-bet-red rounded font-semibold text-sm"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Wallet Section */}
        {user && <WalletSection user={user} />}

        {/* Database Connection Warning */}
        {!databaseConnected && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Database Connection Error:</strong> The game is
                  displayed in view-only mode. Please check your MongoDB
                  connection. See{" "}
                  <a href="/MONGODB_ATLAS_FIX.md" className="underline">
                    MONGODB_ATLAS_FIX.md
                  </a>{" "}
                  for help.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {gameLoading && !game && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-6">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-bet-red mb-4"></div>
            <p className="text-gray-600">Loading game...</p>
          </div>
        )}

        {/* Game Board */}
        {game && (
          <GameBoard
            game={game}
            timeRemaining={timeRemaining}
            formatTime={formatTime}
            onColorClick={handleColorClick}
            user={user}
            databaseConnected={databaseConnected}
          />
        )}

        {/* Game History */}
        <GameHistory history={history} />

        {/* Bet Modal */}
        {showBetModal && (
          <BetModal
            color={selectedColor}
            onClose={() => setShowBetModal(false)}
            onPlaceBet={handlePlaceBet}
            user={user}
          />
        )}
      </div>
    </div>
  );
};

export default GamePage;
