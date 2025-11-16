import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 10);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!identifier) {
        toast.error('Please enter your email or phone number');
        setLoading(false);
        return;
      }
      // if it's a phone number, validate length
      if (!identifier.includes('@')) {
        const digits = identifier.replace(/\D/g, '');
        if (digits.length !== 10) {
          toast.error('Please enter a valid 10-digit phone number');
          setLoading(false);
          return;
        }
      }
      if (!password) {
        toast.error('Please enter your password');
        setLoading(false);
        return;
      }
      await login(identifier, password);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bet-red to-red-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-bet-red mb-2">OK.Win</h1>
          <p className="text-gray-600">Login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email or Phone
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">+91</span>
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  const val = e.target.value;
                  // if user types digits only, keep a max of 10
                  if (/^\d+$/.test(val)) {
                    setIdentifier(formatPhoneNumber(val));
                  } else {
                    setIdentifier(val);
                  }
                }}
                required
                maxLength={80}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bet-red focus:border-transparent"
                placeholder="Enter email or 10-digit phone number"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter your email or 10-digit mobile number (e.g., 9876543210)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bet-red focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-bet-red text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-bet-red font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Back to Game
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;


