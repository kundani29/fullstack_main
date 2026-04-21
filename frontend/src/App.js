import React, { useEffect, useState } from "react";
import "./App.css";
import Dashboard from "./Dashboard";
import API_BASE_URL from "./config";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (localStorage.getItem("notes_app_logged_in") === "true") {
      setLoggedIn(true);
    }
  }, []);

  // LOGIN
  const handleLogin = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Login successful");
        localStorage.setItem("notes_app_logged_in", "true");
        setLoggedIn(true);
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Unable to login. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // SIGNUP
  const handleSignup = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Signup successful");
        setIsLogin(true);
      } else {
        alert("Signup failed");
      }
    } catch (error) {
      console.error("Signup failed:", error);
      alert("Unable to signup. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loggedIn) {
    return <Dashboard onLogout={() => setLoggedIn(false)} />;
  }

  return (
    <div className="container">
      <h1>📚 Notes App</h1>

      <h2>{isLogin ? "Login" : "Signup"}</h2>

      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {isLogin ? (
        <button onClick={handleLogin} disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      ) : (
        <button onClick={handleSignup} disabled={isSubmitting}>
          {isSubmitting ? "Signing up..." : "Signup"}
        </button>
      )}

      <p>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <span onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Signup" : "Login"}
        </span>
      </p>
    </div>
  );
}

export default App;