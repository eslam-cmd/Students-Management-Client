"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Box,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FaUserTie } from "react-icons/fa";

const ProfileContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: "1rem",
  backgroundColor: "#fff",
  direction: "ltr",
  maxWidth: "600px",
  margin: "0 auto",
}));

const API = (
  process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app"
).replace(/\/$/, "");

const TeacherProfileCard = () => {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // البيانات الأصلية القادمة من السيرفر لمقارنتها
  const [initialProfile, setInitialProfile] = useState({ name: "", email: "" });
  
  const [profile, setProfile] = useState({
    name: "",
    subject: "System Admin",
    email: "",
    password: "",
  });

  const fetchProfile = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch(`${API}/api/teacher/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to load profile");

      const data = await res.json();
      const fetchedName = data.name || data.teacher?.name || "";
      const fetchedEmail = data.email || data.teacher?.email || "";
      const fetchedSubject = data.subject || data.teacher?.subject || "System Admin";

      setProfile({
        name: fetchedName,
        email: fetchedEmail,
        subject: fetchedSubject,
        password: "",
      });

      setInitialProfile({
        name: fetchedName,
        email: fetchedEmail,
      });
    } catch (err) {
      console.error("Fetch profile error:", err);
      setError("Failed to load profile details");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleOpenConfirm = () => {
    if (!profile.name.trim()) {
      setError("Name is required");
      return;
    }
    if (profile.email && !profile.email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    if (profile.password && profile.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API}/api/teacher/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: profile.name,
          email: profile.email || undefined,
          password: profile.password || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("✅ Profile updated successfully!");
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        setError("❌ Update failed: " + (data.error || data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Update profile error:", err);
      setError("⚠️ Connection error. Please try again.");
    } finally {
      setLoading(false);
      handleCloseConfirm();
    }
  };

  if (fetching) {
    return (
      <ProfileContainer elevation={3}>
        <Box display="flex" justifyContent="center" alignItems="center" py={5}>
          <CircularProgress />
        </Box>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer elevation={3}>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Box
            sx={{
              backgroundColor: "#e0e7ff",
              borderRadius: "50%",
              padding: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaUserTie size={40} color="#2563eb" />
          </Box>
        </Grid>
        <Grid item>
          <Typography variant="h6" fontWeight={700}>
            {profile.name || "Teacher"}
          </Typography>
          <Typography color="text.secondary">{profile.subject}</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" fontWeight={600} mb={2}>
        Edit Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={profile.name}
            onChange={handleChange}
            variant="outlined"
            required
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={profile.email}
            onChange={handleChange}
            variant="outlined"
            placeholder="teacher@example.com"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="New Password"
            name="password"
            type="password"
            value={profile.password}
            onChange={handleChange}
            variant="outlined"
            placeholder="Min 6 characters"
            helperText="Leave blank to keep current password"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenConfirm}
            disabled={loading}
            sx={{
              borderRadius: "0.5rem",
              px: 4,
              py: 1.2,
              fontWeight: 600,
              backgroundColor: "#2563eb",
              "&:hover": { backgroundColor: "#1d4ed8" },
              "&:disabled": { opacity: 0.6 },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
          </Button>
        </Grid>
      </Grid>

      {/* 🛑 نافذة التأكيد المحسنة مع ملخص التغييرات */}
      <Dialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            minWidth: { xs: "90%", sm: "420px" },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Confirm Changes
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Are you sure you want to update your profile with the following details?
          </Typography>

          <Stack spacing={1} sx={{ backgroundColor: "#f8fafc", p: 2, borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Name:</strong> {profile.name}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {profile.email}
            </Typography>
            {profile.password && (
              <Typography variant="body2" color="warning.main">
                <strong>Password:</strong> ******** (Will be updated)
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleCloseConfirm}
            variant="outlined"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: "#2563eb",
              "&:hover": { backgroundColor: "#1d4ed8" },
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Confirm Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </ProfileContainer>
  );
};

export default TeacherProfileCard;