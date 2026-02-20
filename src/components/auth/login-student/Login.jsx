"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiLock, FiMail, FiLogIn } from "react-icons/fi";
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
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export default function TeacherLoginPage() {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const cleanId = studentId.trim(); // إزالة المسافات من البداية والنهاية

      const res = await fetch(
        "https://manager-students-server.vercel.app/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student_id: cleanId }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "خطأ في تسجيل الدخول");
      }

      localStorage.setItem("studentName", result.student.name);
      localStorage.setItem("studentId", result.student.student_id);
      localStorage.setItem(
        "studentSpecialization",
        result.student.specialization
      );

      setMessage({ type: "success", text: "تم تسجيل الدخول" });
      router.push("/student/my-account");
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
        <Paper
          elevation={6}
          sx={{
            mt: 8,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
              p: 3,
              textAlign: "center",
              color: "white",
            }}
          >
            <Typography fontWeight="bold" style={{ fontSize: "30px" }}>
              مرحبا بك
            </Typography>
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                mt: 1,
                fontSize: "23px",
              }}
            >
              ادخل المعرف الشخصي للدخول
            </Typography>
          </Box>

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              {/* Password Field */}
              <TextField
                fullWidth
                margin="normal"
                label="المعرف الشخصي"
                type="text"
                variant="outlined"
                placeholder="ادخل المعرف الشخصي"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value.trimStart())}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FiLock />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Submit Button */}
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
              {loading ? "جاري الدخول..." : "دخول"}
            </Button>
            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{
                py: 1.5,
                background: "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
                color: "#ffff",
                marginTop: "10px",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #1565c0 30%, #1e88e5 90%)",
                },
              }}
              startIcon={<HomeIcon />}
            >
              <Link href="/" style={{ color: "#ffff", textDecoration: "none" }}>
                {" "}
                الرجوع الى الصفحة الرئيسية
              </Link>
            </Button>
            {/* Message Notification */}
            {message.text && (
              <Box
                sx={{
                  mt: 2,
                  animation:
                    message.type === "success"
                      ? "fadeIn 0.5s ease-out"
                      : "shake 0.5s ease-in-out",
                }}
              >
                <Alert
                  severity={message.type === "success" ? "success" : "error"}
                >
                  {message.text}
                </Alert>
              </Box>
            )}
          </Box>

          {/* Footer */}
          <Divider />
          <Box
            sx={{ p: 2, textAlign: "center", bgcolor: "background.default" }}
          >
            <Typography variant="body2" color="text.secondary">
              © 2025 جميع الحقوق محفوظة
            </Typography>
          </Box>
        </Paper>
      </Container>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          20%,
          60% {
            transform: translateX(-5px);
          }
          40%,
          80% {
            transform: translateX(5px);
          }
        }
      `}</style>
    </ThemeProvider>
  );
}
