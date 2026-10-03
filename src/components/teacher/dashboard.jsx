"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FiUsers,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiBookOpen,
  FiClipboard,
  FiCalendar,
  FiHome,
} from "react-icons/fi";
import {
  AppBar,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  useTheme,
  useMediaQuery,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  alpha,
  Tabs,
  Tab,
  CssBaseline,
  Drawer,
  Tooltip,
  CircularProgress,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";
import AddStudents from "@/components/teacher/sections/Students/addStudents";
import ViewStudents from "@/components/teacher/sections/Students/viewStudents";
import AddQuizzis from "@/components/teacher/sections/quizzestheory/addQuizzes";
import ViewQuizzes from "@/components/teacher/sections/quizzestheory/viewQuizzes";
import AddExams from "@/components/teacher/sections/examstheory/addExams";
import ViewExams from "@/components/teacher/sections/examstheory/viewExams";
import AddAttendance from "@/components/teacher/sections/attendance/addAttendance";
import ViewAttendance from "@/components/teacher/sections/attendance/viewAttendance";
import TeacherProfileCard from "@/components/teacher/sections/setting/teacherProfile";
import AddPracticalNotes from "@/components/teacher/sections/practicalNotes/addPracticalNotes";
import ViewPracticalNotes from "@/components/teacher/sections/practicalNotes/viewPracticalNotes";
import AddPracticalQuiz from "@/components/teacher/sections/practicalQuiz/addPracticalQuiz";
import ViewPracticalQuiz from "@/components/teacher/sections/practicalQuiz/viewPracticalQuiz";
import BrushIcon from "@mui/icons-material/Brush";

/* ==================== Constants ==================== */

const SIDEBAR_WIDTH = 260;
const SIDEBAR_WIDTH_COLLAPSED = 72;

// Primary blue color
const PRIMARY = "#1e40af";
const PRIMARY_LIGHT = "#eff6ff";
const BORDER = "#e5e7eb";
const TEXT_PRIMARY = "#111827";
const TEXT_SECONDARY = "#6b7280";
const BG = "#f9fafb";

/* ==================== Styled Components ==================== */

const DashboardContainer = styled(Box)({
  display: "flex",
  minHeight: "100vh",
  backgroundColor: BG,
});

const Sidebar = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "collapsed",
})(({ theme, collapsed }) => ({
  width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH,
  height: "100vh",
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: theme.zIndex.drawer + 1,
  borderRadius: 0,
  border: "none",
  borderRight: `1px solid ${BORDER}`,
  boxShadow: "none",
  backgroundColor: "#ffffff",
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: 200,
  }),
  overflowX: "hidden",
  display: "flex",
  flexDirection: "column",
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const MobileDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    width: SIDEBAR_WIDTH,
    boxSizing: "border-box",
    border: "none",
    borderRight: `1px solid ${BORDER}`,
    boxShadow: "none",
  },
  [theme.breakpoints.up("md")]: {
    display: "none",
  },
}));

const MainContent = styled(Box, {
  shouldForwardProp: (prop) => prop !== "sidebarCollapsed",
})(({ theme, sidebarCollapsed }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: 200,
  }),
  marginLeft: sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH,
  width: `calc(100% - ${sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH}px)`,
  [theme.breakpoints.down("md")]: {
    marginLeft: 0,
    width: "100%",
  },
}));

const NavButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== "active",
})(({ active }) => ({
  borderRadius: 6,
  margin: "2px 8px",
  padding: "10px 12px",
  backgroundColor: active ? PRIMARY_LIGHT : "transparent",
  color: active ? PRIMARY : TEXT_SECONDARY,
  fontWeight: active ? 600 : 500,
  fontSize: "0.875rem",
  transition: "background-color 0.15s ease, color 0.15s ease",
  "&:hover": {
    backgroundColor: active ? PRIMARY_LIGHT : "#f3f4f6",
    color: active ? PRIMARY : TEXT_PRIMARY,
  },
  justifyContent: "flex-start",
  minHeight: 42,
}));

const ToggleSidebarButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: 76,
  right: -14,
  width: 28,
  height: 28,
  backgroundColor: "#ffffff",
  border: `1px solid ${BORDER}`,
  color: TEXT_SECONDARY,
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  zIndex: theme.zIndex.drawer - 1,
  transition: "all 0.15s ease",
  "&:hover": {
    backgroundColor: "#f9fafb",
    color: PRIMARY,
    borderColor: PRIMARY,
  },
  "& svg": {
    fontSize: "0.95rem",
  },
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "sidebarCollapsed",
})(({ theme, sidebarCollapsed }) => ({
  zIndex: theme.zIndex.drawer + 2,
  width: `calc(100% - ${sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH}px)`,
  marginLeft: sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH,
  backgroundColor: "#ffffff",
  borderBottom: `1px solid ${BORDER}`,
  boxShadow: "none",
  color: TEXT_PRIMARY,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: 200,
  }),
  [theme.breakpoints.down("md")]: {
    width: "100%",
    marginLeft: 0,
  },
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  borderRadius: "8px !important",
  border: `1px solid ${BORDER}`,
  boxShadow: "none",
  marginBottom: theme.spacing(1.5),
  overflow: "hidden",
  "&:before": { display: "none" },
  "&.Mui-expanded": {
    margin: `${theme.spacing(1.5)} 0`,
    borderColor: "#bfdbfe",
  },
  "& .MuiAccordionSummary-root": {
    padding: theme.spacing(0.5, 2),
    minHeight: 52,
    "&:hover": {
      backgroundColor: "#fafbfc",
    },
  },
  "& .MuiAccordionDetails-root": {
    padding: theme.spacing(2),
    backgroundColor: "#ffffff",
    borderTop: `1px solid ${BORDER}`,
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: 44,
  borderBottom: `1px solid ${BORDER}`,
  marginBottom: theme.spacing(2),
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

const ContentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  border: `1px solid ${BORDER}`,
  boxShadow: "none",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const API = (
  process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app"
).replace(/\/$/, "");

/* ==================== Main Component ==================== */

export default function DashboardAdmin() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("Students");
  const [teacher, setTeacher] = useState(null);
  const [quizTab, setQuizTab] = useState(0);
  const [examTab, setExamTab] = useState(0);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  /* ============ Auth ============ */
  const verifyTeacher = useCallback(async () => {
    const controller = new AbortController();

    try {
      const res = await fetch(`${API}/api/teacher/me`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
        credentials: "include",
        signal: controller.signal,
      });

      if (res.status === 401 || res.status === 403) {
        setTeacher(null);
        window.location.href = "/teacher/login";
        return;
      }

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      setTeacher(data);
    } catch (err) {
      if (err.name === "AbortError") {
        console.error("⏱️ Server connection timeout");
      } else {
        console.error("Error verifying session:", err);
      }
      window.location.href = "/teacher/login";
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    verifyTeacher();
  }, [verifyTeacher]);

  useEffect(() => {
    if (isMobile) setSidebarCollapsed(false);
  }, [isMobile]);

  /* ============ Tabs ============ */
  const tabs = [
    { id: "Students", label: "Students", icon: <FiUsers size={18} /> },
    { id: "Quizzes", label: "Quizzes", icon: <FiBookOpen size={18} /> },
    { id: "Exams", label: "Notes", icon: <FiClipboard size={18} /> },
    { id: "Attendance", label: "Attendance", icon: <FiCalendar size={18} /> },
    { id: "Settings", label: "Settings", icon: <FiSettings size={18} /> },
  ];

  /* ============ Logout ============ */
  const handleLogout = async () => {
    try {
      setCheckingAuth(true);
      await fetch(`${API}/api/teacher/logout`, {
        method: "POST",
        headers: { "Cache-Control": "no-cache" },
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      setTeacher(null);
      window.location.href = "/teacher/login";
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (isMobile) setMobileOpen(false);
  };

  /* ============ Content ============ */
  const renderContent = () => {
    switch (activeTab) {
      case "Students":
        return (
          <>
            <StyledAccordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Add Student
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <AddStudents />
              </AccordionDetails>
            </StyledAccordion>

            <StyledAccordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" fontWeight={600}>
                  View Students
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ViewStudents />
              </AccordionDetails>
            </StyledAccordion>
          </>
        );

      case "Quizzes":
        return (
          <Box sx={{ width: "100%" }}>
            <StyledTabs
              value={quizTab}
              onChange={(e, v) => setQuizTab(v)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Add Theory Quiz" />
              <Tab label="Add Practical Quiz" />
              <Tab label="View Theory Quizzes" />
              <Tab label="View Practical Quizzes" />
            </StyledTabs>
            {quizTab === 0 && <AddQuizzis />}
            {quizTab === 1 && <AddPracticalQuiz />}
            {quizTab === 2 && <ViewQuizzes />}
            {quizTab === 3 && <ViewPracticalQuiz />}
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
              <Tab label="Add Theory Note" />
              <Tab label="Add Practical Note" />
              <Tab label="View Theory Notes" />
              <Tab label="View Practical Notes" />
            </StyledTabs>
            {examTab === 0 && <AddExams />}
            {examTab === 1 && <AddPracticalNotes />}
            {examTab === 2 && <ViewExams />}
            {examTab === 3 && <ViewPracticalNotes />}
          </Box>
        );

      case "Attendance":
        return (
          <>
            <StyledAccordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Add Attendance
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <AddAttendance />
              </AccordionDetails>
            </StyledAccordion>

            <StyledAccordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" fontWeight={600}>
                  View Attendance
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ViewAttendance />
              </AccordionDetails>
            </StyledAccordion>
          </>
        );

      case "Settings":
        return <TeacherProfileCard />;

      default:
        return null;
    }
  };

  /* ============ Loading ============ */
  if (checkingAuth) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          gap: 2,
          backgroundColor: BG,
        }}
      >
        <CircularProgress size={40} sx={{ color: PRIMARY }} />
        <Typography variant="body2" color="text.secondary">
          Verifying session...
        </Typography>
      </Box>
    );
  }

  /* ============ Drawer Content ============ */
  const drawerContent = (
    <>
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
        {(!sidebarCollapsed || isMobile) && (
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
              Teacher Portal
            </Typography>
          </Box>
        )}
      </Box>

      {/* User info */}
      {(!sidebarCollapsed || isMobile) && teacher && (
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
            {(teacher?.name?.[0] || "T").toUpperCase()}
          </Avatar>
          <Box sx={{ overflow: "hidden", flex: 1 }}>
            <Typography
              fontWeight={600}
              fontSize="0.85rem"
              color={TEXT_PRIMARY}
              noWrap
            >
              {teacher?.name || "Teacher"}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ fontSize: "0.72rem" }}
            >
              {teacher?.email || "Teacher Account"}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1, pt: 1 }}>
        {(!sidebarCollapsed || isMobile) && (
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
        )}
        {tabs.map((tab) => (
          <ListItem key={tab.id} disablePadding sx={{ display: "block" }}>
            <Tooltip
              title={sidebarCollapsed && !isMobile ? tab.label : ""}
              placement="right"
              arrow
            >
              <NavButton
                active={activeTab === tab.id}
                onClick={() => handleTabChange(tab.id)}
                sx={{
                  justifyContent:
                    sidebarCollapsed && !isMobile ? "center" : "flex-start",
                  px: sidebarCollapsed && !isMobile ? 0 : 1.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: "auto",
                    mr: sidebarCollapsed && !isMobile ? 0 : 1.5,
                    justifyContent: "center",
                    color: "inherit",
                  }}
                >
                  {tab.icon}
                </ListItemIcon>
                {(!sidebarCollapsed || isMobile) && (
                  <ListItemText
                    primary={tab.label}
                    primaryTypographyProps={{
                      fontSize: "0.875rem",
                      fontWeight: activeTab === tab.id ? 600 : 500,
                    }}
                  />
                )}
              </NavButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      {/* Bottom */}
      <Box sx={{ px: 1, pb: 1.5 }}>
        {(!sidebarCollapsed || isMobile) && (
          <Divider sx={{ mx: 1, mb: 1 }} />
        )}

        <ListItem disablePadding sx={{ display: "block" }}>
          <Tooltip
            title={sidebarCollapsed && !isMobile ? "Back to Home" : ""}
            placement="right"
            arrow
          >
            <NavButton
              onClick={() => router.push("/")}
              sx={{
                justifyContent:
                  sidebarCollapsed && !isMobile ? "center" : "flex-start",
                px: sidebarCollapsed && !isMobile ? 0 : 1.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: "auto",
                  mr: sidebarCollapsed && !isMobile ? 0 : 1.5,
                  justifyContent: "center",
                  color: "inherit",
                }}
              >
                <FiHome size={18} />
              </ListItemIcon>
              {(!sidebarCollapsed || isMobile) && (
                <ListItemText
                  primary="Back to Home"
                  primaryTypographyProps={{ fontSize: "0.875rem" }}
                />
              )}
            </NavButton>
          </Tooltip>
        </ListItem>

        <ListItem disablePadding sx={{ display: "block" }}>
          <Tooltip
            title={sidebarCollapsed && !isMobile ? "Logout" : ""}
            placement="right"
            arrow
          >
            <NavButton
              onClick={handleLogout}
              sx={{
                justifyContent:
                  sidebarCollapsed && !isMobile ? "center" : "flex-start",
                px: sidebarCollapsed && !isMobile ? 0 : 1.5,
                color: "#dc2626",
                "&:hover": {
                  backgroundColor: "#fef2f2",
                  color: "#dc2626",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: "auto",
                  mr: sidebarCollapsed && !isMobile ? 0 : 1.5,
                  justifyContent: "center",
                  color: "inherit",
                }}
              >
                <FiLogOut size={18} />
              </ListItemIcon>
              {(!sidebarCollapsed || isMobile) && (
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{ fontSize: "0.875rem" }}
                />
              )}
            </NavButton>
          </Tooltip>
        </ListItem>

        {(!sidebarCollapsed || isMobile) && (
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
        )}
      </Box>
    </>
  );

  /* ============ Main Render ============ */
  return (
    <DashboardContainer>
      <CssBaseline />

      {/* AppBar */}
      <StyledAppBar
        position="fixed"
        elevation={0}
        sidebarCollapsed={sidebarCollapsed}
      >
        <Toolbar sx={{ minHeight: "60px !important", px: { xs: 2, md: 3 } }}>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{
              mr: 1.5,
              display: { md: "none" },
              color: TEXT_PRIMARY,
            }}
          >
            <FiMenu />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
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

          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: PRIMARY_LIGHT,
              color: PRIMARY,
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            {(teacher?.name?.[0] || "T").toUpperCase()}
          </Avatar>
        </Toolbar>
      </StyledAppBar>

      {/* Desktop Sidebar */}
      <Sidebar collapsed={sidebarCollapsed}>
        {drawerContent}
        {!isMobile && (
          <ToggleSidebarButton
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            size="small"
          >
            {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </ToggleSidebarButton>
        )}
      </Sidebar>

      {/* Mobile Drawer */}
      <MobileDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
      >
        {drawerContent}
      </MobileDrawer>

      {/* Main Content */}
      <MainContent sidebarCollapsed={sidebarCollapsed}>
        <Toolbar sx={{ minHeight: "60px !important" }} />
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: { xs: 1.5, sm: 2, md: 2.5 },
          }}
        >
          <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
            <ContentPaper>{renderContent()}</ContentPaper>
          </Box>
        </Box>
      </MainContent>
    </DashboardContainer>
  );
}