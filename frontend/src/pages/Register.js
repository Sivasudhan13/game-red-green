import React, { useState } from "react";
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

  // ------- PHONE OTP STATES -------
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);
  const [sendingPhoneOTP, setSendingPhoneOTP] = useState(false);
  const [verifyingPhoneOTP, setVerifyingPhoneOTP] = useState(false);
  const [mockPhoneOTP, setMockPhoneOTP] = useState("");

  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Format phone number
  const formatPhoneNumber = (value) => value.replace(/\D/g, "").slice(0, 10);

  // -------------------------------
  // SEND PHONE OTP
  // -------------------------------
  const handleSendPhoneOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error("Enter valid 10-digit phone number");
      return;
    }

    setSendingPhoneOTP(true);
    try {
      const res = await api.post("/auth/send-otp", { phoneNumber });

      setPhoneOtpSent(true);
      toast.success("Phone OTP sent!");

      if (res.data.mockOTP) {
        setMockPhoneOTP(res.data.mockOTP);
        toast.info(`Mock Phone OTP: ${res.data.mockOTP}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send phone OTP");
    } finally {
      setSendingPhoneOTP(false);
    }
  };

  // -------------------------------
  // VERIFY PHONE OTP
  // -------------------------------
  const handleVerifyPhoneOTP = async () => {
    if (!phoneOtp) {
      toast.error("Enter phone OTP");
      return;
    }

    setVerifyingPhoneOTP(true);

    try {
      await api.post("/auth/verify-otp", { phoneNumber, otp: phoneOtp });
      setPhoneOtpVerified(true);
      toast.success("Phone number verified!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid phone OTP");
    } finally {
      setVerifyingPhoneOTP(false);
    }
  };

  // -------------------------------
  // REGISTER
  // -------------------------------
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

      if (!phoneOtpVerified) {
        toast.error("Verify your phone number first!");
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
          <h1 className="text-3xl font-bold text-bet-red mb-2">OK.Win</h1>
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

          {/* EMAIL (Required, No OTP) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              className="w-full px-4 py-3 border rounded-lg"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
            />
          </div>

          {/* PHONE + OTP */}
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
                  setPhoneOtpSent(false);
                  setPhoneOtpVerified(false);
                }}
                placeholder="10-digit mobile"
              />

              <button
                type="button"
                className="px-4 py-3 bg-blue-500 text-white rounded-lg"
                onClick={handleSendPhoneOTP}
                disabled={
                  sendingPhoneOTP ||
                  phoneOtpVerified ||
                  phoneNumber.length !== 10
                }
              >
                {sendingPhoneOTP
                  ? "Sending..."
                  : phoneOtpSent
                  ? "Resend"
                  : "Send OTP"}
              </button>
            </div>

            {/* Phone OTP input */}
            {phoneOtpSent && !phoneOtpVerified && (
              <div className="mt-3 flex gap-2">
                <input
                  className="flex-1 px-4 py-3 border rounded-lg"
                  maxLength={6}
                  value={phoneOtp}
                  onChange={(e) =>
                    setPhoneOtp(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Enter Phone OTP"
                />
                <button
                  type="button"
                  className="px-4 py-3 bg-green-600 text-white rounded-lg"
                  onClick={handleVerifyPhoneOTP}
                  disabled={verifyingPhoneOTP}
                >
                  {verifyingPhoneOTP ? "Checking..." : "Verify"}
                </button>
              </div>
            )}

            {phoneOtpVerified && (
              <p className="text-green-600 text-sm mt-1">Phone Verified ✔</p>
            )}
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
            disabled={loading || !phoneOtpVerified}
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
