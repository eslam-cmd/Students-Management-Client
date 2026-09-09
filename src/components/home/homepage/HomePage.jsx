"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
  Fade,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

// معالجة الرابط لضمان عدم وجود شرطة مائلة مضاعفة
const API = (
  process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app"
).replace(/\/$/, "");

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // 1. فحص وجود جلسة مدرس مؤكدة عبر الكوكي
        const teacherRes = await fetch(`${API}/api/teacher/me`, {
          method: "GET",
          credentials: "include",
        });

        if (teacherRes.ok) {
          setIsTeacherLoggedIn(true);
          setLoading(false);
          return;
        }

        // 2. فحص وجود جلسة طالب مؤكدة عبر الكوكي
        const studentRes = await fetch(`${API}/api/students/account/me`, {
          method: "GET",
          credentials: "include",
        });

        if (studentRes.ok) {
          setIsStudentLoggedIn(true);
          setLoading(false);
          return;
        }

        // 3. في حال عدم وجود جلسة نشطة
        setIsTeacherLoggedIn(false);
        setIsStudentLoggedIn(false);
      } catch (err) {
        console.error("Auth check failed on home page:", err);
        setIsTeacherLoggedIn(false);
        setIsStudentLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <Box
      dir="ltr"
      sx={{
        background:
          "linear-gradient(135deg, #0d47a1 0%, #1976d2 50%, #42a5f5 100%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pt: 8,
        pb: 4,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Decorative Elements */}
      <Box
        sx={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          animation: "float 8s ease-in-out infinite",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 70%)",
          animation: "float 10s ease-in-out infinite reverse",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          height: "80%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
          animation: "pulse 6s ease-in-out infinite",
        }}
      />

      {/* Floating Shapes */}
      <Box
        sx={{
          position: "absolute",
          top: "15%",
          right: "10%",
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          animation: "float 7s ease-in-out infinite",
          border: "2px solid rgba(255,255,255,0.05)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "20%",
          left: "15%",
          width: 40,
          height: 40,
          transform: "rotate(45deg)",
          background: "rgba(255,255,255,0.04)",
          animation: "float 9s ease-in-out infinite reverse",
          border: "2px solid rgba(255,255,255,0.05)",
        }}
      />

      <Container maxWidth="md">
        <Fade in timeout={800}>
          <Box
            sx={{
              textAlign: "center",
              backgroundColor: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: 4,
              p: { xs: 3, sm: 5 },
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Logo */}
            <Box
              sx={{
                width: 130,
                height: 130,
                borderRadius: "50%",
                overflow: "hidden",
                mx: "auto",
                mb: 3,
                border: "4px solid #1976d2",
                boxShadow: "0 0 40px rgba(25,118,210,0.2)",
                position: "relative",
              }}
            >
              <Box
                component="img"
                src="/logo5.jpeg"
                alt="Logo"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>

            {/* Title */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #0d47a1, #1976d2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Welcome to EduPlatform
            </Typography>

            <Typography
              sx={{
                color: "#6b7a8f",
                mb: 4,
                fontSize: "1rem",
                maxWidth: 450,
                mx: "auto",
                fontWeight: 400,
              }}
            >
              Your gateway to interactive learning and teaching
            </Typography>

            {/* Render Buttons Based on HTTP Cookie Auth */}
            {!loading && (
              <Stack
                direction={isMobile ? "column" : "row"}
                spacing={2}
                justifyContent="center"
                sx={{ width: "100%" }}
              >
                {isStudentLoggedIn ? (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PersonIcon />}
                    href="/student/my-account"
                    sx={btnStyles.primary}
                  >
                    My Account
                  </Button>
                ) : isTeacherLoggedIn ? (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AdminPanelSettingsIcon />}
                    href="/teacher/dashboard-admin"
                    sx={btnStyles.primary}
                  >
                    Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<SchoolIcon />}
                      href="/student/login"
                      sx={btnStyles.student}
                    >
                      Student Login
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<AdminPanelSettingsIcon />}
                      href="/teacher/login"
                      sx={btnStyles.teacher}
                    >
                      Teacher Login
                    </Button>
                  </>
                )}
              </Stack>
            )}

            {/* Loading Indicator */}
            {loading && (
              <Box
                sx={{
                  height: 50,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  Loading account details...
                </Typography>
              </Box>
            )}

            {/* Footer */}
            <Typography
              sx={{
                mt: 4,
                color: "#b0bec5",
                fontSize: "0.75rem",
              }}
            >
              © 2026 Islam Hadaya. All rights reserved.
            </Typography>
          </Box>
        </Fade>
      </Container>

      {/* Styles & Animations */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 1;
          }
        }
      `}</style>
    </Box>
  );
}

const btnStyles = {
  primary: {
    px: 4,
    py: 1.5,
    fontSize: "1rem",
    fontWeight: 600,
    borderRadius: 2,
    minWidth: 200,
    backgroundColor: "#2c3e50",
    color: "#fff",
    textTransform: "none",
    "&:hover": {
      backgroundColor: "#1a252f",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    },
  },
  student: {
    px: 4,
    py: 1.5,
    fontSize: "1rem",
    fontWeight: 600,
    borderRadius: 2,
    minWidth: 200,
    backgroundColor: "#1976d2",
    color: "#fff",
    textTransform: "none",
    boxShadow: "0 4px 15px rgba(25,118,210,0.3)",
    "&:hover": {
      backgroundColor: "#0d47a1",
      transform: "translateY(-2px)",
      boxShadow: "0 6px 25px rgba(25,118,210,0.4)",
    },
  },
  teacher: {
    px: 4,
    py: 1.5,
    fontSize: "1rem",
    fontWeight: 600,
    borderRadius: 2,
    minWidth: 200,
    borderColor: "#2c3e50",
    color: "#2c3e50",
    textTransform: "none",
    "&:hover": {
      borderColor: "#1976d2",
      backgroundColor: "rgba(255,255,255,0.04)",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    },
  },
};
