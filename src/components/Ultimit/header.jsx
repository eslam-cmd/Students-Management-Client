"use client";
import { useState, useEffect } from "react";
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
  Chip,
} from "@mui/material";
import { Menu as MenuIcon, PersonOutline, School as SchoolIcon } from "@mui/icons-material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";

const navItems = [
  { label: "About us", href: "/", icon: InfoIcon },
];

const whatsappNumbers = [
  { label:  "Pro Eslam hadaya", number: "+963932642429" },
];

// ثوابت الألوان من الصفحة الرئيسية
const COLORS = {
  primaryGradient: "linear-gradient(145deg, #0B4F6C 0%, #145C9E 50%, #1B3B6F 100%)",
  buttonPrimary: "linear-gradient(90deg, #1A73E8 0%, #4285F4 100%)",
  lightBlue: "#E3F2FD",
  mediumBlue: "#90CAF9",
  white: "#ffffff",
  glassBackground: "rgba(255, 255, 255, 0.1)",
  glassBorder: "rgba(255, 255, 255, 0.2)",
};

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);

  useEffect(() => {
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
        elevation={scrolled ? 8 : 0}
        sx={{
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1000,
          background: scrolled 
            ? COLORS.primaryGradient 
            : "rgba(11, 79, 108, 0.9)",
          backdropFilter: "blur(12px) saturate(180%)",
          color: COLORS.white,
          borderBottom: scrolled ? "none" : `1px solid ${COLORS.glassBorder}`,
          transition: "all 0.3s ease",
          boxShadow: scrolled ? "0 4px 30px rgba(0, 0, 0, 0.3)" : "none",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
            {/* شعار المعهد */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                src="/logo5.jpeg"
                alt="Future Institute"
                sx={{
                  width: { xs: 40, md: 45 },
                  height: { xs: 40, md: 45 },
                  border: `2px solid ${COLORS.mediumBlue}`,
                  boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                }}
              />
              <Typography
                variant="h6"
                component={Link}
                href="/"
                sx={{
                  textDecoration: "none",
                  color: COLORS.white,
                  fontWeight: 700,
                  fontSize: { xs: "1rem", md: "1.2rem" },
                  background: "linear-gradient(135deg, #FFFFFF 0%, #BBDEFB 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: { xs: "none", sm: "block" },
                }}
              >
                Future Institute
              </Typography>
            </Box>

            {/* قائمة التنقل الرئيسية - سطح المكتب */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.label}
                    component={Link}
                    href={item.href}
                    startIcon={<Icon sx={{ fontSize: 20 }} />}
                    sx={{
                      color: COLORS.white,
                      fontSize: { lg: "1rem", md: "0.95rem" },
                      fontWeight: 500,
                      textTransform: "none",
                      borderRadius: 3,
                      px: 2,
                      py: 1,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: COLORS.glassBackground,
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}

              {/* زر اتصل بنا */}
              <Button
                onClick={() => setOpenModal(true)}
                startIcon={<ContactPhoneIcon />}
                sx={{
                  color: COLORS.white,
                  fontSize: { lg: "1rem", md: "0.95rem" },
                  fontWeight: 500,
                  textTransform: "none",
                  borderRadius: 3,
                  px: 2,
                  py: 1,
                  backgroundColor: "rgba(37, 211, 102, 0.15)",
                  border: "1px solid rgba(37, 211, 102, 0.3)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(37, 211, 102, 0.25)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 20px rgba(37, 211, 102, 0.3)",
                  },
                }}
              >
                Contact Us
              </Button>
            </Box>

            {/* أيقونة الحساب أو زر دخول الطالب */}
            <Stack direction="row" spacing={1} alignItems="center">
              {isStudentLoggedIn || isTeacherLoggedIn ? (
                <IconButton
                  color="inherit"
                  component={Link}
                  href={
                    isStudentLoggedIn
                      ? "/student/my-account"
                      : "/teacher/dashboard-admin"
                  }
                  sx={{
                    backgroundColor: COLORS.glassBackground,
                    border: `1px solid ${COLORS.glassBorder}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.2)",
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <PersonOutline />
                </IconButton>
              ) : (
                <Button
                  variant="contained"
                  component={Link}
                  href="/student/login"
                  startIcon={<SchoolIcon />}
                  sx={{
                    background: COLORS.buttonPrimary,
                    borderRadius: 3,
                    color: COLORS.white,
                    fontSize: { lg: "0.95rem", md: "0.9rem", xs: "0.85rem" },
                    fontWeight: 600,
                    textTransform: "none",
                    px: 3,
                    py: 1,
                    boxShadow: "0 8px 20px rgba(26, 115, 232, 0.4)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "linear-gradient(90deg, #1669D9 0%, #3B78E7 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 15px 30px rgba(26, 115, 232, 0.6)",
                    },
                  }}
                >
                  دخول الطلاب
                </Button>
              )}

              {/* زر القائمة للموبايل */}
              <IconButton
                onClick={() => setOpenDrawer(true)}
                sx={{
                  display: { xs: "inline-flex", md: "none" },
                  color: COLORS.white,
                  backgroundColor: COLORS.glassBackground,
                  border: `1px solid ${COLORS.glassBorder}`,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.2)",
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* مودال واتساب */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: COLORS.primaryGradient,
            color: COLORS.white,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold", pt: 3 }}>
          <Avatar
            sx={{
              bgcolor: "#25D366",
              width: 60,
              height: 60,
              margin: "0 auto 16px",
              boxShadow: "0 8px 20px rgba(37, 211, 102, 0.4)",
            }}
          >
            <WhatsAppIcon sx={{ fontSize: 35 }} />
          </Avatar>
          <Typography fontWeight={700} fontSize="1.5rem">
            تواصل معنا عبر واتساب
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.lightBlue, mt: 1 }}>
            اختر الشخص المناسب للتواصل
          </Typography>
        </DialogTitle>

        <Divider sx={{ mx: 4, my: 1, borderColor: COLORS.glassBorder }} />

        <DialogContent sx={{ pb: 3 }}>
          <List>
            {whatsappNumbers.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  onClick={() => openWhatsApp(item.number)}
                  sx={{
                    borderRadius: 3,
                    mb: 1.5,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                    border: `1px solid ${COLORS.glassBorder}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(37, 211, 102, 0.2)",
                      transform: "translateX(-5px)",
                      borderColor: "#25D366",
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
                      <Typography variant="subtitle1" fontWeight={600} color={COLORS.white}>
                        {item.label}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: COLORS.mediumBlue }}>
                        {item.number}
                      </Typography>
                    }
                    sx={{ textAlign: "right" }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Drawer للقائمة الجانبية في الموبايل */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: COLORS.primaryGradient,
            color: COLORS.white,
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 20,
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Avatar
              src="/logo5.jpeg"
              alt="Future Institute"
              sx={{
                width: 50,
                height: 50,
                border: `2px solid ${COLORS.mediumBlue}`,
              }}
            />
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                background: "linear-gradient(135deg, #FFFFFF 0%, #BBDEFB 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Future Institute
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 2, borderColor: COLORS.glassBorder }} />
          
          <List>
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    onClick={() => setOpenDrawer(false)}
                    sx={{
                      borderRadius: 3,
                      mb: 1,
                      "&:hover": {
                        backgroundColor: COLORS.glassBackground,
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: COLORS.mediumBlue, minWidth: 40 }}>
                      <Icon />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      sx={{
                        textAlign: "right",
                        "& .MuiListItemText-primary": {
                          fontWeight: 500,
                          color: COLORS.white,
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
            
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  setOpenDrawer(false);
                  setOpenModal(true);
                }}
                sx={{
                  borderRadius: 3,
                  mb: 1,
                  backgroundColor: "rgba(37, 211, 102, 0.15)",
                  border: `1px solid rgba(37, 211, 102, 0.3)`,
                  "&:hover": {
                    backgroundColor: "rgba(37, 211, 102, 0.25)",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#25D366", minWidth: 40 }}>
                  <WhatsAppIcon />
                </ListItemIcon>
                <ListItemText
                  primary="اتصل بنا"
                  sx={{
                    textAlign: "right",
                    "& .MuiListItemText-primary": {
                      fontWeight: 600,
                      color: COLORS.white,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>

          {!isStudentLoggedIn && !isTeacherLoggedIn && (
            <Box sx={{ mt: 3 }}>
              <Button
                fullWidth
                variant="contained"
                component={Link}
                href="/student/login"
                startIcon={<SchoolIcon />}
                onClick={() => setOpenDrawer(false)}
                sx={{
                  background: COLORS.buttonPrimary,
                  borderRadius: 3,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "0 8px 20px rgba(26, 115, 232, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(90deg, #1669D9 0%, #3B78E7 100%)",
                  },
                }}
              >
                دخول الطلاب
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default Header;