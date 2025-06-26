import React, { useState } from "react";

export default function LoginRegister({ onLogin, onLogout, username }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", password: "" });

  const toggleMode = () => setIsLogin(!isLogin);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `http://localhost:5000/${isLogin ? "login" : "register"}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        onLogin(data.username);
      } else {
        alert(data.error || "Something went wrong.");
      }
    } catch (error) {
      alert("Server error.");
    }
  };

  return (
    <div style={{
      padding: "2rem",
      fontFamily: "Arial",
      backgroundColor: "#282a36",  // Dracula background
      color: "#f8f8f2",            // Dracula text color
      minHeight: "100vh"
    }}>
      <h2 style={{ color: "#bd93f9", fontSize: "2rem", marginBottom: "1rem" }}>
        {isLogin ? "Login" : "Register"}
      </h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          style={{
            display: "block",
            marginBottom: "1rem",
            padding: "0.8rem",
            width: "100%",
            backgroundColor: "#1e1e1e",
            color: "#f1f1f1",
            border: "1px solid #444",
            borderRadius: "4px"
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          style={{
            display: "block",
            marginBottom: "1rem",
            padding: "0.8rem",
            width: "100%",
            backgroundColor: "#1e1e1e",
            color: "#f1f1f1",
            border: "1px solid #444",
            borderRadius: "4px"
          }}
        />
        <button type="submit" style={{
          padding: "0.5rem 1rem",
          marginBottom: "1rem",
          backgroundColor: "#ff79c6",
          color: "#282a36",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}>
          {isLogin ? "Login" : "Register"}
        </button>
      </form>

      <button onClick={toggleMode} style={{
        color: "#8be9fd",
        backgroundColor: "transparent",
        border: "none",
        textDecoration: "underline",
        cursor: "pointer",
        marginBottom: "1rem"
      }}>
        {isLogin ? "Need to Register?" : "Already have an account?"}
      </button>

      {username && (
        <div>
          <p>Logged in as: <strong style={{ color: "#50fa7b" }}>{username}</strong></p>
          <button onClick={onLogout} style={{
            backgroundColor: "#ff5555",
            color: "#282a36",
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
