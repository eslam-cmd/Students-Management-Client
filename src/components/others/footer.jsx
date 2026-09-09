"use client";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
} from "@mui/material";
import {
  Facebook,
  Phone,
  LocationOn,
} from "@mui/icons-material";
import SchoolIcon from "@mui/icons-material/School";
import { useState } from "react";
import AboutIslam from "../home/aboutislam/aboutIslam";

const Footer = () => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#f8fafc",
        color: "#1a2332",
        pt: 6,
        pb: 3,
        borderTop: "1px solid #e2e8f0",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo & Description */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <SchoolIcon sx={{ color: "#1976d2", mr: 1, fontSize: 32 }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#1a2332",
                }}
              >
                EduPlatform
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
                lineHeight: 1.7,
                maxWidth: 300,
              }}
            >
              Modern educational platform connecting students and teachers for
              better learning experience.
            </Typography>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: "#1a2332",
                mb: 2,
              }}
            >
              Contact Us
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <Phone sx={{ color: "#1976d2", fontSize: "1rem", mr: 1.5 }} />
              <Typography variant="body2" color="#64748b">
                +963 932 642 429
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <Facebook sx={{ color: "#1976d2", fontSize: "1rem", mr: 1.5 }} />
              <Link
                href="/"
                target="_blank"
                sx={{
                  color: "#64748b",
                  textDecoration: "none",
                  "&:hover": { color: "#1976d2" },
                }}
              >
                Facebook Page
              </Link>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <LocationOn
                sx={{ color: "#1976d2", fontSize: "1rem", mr: 1.5 }}
              />
              <Typography variant="body2" color="#64748b">
                Aleppo, Syria
              </Typography>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: "#1a2332",
                mb: 2,
              }}
            >
              Quick Links
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                href="/"
                sx={{
                  color: "#64748b",
                  textDecoration: "none",
                  "&:hover": { color: "#1976d2" },
                }}
              >
                Privacy Policy
              </Link>
              <Link
                href="/"
                sx={{
                  color: "#64748b",
                  textDecoration: "none",
                  "&:hover": { color: "#1976d2" },
                }}
              >
                Terms & Conditions
              </Link>
              <Link
                href="/"
                sx={{
                  color: "#64748b",
                  textDecoration: "none",
                  "&:hover": { color: "#1976d2" },
                }}
              >
                Site Map
              </Link>
              <Link
                href="#"
                sx={{
                  color: "#1976d2",
                  textDecoration: "none",
                  fontWeight: 500,
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => setOpenModal(true)}
              >
                Book Design Service
              </Link>
            </Box>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Divider sx={{ my: 3, borderColor: "#e2e8f0" }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography variant="body2" color="#94a3b8">
            © {new Date().getFullYear()} Islam Hadaya. All rights reserved.
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Link
              href="/"
              sx={{
                color: "#94a3b8",
                textDecoration: "none",
                fontSize: "0.8rem",
                "&:hover": { color: "#1976d2" },
              }}
            >
              Privacy
            </Link>
            <Link
              href="/"
              sx={{
                color: "#94a3b8",
                textDecoration: "none",
                fontSize: "0.8rem",
                "&:hover": { color: "#1976d2" },
              }}
            >
              Terms
            </Link>
            <Link
              href="/"
              sx={{
                color: "#94a3b8",
                textDecoration: "none",
                fontSize: "0.8rem",
                "&:hover": { color: "#1976d2" },
              }}
            >
              Sitemap
            </Link>
          </Box>
        </Box>
      </Container>

      <AboutIslam open={openModal} handleClose={() => setOpenModal(false)} />
    </Box>
  );
};

export default Footer;
