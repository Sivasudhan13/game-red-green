import React, { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const loadRazorpaySdk = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
};

const DepositModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const initSdk = async () => {
      try {
        await loadRazorpaySdk();
        if (isMounted) {
          setSdkReady(true);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setSdkError(
            "Unable to load Razorpay SDK. Please refresh and try again."
          );
        }
      }
    };

    initSdk();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);

    if (!depositAmount || depositAmount < 70 || depositAmount > 50000) {
      toast.error("Deposit amount must be between ₹70 and ₹50,000");
      return;
    }

    if (!sdkReady || sdkError) {
      toast.error(
        "Payment gateway is not ready. Please refresh and try again."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/payment/deposit", { amount: depositAmount });
      const { data } = res;
      const prefill = data.prefill || {};

      const razorpayOptions = {
        key: data.razorpayKeyId,
        amount: data.amountInPaise,
        currency: data.currency,
        name: "Win Go",
        description: `Wallet top-up of ₹${depositAmount}`,
        order_id: data.orderId,
        notes: {
          transactionId: data.transactionId,
        },
        prefill: {
          name: prefill.name || user?.name || "",
          email: prefill.email || user?.email || "",
          contact: (prefill.phone || user?.phoneNumber || "")
            .replace(/\D/g, "")
            .slice(-10),
        },
        theme: {
          color: "#ef4444",
        },
        handler: async (response) => {
          try {
            await api.post("/payment/confirm-deposit", {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Deposit successful!");
            onSuccess();
            onClose();
          } catch (error) {
            toast.error(
              error.response?.data?.message || "Failed to confirm deposit"
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const razorpayCheckout = new window.Razorpay(razorpayOptions);
      razorpayCheckout.on("payment.failed", (response) => {
        toast.error(response.error?.description || "Payment failed");
        setLoading(false);
      });

      razorpayCheckout.open();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to initialize payment"
      );
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-800">Deposit Money</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
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

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (₹70 - ₹50,000)
          </label>
          <input
            type="number"
            min="70"
            max="50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bet-green focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs text-blue-800 space-y-2">
          <p>
            <strong>Note:</strong> Payments are processed securely via Razorpay.
            Use the same email/phone as your account for faster verification.
          </p>
          {!sdkReady && !sdkError && <p>Loading payment gateway...</p>}
          {sdkError && <p className="text-red-600">{sdkError}</p>}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleDeposit}
            disabled={!amount || loading || !!sdkError || !sdkReady}
            className="flex-1 py-3 bg-bet-green text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Continue to Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
