"use client";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  useTheme,
  Avatar,
  colors,
} from "@mui/material";
import {
  Facebook,
  Phone,
  LocationOn,
  Email,
  WhatsApp,
} from "@mui/icons-material";
import { useState } from "react";
import AboutIslam from "../home/aboutislam/aboutIslam";
import SchoolIcon from "@mui/icons-material/School";

// ثوابت الألوان من الصفحة الرئيسية
const COLORS = {
  primaryGradient:
    "linear-gradient(145deg, #0B4F6C 0%, #145C9E 50%, #1B3B6F 100%)",
  lightBlue: "#E3F2FD",
  mediumBlue: "#90CAF9",
  white: "#ffffff",
  borderLight: "rgba(255, 255, 255, 0.1)",
};

const Footer = () => {
  const theme = useTheme();
  const [openModal, setOpenModal] = useState(false);

  return (
    <Box
      component="footer"
      sx={{
        background: COLORS.primaryGradient,
        pt: 6,
        pb: 3,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* معلومات المعهد */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
            >
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
                sx={{
                  fontWeight: 700,
                  background:
                    "linear-gradient(135deg, #FFFFFF 0%, #BBDEFB 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Future Institute
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: COLORS.lightBlue, lineHeight: 1.8 }}
            >
              We offer the best educational programs to develop a digitally
              skilled generation using the latest curricula and the best
              trainers.
            </Typography>
          </Grid>

          {/* روابط سريعة - بسيطة */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 2, color: COLORS.white }}
            >
              Quick links
            </Typography>
            <Grid container spacing={1}>
              {["Home", "About the institute", "Courses", "Contact us"].map(
                (item, index) => (
                  <Grid item xs={6} key={index}>
                    <Link
                      href="/"
                      sx={{
                        color: COLORS.lightBlue,
                        textDecoration: "none",
                        fontSize: "0.9rem",
                        display: "inline-block",
                        py: 0.5,
                        "&:hover": { color: COLORS.white },
                      }}
                    >
                      {item}
                    </Link>
                  </Grid>
                ),
              )}
            </Grid>
          </Grid>

          {/* معلومات الاتصال - مبسطة */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 2, color: COLORS.white }}
            >
              Contact us{" "}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  direction: "ltr",
                }}
              >
                <Phone sx={{ color: COLORS.mediumBlue, fontSize: "1.1rem" }} />
                <Typography variant="body2" sx={{ color: COLORS.lightBlue }}>
                  +963 958 359 136
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  direction: "ltr",
                }}
              >
                <Phone sx={{ color: COLORS.mediumBlue, fontSize: "1.1rem" }} />
                <Typography variant="body2" sx={{ color: COLORS.lightBlue }}>
                  +963 932 642 429
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  direction: "ltr",
                }}
              >
                <LocationOn
                  sx={{ color: COLORS.mediumBlue, fontSize: "1.1rem" }}
                />
                <Typography variant="body2" sx={{ color: COLORS.lightBlue }}>
                  Syria - Aleppo
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  direction: "ltr",
                }}
              >
                <Facebook
                  sx={{ color: COLORS.mediumBlue, fontSize: "1.1rem" }}
                />
                <Link
                  href="https://www.facebook.com/share/19mM3fEsd7/"
                  target="_blank"
                  sx={{
                    color: COLORS.lightBlue,
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    "&:hover": { color: COLORS.white },
                  }}
                >
                  Future Institute
                </Link>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  direction: "ltr",
                  cursor: "pointer",
                  mt: 1,
                }}
                onClick={() => setOpenModal(true)}
              >
                <WhatsApp sx={{ color: "#25D366", fontSize: "1.1rem" }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: COLORS.lightBlue,
                    textDecoration: "underline",
                    textDecorationColor: COLORS.mediumBlue,
                    "&:hover": { color: COLORS.white },
                  }}
                >
                  Book your design with Islam Hadaya
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* خط فاصل بسيط */}
        <Divider sx={{ my: 4, borderColor: COLORS.borderLight }} />

        {/* حقوق النشر - بسيطة */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: COLORS.lightBlue }}>
            © {new Date().getFullYear()} Future Institute. All rights reserved
          </Typography>

          <Box sx={{ display: "flex", gap: 3 }}>
            <Link
              href="/privacy"
              variant="body2"
              sx={{
                color: COLORS.lightBlue,
                textDecoration: "none",
              }}
            >
              privacy policy
            </Link>
            <Link
              href="/terms"
              variant="body2"
              sx={{
                color: COLORS.lightBlue,
                textDecoration: "none",
              }}
            >
              Terms
            </Link>
          </Box>
        </Box>
      </Container>

      <AboutIslam open={openModal} handleClose={() => setOpenModal(false)} />
    </Box>
  );
};

export default Footer;
