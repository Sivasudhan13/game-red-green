import React from "react";

const GameBoard = ({
  game,
  timeRemaining,
  formatTime,
  onColorClick,
  user,
  databaseConnected = true,
}) => {
  const getNumberColor = (num) => {
    const colorMap = {
      0: "bg-gradient-to-r from-purple-500 to-red-500",
      1: "bg-bet-green",
      2: "bg-bet-red",
      3: "bg-bet-green",
      4: "bg-bet-red",
      5: "bg-gradient-to-r from-purple-500 to-green-500",
      6: "bg-bet-red",
      7: "bg-bet-green",
      8: "bg-bet-red",
      9: "bg-bet-green",
    };
    return colorMap[num] || "bg-gray-500";
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      {/* Game Info */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">WinGo 1 Min</h2>
          <div className="text-right">
            <p className="text-sm text-gray-600">Time Remaining</p>
            <p className="text-3xl font-bold text-bet-red">
              {formatTime(timeRemaining)}
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-2">Game ID: {game.gameId}</p>

        {/* Recent Results */}
        {game.winningColor && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600">Last Result:</span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                game.winningColor === "red"
                  ? "bg-bet-red"
                  : game.winningColor === "green"
                  ? "bg-bet-green"
                  : "bg-bet-violet"
              }`}
            >
              {game.winningNumber}
            </div>
            <span
              className={`text-sm font-semibold ${
                game.winningColor === "red"
                  ? "text-bet-red"
                  : game.winningColor === "green"
                  ? "text-bet-green"
                  : "text-bet-violet"
              }`}
            >
              {game.winningColor.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Color Betting Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => onColorClick("green")}
          disabled={!user || timeRemaining < 30 || !databaseConnected}
          className="bg-bet-green text-white py-6 rounded-lg font-bold text-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
        >
          Green
          {user?.role === "admin" && (
            <div className="text-sm mt-1 opacity-90">
              {game.totalBets?.green || 0} bets
            </div>
          )}
        </button>
        <button
          onClick={() => onColorClick("violet")}
          disabled={!user || timeRemaining < 30 || !databaseConnected}
          className="bg-bet-violet text-white py-6 rounded-lg font-bold text-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
        >
          Violet
          {user?.role === "admin" && (
            <div className="text-sm mt-1 opacity-90">
              {game.totalBets?.violet || 0} bets
            </div>
          )}
        </button>
        <button
          onClick={() => onColorClick("red")}
          disabled={!user || timeRemaining < 30 || !databaseConnected}
          className="bg-bet-red text-white py-6 rounded-lg font-bold text-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
        >
          Red
          {user?.role === "admin" && (
            <div className="text-sm mt-1 opacity-90">
              {game.totalBets?.red || 0} bets
            </div>
          )}
        </button>
      </div>

      {/* Number Grid */}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <div
            key={num}
            className={`${getNumberColor(
              num
            )} w-full aspect-square rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md`}
          >
            {num}
          </div>
        ))}
      </div>

      {!databaseConnected && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 text-center">
            ⚠️ Database disconnected. Betting is disabled. Please check your
            MongoDB connection.
          </p>
        </div>
      )}

      {!user && databaseConnected && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 text-center">
            Please <span className="font-semibold">Login</span> to place bets
          </p>
        </div>
      )}

      {user && timeRemaining < 30 && databaseConnected && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 text-center">
            Betting closed for this round
          </p>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
