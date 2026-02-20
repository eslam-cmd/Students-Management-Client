"use client";
import React, { useState, useEffect } from "react";
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
  Breadcrumbs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  alpha,
  Tabs,
  Tab,
  CssBaseline,
  Drawer,
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
// مكونات الصفحات (يجب استيرادها بشكل صحيح)

import BrushIcon from "@mui/icons-material/Brush";
import Header from "../Ultimit/header";

const SIDEBAR_WIDTH = 280;
const SIDEBAR_WIDTH_COLLAPSED = 70;

const DashboardContainer = styled(Box)({
  display: "flex",
  minHeight: "100vh",
  backgroundColor: "#f9fafb",
  overflowX: "hidden",
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
    display: "none", // إخفاء الشريط الجانبي على الهواتف
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

const ContentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
    borderRadius: 8,
  },
}));

export default function DashboardAdmin() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("Students");
  const [name, setName] = useState("");
  const [quizTab, setQuizTab] = useState(0);
  const [examTab, setExamTab] = useState(0);
  const router = useRouter();
  useEffect(() => {
    const teacherId = localStorage.getItem("teacherId");
    if (!teacherId) {
      router.push("/teacher/login");
    }
  }, []);

  useEffect(() => {
    const storedName = localStorage.getItem("teacherName");
    if (storedName) {
      setName(storedName);
    }
  }, []);
  useEffect(() => {
    fetch("https://manager-students-server.vercel.app/api/teacher/me", {})
      .then((res) => res.json())
      .then((data) => {
        if (data.name) setName(data.name);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(false);
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const tabs = [
    { id: "Students", label: "Students", icon: <FiUsers /> },
    { id: "Quizzes", label: "Quizzes", icon: <FiBookOpen /> },
    { id: "Exams", label: "Notes", icon: <FiClipboard /> },
    { id: "Attendance", label: "Attendance", icon: <FiCalendar /> },
    { id: "Settings", label: "Settings", icon: <FiSettings /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("studentId");
    localStorage.removeItem("studentName");
    localStorage.removeItem("studentSpecialization");
    localStorage.removeItem("teacherId");
    localStorage.removeItem("teacherName");

    window.location.href = "/";
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
                  Add Students
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
              sx={{
                overflowX: "auto",
                "& .MuiTabs-flexContainer": { flexWrap: "nowrap" },
              }}
            >
              <Tab label="Add a theoretical exam" />
              <Tab label="Add a practical test" />
              <Tab label="Presentation of theoretical tests" />
              <Tab label="Presentation of practical tests" />
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
              sx={{
                overflowX: "auto",
                "& .MuiTabs-flexContainer": { flexWrap: "nowrap" },
              }}
            >
              <Tab label="Adding theoretical study" />
              <Tab label="Adding practical study" />
              <Tab label="Presentation of theoretical notes" />
              <Tab label="Presentation of practical notes" />
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

  const drawerContent = (
    <>
      {/* Profile Section */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: ` 1px solid ${theme.palette.divider}`,
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
              {name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              System Administrator
            </Typography>
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1 }}>
        {tabs.map((tab) => (
          <ListItem key={tab.id} disablePadding sx={{ display: "block" }}>
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
          </ListItem>
        ))}
      </List>

      {/* Logout */}
      <ListItem disablePadding sx={{ display: "block", mb: 2, mt: "auto" }}>
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
          {(!sidebarCollapsed || isMobile) && <ListItemText primary="Logout" />}
        </NavButton>
      </ListItem>

      {/* Footer */}
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
            <BrushIcon style={{ fontSize: "10px" }} /> The website was
            programmed by Islam Hadaya.
          </Typography>
        </Box>
      )}
    </>
  );

  return (
    <DashboardContainer>
      <CssBaseline />
      {/* Mobile AppBar */}
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
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <FiMenu />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            {tabs.find((t) => t.id === activeTab)?.label || "Control Panel"}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar for desktop */}
      <Sidebar collapsed={sidebarCollapsed}>
        {drawerContent}

        {/* Toggle Sidebar Button (desktop only) */}
        {!isMobile && (
          <ToggleSidebarButton onClick={handleSidebarToggle} size="small">
            {sidebarCollapsed ? (
              <FiChevronRight style={{ zIndex: "9999" }} />
            ) : (
              <FiChevronLeft style={{ zIndex: "9999" }} />
            )}
          </ToggleSidebarButton>
        )}
      </Sidebar>

      {/* Mobile drawer */}
      <MobileDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: SIDEBAR_WIDTH,
            boxShadow: theme.shadows[16],
            top: { xs: 56, sm: 64 }, // إزاحة للأسفل حسب حجم الشاشة
            height: "100%", // حتى لا يغطي الشاشة بالكامل إذا ما بدك
          },
        }}
      >
        {drawerContent}
      </MobileDrawer>

      {/* Main Content */}
      <MainContent sidebarCollapsed={sidebarCollapsed}>
        <Toolbar /> {/* Spacer for AppBar */}
        {/* Content Area */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: { xs: 1, sm: 2, md: 3 },
          }}
        >
          <Box
            sx={{
              maxWidth: 1200,
              mx: "auto",
              width: "100%",
            }}
          >
            <ContentPaper>{renderContent()}</ContentPaper>
          </Box>
        </Box>
      </MainContent>
    </DashboardContainer>
  );
}
