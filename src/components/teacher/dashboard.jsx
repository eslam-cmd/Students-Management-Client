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

const SIDEBAR_WIDTH = 280;
const SIDEBAR_WIDTH_COLLAPSED = 72;

const DashboardContainer = styled(Box)({
  display: "flex",
  minHeight: "100vh",
  backgroundColor: "#f9fafb",
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
  boxShadow: theme.shadows[4],
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
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
    boxShadow: theme.shadows[16],
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
    duration: theme.transitions.duration.leavingScreen,
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
})(({ active, theme }) => ({
  borderRadius: 8,
  margin: theme.spacing(0.5, 1),
  backgroundColor: active
    ? alpha(theme.palette.primary.main, 0.1)
    : "transparent",
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  fontWeight: active ? 600 : 400,
  "&:hover": {
    backgroundColor: active
      ? alpha(theme.palette.primary.main, 0.2)
      : alpha(theme.palette.action.hover, 0.5),
  },
  justifyContent: "flex-start",
  minHeight: 48,
}));

const ToggleSidebarButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: 72,
  right: -12,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[4],
  zIndex: theme.zIndex.drawer - 1,
  "&:hover": {
    backgroundColor: theme.palette.background.paper,
  },
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const API = (
  process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app"
).replace(/\/$/, "");

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

  // ✅ التحقق من جلسة المعلم من مساره المخصص
  const verifyTeacher = useCallback(async () => {
    const controller = new AbortController();
    // const timeoutId = setTimeout(() => controller.abort(), 6000);

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

      // clearTimeout(timeoutId);

      if (res.status === 401 || res.status === 403) {
        setTeacher(null);
        window.location.href = "/teacher/login";
        return;
      }

      if (!res.ok) {
        throw new Error(`خطأ من السيرفر: ${res.status}`);
      }

      const data = await res.json();
      setTeacher(data);
    } catch (err) {
      if (err.name === "AbortError") {
        console.error("⏱️ انتهت مهلة الاتصال بالسيرفر");
      } else {
        console.error("خطأ أثناء التحقق من الجلسة:", err);
      }
      window.location.href = "/teacher/login";
    } finally {
      // clearTimeout(timeoutId);
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    verifyTeacher();
  }, [verifyTeacher]);

  useEffect(() => {
    if (isMobile) setSidebarCollapsed(false);
  }, [isMobile]);

  const tabs = [
    { id: "Students", label: "Students", icon: <FiUsers /> },
    { id: "Quizzes", label: "Quizzes", icon: <FiBookOpen /> },
    { id: "Exams", label: "Notes", icon: <FiClipboard /> },
    { id: "Attendance", label: "Attendance", icon: <FiCalendar /> },
    { id: "Settings", label: "Settings", icon: <FiSettings /> },
  ];

  // ✅ تسجيل خروج المعلم من مساره المخصص
  const handleLogout = async () => {
    try {
      setCheckingAuth(true);
      await fetch(`${API}/api/teacher/logout`, {
        method: "POST",
        headers: { "Cache-Control": "no-cache" },
        credentials: "include",
      });
    } catch (error) {
      console.error("خطأ تسجيل الخروج:", error);
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

  const renderContent = () => {
    switch (activeTab) {
      case "Students":
        return (
          <>
            <Accordion defaultExpanded sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Add Student
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <AddStudents />
              </AccordionDetails>
            </Accordion>
            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="bold">
                  View Students
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ViewStudents />
              </AccordionDetails>
            </Accordion>
          </>
        );

      case "Quizzes":
        return (
          <Box sx={{ width: "100%" }}>
            <Tabs
              value={quizTab}
              onChange={(e, newValue) => setQuizTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 2 }}
            >
              <Tab label="Add Theory Quiz" />
              <Tab label="Add Practical Quiz" />
              <Tab label="View Theory Quizzes" />
              <Tab label="View Practical Quizzes" />
            </Tabs>
            {quizTab === 0 && <AddQuizzis />}
            {quizTab === 1 && <AddPracticalQuiz />}
            {quizTab === 2 && <ViewQuizzes />}
            {quizTab === 3 && <ViewPracticalQuiz />}
          </Box>
        );

      case "Exams":
        return (
          <Box sx={{ width: "100%" }}>
            <Tabs
              value={examTab}
              onChange={(e, newValue) => setExamTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 2 }}
            >
              <Tab label="Add Theory Note" />
              <Tab label="Add Practical Note" />
              <Tab label="View Theory Notes" />
              <Tab label="View Practical Notes" />
            </Tabs>
            {examTab === 0 && <AddExams />}
            {examTab === 1 && <AddPracticalNotes />}
            {examTab === 2 && <ViewExams />}
            {examTab === 3 && <ViewPracticalNotes />}
          </Box>
        );

      case "Attendance":
        return (
          <>
            <Accordion defaultExpanded sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Add Attendance
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <AddAttendance />
              </AccordionDetails>
            </Accordion>
            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="bold">
                  View Attendance
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ViewAttendance />
              </AccordionDetails>
            </Accordion>
          </>
        );

      case "Settings":
        return <TeacherProfileCard />;

      default:
        return null;
    }
  };

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
          backgroundColor: "#f9fafb",
        }}
      >
        <CircularProgress size={50} />
        <Typography variant="body1" color="text.secondary" fontWeight={500}>
          Verifying session, please wait...
        </Typography>
      </Box>
    );
  }

  const drawerContent = (
    <>
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2,
          mb: 1,
        }}
      >
        <Avatar
          sx={{
            bgcolor: "primary.main",
            color: "white",
            width: 48,
            height: 48,
          }}
        >
          <FiUsers />
        </Avatar>
        {(!sidebarCollapsed || isMobile) && (
          <Box sx={{ overflow: "hidden" }}>
            <Typography fontWeight={600} noWrap>
              {teacher?.name || "Teacher"}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              Teacher Account
            </Typography>
          </Box>
        )}
      </Box>

      <List sx={{ flex: 1, px: 1 }}>
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
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: "auto",
                    color:
                      activeTab === tab.id ? "primary.main" : "text.secondary",
                    mr: sidebarCollapsed && !isMobile ? 0 : 2,
                    justifyContent: "center",
                  }}
                >
                  {tab.icon}
                </ListItemIcon>
                {(!sidebarCollapsed || isMobile) && (
                  <ListItemText primary={tab.label} />
                )}
              </NavButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      <List sx={{ px: 1, pb: 1 }}>
        <ListItem disablePadding sx={{ display: "block", mb: 1 }}>
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
                color: "text.primary",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: "auto",
                  color: "text.secondary",
                  mr: sidebarCollapsed && !isMobile ? 0 : 2,
                  justifyContent: "center",
                }}
              >
                <FiHome />
              </ListItemIcon>
              {(!sidebarCollapsed || isMobile) && (
                <ListItemText primary="Back to Home" />
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
                color: "error.main",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: "auto",
                  color: "error.main",
                  mr: sidebarCollapsed && !isMobile ? 0 : 2,
                  justifyContent: "center",
                }}
              >
                <FiLogOut />
              </ListItemIcon>
              {(!sidebarCollapsed || isMobile) && (
                <ListItemText primary="Logout" />
              )}
            </NavButton>
          </Tooltip>
        </ListItem>
      </List>

      {(!sidebarCollapsed || isMobile) && (
        <Box
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            p: 2,
            textAlign: "center",
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "primary.main", fontWeight: 500 }}
          >
            <BrushIcon style={{ fontSize: "10px" }} /> Powered by Islam Hadaya
          </Typography>
        </Box>
      )}
    </>
  );

  return (
    <DashboardContainer>
      <CssBaseline />

      <AppBar
        position="fixed"
        color="inherit"
        elevation={1}
        sx={{
          zIndex: theme.zIndex.drawer + 2,
          width: {
            md: `calc(100% - ${sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH}px)`,
          },
          ml: {
            md: sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH,
          },
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <FiMenu />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {tabs.find((t) => t.id === activeTab)?.label || "Dashboard"}
          </Typography>
        </Toolbar>
      </AppBar>

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

      <MobileDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
      >
        {drawerContent}
      </MobileDrawer>

      <MainContent sidebarCollapsed={sidebarCollapsed}>
        <Toolbar />
        <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 1, sm: 2, md: 3 } }}>
          <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
            <Paper sx={{ p: { xs: 1.5, sm: 2, md: 3 }, borderRadius: 2 }}>
              {renderContent()}
            </Paper>
          </Box>
        </Box>
      </MainContent>
    </DashboardContainer>
  );
}
