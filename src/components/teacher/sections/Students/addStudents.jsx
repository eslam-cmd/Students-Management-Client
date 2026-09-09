"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Paper,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { CheckCircle, Error as ErrorIcon } from "@mui/icons-material";

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "1rem",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  backgroundColor: "#ffffff",
  direction: "ltr",
}));
const API =
  process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app";
const AddStudents = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    section: "",
    specialization: "",
    nameSchool: "",
    guardianNum: "",
    phone: "",
  });

  const [modal, setModal] = useState({
    open: false,
    success: false,
    message: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${API}/api/students`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) throw new Error("Failed to send");

      const result = await response.json();
      setModal({
        open: true,
        success: true,
        message: "✅ Student added successfully",
      });

      setFormData({
        name: "",
        section: "",
        specialization: "",
        nameSchool: "",
        guardianNum: "",
        phone: "",
      });
    } catch (err) {
      console.error("❌ Server error:", err.message);
      setModal({
        open: true,
        success: false,
        message: "❌ Error occurred while adding",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FormContainer>
        <Typography
          sx={{ fontSize: { xs: "17px", md: "22px", lg: "25px" } }}
          fontWeight={600}
          mb={2}
          color="#1f2937"
        >
          Add New Student
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
              placeholder="Enter student name"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Guardian Number"
              name="guardianNum"
              value={formData.guardianNum}
              onChange={handleChange}
              variant="outlined"
              placeholder="98xxxxxxx"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">+963</InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="School Name"
              name="nameSchool"
              value={formData.nameSchool}
              onChange={handleChange}
              variant="outlined"
              placeholder="Enter school name"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Section"
              name="section"
              value={formData.section}
              onChange={handleChange}
              variant="outlined"
              placeholder="e.g., Section 1"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              variant="outlined"
              placeholder="e.g., Electronics"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              variant="outlined"
              placeholder="98xxxxxxx"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">+963</InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                borderRadius: "0.5rem",
                paddingX: 4,
                paddingY: 1.2,
                fontWeight: 600,
                backgroundColor: "#2563eb",
                "&:hover": { backgroundColor: "#1d4ed8" },
              }}
            >
              {loading ? "⏳ Saving..." : "Save Student"}
            </Button>
          </Grid>
        </Grid>
      </FormContainer>

      <Dialog
        open={modal.open}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
      >
        <DialogTitle sx={{ textAlign: "center" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 1,
              borderRadius: "20px",
            }}
          >
            {modal.success ? (
              <CheckCircle sx={{ fontSize: 60, color: "green" }} />
            ) : (
              <ErrorIcon sx={{ fontSize: 60, color: "red" }} />
            )}
          </Box>
          <Typography
            sx={{
              color: modal.success ? "green" : "red",
              fontWeight: "bold",
              textAlign: "center",
              fontSize: "25px",
            }}
          >
            {modal.success ? "Success" : "Failed"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ textAlign: "center" }}>{modal.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button
            onClick={() => setModal((prev) => ({ ...prev, open: false }))}
            variant="contained"
            sx={{
              backgroundColor: modal.success ? "green" : "red",
              "&:hover": {
                backgroundColor: modal.success ? "#0f7b0f" : "#b71c1c",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddStudents;
