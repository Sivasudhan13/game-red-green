import React, { useState } from 'react';
import { toast } from 'react-toastify';

const BetModal = ({ color, onClose, onPlaceBet, user }) => {
  const [amount, setAmount] = useState(1);
  const [multiplier, setMultiplier] = useState(1);

  const multipliers = [1, 5, 10, 20, 50, 100];

  const handleAmountChange = (mult) => {
    setMultiplier(mult);
    setAmount(mult);
  };

  const handlePlaceBet = () => {
    if (!amount || amount < 1) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    if (user.walletBalance < amount) {
      toast.error('Insufficient balance');
      return;
    }

    onPlaceBet(amount);
  };

  const getColorClass = () => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-800">Place Bet</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={`${getColorClass()} text-white p-4 rounded-lg mb-4 text-center`}>
          <p className="text-lg font-semibold mb-1">Selected Color</p>
          <p className="text-3xl font-bold">{color.toUpperCase()}</p>
          <p className="text-sm mt-2 opacity-90">Win: 2x your bet amount</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bet Amount (₹)
          </label>
          <input
            type="number"
            min="1"
            max={user.walletBalance}
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 1)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bet-red focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Available: ₹{user.walletBalance?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Select
          </label>
          <div className="grid grid-cols-3 gap-2">
            {multipliers.map((mult) => (
              <button
                key={mult}
                onClick={() => handleAmountChange(mult)}
                className={`py-2 px-4 rounded-lg font-semibold transition ${
                  multiplier === mult
                    ? 'bg-bet-red text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ₹{mult}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Bet Amount:</span>
            <span className="font-semibold">₹{amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Potential Win:</span>
            <span className="font-semibold text-bet-green">₹{(amount * 2).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Balance After:</span>
            <span className="font-semibold">₹{(user.walletBalance - amount).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handlePlaceBet}
            className={`flex-1 py-3 ${getColorClass()} text-white rounded-lg font-semibold hover:opacity-90 transition`}
          >
            Place Bet
          </button>
        </div>
      </div>
    </div>
  );
};

export default BetModal;



