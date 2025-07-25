// Login.js
import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  TextField,
  Container,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
  Paper,
  Slide,
  InputAdornment,
  IconButton
} from "@mui/material";
import {
  WaterDrop as WaterDropIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Visibility,
  VisibilityOff
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import RegistrationForm from "./RegistrationForm";

const playErrorSound = () => {
  const audio = new Audio("https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae6b5.mp3");
  audio.play();
};

function Login({ onLoginSuccess }) {
  const [step, setStep] = useState("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [serverOtp, setServerOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpSuccess, setShowOtpSuccess] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const otpRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (step === "otp") {
      setOtpTimer(60);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setResendEnabled(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const res = await axios.post("https://diag.hoags.in/waas/authentication/otp", {
        phone: phoneNumber
      });

      if (res.data?.otp) {
        setServerOtp(res.data.otp.toString());
        setStep("otp");
        setOtpInput("");
        setResendEnabled(false);
        setOtpTimer(60);
        setTimeout(() => otpRef.current?.focus(), 300);
      } else {
        setError("Failed to send OTP. Try again.");
      }
    } catch {
      setError("Failed to send OTP. Try again.");
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = () => {
    if (otpInput.length !== 4) {
      setError("Please enter a 4-digit OTP");
      return;
    }
    if (otpTimer <= 0) {
      setError("OTP expired. Please resend OTP.");
      return;
    }
    if (otpInput === serverOtp) {
      setShowOtpSuccess(true);
      clearInterval(timerRef.current);
      setTimeout(() => {
        setShowOtpSuccess(false);
        setStep("register");
      }, 1000);
    } else {
      setSnackbarOpen(true);
      setError("Invalid OTP");
      playErrorSound();
    }
  };

  const handleUsernameLogin = async () => {
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post("https://diag.hoags.in/waas/usercredential/login", {
        username,
        password
      });

      if (res.data?.id) {
        onLoginSuccess(res.data.id);
        setStep("done");
      } else {
        setError("Invalid username or password");
        setSnackbarOpen(true);
      }
    } catch {
      setError("Login failed. Try again.");
      setSnackbarOpen(true);
    }
    setIsLoading(false);
  };

  const handleRegistrationSuccess = (userId) => {
    if (onLoginSuccess) onLoginSuccess(userId);
    setStep("done");
  };

  if (step === "register") {
    return (
      <RegistrationForm
        phoneNumber={phoneNumber}
        onRegistrationSuccess={handleRegistrationSuccess}
      />
    );
  }

  if (step === "done") return null;

  return (
    <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f3f7fa" }}>
      <Paper elevation={5} sx={{ p: 4, borderRadius: 4, maxWidth: 400, width: "100%" }}>
        <AnimatePresence>
          {showOtpSuccess && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1.2 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.4 }}
              style={{ position: "absolute", top: "30%", left: "45%", zIndex: 10 }}
            >
              <CheckCircleIcon sx={{ fontSize: 60, color: "green" }} />
            </motion.div>
          )}
        </AnimatePresence>

        <Avatar sx={{ bgcolor: "#00A3E0", width: 72, height: 72, mb: 2, mx: "auto" }}>
          <WaterDropIcon sx={{ fontSize: 44, color: "#fff" }} />
        </Avatar>

        <Typography variant="h5" align="center" fontWeight={800} mb={2}>Waas</Typography>
        <Typography align="center" mb={3}>Connect to your water management system</Typography>

        {/* Step: Phone Number */}
        {step === "phone" && (
          <>
            <TextField
              label="Phone Number"
              variant="outlined"
              fullWidth
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
              error={!!error}
              helperText={error}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon />
                  </InputAdornment>
                )
              }}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleSendOtp}
              disabled={isLoading}
              sx={{ py: 1.5, fontWeight: 600 }}
            >
              {isLoading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Send OTP"}
            </Button>
            <Button
              fullWidth
              variant="text"
              sx={{ mt: 2 }}
              onClick={() => {
                setStep("login");
                setError("");
              }}
            >
              Already have an account? Login
            </Button>
          </>
        )}

        {/* Step: OTP Input */}
        {step === "otp" && (
          <>
            <TextField
              label="Enter OTP"
              variant="outlined"
              fullWidth
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
              error={!!error}
              helperText={error || `Resend OTP in: ${otpTimer}s`}
              inputRef={otpRef}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleVerifyOtp}
              disabled={otpInput.length !== 4}
              sx={{ py: 1.5, fontWeight: 600, mb: 1 }}
            >
              Verify OTP
            </Button>
            <Button
              variant="text"
              fullWidth
              disabled={!resendEnabled}
              onClick={handleSendOtp}
              sx={{ textTransform: 'none', fontWeight: 500 }}
            >
              Resend OTP
            </Button>
          </>
        )}

        {/* Step: Username Login */}
        {step === "login" && (
          <>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleUsernameLogin}
              sx={{ py: 1.5, fontWeight: 600 }}
            >
              {isLoading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Login"}
            </Button>
            <Button
              fullWidth
              variant="text"
              sx={{ mt: 2 }}
              onClick={() => {
                setStep("phone");
                setError("");
              }}
            >
              Don’t have an account? Register with phone
            </Button>
          </>
        )}
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={Slide}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Login;
