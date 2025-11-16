import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import api from '../services/api';
import { toast } from 'react-toastify';

// Initialize Stripe only if key is provided
const getStripePromise = () => {
  const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey || publishableKey.trim() === '') {
    return null;
  }
  return loadStripe(publishableKey);
};

const stripePromise = getStripePromise();

const CheckoutForm = ({ amount, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        const res = await api.post('/payment/deposit', { amount });
        setClientSecret(res.data.clientSecret);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to initialize payment');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (amount) {
      createPaymentIntent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        try {
          // Confirm with backend
          await api.post('/payment/confirm-deposit', {
            paymentIntentId: paymentIntent.id
          });
          toast.success('Deposit successful!');
          onSuccess();
        } catch (confirmError) {
          toast.error(confirmError.response?.data?.message || 'Failed to confirm deposit');
          setLoading(false);
        }
      } else {
        toast.error(`Payment status: ${paymentIntent.status}`);
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment processing failed');
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  if (!clientSecret) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-bet-green"></div>
          <p className="mt-4 text-gray-600">Initializing payment...</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-300 rounded-lg bg-white">
        <CardElement options={cardElementOptions} />
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Test Card:</strong> Use 4242 4242 4242 4242, any future expiry date, and any CVC
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading || !clientSecret}
          className="flex-1 py-3 bg-bet-green text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Pay ₹${amount}`}
        </button>
      </div>
    </form>
  );
};

const DepositModal = ({ onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  const handleDeposit = () => {
    const depositAmount = parseFloat(amount);
    
    if (!depositAmount || depositAmount < 70 || depositAmount > 50000) {
      toast.error('Deposit amount must be between ₹70 and ₹50,000');
      return;
    }

    // Check if Stripe is configured
    if (!stripePromise) {
      toast.error('Payment gateway is not configured. Please set REACT_APP_STRIPE_PUBLISHABLE_KEY in your .env file.');
      return;
    }

    setShowPayment(true);
  };

  if (showPayment) {
    if (!stripePromise) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Payment Configuration Error</h3>
              <button
                onClick={() => {
                  setShowPayment(false);
                  onClose();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">
                <strong>Error:</strong> Stripe publishable key is not configured. Please set REACT_APP_STRIPE_PUBLISHABLE_KEY in your .env file.
              </p>
            </div>
            <button
              onClick={() => {
                setShowPayment(false);
                onClose();
              }}
              className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-800">Complete Payment</h3>
            <button
              onClick={() => {
                setShowPayment(false);
                onClose();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <Elements stripe={stripePromise}>
            <CheckoutForm
              amount={parseFloat(amount)}
              onSuccess={() => {
                setShowPayment(false);
                onSuccess();
              }}
              onClose={() => {
                setShowPayment(false);
                onClose();
              }}
            />
          </Elements>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-800">Deposit Money</h3>
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
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> Minimum deposit is ₹70 and maximum is ₹50,000
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDeposit}
            disabled={!amount}
            className="flex-1 py-3 bg-bet-green text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
