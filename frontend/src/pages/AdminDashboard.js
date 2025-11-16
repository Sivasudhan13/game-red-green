import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState([]);
  const [allWithdrawals, setAllWithdrawals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // "pending" or "all"

  useEffect(() => {
    // Verify user is admin
    if (!user || user.role !== "admin") {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }

    fetchWithdrawals();
    fetchAllWithdrawals();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === "all") {
      fetchAllWithdrawals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchWithdrawals = async () => {
    try {
      const res = await api.get("/admin/withdrawals");
      setWithdrawals(res.data.withdrawals);
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        toast.error("Access denied. Please login as admin.");
        navigate("/login");
      } else {
        toast.error("Failed to fetch withdrawals");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllWithdrawals = async (status = "all") => {
    try {
      const res = await api.get(`/admin/withdrawals/all?status=${status}`);
      setAllWithdrawals(res.data.withdrawals);
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        toast.error("Access denied. Please login as admin.");
        navigate("/login");
      } else {
        toast.error("Failed to fetch all withdrawals");
      }
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        toast.error("Access denied. Please login as admin.");
        navigate("/login");
      } else {
        toast.error("Failed to fetch stats");
      }
    }
  };

  const handleViewDetails = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setAdminNotes("");
    setShowDetailsModal(true);
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/approve-withdrawal/${id}`, {
        adminNotes: adminNotes || undefined,
      });
      toast.success("Withdrawal approved");
      setShowDetailsModal(false);
      setSelectedWithdrawal(null);
      setAdminNotes("");
      fetchWithdrawals();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/admin/reject-withdrawal/${id}`, {
        adminNotes: adminNotes || undefined,
      });
      toast.success("Withdrawal rejected and amount refunded");
      setShowDetailsModal(false);
      setSelectedWithdrawal(null);
      setAdminNotes("");
      fetchWithdrawals();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject");
    }
  };

  const handleProcess = async (id) => {
    try {
      await api.post(`/admin/process-withdrawal/${id}`);
      toast.success("Withdrawal marked as processing");
      if (showDetailsModal && selectedWithdrawal?._id === id) {
        setShowDetailsModal(false);
        setSelectedWithdrawal(null);
        setAdminNotes("");
      }
      fetchWithdrawals();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getWithdrawalMethodLabel = (method) => {
    switch (method) {
      case "bank":
        return "Bank Transfer";
      case "upi":
        return "UPI";
      case "wallet":
        return "Digital Wallet";
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-bet-red mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null; // Will be handled by AdminRoute
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-bet-red text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm opacity-90">Welcome, {user.name}</p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-white text-bet-red rounded font-semibold hover:bg-gray-100 transition"
            >
              Back to Game
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-2">Total Users</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.totalUsers}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-2">Total Deposits</p>
              <p className="text-3xl font-bold text-bet-green">
                ₹{stats.totalDeposits.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-2">Total Withdrawals</p>
              <p className="text-3xl font-bold text-bet-red">
                ₹{stats.totalWithdrawals.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-2">Total Commission</p>
              <p className="text-3xl font-bold text-bet-violet">
                ₹{stats.totalCommission.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Withdrawals Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Withdrawals
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  activeTab === "pending"
                    ? "bg-bet-red text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  activeTab === "all"
                    ? "bg-bet-red text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All Withdrawals
              </button>
            </div>
          </div>
          
          {activeTab === "pending" ? (
            <>
          {withdrawals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No pending withdrawals
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800">
                            {withdrawal.user?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {withdrawal.user?.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        ₹{withdrawal.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getWithdrawalMethodLabel(withdrawal.withdrawalMethod)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            withdrawal.status
                          )}`}
                        >
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(withdrawal.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleViewDetails(withdrawal)}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm font-semibold hover:bg-blue-700"
                          >
                            View
                          </button>
                          {withdrawal.status === "pending" && (
                            <button
                              onClick={() => handleProcess(withdrawal._id)}
                              className="px-3 py-1 bg-purple-500 text-white rounded text-sm font-semibold hover:bg-purple-700"
                            >
                              Process
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
            </>
          ) : (
            <>
              {allWithdrawals.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No withdrawals found
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Min Bet
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Commission
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Method
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {allWithdrawals.map((withdrawal) => (
                        <tr key={withdrawal._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-800">
                                {withdrawal.user?.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {withdrawal.user?.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-800">
                            ₹{withdrawal.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            ₹{withdrawal.minBetAmount?.toFixed(2) || "0.00"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`font-semibold ${
                              withdrawal.commissionStatus === "completed"
                                ? "text-green-600"
                                : "text-yellow-600"
                            }`}>
                              ₹{withdrawal.commissionEarned?.toFixed(2) || "0.00"}
                            </span>
                            <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                              withdrawal.commissionStatus === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {withdrawal.commissionStatus || "pending"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {getWithdrawalMethodLabel(withdrawal.withdrawalMethod)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                withdrawal.status
                              )}`}
                            >
                              {withdrawal.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(withdrawal.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleViewDetails(withdrawal)}
                              className="px-3 py-1 bg-blue-500 text-white rounded text-sm font-semibold hover:bg-blue-700"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Withdrawal Details Modal */}
        {showDetailsModal && selectedWithdrawal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  Withdrawal Details
                </h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedWithdrawal(null);
                    setAdminNotes("");
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* User Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">User Information</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Name:</strong> {selectedWithdrawal.user?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {selectedWithdrawal.user?.email}
                  </p>
                </div>

                {/* Amount & Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">Transaction Details</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Amount:</strong> ₹{selectedWithdrawal.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Minimum Bet Required:</strong> ₹{selectedWithdrawal.minBetAmount?.toFixed(2) || "0.00"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Commission Earned:</strong> ₹{selectedWithdrawal.commissionEarned?.toFixed(2) || "0.00"}
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      selectedWithdrawal.commissionStatus === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {selectedWithdrawal.commissionStatus || "pending"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Method:</strong>{" "}
                    {getWithdrawalMethodLabel(selectedWithdrawal.withdrawalMethod)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        selectedWithdrawal.status
                      )}`}
                    >
                      {selectedWithdrawal.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Requested:</strong>{" "}
                    {new Date(selectedWithdrawal.createdAt).toLocaleString()}
                  </p>
                  {selectedWithdrawal.processedAt && (
                    <p className="text-sm text-gray-600">
                      <strong>Processed:</strong>{" "}
                      {new Date(selectedWithdrawal.processedAt).toLocaleString()}
                    </p>
                  )}
                  {selectedWithdrawal.processedBy && (
                    <p className="text-sm text-gray-600">
                      <strong>Processed By:</strong>{" "}
                      {selectedWithdrawal.processedBy?.name}
                    </p>
                  )}
                </div>

                {/* Withdrawal Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Withdrawal Details
                  </h4>
                  {selectedWithdrawal.withdrawalMethod === "bank" && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Account Holder:</strong>{" "}
                        {selectedWithdrawal.accountHolderName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Account Number:</strong>{" "}
                        {selectedWithdrawal.accountNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>IFSC Code:</strong> {selectedWithdrawal.ifscCode}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Bank Name:</strong> {selectedWithdrawal.bankName}
                      </p>
                    </div>
                  )}
                  {selectedWithdrawal.withdrawalMethod === "upi" && (
                    <p className="text-sm text-gray-600">
                      <strong>UPI ID:</strong> {selectedWithdrawal.upiId}
                    </p>
                  )}
                  {selectedWithdrawal.withdrawalMethod === "wallet" && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Wallet Type:</strong>{" "}
                        {selectedWithdrawal.walletType?.toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Wallet Number:</strong>{" "}
                        {selectedWithdrawal.walletNumber}
                      </p>
                    </div>
                  )}
                </div>

                {/* Admin Notes */}
                {selectedWithdrawal.adminNotes && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Admin Notes
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedWithdrawal.adminNotes}
                    </p>
                  </div>
                )}

                {/* Admin Notes Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this withdrawal..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bet-red focus:border-transparent"
                    rows="3"
                  />
                </div>

                {/* Actions */}
                {selectedWithdrawal.status === "pending" ||
                selectedWithdrawal.status === "processing" ? (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setSelectedWithdrawal(null);
                        setAdminNotes("");
                      }}
                      className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                    {selectedWithdrawal.status === "pending" && (
                      <button
                        onClick={() => handleProcess(selectedWithdrawal._id)}
                        className="flex-1 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                      >
                        Mark as Processing
                      </button>
                    )}
                    <button
                      onClick={() => handleReject(selectedWithdrawal._id)}
                      className="flex-1 py-3 bg-bet-red text-white rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(selectedWithdrawal._id)}
                      className="flex-1 py-3 bg-bet-green text-white rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setSelectedWithdrawal(null);
                        setAdminNotes("");
                      }}
                      className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
