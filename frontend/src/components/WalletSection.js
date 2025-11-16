import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import DepositModal from './DepositModal';
import WithdrawModal from './WithdrawModal';

const WalletSection = ({ user }) => {
  const { updateUser } = useAuth();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/auth/me');
      updateUser(res.data.user);
      toast.success('Balance updated');
    } catch (error) {
      toast.error('Failed to refresh balance');
    } finally {
      setRefreshing(false);
    }
  };

  const fetchWithdrawals = async () => {
    setLoadingWithdrawals(true);
    try {
      const res = await api.get('/user/withdrawals');
      setWithdrawals(res.data.withdrawals);
    } catch (error) {
      toast.error('Failed to fetch withdrawal history');
    } finally {
      setLoadingWithdrawals(false);
    }
  };

  useEffect(() => {
    if (showTransactions) {
      fetchWithdrawals();
    }
  }, [showTransactions]);

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-600 text-sm mb-1">Wallet Balance</p>
            <h2 className="text-3xl font-bold text-gray-800">₹{user.walletBalance?.toFixed(2) || '0.00'}</h2>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            <svg
              className={`w-6 h-6 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowWithdraw(true)}
            className="flex-1 bg-bet-red text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Withdraw
          </button>
          <button
            onClick={() => setShowDeposit(true)}
            className="flex-1 bg-bet-green text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Deposit
          </button>
        </div>
        {user.inviteCode && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <p className="text-sm text-gray-600 mb-1">Your Invite Code:</p>
            <p className="text-lg font-bold text-bet-red">{user.inviteCode}</p>
            <p className="text-xs text-gray-500 mt-1">Share this code to earn ₹25 per referral!</p>
          </div>
        )}
        <button
          onClick={() => setShowTransactions(!showTransactions)}
          className="mt-4 w-full py-2 text-sm text-gray-600 hover:text-gray-800 border-t border-gray-200 pt-4"
        >
          {showTransactions ? 'Hide' : 'View'} Withdrawal History
        </button>
      </div>

      {showTransactions && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Withdrawal History</h3>
          {loadingWithdrawals ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-bet-red"></div>
            </div>
          ) : withdrawals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No withdrawal requests yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Min Bet</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Method</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold">₹{withdrawal.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        ₹{withdrawal.minBetAmount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 uppercase text-xs">
                        {withdrawal.withdrawalMethod || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            withdrawal.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : withdrawal.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : withdrawal.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : withdrawal.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {withdrawal.withdrawalMethod === 'bank' && (
                          <span className="text-xs text-gray-500">
                            {withdrawal.accountHolderName} - {withdrawal.bankName}
                          </span>
                        )}
                        {withdrawal.withdrawalMethod === 'upi' && (
                          <span className="text-xs text-gray-500">{withdrawal.upiId}</span>
                        )}
                        {withdrawal.withdrawalMethod === 'wallet' && (
                          <span className="text-xs text-gray-500">
                            {withdrawal.walletType} - {withdrawal.walletNumber}
                          </span>
                        )}
                        {withdrawal.adminNotes && (
                          <p className="text-xs text-yellow-600 mt-1">
                            Note: {withdrawal.adminNotes}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showDeposit && (
        <DepositModal
          onClose={() => setShowDeposit(false)}
          onSuccess={() => {
            setShowDeposit(false);
            handleRefresh();
          }}
        />
      )}

      {showWithdraw && (
        <WithdrawModal
          onClose={() => setShowWithdraw(false)}
          onSuccess={() => {
            setShowWithdraw(false);
            handleRefresh();
          }}
        />
      )}
    </>
  );
};

export default WalletSection;

