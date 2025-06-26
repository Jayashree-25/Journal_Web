import React, { useState } from "react";

export default function LoginRegister({ onLogin, onLogout, username }) //it accepts onLogin, onLogout, username as props
{
    const [isLogin, setIsLogin] = useState(true);  //true -> login mode
    const [form, setForm] = useState({ username: "", password: "" });
    //toggle between login and register
    const toggleMode = () => setIsLogin(!isLogin);

    const handleSubmit = async (e) => {
        e.preventDefault();  //prevent page refresh
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
                alert("Something went wrong");
            }
        } catch (err) {
            alert("Server error");
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>{isLogin ? "Login" : "Register"}</h2>
            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    placeholder="Enter Username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                    style={{
                        display: "block",
                        marginBottom: "1rem",
                        padding: "0.5rem",
                        width: "100%"
                    }}
                />

                <input
                    type="password"
                    placeholder="Enter Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    style={{
                        display: "block",
                        marginBottom: "1rem",
                        padding: "0.5rem",
                        width: "100%"
                    }}
                />

                <button
                    type="submit"
                    style={{
                        padding: "0.5rem",
                        marginBottom: "1rem"
                    }}>
                    {isLogin ? "Login" : "Register"}
                </button>
            </form>

            <button
                onClick={toggleMode}
                style={{ marginBottom: "1rem" }}
            >
                {isLogin ? "Need to Register?" : "Already have an account?"}
            </button>

            {username && (
                <div>
                    <p>Logged in as: <strong>{username}</strong></p>
                    <button
                        onClick={onLogout}
                        style={{
                            backgroundColor: "#ff5555",
                            padding: "0.5rem"
                        }}>
                        Logout
                    </button>
                </div>
            )}

        </div>
    )
}