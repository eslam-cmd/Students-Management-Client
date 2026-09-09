"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  FiMenu,
  FiX,
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

const API = (
  process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app"
).replace(/\/$/, "");

const Root = styled(Box)({
  display: "flex",
  minHeight: "100vh",
  backgroundColor: "#f9fafb",
});

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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          gap: 2,
          backgroundColor: "#0D8CAB",
        }}
      >
        <Avatar sx={{ bgcolor: "white", color: "#0D8CAB" }}>
          <PersonIcon />
        </Avatar>
        <Box>
          <Typography
            sx={{ color: "#fff" }}
            variant="subtitle1"
            fontWeight={600}
            noWrap
          >
            {student?.name || "Student"}
          </Typography>
          <Typography
            sx={{ color: "rgba(255,255,255,0.8)" }}
            variant="body2"
            noWrap
          >
            {student?.specialization
              ? `${student.specialization} Student`
              : "Student"}
          </Typography>
        </Box>
      </Box>

      <List sx={{ flex: 1, p: 0 }}>
        {tabs.map((tab) => (
          <ListItem key={tab.id} disablePadding>
            <Tooltip title={tab.label} placement="right" arrow>
              <ListItemButton
                selected={activeTab === tab.id}
                onClick={() => onTabClick(tab.id)}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "rgba(13, 140, 171, 0.12)",
                    borderRight: "4px solid #0D8CAB",
                  },
                  "&:hover": {
                    backgroundColor: "rgba(13, 140, 171, 0.08)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: activeTab === tab.id ? "#0D8CAB" : "gray",
                    minWidth: 40,
                  }}
                >
                  {tab.icon}
                </ListItemIcon>
                <ListItemText
                  primary={tab.label}
                  primaryTypographyProps={{
                    noWrap: true,
                    fontWeight: activeTab === tab.id ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}

        <ListItem disablePadding>
          <Tooltip title="Logout" placement="right" arrow>
            <ListItemButton
              onClick={onLogout}
              sx={{
                color: "error.main",
                "&:hover": { backgroundColor: "#fee2e2" },
              }}
            >
              <ListItemIcon sx={{ color: "error.main", minWidth: 40 }}>
                <FiLogOut />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>

      <Box
        sx={{
          mt: 2,
          px: 2,
          py: 1,
          borderTop: 1,
          borderColor: "divider",
          textAlign: "center",
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: "#0D8CAB", fontWeight: 500, fontSize: "0.65rem" }}
        >
          <BrushIcon style={{ fontSize: "10px" }} /> Powered by Islam Hadaya
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
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [quizTab, setQuizTab] = useState(0);
  const [examTab, setExamTab] = useState(0);

  const tabs = [
    { id: "Quizzes", label: "Quizzes", icon: <FiBookOpen /> },
    { id: "Exams", label: "Notes", icon: <FiClipboard /> },
    { id: "Attendance", label: "Attendance", icon: <FiCalendar /> },
  ];

  useEffect(() => {
    if (isDesktop) setDrawerOpen(true);
  }, [isDesktop]);

  // ✅ جلب بيانات حساب الطالب باستخدام HttpOnly Cookie حصراً
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
      // تشخيص دقيق للخطأ
      console.error("Network or Fetch Error:", err.message);

      // عدم إعادة التوجيه الفوري في بيئة التطوير للتمكن من فحص الـ Network Tab
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

  // ✅ تسجيل خروج الطالب بمسار الكوكي
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

  const renderContent = () => {
    switch (activeTab) {
      case "Quizzes":
        return (
          <Box sx={{ width: "100%", marginTop: "30px" }}>
            <Tabs
              value={quizTab}
              onChange={(e, newValue) => setQuizTab(newValue)}
              sx={{
                "& .MuiTab-root": {
                  fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.9rem" },
                  fontWeight: 600,
                  textTransform: "none",
                },
              }}
            >
              <Tab label="Theory Quizzes" />
              <Tab label="Practical Quizzes" />
            </Tabs>
            {/* ✅ إرسال كائن الكويزات المجلوب للفرونت إند */}
            {quizTab === 0 && <ViewQuizzes data={student?.quizzes} />}
            {quizTab === 1 && <ViewPracticalQuiz data={student?.quizzes} />}
          </Box>
        );

      case "Exams":
        return (
          <Box sx={{ width: "100%", marginTop: "30px" }}>
            <Tabs
              value={examTab}
              onChange={(e, newValue) => setExamTab(newValue)}
              sx={{
                "& .MuiTab-root": {
                  fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.9rem" },
                  fontWeight: 600,
                  textTransform: "none",
                },
              }}
            >
              <Tab label="Theory Notes" />
              <Tab label="Practical Notes" />
            </Tabs>
            {/* ✅ إرسال كائن الملاحظات/الامتحانات المجلوب للفرونت إند */}
            {examTab === 0 && <ViewExams data={student?.notes} />}
            {examTab === 1 && <ViewPracticalNotes data={student?.notes} />}
          </Box>
        );

      case "Attendance":
        return (
          <Box sx={{ width: "100%", marginTop: "30px" }}>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                mb: 2,
                fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <FiCalendar style={{ color: "#0D8CAB" }} />
              Attendance Record
            </Typography>
            {/* ✅ إرسال بيانات السجل المجلوبة للفرونت إند */}
            <ViewAttendance data={student?.attendance} />
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#f9fafb",
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: "#0D8CAB" }} />
        <Typography variant="body2" color="text.secondary">
          Verifying session credentials...
        </Typography>
      </Box>
    );
  }

  return (
    <Root>
      <AppBar
        position="fixed"
        sx={{
          width: {
            xs: "100%",
            lg: drawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
          },
          ml: { lg: drawerOpen ? `${DRAWER_WIDTH}px` : 0 },
          backgroundColor: "#0D8CAB",
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
          </Typography>
          <Breadcrumbs
            separator="›"
            sx={{ color: "inherit", display: { xs: "none", sm: "flex" } }}
          >
            <Link
              href="/"
              style={{
                textDecoration: "none",
                fontSize: "16px",
                color: "#FAF0BE",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <HomeIcon /> Back to Home
            </Link>
          </Breadcrumbs>
        </Toolbar>
      </AppBar>

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
              backgroundColor: "#ffffff",
              boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
            },
          }}
        >
          <SidebarContent
            student={student}
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

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          mt: { xs: 8, lg: 8 },
          ml: { lg: drawerOpen ? `${DRAWER_WIDTH}px` : 0 },
          width: {
            xs: "100%",
            lg: drawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
          },
          transition: "all 0.2s ease-in-out",
        }}
      >
        <Paper
          sx={{
            borderRadius: 2,
            boxShadow: 1,
            p: { xs: 1.5, sm: 2.5, md: 3 },
            minHeight: "calc(100vh - 110px)",
            backgroundColor: "#ffffff",
          }}
        >
          {renderContent()}
        </Paper>
      </Box>
    </Root>
  );
}
