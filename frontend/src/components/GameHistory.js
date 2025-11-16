import React from 'react';

const GameHistory = ({ history }) => {
  const getColorClass = (color) => {
    switch (color) {
      case 'red':
        return 'bg-bet-red';
      case 'green':
        return 'bg-bet-green';
      case 'violet':
        return 'bg-bet-violet';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Game History</h3>
      {history.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No game history yet</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {history.map((game) => (
            <div
              key={game._id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getColorClass(game.winningColor)}`}>
                  {game.winningNumber}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{game.gameId}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(game.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getColorClass(game.winningColor)}`}>
                  {game.winningColor?.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameHistory;




