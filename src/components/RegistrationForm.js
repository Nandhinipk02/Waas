import React, { useState } from 'react';
import axios from 'axios';

const WaterDropletSVG = () => (
  <svg width="70" height="90" viewBox="0 0 64 80" style={{ marginBottom: 12 }}>
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#00A3E0", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#c2e9fb", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path
      d="M32 0C18 20 4 36 4 50C4 65 16 80 32 80C48 80 60 65 60 50C60 36 46 20 32 0Z"
      fill="url(#grad)"
    >
      <animateTransform
        attributeName="transform"
        type="translate"
        values="0,0; 0,2; 0,0"
        dur="1.5s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(120deg, #8fd6ff 0%, #f6fbff 100%)',
    fontFamily: "'Montserrat', sans-serif"
  },
  formWrapper: {
    background: '#fff',
    borderRadius: '24px',
    boxShadow: '0 8px 32px rgba(55, 120, 200, 0.18)',
    maxWidth: '400px',
    width: '100%',
    padding: '36px 28px 28px 28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  heading: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#2b7ec1',
    marginBottom: '10px'
  },
  subheading: {
    fontSize: '1rem',
    color: '#4f6294',
    textAlign: 'center',
    marginBottom: '20px'
  },
  input: {
    width: '100%',
    padding: '13px 15px',
    border: '1.5px solid #e3e8f0',
    borderRadius: '12px',
    outline: 'none',
    fontSize: '1rem',
    marginBottom: '17px',
    background: '#f0f7fa',
  },
  button: {
    width: '100%',
    padding: '13px 0',
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(90deg, #2b7ec1 0%, #4fbbfb 100%)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '1.07rem',
    cursor: 'pointer',
    marginTop: '10px',
    marginBottom: '6px'
  },
  message: {
    marginTop: '12px',
    fontWeight: 600,
    fontSize: '1rem',
    color: '#c91c4a'
  }
};

function RegistrationForm({ phoneNumber, onRegistrationSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [formData, setFormData] = useState({
    emailid: '',
    username: '',
    password: '',
    confirmPassword: '',
    location: ''
  });
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailOrUsername, setResetEmailOrUsername] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.trim() }));
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value.trim() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage('❌ Passwords do not match');
      setStatus('fail');
      return;
    }

    setStatus('submitting');

    try {
      const response = await axios.post('https://diag.hoags.in/waas/user/registration', {
        ...formData,
        phoneno: phoneNumber
      });

      if (response.data?.id) {
        localStorage.setItem('userId', response.data.id);
        setMessage('✅ Registration successful!');
        setStatus('success');
        setTimeout(() => onRegistrationSuccess?.(response.data.id), 1000);
      } else {
        setMessage('❌ Registration failed: No user ID');
        setStatus('fail');
      }
    } catch {
      setMessage('❌ Registration failed');
      setStatus('fail');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.username || !loginData.password) {
      setMessage('❌ Enter both fields');
      return;
    }

    setStatus('submitting');

    try {
      const res = await axios.post('https://diag.hoags.in/waas/usercredential/login', loginData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      if (res.data?.message?.toLowerCase().includes("success")) {
        localStorage.setItem("userId", res.data.id);
        setMessage('✅ Login successful');
        setStatus('success');
        setTimeout(() => onRegistrationSuccess?.(res.data.id), 1000);
      } else {
        setMessage(`❌ ${res.data?.message || 'Invalid credentials'}`);
        setStatus('fail');
      }
    } catch {
      setMessage('❌ Login failed. Check credentials or network.');
      setStatus('fail');
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmailOrUsername) {
      return setResetMessage("Please enter your email or username");
    }

    try {
      const res = await axios.post('https://diag.hoags.in/waas/usercredential/forgotpassword', {
        identifier: resetEmailOrUsername
      });

      setResetMessage(
        res.data?.message === "Reset link sent"
          ? "✅ Reset link sent."
          : "❌ Could not send reset link."
      );
    } catch {
      setResetMessage("❌ Failed to send reset link. Try later.");
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.formWrapper} onSubmit={isLoginMode ? handleLogin : handleSubmit}>
        <WaterDropletSVG />
        <div style={styles.heading}>{isLoginMode ? 'Login' : 'Create Account'}</div>
        <div style={styles.subheading}>
          {isLoginMode ? 'Login using username & password' : 'Please fill the form to register'}
        </div>

        {isLoginMode ? (
          <>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={loginData.username}
              onChange={handleLoginChange}
              style={styles.input}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleLoginChange}
              style={styles.input}
              required
            />
            <div
              style={{
                color: '#2b7ec1',
                textAlign: 'right',
                cursor: 'pointer',
                marginBottom: '10px',
                fontSize: '0.9rem'
              }}
              onClick={() => {
                setShowForgotPassword(true);
                setResetMessage('');
              }}
            >
              Forgot Password?
            </div>

            {showForgotPassword && (
              <div style={{ width: '100%' }}>
                <input
                  type="text"
                  placeholder="Enter Email or Username"
                  value={resetEmailOrUsername}
                  onChange={(e) => setResetEmailOrUsername(e.target.value)}
                  style={styles.input}
                />
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  style={{
                    ...styles.button,
                    background: 'linear-gradient(90deg, #4e8ccf 0%, #8bd3f5 100%)',
                    marginBottom: 6
                  }}
                >
                  Send Reset Link
                </button>
                {resetMessage && (
                  <div
                    style={{
                      ...styles.message,
                      fontSize: '0.9rem',
                      marginTop: '6px',
                      color: resetMessage.includes("✅") ? '#119e4a' : '#c91c4a'
                    }}
                  >
                    {resetMessage}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <input
              type="email"
              name="emailid"
              placeholder="Email"
              value={formData.emailid}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              style={styles.input}
            />
          </>
        )}

        <button
          type="submit"
          style={{
            ...styles.button,
            background: status === 'success'
              ? 'linear-gradient(90deg, #4fd37d 0%, #a4ebaf 100%)'
              : 'linear-gradient(90deg, #2b7ec1 0%, #4fbbfb 100%)'
          }}
        >
          {isLoginMode
            ? status === 'submitting' ? 'Logging in...' : 'Login'
            : status === 'submitting' ? 'Registering...' : 'Register'}
        </button>

        {message && (
          <div style={{ ...styles.message, color: status === 'success' ? '#119e4a' : '#c91c4a' }}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default RegistrationForm;
