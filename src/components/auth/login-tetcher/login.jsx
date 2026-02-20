"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiLock, FiMail, FiLogIn, FiUser } from "react-icons/fi";
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
});

export default function TeacherLoginPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const router = useRouter();
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://manager-students-server.vercel.app";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API_URL}/api/teacher/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "حدث خطأ أثناء تسجيل الدخول");
      }

      // حفظ الاسم و الـ ID في localStorage
      localStorage.setItem("teacherName", data.name || name);
      localStorage.setItem("teacherId", data.id);

      setMessage({ type: "success", text: data.message });
      router.push("/teacher/dashboard-admin");
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
            <Typography fontWeight="bold" sx={{ fontSize: 30 }}>
              لوحة تحكم الاستاذ
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.7)", mt: 1, fontSize: 23 }}
            >
              سجل دخول للاستمرار
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
            <TextField
              fullWidth
              margin="normal"
              label="الاسم"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiUser />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="البريد الإلكتروني"
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
              label="كلمة السر"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiLock />
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
              sx={{
                py: 1.5,
                background: "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #1565c0 30%, #1e88e5 90%)",
                },
              }}
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <FiLogIn />
                )
              }
            >
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>

            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{
                py: 1.5,
                background: "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
                color: "#fff",
                mt: 2,
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #1565c0 30%, #1e88e5 90%)",
                },
              }}
              startIcon={<HomeIcon />}
            >
              <Link href="/" style={{ color: "#fff", textDecoration: "none" }}>
                العودة للصفحة الرئيسية
              </Link>
            </Button>

            {message.text && (
              <Box sx={{ mt: 2 }}>
                <Alert severity={message.type}>{message.text}</Alert>
              </Box>
            )}
          </Box>

          <Divider />
          <Box
            sx={{ p: 2, textAlign: "center", bgcolor: "background.default" }}
          >
            <Typography variant="body2" color="text.secondary">
              © 2025 جميع الحقوق محفوظة.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}
