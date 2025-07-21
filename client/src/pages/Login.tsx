import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoggingIn(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        // Save JWT and user info to localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.alert("Login successful!");
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(data.msg || "Login failed");
      }
    } catch (err) {
      setError("Login failed");
    }
    setLoggingIn(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 rounded-2xl glass shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">Login</h2>
        <form className="space-y-5" onSubmit={handleLogin}>
          <Input type="email" placeholder="Email" className="bg-[#1B1B1B] text-white" required value={email} onChange={e => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" className="bg-[#1B1B1B] text-white" required value={password} onChange={e => setPassword(e.target.value)} />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Button type="submit" className="button-gradient w-full" disabled={loggingIn}>{loggingIn ? "Logging in..." : "Login"}</Button>
        </form>
        <div className="mt-6 text-center">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link to="/register" className="text-primary hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 