// App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./components/Login"; // OTP + Register/Login flow
import RegistrationForm from "./components/RegistrationForm"; // Optional separate route
import Dashboard from "./components/Dashboard";
import PaymentPage from "./components/PaymentPage";
import "./App.css";

function App() {
  // Persist session from localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("userId"));
  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));

  // When user logs in or registers successfully
  const handleLoginSuccess = (id) => {
    setUserId(id);
    setIsLoggedIn(true);
    localStorage.setItem("userId", id); // Store in localStorage
  };

  // Sync session between tabs/windows
  useEffect(() => {
    const syncStorage = () => {
      const storedId = localStorage.getItem("userId");
      setUserId(storedId);
      setIsLoggedIn(!!storedId);
    };
    window.addEventListener("storage", syncStorage);
    return () => window.removeEventListener("storage", syncStorage);
  }, []);

  return (
    <Router>
      <Routes>
        {/* ✅ Default Route: Login with OTP/Phone */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* ✅ Optional Separate Registration Route */}
        <Route
          path="/register"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <RegistrationForm onRegistrationSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* ✅ Dashboard: Protected Route */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <Dashboard userId={userId} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        

        {/* ✅ Payment Page: Protected Route */}
        <Route
          path="/payment"
          element={
            isLoggedIn ? <PaymentPage /> : <Navigate to="/" replace />
          }
        />

        {/* ✅ Catch All → Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
