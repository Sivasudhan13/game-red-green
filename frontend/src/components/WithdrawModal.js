import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const WithdrawModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('bank');
  const [loading, setLoading] = useState(false);
  
  // Bank details
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  
  // UPI details
  const [upiId, setUpiId] = useState('');
  
  // Wallet details
  const [walletType, setWalletType] = useState('paytm');
  const [walletNumber, setWalletNumber] = useState('');

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    
    if (!withdrawAmount || withdrawAmount < 110 || withdrawAmount > 50000) {
      toast.error('Withdrawal amount must be between ₹110 and ₹50,000');
      return;
    }

    if (user.walletBalance < withdrawAmount) {
      toast.error('Insufficient balance');
      return;
    }

    // Validate method-specific fields
    if (withdrawalMethod === 'bank') {
      if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
        toast.error('Please fill all bank details');
        return;
      }
    } else if (withdrawalMethod === 'upi') {
      if (!upiId) {
        toast.error('Please enter UPI ID');
        return;
      }
    } else if (withdrawalMethod === 'wallet') {
      if (!walletNumber) {
        toast.error('Please enter wallet number');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        amount: withdrawAmount,
        withdrawalMethod,
      };

      if (withdrawalMethod === 'bank') {
        payload.accountHolderName = accountHolderName;
        payload.accountNumber = accountNumber;
        payload.ifscCode = ifscCode;
        payload.bankName = bankName;
      } else if (withdrawalMethod === 'upi') {
        payload.upiId = upiId;
      } else if (withdrawalMethod === 'wallet') {
        payload.walletType = walletType;
        payload.walletNumber = walletNumber;
      }

      await api.post('/payment/withdraw', payload);
      toast.success('Withdrawal request submitted. Waiting for admin approval.');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request withdrawal');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-800">Withdraw Money</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (₹110 - ₹50,000)
          </label>
          <input
            type="number"
            min="110"
            max="50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bet-red focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Available: ₹{user.walletBalance?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Withdrawal Method
          </label>
          <select
            value={withdrawalMethod}
            onChange={(e) => setWithdrawalMethod(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bet-red focus:border-transparent"
          >
            <option value="bank">Bank Transfer</option>
            <option value="upi">UPI</option>
            <option value="wallet">Digital Wallet</option>
          </select>
        </div>

        {/* Bank Details */}
        {withdrawalMethod === 'bank' && (
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Holder Name
              </label>
              <input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="Enter account holder name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bet-red focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bet-red focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IFSC Code
              </label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="Enter IFSC code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bet-red focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Enter bank name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bet-red focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* UPI Details */}
        {withdrawalMethod === 'upi' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              UPI ID
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="Enter UPI ID (e.g., yourname@paytm)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bet-red focus:border-transparent"
            />
          </div>
        )}

        {/* Wallet Details */}
        {withdrawalMethod === 'wallet' && (
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wallet Type
              </label>
              <select
                value={walletType}
                onChange={(e) => setWalletType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bet-red focus:border-transparent"
              >
                <option value="paytm">Paytm</option>
                <option value="phonepe">PhonePe</option>
                <option value="googlepay">Google Pay</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wallet Number / Mobile Number
              </label>
              <input
                type="text"
                value={walletNumber}
                onChange={(e) => setWalletNumber(e.target.value)}
                placeholder="Enter wallet number or mobile number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bet-red focus:border-transparent"
              />
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-800 mb-2">
            <strong>Note:</strong> Withdrawal requests require admin approval. Minimum withdrawal is ₹110 and maximum is ₹50,000. Please ensure all details are correct.
          </p>
          {amount && (
            <p className="text-xs text-blue-800">
              <strong>Minimum Bet Requirement:</strong> You need to bet at least ₹{Math.max(100, Math.ceil(parseFloat(amount) * 0.1)).toFixed(2)} to complete this withdrawal. This is 10% of your withdrawal amount (minimum ₹100).
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleWithdraw}
            disabled={loading || !amount}
            className="flex-1 py-3 bg-bet-red text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Request Withdrawal'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;

