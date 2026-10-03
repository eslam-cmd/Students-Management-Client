"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Paper,
  Breadcrumbs,
  useTheme,
  useMediaQuery,
  styled,
  Tabs,
  Tab,
  Tooltip,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  FiMenu,
  FiX,
  FiCalendar,
  FiBookOpen,
  FiClipboard,
  FiLogOut,
  FiHome,
} from "react-icons/fi";
import ViewQuizzes from "./sections/quizzes/viewQuizzes";
import ViewPracticalQuiz from "./sections/practicalQuiz/ViewPracticalQuiz";
import ViewExams from "./sections/exams/viewExams";
import ViewPracticalNotes from "./sections/practicalNotes/ViewPracticalNotes";
import ViewAttendance from "./sections/attendance/viewAttendance";
import Link from "next/link";
import PersonIcon from "@mui/icons-material/Person";
import BrushIcon from "@mui/icons-material/Brush";

/* ==================== Constants ==================== */

const DRAWER_WIDTH = 260;

// Blue palette (professional)
const PRIMARY = "#0D8CAB";
const PRIMARY_LIGHT = "#e6f4f8";
const PRIMARY_HOVER = "#0a7a94";
const BORDER = "#e5e7eb";
const TEXT_PRIMARY = "#111827";
const TEXT_SECONDARY = "#6b7280";
const BG = "#f9fafb";

const API = (
  process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app"
).replace(/\/$/, "");

/* ==================== Styled Components ==================== */

const Root = styled(Box)({
  display: "flex",
  minHeight: "100vh",
  backgroundColor: BG,
});

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "drawerOpen" && prop !== "isDesktop",
})(({ theme, drawerOpen, isDesktop }) => ({
  width: {
    xs: "100%",
    lg: isDesktop && drawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
  },
  ml: {
    lg: isDesktop && drawerOpen ? `${DRAWER_WIDTH}px` : 0,
  },
  backgroundColor: "#ffffff",
  borderBottom: `1px solid ${BORDER}`,
  boxShadow: "none",
  color: TEXT_PRIMARY,
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: 200,
  }),
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    width: DRAWER_WIDTH,
    boxSizing: "border-box",
    border: "none",
    borderRight: `1px solid ${BORDER}`,
    backgroundColor: "#ffffff",
    boxShadow: "none",
  },
  [theme.breakpoints.down("lg")]: {
    "& .MuiDrawer-paper": {
      width: "280px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    },
  },
}));

const MainContent = styled(Box, {
  shouldForwardProp: (prop) => prop !== "drawerOpen" && prop !== "isDesktop",
})(({ theme, drawerOpen, isDesktop }) => ({
  flexGrow: 1,
  marginLeft: {
    lg: isDesktop && drawerOpen ? `${DRAWER_WIDTH}px` : 0,
  },
  width: {
    lg: isDesktop && drawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
  },
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: 200,
  }),
}));

const ContentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  border: `1px solid ${BORDER}`,
  boxShadow: "none",
  minHeight: "calc(100vh - 120px)",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: 44,
  borderBottom: `1px solid ${BORDER}`,
  marginBottom: theme.spacing(3),
  "& .MuiTabs-indicator": {
    backgroundColor: PRIMARY,
    height: 2,
  },
  "& .MuiTab-root": {
    minHeight: 44,
    textTransform: "none",
    fontWeight: 500,
    fontSize: "0.875rem",
    color: TEXT_SECONDARY,
    padding: theme.spacing(0, 2),
    "&:hover": {
      color: PRIMARY,
    },
    "&.Mui-selected": {
      color: PRIMARY,
      fontWeight: 600,
    },
  },
}));

/* ==================== Sidebar Content ==================== */

