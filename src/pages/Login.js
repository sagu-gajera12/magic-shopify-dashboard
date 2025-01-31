import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  CircularProgress,
} from "@mui/material";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function OTPLogin() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Send OTP API Call
  const sendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const request = {
        email: email,
        user: { email: email },
      };

      await axios.post(`${API_BASE_URL}/api/auth/sent/login-otp`, request, {
        headers: { "Content-Type": "application/json" },
      });
      
      setIsOtpSent(true);
    } catch (error) {
      setError("Failed to send OTP. Please try again.");
    }
    setLoading(false);
  };

  // Login with OTP API Call
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const request = { email: email, otp: otp };
      const response = await axios.post(`${API_BASE_URL}/api/auth/signin`, request, {
        headers: { "Content-Type": "application/json" },
      });

      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (error) {
      setError("Invalid OTP. Please try again.");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={6} sx={{ padding: 4, textAlign: "center", marginTop: "10vh" }}>
        <Typography variant="h5" sx={{ marginBottom: 2 }}>
          OTP Login
        </Typography>
        <Grid container spacing={2}>
          {/* Email Field */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              disabled={isOtpSent}
            />
          </Grid>
          
          {/* Send OTP Button */}
          {!isOtpSent && (
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={sendOtp}
                disabled={loading || !email}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Send OTP to Email"}
              </Button>
            </Grid>
          )}

          {/* OTP Field */}
          {isOtpSent && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Enter OTP"
                variant="outlined"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                type="text"
                required
              />
            </Grid>
          )}
          
          {/* Login Button */}
          {isOtpSent && (
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={handleLogin}
                disabled={!otp}
              >
                Login
              </Button>
            </Grid>
          )}

          {/* Error Message */}
          {error && (
            <Grid item xs={12}>
              <Typography color="error">{error}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
}

export default OTPLogin;
