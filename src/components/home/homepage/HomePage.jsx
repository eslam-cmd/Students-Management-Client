"use client";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Grid,
  useTheme,
  useMediaQuery,
  Paper,
  Chip,
} from "@mui/material";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import EditNoteIcon from "@mui/icons-material/EditNote";
import SchoolIcon from "@mui/icons-material/School";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useEffect, useState } from "react";
import { Margin } from "@mui/icons-material";

// ثوابت التصميم - ألوان زرقاء للتعليم
const DESIGN_CONSTANTS = {
  colors: {
    // تدرجات زرقاء رئيسية
    primaryGradient:
      "linear-gradient(145deg, #0B4F6C 0%, #145C9E 50%, #1B3B6F 100%)",
    secondaryGradient:
      "linear-gradient(145deg, #084C61 0%, #177E89 70%, #0B4F6C 100%)",

    // أزرار
    buttonPrimary: "linear-gradient(90deg, #1A73E8 0%, #4285F4 100%)",
    buttonPrimaryHover: "linear-gradient(90deg, #1669D9 0%, #3B78E7 100%)",
    buttonSecondary: "linear-gradient(90deg, #0F52BA 0%, #1E81D9 100%)",
    buttonOutlined: "rgba(33, 150, 243, 0.15)",

    // ألوان النصوص والخلفيات
    white: "#ffffff",
    lightBlue: "#E3F2FD",
    mediumBlue: "#90CAF9",
    darkBlue: "#0A1929",

    // البطاقات
    statCard: "rgba(33, 150, 243, 0.15)",
    statCardBorder: "rgba(33, 150, 243, 0.3)",
    statCardHover: "rgba(33, 150, 243, 0.25)",
  },
  sizes: {
    logo: {
      width: 370, // تكبير الشعار قليلاً
      height: 370,
      border: 5,
    },
    button: {
      borderRadius: 3,
      paddingY: 1.5,
      paddingX: 4,
      minWidth: 200,
    },
  },
};

