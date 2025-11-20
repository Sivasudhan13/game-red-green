import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { toast } from "react-toastify";

const Register = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [verifyingEmailOtp, setVerifyingEmailOtp] = useState(false);

  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Format phone number
  const formatPhoneNumber = (value) => value.replace(/\D/g, "").slice(0, 10);

  useEffect(() => {
    if (otpCountdown <= 0) {
      return;
    }

    const timeout = setTimeout(() => {
      setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [otpCountdown]);

  useEffect(() => {
    setEmailOtp("");
    setEmailOtpSent(false);
    setEmailOtpVerified(false);
    setOtpCountdown(0);
  }, [email]);

  const handleSendEmailOtp = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Enter a valid email before requesting OTP");
      return;
    }

    setSendingEmailOtp(true);
    try {
      await api.post("/auth/send-email-otp", { email: email.toLowerCase() });
      toast.success("OTP sent to your email");
      setEmailOtpSent(true);
      setOtpCountdown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send email OTP");
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.length !== 6) {
      toast.error("Enter the 6-digit OTP from your email");
      return;
    }

    setVerifyingEmailOtp(true);
    try {
      await api.post("/auth/verify-email-otp", {
        email: email.toLowerCase(),
        otp: emailOtp,
      });
      toast.success("Email verified successfully");
      setEmailOtpVerified(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
      setEmailOtpVerified(false);
    } finally {
      setVerifyingEmailOtp(false);
    }
  };

  // REGISTER
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!name || !phoneNumber || !email || !password) {
        toast.error("All fields are required!");
        setLoading(false);
        return;
      }

      if (!email.includes("@")) {
        toast.error("Enter valid email");
        setLoading(false);
        return;
      }

      if (!emailOtpVerified) {
        toast.error(
          "Please verify the OTP sent to your email before registering"
        );
        setLoading(false);
        return;
      }

      await register(name, phoneNumber, password, inviteCode, email);
      toast.success("Registration successful!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bet-red to-red-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-bet-red mb-2">Win Go</h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* NAME */}
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              className="w-full px-4 py-3 border rounded-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  className="flex-1 px-4 py-3 border rounded-lg"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                />
                <button
                  type="button"
                  onClick={handleSendEmailOtp}
                  disabled={
                    sendingEmailOtp ||
                    otpCountdown > 0 ||
                    !email ||
                    emailOtpVerified
                  }
                  className="px-4 py-3 bg-bet-red text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmailOtp
                    ? "Sending..."
                    : emailOtpVerified
                    ? "Verified"
                    : otpCountdown > 0
                    ? `Resend in ${otpCountdown}s`
                    : "Send OTP"}
                </button>
              </div>

              {emailOtpSent && !emailOtpVerified && (
                <div className="flex gap-2">
                  <input
                    className="flex-1 px-4 py-3 border rounded-lg tracking-widest text-center uppercase"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={emailOtp}
                    onChange={(e) =>
                      setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="Enter 6-digit OTP"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmailOtp}
                    disabled={verifyingEmailOtp}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifyingEmailOtp ? "Verifying..." : "Verify"}
                  </button>
                </div>
              )}

              {emailOtpVerified ? (
                <p className="text-xs text-green-600">
                  Email verified via OTP.
                </p>
              ) : emailOtpSent ? (
                <p className="text-xs text-gray-500">
                  We sent a 6-digit OTP to {email}. Please verify to continue.
                </p>
              ) : null}
            </div>
          </div>

          {/* PHONE */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <div className="flex gap-2">
              <span className="px-3 py-3 bg-gray-100 rounded-lg">+91</span>
              <input
                className="flex-1 px-4 py-3 border rounded-lg"
                maxLength={10}
                value={phoneNumber}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setPhoneNumber(formatted);
                }}
                placeholder="10-digit mobile"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              className="w-full px-4 py-3 border rounded-lg"
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
            />
          </div>

          {/* INVITE CODE */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Invite Code (Optional)
            </label>
            <input
              className="w-full px-4 py-3 border rounded-lg"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Friend's invite code"
            />
          </div>

          {/* SUBMIT */}
          <button
            className="w-full py-3 bg-bet-red text-white rounded-lg"
            disabled={loading}
          >
            {loading ? "Registering..." : "Complete Registration"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-bet-red font-semibold">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
