"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  AccordionSummary,
} from "@mui/material";
import {
  FiMenu,
  FiX,
  FiHome,
  FiCalendar,
  FiBookOpen,
  FiClipboard,
  FiLogOut,
} from "react-icons/fi";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import ViewQuizzes from "./sections/quizzes/viewQuizzes";
import ViewPracticalQuiz from "./sections/practicalQuiz/ViewPracticalQuiz";
import ViewExams from "./sections/exams/viewExams";
import ViewPracticalNotes from "./sections/practicalNotes/ViewPracticalNotes";
import ViewAttendance from "./sections/attendance/viewAttendance";
import Link from "next/link";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import BrushIcon from "@mui/icons-material/Brush";

const DRAWER_WIDTH = 280;

const Root = styled(Box)({
  display: "flex",
  minHeight: "100vh",
  backgroundColor: "#f9fafb",
});

const SidebarContent = ({ tabs, activeTab, onTabClick, onLogout }) => {
  const name = localStorage.getItem("studentName");
  const spec = localStorage.getItem("studentSpecialization");

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Profile */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          gap: 2,
          backgroundColor: "#0D8CAB",
        }}
      >
        <Avatar sx={{ bgcolor: "white", color: "primary.main" }}>
          <PersonIcon />
        </Avatar>
        <Box>
          <Typography
            sx={{ color: "#fff" }}
            variant="subtitle1"
            fontWeight={600}
            noWrap
          >
            {name}
          </Typography>
          <Typography sx={{ color: "#fff" }} variant="body2" noWrap>
            Specialization {spec}
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, p: 0 }}>
        {tabs.map((tab) => (
          <ListItem key={tab.id} disablePadding>
            <ListItemButton
              selected={activeTab === tab.id}
              onClick={() => onTabClick(tab.id)}
            >
              <ListItemIcon
                sx={{ color: activeTab === tab.id ? "primary.main" : "gray" }}
              >
                {tab.icon}
              </ListItemIcon>
              <ListItemText
                primary={tab.label}
                primaryTypographyProps={{ noWrap: true }}
              />
            </ListItemButton>
          </ListItem>
        ))}

        {/* Logout */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={onLogout}
            sx={{
              color: "error.main",
              "&:hover": { backgroundColor: "#fee2e2" },
            }}
          >
            <ListItemIcon sx={{ color: "error.main" }}>
              <FiLogOut />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Footer */}
      <Box
        sx={{
          mt: 2,
          px: 2,
          py: 1,
          borderTop: 1,
          borderColor: "primary.main",
          textAlign: "center",
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: "primary.main", fontWeight: 500 }}
        >
          <BrushIcon style={{ fontSize: "10px" }} /> The website was programmed
          by Islam Hadaya.
        </Typography>
      </Box>
    </Box>
  );
};

export default function DashboardStudent() {
  const theme = useTheme();
  const router = useRouter();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const [drawerOpen, setDrawerOpen] = useState(() => isDesktop);
  const [activeTab, setActiveTab] = useState("Quizzes");

  // تبويبات داخلية
  const [quizTab, setQuizTab] = useState(0);
  const [examTab, setExamTab] = useState(0);

  const tabs = [
    { id: "Quizzes", label: "Tasks", icon: <FiBookOpen /> },
    { id: "Exams", label: "Notes", icon: <FiClipboard /> },
    { id: "Attendance", label: "Attendance", icon: <FiCalendar /> },
  ];

  useEffect(() => {
    if (isDesktop) {
      setDrawerOpen(true);
    }
  }, [isDesktop]);

  useEffect(() => {
    const id = localStorage.getItem("studentId");
    const name = localStorage.getItem("studentName");
    const spec = localStorage.getItem("studentSpecialization");
    if (!id || !name || !spec) {
      router.replace("/student/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/");
  };

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  // المحتوى
  const renderContent = () => {
    switch (activeTab) {
      case "Quizzes":
        return (
          <Box sx={{ width: "100%", marginTop: "30px" }}>
            <Tabs
              value={quizTab}
              onChange={(e, newValue) => setQuizTab(newValue)}
            >
              <Tab label="Presentation of theoretical tests" />
              <Tab label="Presentation of practical tests" />
            </Tabs>
            {quizTab === 0 && <ViewQuizzes />}
            {quizTab === 1 && <ViewPracticalQuiz />}
          </Box>
        );

      case "Exams":
        return (
          <Box sx={{ width: "100%", marginTop: "30px" }}>
            <Tabs
              value={examTab}
              onChange={(e, newValue) => setExamTab(newValue)}
            >
              <Tab label="Presentation of theoretical notes" />
              <Tab label="Presentation of practical notes" />
            </Tabs>
            {examTab === 0 && <ViewExams />}
            {examTab === 1 && <ViewPracticalNotes />}
          </Box>
        );

      case "Attendance":
        return (
          <>
            <AccordionSummary style={{ marginTop: "30px" }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Inspection display
              </Typography>
            </AccordionSummary>
            <ViewAttendance />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Root>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: {
            xs: "100%",
            lg: drawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
          },
          ml: { lg: drawerOpen ? `${DRAWER_WIDTH}px` : 0 },
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 1, sm: 2 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 1 }}
          >
            {drawerOpen ? <FiX /> : <FiMenu />}
          </IconButton>
          <Typography variant="h6" style={{ color: "#FAF0BE" }} noWrap>
            <AssignmentIndIcon />
            {"  "}
          </Typography>
          <Breadcrumbs
            separator="›"
            sx={{ color: "inherit", display: { xs: "none", sm: "flex" } }}
          >
            <Link
              href="/"
              style={{
                textDecoration: "none",
                fontSize: "20px",
                color: "#FAF0BE",
                fontWeight: "700",
              }}
            >
              <HomeIcon /> Back to Home
            </Link>
          </Breadcrumbs>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component="nav">
        <Drawer
          variant={isDesktop ? "persistent" : "temporary"}
          open={drawerOpen}
          onClose={toggleDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: { xs: "80vw", sm: "60vw", md: DRAWER_WIDTH },
              maxWidth: "100%",
              boxSizing: "border-box",
            },
          }}
        >
          <SidebarContent
            tabs={tabs}
            activeTab={activeTab}
            onTabClick={(id) => {
              setActiveTab(id);
              if (!isDesktop) toggleDrawer();
            }}
            onLogout={handleLogout}
          />
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          mt: { xs: 8, lg: 0 },
          ml: { lg: drawerOpen ? `${DRAWER_WIDTH}px` : 0 },
          width: {
            xs: "100%",
            lg: drawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
          },
        }}
      >
        <Paper
          sx={{
            borderRadius: 2,
            boxShadow: 1,
            p: { xs: 1, sm: 2 },
            minHeight: "calc(100vh - 64px)",
          }}
        >
          {renderContent()}
        </Paper>
      </Box>
    </Root>
  );
}