const SidebarContent = ({ student, tabs, activeTab, onTabClick, onLogout }) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Brand */}
      <Box
        sx={{
          p: 2.5,
          pb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "8px",
            backgroundColor: PRIMARY,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          E
        </Box>
        <Box sx={{ overflow: "hidden" }}>
          <Typography
            fontWeight={700}
            fontSize="0.95rem"
            color={TEXT_PRIMARY}
            noWrap
            lineHeight={1.2}
          >
            EduDash
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ fontSize: "0.7rem" }}
          >
            Student Portal
          </Typography>
        </Box>
      </Box>

      {/* Student Info */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            bgcolor: PRIMARY_LIGHT,
            color: PRIMARY,
            width: 40,
            height: 40,
            fontWeight: 600,
            fontSize: "0.95rem",
          }}
        >
          {student?.name?.[0]?.toUpperCase() || <PersonIcon />}
        </Avatar>
        <Box sx={{ overflow: "hidden", flex: 1 }}>
          <Typography
            fontWeight={600}
            fontSize="0.85rem"
            color={TEXT_PRIMARY}
            noWrap
          >
            {student?.name || "Student"}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ fontSize: "0.72rem" }}
          >
            {student?.specialization
              ? `${student.specialization} Student`
              : "Student Account"}
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1, pt: 1 }}>
        <Typography
          sx={{
            px: 1.5,
            py: 1,
            color: "#9ca3af",
            fontWeight: 600,
            fontSize: "0.68rem",
            letterSpacing: "0.8px",
            textTransform: "uppercase",
          }}
        >
          Menu
        </Typography>
        {tabs.map((tab) => (
          <ListItem key={tab.id} disablePadding sx={{ display: "block" }}>
            <Tooltip title={tab.label} placement="right" arrow>
              <ListItemButton
                selected={activeTab === tab.id}
                onClick={() => onTabClick(tab.id)}
                sx={{
                  borderRadius: 6,
                  margin: "2px 0",
                  padding: "10px 12px",
                  backgroundColor:
                    activeTab === tab.id ? PRIMARY_LIGHT : "transparent",
                  color: activeTab === tab.id ? PRIMARY : TEXT_SECONDARY,
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  fontSize: "0.875rem",
                  minHeight: 42,
                  transition: "background-color 0.15s ease, color 0.15s ease",
                  "&:hover": {
                    backgroundColor:
                      activeTab === tab.id ? PRIMARY_LIGHT : "#f3f4f6",
                    color: activeTab === tab.id ? PRIMARY : TEXT_PRIMARY,
                  },
                  "&.Mui-selected": {
                    backgroundColor: PRIMARY_LIGHT,
                    "&:hover": {
                      backgroundColor: PRIMARY_LIGHT,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: "inherit",
                    minWidth: 32,
                  }}
                >
                  {tab.icon}
                </ListItemIcon>
                <ListItemText
                  primary={tab.label}
                  primaryTypographyProps={{
                    noWrap: true,
                    fontSize: "0.875rem",
                    fontWeight: activeTab === tab.id ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      {/* Bottom Actions */}
      <Box sx={{ px: 1, pb: 1.5 }}>
        <Divider sx={{ mx: 1, mb: 1 }} />

        <ListItem disablePadding sx={{ display: "block" }}>
          <Tooltip title="Back to Home" placement="right" arrow>
            <ListItemButton
              component={Link}
              href="/"
              sx={{
                borderRadius: 6,
                margin: "2px 0",
                padding: "10px 12px",
                color: TEXT_SECONDARY,
                minHeight: 42,
                transition: "background-color 0.15s ease",
                "&:hover": {
                  backgroundColor: "#f3f4f6",
                  color: PRIMARY,
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 32 }}>
                <FiHome size={18} />
              </ListItemIcon>
              <ListItemText
                primary="Back to Home"
                primaryTypographyProps={{ fontSize: "0.875rem" }}
              />
            </ListItemButton>
          </Tooltip>
        </ListItem>

        <ListItem disablePadding sx={{ display: "block" }}>
          <Tooltip title="Logout" placement="right" arrow>
            <ListItemButton
              onClick={onLogout}
              sx={{
                borderRadius: 6,
                margin: "2px 0",
                padding: "10px 12px",
                color: "#dc2626",
                minHeight: 42,
                transition: "background-color 0.15s ease",
                "&:hover": {
                  backgroundColor: "#fef2f2",
                  color: "#dc2626",
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 32 }}>
                <FiLogOut size={18} />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ fontSize: "0.875rem" }}
              />
            </ListItemButton>
          </Tooltip>
        </ListItem>

        <Box sx={{ textAlign: "center", pt: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: "#9ca3af",
              fontSize: "0.68rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
            }}
          >
            <BrushIcon style={{ fontSize: "11px" }} />
            Powered by Islam Hadaya
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

/* ==================== Main Component ==================== */

export default function DashboardStudent() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Quizzes");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [quizTab, setQuizTab] = useState(0);
  const [examTab, setExamTab] = useState(0);

  const tabs = [
    { id: "Quizzes", label: "Quizzes", icon: <FiBookOpen size={18} /> },
    { id: "Exams", label: "Notes", icon: <FiClipboard size={18} /> },
    { id: "Attendance", label: "Attendance", icon: <FiCalendar size={18} /> },
  ];

  // Auto-open drawer on desktop
  useEffect(() => {
    if (isDesktop) setDrawerOpen(true);
    else setDrawerOpen(false);
  }, [isDesktop]);

  /* ============ Fetch Profile ============ */
  const verifyAndFetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/students/account/me`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
        credentials: "include",
      });

      if (res.status === 401 || res.status === 403) {
        setStudent(null);
        window.location.href = "/student/login";
        return;
      }

      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status}`);
      }

      const data = await res.json();
      setStudent(data);
    } catch (err) {
      console.error("Network or Fetch Error:", err.message);

      if (process.env.NODE_ENV === "production") {
        window.location.href = "/student/login";
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyAndFetchProfile();
  }, [verifyAndFetchProfile]);

  /* ============ Logout ============ */
  const handleLogout = async () => {
    try {
      setLoading(true);
      await fetch(`${API}/api/students/account/logout`, {
        method: "POST",
        headers: { "Cache-Control": "no-cache" },
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout execution error:", err);
    } finally {
      setStudent(null);
      window.location.href = "/student/login";
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  const handleTabClick = (id) => {
    setActiveTab(id);
    if (!isDesktop) setDrawerOpen(false);
  };

  /* ============ Content Renderer ============ */
  const renderContent = () => {
    switch (activeTab) {
      case "Quizzes":
        return (
          <Box sx={{ width: "100%" }}>
            <StyledTabs
              value={quizTab}
              onChange={(e, v) => setQuizTab(v)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Theory Quizzes" />
              <Tab label="Practical Quizzes" />
            </StyledTabs>
            {quizTab === 0 && <ViewQuizzes data={student?.quizzes} />}
            {quizTab === 1 && <ViewPracticalQuiz data={student?.quizzes} />}
          </Box>
        );

      case "Exams":
        return (
          <Box sx={{ width: "100%" }}>
            <StyledTabs
              value={examTab}
              onChange={(e, v) => setExamTab(v)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Theory Notes" />
              <Tab label="Practical Notes" />
            </StyledTabs>
            {examTab === 0 && <ViewExams data={student?.notes} />}
            {examTab === 1 && <ViewPracticalNotes data={student?.notes} />}
          </Box>
        );

      case "Attendance":
        return (
          <Box sx={{ width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "8px",
                  backgroundColor: PRIMARY_LIGHT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: PRIMARY,
                }}
              >
                <FiCalendar size={18} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  fontSize="1.05rem"
                  color={TEXT_PRIMARY}
                >
                  Attendance Record
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Your daily attendance history
                </Typography>
              </Box>
            </Box>
            <ViewAttendance data={student?.attendance} />
          </Box>
        );

      default:
        return null;
    }
  };

  /* ============ Loading ============ */
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: BG,
          gap: 2,
        }}
      >
        <CircularProgress size={40} sx={{ color: PRIMARY }} />
        <Typography variant="body2" color="text.secondary">
          Verifying session...
        </Typography>
      </Box>
    );
  }

  /* ============ Main Render ============ */
  return (
    <Root>
      <StyledAppBar
        position="fixed"
        elevation={0}
        drawerOpen={drawerOpen}
        isDesktop={isDesktop}
      >
        <Toolbar
          sx={{ minHeight: "60px !important", px: { xs: 1.5, sm: 2.5 } }}
        >
          <IconButton
            edge="start"
            onClick={toggleDrawer}
            sx={{
              mr: 1.5,
              color: TEXT_PRIMARY,
              width: 38,
              height: 38,
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "#f3f4f6",
              },
            }}
          >
            {drawerOpen && isDesktop ? <FiX /> : <FiMenu />}
          </IconButton>

          <Box
            sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 1 }}
          >
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 600,
                color: TEXT_PRIMARY,
                fontSize: { xs: "0.95rem", md: "1.05rem" },
              }}
            >
              {tabs.find((t) => t.id === activeTab)?.label || "Dashboard"}
            </Typography>
          </Box>

          <Breadcrumbs
            separator="›"
            sx={{
              display: { xs: "none", sm: "flex" },
              "& .MuiBreadcrumbs-separator": {
                color: "#d1d5db",
              },
            }}
          >
            <Link
              href="/"
              style={{
                textDecoration: "none",
                fontSize: "0.8rem",
                color: TEXT_SECONDARY,
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontWeight: 500,
              }}
            >
              <FiHome size={14} />
              Home
            </Link>
          </Breadcrumbs>

          <Avatar
            sx={{
              ml: 2,
              width: 34,
              height: 34,
              bgcolor: PRIMARY_LIGHT,
              color: PRIMARY,
              fontWeight: 600,
              fontSize: "0.85rem",
            }}
          >
            {student?.name?.[0]?.toUpperCase() || <PersonIcon />}
          </Avatar>
        </Toolbar>
      </StyledAppBar>

      <Box component="nav">
        <StyledDrawer
          variant={isDesktop ? "persistent" : "temporary"}
          open={drawerOpen}
          onClose={toggleDrawer}
          ModalProps={{ keepMounted: true }}
        >
          <SidebarContent
            student={student}
            tabs={tabs}
            activeTab={activeTab}
            onTabClick={handleTabClick}
            onLogout={handleLogout}
          />
        </StyledDrawer>
      </Box>

      <MainContent
        component="main"
        drawerOpen={drawerOpen}
        isDesktop={isDesktop}
        sx={{
          p: { xs: 1.5, sm: 2, md: 2.5 },
          mt: "60px",
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
          <ContentPaper>{renderContent()}</ContentPaper>
        </Box>
      </MainContent>
    </Root>
  );
}
