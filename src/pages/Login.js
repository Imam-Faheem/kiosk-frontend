import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("testadmin@example.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    console.log("Login: Token exists?", !!token); // Debug log
    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);
const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const response = await axios.post(`${baseUrl}/login`, {
      username,
      password,
    });

    // 👇 Fix: Use ref_tok from backend response
    const access_token = response.data.user?.ref_tok;

    if (!access_token) {
      throw new Error("No access token received from backend");
    }

    localStorage.setItem("access_token", access_token);
    console.log("Login successful — Token stored:", access_token);

    navigate("/", { replace: true });
  } catch (err) {
    console.error("Login error:", err);
    setError(
      err.response?.status === 401
        ? "Invalid username or password."
        : "Login failed. Try again later."
    );
  }
};

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center mb-4">Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Username or Email</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;