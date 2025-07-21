import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";

const OTP_TIMER = 120; // 2 minutes in seconds

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Password fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const navigate = useNavigate();

  // Send OTP handler (unchanged)
  const handleSendOtp = async () => {
    if (!email) return;
    setOtpError("");
    setOtpSent(false);
    setOtpVerified(false);
    setVerifying(false);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setTimer(OTP_TIMER);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) {
              if (timerRef.current) clearInterval(timerRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setOtpError(data.msg || "Failed to send OTP");
      }
    } catch (err) {
      setOtpError("Failed to send OTP");
    }
  };

  // Verify OTP handler (unchanged)
  const handleVerifyOtp = async () => {
    if (!email || !otp) return;
    setVerifying(true);
    setOtpError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpVerified(true);
      } else {
        setOtpVerified(false);
        setOtpError(data.msg || "Invalid OTP");
      }
    } catch (err) {
      setOtpVerified(false);
      setOtpError("Failed to verify OTP");
    }
    setVerifying(false);
  };

  // Registration handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    if (!otpVerified) return;
    if (!username || !email || !password || !confirmPassword) {
      setRegisterError("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      setRegisterError("Passwords do not match");
      return;
    }
    setRegistering(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        window.alert("Registration successful! Please login.");
        navigate("/login");
      } else {
        setRegisterError(data.msg || "Registration failed");
      }
    } catch (err) {
      setRegisterError("Registration failed");
    }
    setRegistering(false);
  };

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 rounded-2xl glass shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">Sign Up</h2>
        <form className="space-y-5" onSubmit={handleRegister}>
          <Input type="text" placeholder="Username" className="bg-[#1B1B1B] text-white" required value={username} onChange={e => setUsername(e.target.value)} disabled={otpVerified} />
          <Input type="email" placeholder="Email" className="bg-[#1B1B1B] text-white" required value={email} onChange={e => setEmail(e.target.value)} disabled={otpVerified} />
          <div className="flex items-center gap-2">
            <Button type="button" className="button-gradient w-full" onClick={handleSendOtp} disabled={timer > 0 || !email || otpVerified} style={{ display: otpSent ? 'none' : undefined }}>
              Send OTP
            </Button>
            {timer > 0 && (
              <div className="w-full text-center text-muted-foreground font-medium py-2">
                Resend in {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
          <Input type="text" placeholder="Enter OTP" className="bg-[#1B1B1B] text-white" value={otp} onChange={e => setOtp(e.target.value)} disabled={otpVerified || !otpSent} />
          <Button type="button" className={`w-full ${otpVerified ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 text-white'}`} onClick={handleVerifyOtp} disabled={otpVerified || !otpSent || !otp || verifying}>
            {otpVerified ? 'OTP Verified' : verifying ? 'Verifying...' : 'Verify OTP'}
          </Button>
          {otpError && <div className="text-red-500 text-sm text-center">{otpError}</div>}
          {otpVerified && (
            <>
              <Input type="password" placeholder="Password" className="bg-[#1B1B1B] text-white" required value={password} onChange={e => setPassword(e.target.value)} />
              <Input type="password" placeholder="Confirm Password" className="bg-[#1B1B1B] text-white" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </>
          )}
          {registerError && <div className="text-red-500 text-sm text-center">{registerError}</div>}
          <Button type="submit" className="button-gradient w-full" disabled={!otpVerified || registering}>{registering ? "Registering..." : "Register"}</Button>
        </form>
        <div className="mt-6 text-center">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link to="/login" className="text-primary hover:underline">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 