// مكون البطاقة الإحصائية - تصميم أزرق
const StatCard = ({ icon: Icon, value, label }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      background: DESIGN_CONSTANTS.colors.statCard,
      backdropFilter: "blur(10px)",
      borderRadius: 3,
      textAlign: "center",
      border: `1px solid ${DESIGN_CONSTANTS.colors.statCardBorder}`,
      transition: "all 0.3s ease",
      "&:hover": {
        background: DESIGN_CONSTANTS.colors.statCardHover,
        transform: "translateY(-5px)",
        boxShadow: "0 10px 30px rgba(26, 115, 232, 0.4)",
      },
    }}
  >
    <Icon
      sx={{ fontSize: 40, color: DESIGN_CONSTANTS.colors.mediumBlue, mb: 1 }}
    />
    <Typography variant="h5" sx={{ fontWeight: 700, color: "white" }}>
      {value}
    </Typography>
    <Typography
      variant="body2"
      sx={{ color: DESIGN_CONSTANTS.colors.lightBlue, fontWeight: 500 }}
    >
      {label}
    </Typography>
  </Paper>
);

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const studentId = localStorage.getItem("studentId");
    const studentName = localStorage.getItem("studentName");
    const studentSpecialization = localStorage.getItem("studentSpecialization");
    const teacherId = localStorage.getItem("teacherId");

    if (studentId && studentName && studentSpecialization) {
      setIsStudentLoggedIn(true);
    }
    if (teacherId) {
      setIsTeacherLoggedIn(true);
    }
  }, []);

  const renderButtons = () => {
    if (isStudentLoggedIn) {
      return (
        <Button
          variant="contained"
          size="large"
          endIcon={<MeetingRoomIcon />}
          href="/student/my-account"
          sx={{
            borderRadius: DESIGN_CONSTANTS.sizes.button.borderRadius,
            py: DESIGN_CONSTANTS.sizes.button.paddingY,
            px: DESIGN_CONSTANTS.sizes.button.paddingX,
            fontSize: "1.1rem",
            fontWeight: 700,
            background: DESIGN_CONSTANTS.colors.buttonPrimary,
            color: DESIGN_CONSTANTS.colors.white,
            textTransform: "none",
            boxShadow: "0 8px 20px rgba(26, 115, 232, 0.4)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: DESIGN_CONSTANTS.colors.buttonPrimaryHover,
              transform: "translateY(-3px)",
              boxShadow: "0 15px 30px rgba(26, 115, 232, 0.6)",
            },
          }}
        >
          Dashboard
        </Button>
      );
    }

    if (isTeacherLoggedIn) {
      return (
        <Button
          variant="contained"
          size="large"
          endIcon={<MeetingRoomIcon />}
          href="/teacher/dashboard-admin"
          sx={{
            borderRadius: DESIGN_CONSTANTS.sizes.button.borderRadius,
            py: DESIGN_CONSTANTS.sizes.button.paddingY,
            px: DESIGN_CONSTANTS.sizes.button.paddingX,
            fontSize: "1.1rem",
            fontWeight: 700,
            background: DESIGN_CONSTANTS.colors.buttonSecondary,
            color: DESIGN_CONSTANTS.colors.white,
            textTransform: "none",
            boxShadow: "0 8px 20px rgba(15, 82, 186, 0.4)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow: "0 15px 30px rgba(15, 82, 186, 0.6)",
            },
          }}
        >
          Dashboard
        </Button>
      );
    }

    return (
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Button
          variant="contained"
          size="large"
          endIcon={<MeetingRoomIcon />}
          href="/student/login"
          sx={{
            borderRadius: DESIGN_CONSTANTS.sizes.button.borderRadius,
            py: DESIGN_CONSTANTS.sizes.button.paddingY,
            px: DESIGN_CONSTANTS.sizes.button.paddingX,
            fontSize: "1.1rem",
            fontWeight: 700,
            minWidth: DESIGN_CONSTANTS.sizes.button.minWidth,
            background: DESIGN_CONSTANTS.colors.buttonPrimary,
            color: DESIGN_CONSTANTS.colors.white,
            textTransform: "none",
            boxShadow: "0 8px 20px rgba(26, 115, 232, 0.4)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: DESIGN_CONSTANTS.colors.buttonPrimaryHover,
              transform: "translateY(-3px)",
              boxShadow: "0 15px 30px rgba(26, 115, 232, 0.6)",
            },
          }}
        >
          Student entry
        </Button>

        <Button
          variant="outlined"
          size="large"
          endIcon={<EditNoteIcon />}
          href="/teacher/login"
          sx={{
            borderRadius: DESIGN_CONSTANTS.sizes.button.borderRadius,
            py: DESIGN_CONSTANTS.sizes.button.paddingY,
            px: DESIGN_CONSTANTS.sizes.button.paddingX,
            fontSize: "1.1rem",
            fontWeight: 700,
            minWidth: DESIGN_CONSTANTS.sizes.button.minWidth,
            borderWidth: 2,
            borderColor: DESIGN_CONSTANTS.colors.mediumBlue,
            color: DESIGN_CONSTANTS.colors.white,
            textTransform: "none",
            backgroundColor: DESIGN_CONSTANTS.colors.buttonOutlined,
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "rgba(33, 150, 243, 0.25)",
              transform: "translateY(-3px)",
              borderColor: DESIGN_CONSTANTS.colors.lightBlue,
              boxShadow: "0 10px 25px rgba(33, 150, 243, 0.5)",
            },
          }}
        >
          teacher entry
        </Button>
      </Stack>
    );
  };

  if (!mounted) return null;

  return (
    <Box
      sx={{
        background: DESIGN_CONSTANTS.colors.primaryGradient,
        color: DESIGN_CONSTANTS.colors.white,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* عناصر خلفية زرقاء متحركة */}
      <Box
        sx={{
          position: "absolute",
          top: -150,
          right: -150,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(33,150,243,0.2) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "float 20s infinite ease-in-out",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -100,
          left: -100,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(100,181,246,0.2) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "float 15s infinite ease-in-out reverse",
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 2,
          py: { xs: 4, md: 0 },
        }}
      >
        <Grid
          container
          spacing={{ xs: 4, md: 0 }}
          alignItems="center"
          sx={{
            minHeight: "calc(100vh - 100px)",
          }}
        >
          {/* الجانب الأيمن - النص والأزرار */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: "flex",
              justifyContent: { md: "flex-end" },
              pr: { md: 4 },
            }}
          >
            <Box
              sx={{
                textAlign: { xs: "center", md: "left" },
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(20px)",
                transition: "all 0.6s ease-out",
                maxWidth: "580px",
                width: "100%",
                ml: { md: 15 },
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "2.5rem", md: "3.2rem", lg: "3.8rem" },
                  lineHeight: 1.2,
                  marginTop: "100px",
                  mb: 2,
                  background:
                    "linear-gradient(135deg, #FFFFFF 0%, #BBDEFB 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 5px 15px rgba(0,0,0,0.3)",
                }}
              >
                Future Institute
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 500,
                  mb: 3,
                  color: DESIGN_CONSTANTS.colors.lightBlue,
                  textShadow: "0 2px 5px rgba(0,0,0,0.2)",
                }}
              >
                Shape your future today
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mb: 4,
                  fontSize: "1.2rem",
                  lineHeight: 1.8,
                  color: DESIGN_CONSTANTS.colors.lightBlue,
                  maxWidth: "550px",
                  mx: { xs: "auto", md: 0 },
                }}
              >
                A comprehensive educational system that connects students and
                teachers in an advanced interactive environment for an
                exceptional learning experience.
              </Typography>

              <Box sx={{ mt: 4, mb: 6 }}>{renderButtons()}</Box>
            </Box>
          </Grid>

          {/* الجانب الأيسر - الشعار */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: "flex",
              justifyContent: { md: "flex-start" },
              pl: { md: 0 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "scale(1)" : "scale(0.9)",
                transition: "all 0.6s ease-out 0.2s",
                position: "relative",
                left: { md: 20 },
                width: "100%",
              }}
            >
              {/* تأثير إضاءة زرقاء خلف الشعار */}
              <Box
                sx={{
                  position: "absolute",
                  width: DESIGN_CONSTANTS.sizes.logo.width + 80,
                  height: DESIGN_CONSTANTS.sizes.logo.height + 80,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(33,150,243,0.4) 0%, transparent 70%)",
                  filter: "blur(40px)",
                  animation: "pulse 3s infinite ease-in-out",
                }}
              />

              {/* إطار الشعار */}
              <Paper
                elevation={24}
                sx={{
                  width: DESIGN_CONSTANTS.sizes.logo.width,
                  height: DESIGN_CONSTANTS.sizes.logo.height,
                  borderRadius: "50%",
                  overflow: "hidden",
                  position: "relative",
                  border: `${DESIGN_CONSTANTS.sizes.logo.border}px solid rgba(255,255,255,0.95)`,
                  boxShadow:
                    "0 25px 50px rgba(0,0,0,0.5), 0 0 0 3px rgba(33,150,243,0.5)",
                  transition: "all 0.4s ease",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    padding: "10px",
                    background:
                      "linear-gradient(145deg, rgba(33,150,243,0.4), transparent)",
                    WebkitMask:
                      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  },
                  "&:hover": {
                    transform: "scale(1.03) rotate(2deg)",
                    boxShadow:
                      "0 35px 70px rgba(0,0,0,0.6), 0 0 0 4px rgba(33,150,243,0.7)",
                  },
                }}
              >
                <Box
                  component="img"
                  src="/logo5.jpeg"
                  alt="Future Institute Logo"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
      `}</style>
    </Box>
  );
}
