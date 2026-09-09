"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiLock,
  FiMail,
  FiLogIn,
  FiEye,
  FiEyeOff,
  FiShield,
  FiArrowLeft,
  FiRefreshCw,
  FiKey,
} from "react-icons/fi";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import HomeIcon from "@mui/icons-material/Home";
import Link from "next/link";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
  },
  shape: { borderRadius: 12 },
  direction: "ltr",
});

const API = (
  process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app"
).replace(/\/$/, "");

export default function TeacherLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 1: تسجيل الدخول, 2: أدخال OTP الدخول, 3: طلب إعادة ضبط كلمة السر, 4: إدخال OTP وكلمة السر الجديدة
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [message, setMessage] = useState({ type: "", text: "" });
  const router = useRouter();

  // عداد إعادة الإرسال
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  // 1️⃣ المرحلة الأولى: طلب الـ OTP لتسجيل الدخول
  const handleInitialLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API}/api/teacher/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login request failed");
      }

      setMessage({
        type: "success",
        text: data.message || "OTP code sent to your email!",
      });
      setStep(2);
      setResendTimer(60);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API}/api/teacher/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ⚠️ ضروري جداً لاستقبال الكوكي
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification code is incorrect");
      }

      setMessage({
        type: "success",
        text: "Verified successfully! Redirecting...",
      });

      // ✅ التوجيه المباشر لتسجيل الجلسة
      setTimeout(() => {
        window.location.href = "/teacher/dashboard-admin";
      }, 300);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // 🔁 زر إعادة إرسال الرمز (Resend OTP)
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setResendLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const endpoint =
        step === 4 ? "/api/teacher/forgot-password" : "/api/teacher/login";
      const bodyData = step === 4 ? { email } : { email, password };

      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend code");

      setMessage({
        type: "success",
        text: "A new OTP code has been sent to your email.",
      });
      setResendTimer(60);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setResendLoading(false);
    }
  };

  // 3️⃣ طلب إعادة ضبط كلمة المرور (Forgot Password)
  const handleRequestResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API}/api/teacher/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      setMessage({
        type: "success",
        text: "Reset OTP code sent to your email.",
      });
      setStep(4);
      setResendTimer(60);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // 4️⃣ تعيين كلمة المرور الجديدة بعد تأكيد الـ OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API}/api/teacher/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      setMessage({
        type: "success",
        text: "Password reset successful! Please log in with your new password.",
      });
      setTimeout(() => {
        setStep(1);
        setPassword("");
        setNewPassword("");
        setOtp("");
        setMessage({ type: "", text: "" });
      }, 2000);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container component="main" maxWidth="xs">
        <Paper elevation={6} sx={{ mt: 8, overflow: "hidden" }}>
          <Box
            sx={{
              background: "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
              p: 3,
              textAlign: "center",
              color: "white",
            }}
          >
            <Typography fontWeight="bold" sx={{ fontSize: 28 }}>
              Teacher Dashboard
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.8)", mt: 1, fontSize: 16 }}
            >
              {step === 1 && "Sign in to continue"}
              {step === 2 && "Security Verification"}
              {step === 3 && "Forgot Password"}
              {step === 4 && "Set New Password"}
            </Typography>
          </Box>

          {/* 1️⃣ نموذج تسجيل الدخول */}
          {step === 1 && (
            <Box component="form" onSubmit={handleInitialLogin} sx={{ p: 3 }}>
              <TextField
                fullWidth
                margin="normal"
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FiMail />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                margin="normal"
                label="Password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FiLock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePassword} edge="end">
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box display="flex" justifyContent="flex-end" mt={0.5}>
                <Button
                  size="small"
                  onClick={() => {
                    setStep(3);
                    setMessage({ type: "", text: "" });
                  }}
                  sx={{ textTransform: "none" }}
                >
                  Forgot Password?
                </Button>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  mt: 2,
                  background:
                    "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
                }}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <FiLogIn />
                  )
                }
              >
                {loading ? "Requesting access..." : "Request Access Code"}
              </Button>

              <Button
                component={Link}
                href="/"
                fullWidth
                variant="outlined"
                size="large"
                sx={{ py: 1.5, mt: 1.5 }}
                startIcon={<HomeIcon />}
              >
                Back to Home
              </Button>

              {message.text && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity={message.type}>{message.text}</Alert>
                </Box>
              )}
            </Box>
          )}

          {/* 2️⃣ نموذج إدخال OTP وتسجيل الدخول */}
          {step === 2 && (
            <Box component="form" onSubmit={handleVerifyOTP} sx={{ p: 3 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mb: 2 }}
              >
                We have sent a 6-digit verification code to:{" "}
                <strong>{email}</strong>
              </Typography>

              <TextField
                fullWidth
                margin="normal"
                label="Verification Code (OTP)"
                type="text"
                required
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                inputProps={{
                  maxLength: 6,
                  style: {
                    textAlign: "center",
                    letterSpacing: "8px",
                    fontSize: "20px",
                    fontWeight: "bold",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FiShield />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="success"
                size="large"
                disabled={loading}
                sx={{ py: 1.5, mt: 2 }}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <FiShield />
                  )
                }
              >
                {loading ? "Verifying..." : "Verify & Log In"}
              </Button>

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mt={2}
              >
                <Button
                  size="small"
                  startIcon={<FiArrowLeft />}
                  onClick={() => {
                    setStep(1);
                    setMessage({ type: "", text: "" });
                    setOtp("");
                  }}
                  sx={{ textTransform: "none" }}
                >
                  Back
                </Button>

                <Button
                  size="small"
                  startIcon={
                    resendLoading ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <FiRefreshCw />
                    )
                  }
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || resendLoading}
                  sx={{ textTransform: "none" }}
                >
                  {resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : "Resend Code"}
                </Button>
              </Box>

              {message.text && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity={message.type}>{message.text}</Alert>
                </Box>
              )}
            </Box>
          )}

          {/* 3️⃣ طلب إعادة ضبط كلمة المرور */}
          {step === 3 && (
            <Box
              component="form"
              onSubmit={handleRequestResetPassword}
              sx={{ p: 3 }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter your registered email address to receive a password reset
                verification code.
              </Typography>

              <TextField
                fullWidth
                margin="normal"
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FiMail />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ py: 1.5, mt: 2 }}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <FiKey />
                  )
                }
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </Button>

              <Button
                fullWidth
                variant="text"
                size="small"
                startIcon={<FiArrowLeft />}
                onClick={() => {
                  setStep(1);
                  setMessage({ type: "", text: "" });
                }}
                sx={{ mt: 1.5, textTransform: "none" }}
              >
                Back to Login
              </Button>

              {message.text && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity={message.type}>{message.text}</Alert>
                </Box>
              )}
            </Box>
          )}

          {/* 4️⃣ إدخال OTP وكلمة المرور الجديدة */}
          {step === 4 && (
            <Box component="form" onSubmit={handleResetPassword} sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter the OTP sent to <strong>{email}</strong> along with your
                new password.
              </Typography>

              <TextField
                fullWidth
                margin="normal"
                label="Reset Code (OTP)"
                type="text"
                required
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                inputProps={{
                  maxLength: 6,
                  style: {
                    textAlign: "center",
                    letterSpacing: "8px",
                    fontSize: "18px",
                    fontWeight: "bold",
                  },
                }}
              />

              <TextField
                fullWidth
                margin="normal"
                label="New Password"
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                helperText="Min 6 characters"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FiLock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePassword} edge="end">
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ py: 1.5, mt: 2 }}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Reset Password"
                )}
              </Button>

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mt={2}
              >
                <Button
                  size="small"
                  startIcon={<FiArrowLeft />}
                  onClick={() => {
                    setStep(3);
                    setMessage({ type: "", text: "" });
                  }}
                  sx={{ textTransform: "none" }}
                >
                  Back
                </Button>

                <Button
                  size="small"
                  startIcon={
                    resendLoading ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <FiRefreshCw />
                    )
                  }
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || resendLoading}
                  sx={{ textTransform: "none" }}
                >
                  {resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : "Resend Code"}
                </Button>
              </Box>

              {message.text && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity={message.type}>{message.text}</Alert>
                </Box>
              )}
            </Box>
          )}

          <Divider />
          <Box
            sx={{ p: 2, textAlign: "center", bgcolor: "background.default" }}
          >
            <Typography variant="body2" color="text.secondary">
              © 2026 Islam Hadaya. All rights reserved.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}
