"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Button,
  IconButton,
  Stack,
  Dialog,
  Typography,
  ListItemIcon,
  Divider,
  Avatar,
  Drawer,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { Menu as MenuIcon, PersonOutline } from "@mui/icons-material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const navItems = [{ label: "About", href: "/about" }];

const whatsappNumbers = [{ label: "Eslam", number: "+9635859136" }];

const API = (
  process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app"
).replace(/\/$/, "");

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);

  // ✅ التحقق الحصري والآمن من الجلسة النشطة عبر الكوكيز فقط
  useEffect(() => {
    let isMounted = true;

    const checkAuthStatus = async () => {
      try {
        // 1. فحص الجلسة الخاصة بالمعلم
        const teacherRes = await fetch(`${API}/api/teacher/me`, {
          method: "GET",
          credentials: "include",
        });

        if (teacherRes.ok) {
          if (isMounted) {
            setIsTeacherLoggedIn(true);
            setIsStudentLoggedIn(false);
          }
          return;
        }

        // 2. فحص الجلسة الخاصة بالطالب
        const studentRes = await fetch(`${API}/api/students/account/me`, {
          method: "GET",
          credentials: "include",
        });

        if (studentRes.ok) {
          if (isMounted) {
            setIsStudentLoggedIn(true);
            setIsTeacherLoggedIn(false);
          }
          return;
        }

        // 3. في حال عدم وجود جلسة نشطة
        if (isMounted) {
          setIsTeacherLoggedIn(false);
          setIsStudentLoggedIn(false);
        }
      } catch (err) {
        console.error("Auth check failed in Header:", err);
        if (isMounted) {
          setIsTeacherLoggedIn(false);
          setIsStudentLoggedIn(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuthStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openWhatsApp = (number) => {
    const url = `https://wa.me/${number.replace(/\D/g, "")}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={scrolled ? 4 : 0}
        sx={{
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1000,
          backgroundColor: "rgba(0, 0, 0, 0.81)",
          backdropFilter: "blur(10px)",
          color: "white",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{ justifyContent: "space-between", direction: "ltr" }}
          >
            {/* Institute Name */}
            <Typography
              component={Link}
              href="/"
              variant="h6"
              sx={{
                textDecoration: "none",
                color: "white",
                fontWeight: 700,
                letterSpacing: 1,
                fontSize: { xs: "1rem", md: "1.25rem", lg: "1.5rem" },
                "&:hover": {
                  color: "#90caf9",
                },
              }}
            >
              EduPlatform
            </Typography>

            <IconButton
              onClick={() => setOpenDrawer(true)}
              sx={{
                display: { xs: "inline-flex", md: "none" },
                color: "white",
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Navigation Menu */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  component={Link}
                  href={item.href}
                  sx={{
                    color: "inherit",
                    fontSize: { lg: "17px", md: "15px", xs: "13px" },
                  }}
                >
                  {item.label}
                </Button>
              ))}

              <Button
                onClick={() => setOpenModal(true)}
                sx={{
                  color: "inherit",
                  fontSize: { lg: "17px", md: "15px", xs: "13px" },
                }}
              >
                Contact Us
              </Button>
            </Box>

            {/* Dynamic Auth Section */}
            <Stack direction="row" spacing={1} alignItems="center">
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : isStudentLoggedIn || isTeacherLoggedIn ? (
                <IconButton
                  color="inherit"
                  component={Link}
                  href={
                    isStudentLoggedIn
                      ? "/student/my-account"
                      : "/teacher/dashboard-admin"
                  }
                >
                  <PersonOutline />
                </IconButton>
              ) : (
                <Button
                  variant="outlined"
                  component={Link}
                  href="/student/login"
                  sx={{
                    borderRadius: 4,
                    color: "white",
                    borderColor: "white",
                    fontSize: { lg: "17px", md: "15px", xs: "13px" },
                  }}
                >
                  Student Login
                </Button>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* WhatsApp Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold", pt: 3 }}>
          <WhatsAppIcon sx={{ fontSize: 40, color: "#25D366", mb: 1 }} />
          <Typography fontWeight={700}>Contact Us on WhatsApp</Typography>
        </DialogTitle>

        <Divider sx={{ mx: 4, my: 1 }} />

        <DialogContent sx={{ pb: 3 }}>
          <List>
            {whatsappNumbers.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  onClick={() => openWhatsApp(item.number)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: "#f5f5f5",
                    "&:hover": {
                      backgroundColor: "#e0f7e9",
                    },
                  }}
                >
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: "#25D366" }}>
                      <WhatsAppIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight={600}>
                        {item.label}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {item.number}
                      </Typography>
                    }
                    sx={{ textAlign: "left" }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      >
        <Box sx={{ width: 250, p: 2, direction: "ltr" }}>
          <Typography variant="h6" fontWeight={700} textAlign="center" mb={2}>
            Menu
          </Typography>
          <Divider />
          <List>
            {navItems.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  onClick={() => setOpenDrawer(false)}
                >
                  <ListItemText
                    primary={item.label}
                    sx={{ textAlign: "left" }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  setOpenDrawer(false);
                  setOpenModal(true);
                }}
              >
                <ListItemText primary="Contact Us" sx={{ textAlign: "left" }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;