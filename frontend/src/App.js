import React, { useState } from "react";
import "./App.css";
import Dashboard from "./Dashboard";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // LOGIN
  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5050/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Login successful");
        setLoggedIn(true);
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Unable to login. Please check if backend is running on port 5050.");
    }
  };

  // SIGNUP
  const handleSignup = async () => {
    try {
      const res = await fetch("http://localhost:5050/signup", {
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
      alert("Unable to signup. Please check if backend is running on port 5050.");
    }
  };

  if (loggedIn) {
    return <Dashboard />;
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
        <button onClick={handleLogin}>Login</button>
      ) : (
        <button onClick={handleSignup}>Signup</button>
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