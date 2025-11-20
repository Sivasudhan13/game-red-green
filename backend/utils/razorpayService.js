const Razorpay = require("razorpay");

// Initialize Razorpay only if credentials are provided
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * Initiate a payout via Razorpay
 * Supports bank transfer and UPI
 * @param {Object} payoutData - Payout details
 * @param {number} payoutData.amount - Amount in paise (smallest unit)
 * @param {string} payoutData.method - 'bank' or 'upi'
 * @param {string} payoutData.account_number - Bank account or UPI ID
 * @param {string} payoutData.ifsc_code - IFSC code (only for bank)
 * @param {string} payoutData.account_holder_name - Account holder name
 * @param {string} payoutData.description - Payout description
 * @returns {Promise<Object>} Payout response from Razorpay
 */
const initiateWithdrawal = async (payoutData) => {
  try {
    if (!razorpay) {
      throw new Error(
        "Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env"
      );
    }

    // Prepare payout request based on method
    const payoutRequest = {
      account_number: payoutData.account_number,
      amount: payoutData.amount, // Must be in paise
      currency: "INR",
      mode: payoutData.method === "upi" ? "UPI" : "NEFT", // NEFT for bank, UPI for UPI
      purpose: "payout",
      description: payoutData.description || "Withdrawal from Win Go",
      receipt: `withdrawal_${Date.now()}`,
      queue_if_low_balance: true, // Queue if account balance is low
    };

    // Add reference if available
    if (payoutData.reference_id) {
      payoutRequest.reference_id = payoutData.reference_id;
    }

    // For bank transfers, add IFSC
    if (payoutData.method === "bank" && payoutData.ifsc_code) {
      payoutRequest.fund_account = {
        account_type: "bank_account",
        bank_account: {
          name: payoutData.account_holder_name,
          notes: {
            account_holder: payoutData.account_holder_name,
          },
          account_number: payoutData.account_number,
          ifsc: payoutData.ifsc_code,
        },
      };
    } else if (payoutData.method === "upi") {
      // For UPI, use VPA (Virtual Payment Address)
      payoutRequest.fund_account = {
        account_type: "vpa",
        vpa: {
          address: payoutData.account_number, // UPI ID like user@upi
        },
      };
    }

    console.log("📤 Initiating Razorpay payout...", {
      amount: `₹${payoutData.amount / 100}`,
      method: payoutData.method,
      account: payoutData.account_number,
    });

    // Create payout
    const payout = await razorpay.payouts.create(payoutRequest);

    console.log("✅ Razorpay payout created:", {
      id: payout.id,
      status: payout.status,
      amount: payout.amount,
    });

    return {
      success: true,
      payoutId: payout.id,
      status: payout.status, // 'processing', 'queued', 'rejected', 'failed', 'reversed'
      amount: payout.amount,
      fee: payout.fees || 0,
      tax: payout.tax || 0,
      metadata: {
        created_at: payout.created_at,
        updated_at: payout.updated_at,
      },
    };
  } catch (error) {
    console.error("❌ Razorpay payout error:", {
      message: error.message,
      code: error.code,
      description: error.description,
    });

    return {
      success: false,
      error: error.message || "Failed to initiate payout",
      code: error.code,
    };
  }
};

/**
 * Get payout status from Razorpay
 * @param {string} payoutId - Razorpay payout ID
 * @returns {Promise<Object>} Payout status
 */
const getPayoutStatus = async (payoutId) => {
  try {
    if (!razorpay) {
      throw new Error("Razorpay not configured");
    }

    const payout = await razorpay.payouts.fetch(payoutId);

    return {
      success: true,
      payoutId: payout.id,
      status: payout.status,
      amount: payout.amount,
      failureReason: payout.failure_reason || null,
    };
  } catch (error) {
    console.error("❌ Error fetching payout status:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Cancel a payout (only if status is pending)
 * @param {string} payoutId - Razorpay payout ID
 * @returns {Promise<Object>} Cancel response
 */
const cancelPayout = async (payoutId) => {
  try {
    if (!razorpay) {
      throw new Error("Razorpay not configured");
    }

    const payout = await razorpay.payouts.cancel(payoutId);

    return {
      success: true,
      message: "Payout cancelled",
      payoutId: payout.id,
      status: payout.status,
    };
  } catch (error) {
    console.error("❌ Error cancelling payout:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  initiateWithdrawal,
  getPayoutStatus,
  cancelPayout,
  isConfigured: () => razorpay !== null,
};
