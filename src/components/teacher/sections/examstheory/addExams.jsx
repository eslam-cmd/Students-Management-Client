// src/components/AddExams.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { CheckCircle, Error as ErrorIcon } from "@mui/icons-material";

const API =
  process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app/";

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "1rem",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  backgroundColor: "#ffffff",
  direction: "ltr",
}));

const AddExams = () => {
  const [noteData, setNoteData] = useState({
    student_id: "",
    sabject_title: "",
    sabject_name: "",
    sabject_date: "",
    sabject_grade: "",
  });

  const [errors, setErrors] = useState({});
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Arabic Language",
    "English Language",
    "Religion",
  ];

  // Set today's date automatically
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setNoteData((prev) => ({ ...prev, sabject_date: today }));
  }, []);

  // Fetch students list
  useEffect(() => {
    async function fetchStudents() {
      setLoadingStudents(true);
      setFetchError("");
      try {
        const res = await fetch(`${API}/api/students`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error("Error fetching students:", err);
        setFetchError(
          "Failed to load student list. Please make sure the server is running.",
        );
      } finally {
        setLoadingStudents(false);
      }
    }
    fetchStudents();
  }, []);

  // Clear field error on change and update noteData
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNoteData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  // Validate required fields
  const validate = () => {
    const newErrors = {};
    if (!noteData.sabject_title.trim())
      newErrors.sabject_title = "Note title is required";
    if (!noteData.sabject_grade.trim())
      newErrors.sabject_grade = "Student grade is required";
    if (!noteData.sabject_date)
      newErrors.sabject_date = "Note date is required";
    if (!noteData.student_id) newErrors.student_id = "Please select a student";
    if (!noteData.sabject_name)
      newErrors.sabject_name = "Please select a subject";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [modal, setModal] = useState({
    open: false,
    success: false,
    message: "",
  });

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`${API}/api/sabject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Unknown error");

      // Open success modal
      setModal({
        open: true,
        success: true,
        message: "✅ Note added successfully!",
      });

      // Reset form fields
      const today = new Date().toISOString().split("T")[0];
      setNoteData({
        student_id: "",
        sabject_title: "",
        sabject_name: "",
        sabject_date: today,
        sabject_grade: "",
      });
      setErrors({});
    } catch (err) {
      console.error("Error during submission:", err);
      setSubmitError(`Failed to save note: ${err.message}`);
      setModal({
        open: true,
        success: false,
        message: "❌ An error occurred while saving",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <FormContainer component="form" onSubmit={handleSubmit}>
        <Typography
          sx={{
            fontSize: { xs: "17px", md: "22px", lg: "25px" },
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
          fontWeight={600}
          mb={2}
          color="#1f2937"
        >
          Add Note for Student
        </Typography>

        {fetchError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {fetchError}
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* Note Title */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Note Title"
              name="sabject_title"
              value={noteData.sabject_title}
              onChange={handleChange}
              error={!!errors.sabject_title}
              helperText={errors.sabject_title}
              placeholder="e.g., Review Unit 2"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />
          </Grid>

          {/* Student Grade */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Student Grade"
              name="sabject_grade"
              value={noteData.sabject_grade}
              onChange={handleChange}
              error={!!errors.sabject_grade}
              helperText={errors.sabject_grade}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />
          </Grid>

          {/* Note Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Note Date"
              name="sabject_date"
              value={noteData.sabject_date}
              onChange={handleChange}
              error={!!errors.sabject_date}
              helperText={errors.sabject_date}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />
          </Grid>

          {/* Select Student */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Select Student"
              name="student_id"
              value={noteData.student_id}
              onChange={handleChange}
              error={!!errors.student_id}
              helperText={errors.student_id}
              disabled={loadingStudents}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            >
              {loadingStudents ? (
                <MenuItem value="" disabled>
                  <CircularProgress size={20} /> Loading...
                </MenuItem>
              ) : students.length === 0 ? (
                <MenuItem value="" disabled>
                  No students available
                </MenuItem>
              ) : (
                students.map((s) => (
                  <MenuItem key={s.student_id} value={s.student_id}>
                    {s.name} {s.student_id ? `(${s.student_id})` : ""}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Grid>

          {/* Select Subject */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Select Subject"
              name="sabject_name"
              value={noteData.sabject_name}
              onChange={handleChange}
              error={!!errors.sabject_name}
              helperText={errors.sabject_name}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            >
              {subjects.map((subj) => (
                <MenuItem key={subj} value={subj}>
                  {subj}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* General submit error */}
          {submitError && (
            <Grid item xs={12}>
              <Alert severity="error">{submitError}</Alert>
            </Grid>
          )}

          {/* Submit Button */}
          <Grid item xs={12}>
            <Tooltip
              title={
                loadingStudents
                  ? "Loading students..."
                  : submitting
                    ? "Saving..."
                    : ""
              }
              arrow
            >
              <span>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={submitting || loadingStudents}
                  sx={{
                    borderRadius: "0.5rem",
                    px: 4,
                    py: 1.2,
                    fontWeight: 600,
                    backgroundColor: "#2563eb",
                    "&:hover": { backgroundColor: "#1d4ed8" },
                    "&:disabled": {
                      opacity: 0.6,
                    },
                  }}
                  startIcon={
                    submitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                >
                  {submitting ? "Saving..." : "Save Note"}
                </Button>
              </span>
            </Tooltip>
          </Grid>
        </Grid>
      </FormContainer>

      {/* Modern Status Modal */}
      <Dialog
        open={modal.open}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: "8px",
            minWidth: { xs: "90%", sm: "400px" },
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            {modal.success ? (
              <CheckCircle sx={{ fontSize: 64, color: "#22c55e" }} />
            ) : (
              <ErrorIcon sx={{ fontSize: 64, color: "#ef4444" }} />
            )}
          </Box>
          <Typography
            variant="h6"
            sx={{
              color: modal.success ? "#22c55e" : "#ef4444",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {modal.success ? "Success" : "Failed"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ textAlign: "center", fontSize: "1rem", py: 1 }}>
            {modal.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button
            onClick={() => setModal((prev) => ({ ...prev, open: false }))}
            variant="contained"
            sx={{
              backgroundColor: modal.success ? "#22c55e" : "#ef4444",
              borderRadius: "8px",
              px: 4,
              py: 1,
              fontWeight: 600,
              "&:hover": {
                backgroundColor: modal.success ? "#16a34a" : "#dc2626",
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

export default AddExams;
