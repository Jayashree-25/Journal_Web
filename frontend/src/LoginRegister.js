import React, { useState } from "react";
import API_URL from "./config";
import "./LoginRegister.css";

function BotanicalDecoration() {
  return (
    <svg className="journal__botanical" viewBox="0 0 160 180" fill="none" aria-hidden="true">
      <path d="M20 160 C 26 112, 56 84, 118 44" stroke="#7A8068" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      <g stroke="#7A8068" strokeWidth="1.1" strokeLinecap="round" opacity="0.45">
        <path d="M58 96 q -12 -6 -14 -18 q 14 2 14 18 Z" />
        <path d="M58 96 q 12 -8 8 -20 q -14 4 -8 20 Z" />
        <path d="M84 74 q -11 -5 -13 -16 q 13 1 13 16 Z" />
        <path d="M84 74 q 11 -7 7 -18 q -13 3 -7 18 Z" />
        <path d="M108 52 q -10 -4 -12 -14 q 12 1 12 14 Z" />
        <path d="M40 128 q -10 -5 -12 -15 q 12 1 12 15 Z" />
      </g>
    </svg>
  );
}

function PenIcon() {
  return (
    <svg className="journal__pen" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3 C 13.8 7.5 15 10 14.6 14.5 L 12 16.5 L 9.4 14.5 C 9 10 10.2 7.5 12 3 Z" stroke="#8B5E3C" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M12 16.5 V 11.5" stroke="#8B5E3C" strokeWidth="1.1" />
      <circle cx="12" cy="18.6" r="1.2" stroke="#8B5E3C" strokeWidth="1.1" />
    </svg>
  );
}

export default function LoginRegister({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setInfo("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    const url = `${API_URL}/${isLogin ? "login" : "register"}`;

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
      } else if (data.message && !isLogin) {
        setInfo("Your journal is ready — please login to begin.");
        setForm({ username: "", password: "" });
        setIsLogin(true); // Switch to login form
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="journal-login">
      <div className="journal">
        {/* Left page — branding */}
        <section className="journal__page journal__page--left" aria-label="About Journal">
          <div>
            <h1 className="journal__title">Journal</h1>
            <p className="journal__tagline">your thoughts, your story</p>
            <span className="journal__divider" aria-hidden="true" />
            <blockquote className="journal__quote">
              &ldquo;Every thought deserves a place.&rdquo;
            </blockquote>
            <PenIcon />
          </div>
          <BotanicalDecoration />
        </section>

        {/* Center spine */}
        <div className="journal__spine" aria-hidden="true" />

        {/* Right page — form */}
        <section className="journal__page journal__page--right" aria-label="Account form">
          <div className="journal__form">
            <h2 className="journal__form-title">
              {isLogin ? "Welcome back." : "Create your journal."}
            </h2>
            <p className="journal__form-sub">
              {isLogin ? "Continue your story." : "Begin writing your first entry."}
            </p>

            {(error || info) && (
              <p
                className={`journal__notice ${error ? "journal__notice--error" : "journal__notice--success"}`}
                role={error ? "alert" : "status"}
              >
                {error || info}
              </p>
            )}

            <form onSubmit={handleSubmit} className="journal__form-fields">
              <div className="journal__field">
                <label htmlFor="journal-username">Username</label>
                <input
                  id="journal-username"
                  name="username"
                  type="text"
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="journal__field">
                <label htmlFor="journal-password">Password</label>
                <input
                  id="journal-password"
                  name="password"
                  type="password"
                  placeholder={isLogin ? "Password" : "At least 6 characters"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
              </div>

              <button type="submit" className="journal__submit" disabled={loading}>
                {loading
                  ? isLogin
                    ? "Opening…"
                    : "Creating…"
                  : isLogin
                  ? "Open Journal →"
                  : "Create Journal →"}
              </button>
            </form>

            <p className="journal__toggle">
              {isLogin ? "Need to register?" : "Already have an account?"}{" "}
              <button type="button" className="journal__toggle-link" onClick={toggleMode}>
                {isLogin ? "Create your journal" : "Back to login"} →
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
