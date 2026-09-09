// src/components/AddPracticalNotes.jsx
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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { CheckCircle, Error as ErrorIcon } from "@mui/icons-material";

const API =
  process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app";

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "1rem",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  backgroundColor: "#ffffff",
  direction: "ltr",
}));

const AddPracticalNotes = () => {
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

  const [modal, setModal] = useState({
    open: false,
    success: false,
    message: "",
  });

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setNoteData((prev) => ({ ...prev, sabject_date: today }));
  }, []);

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
        setFetchError("Failed to load students. Please check server.");
      } finally {
        setLoadingStudents(false);
      }
    }
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNoteData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

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
      newErrors.sabject_name = "Subject name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`${API}/api/practical-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...noteData, type: "practical" }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Unknown error");

      setModal({
        open: true,
        success: true,
        message: "✅ Note added successfully",
      });

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
        message: "❌ Error occurred while adding",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <FormContainer component="form" onSubmit={handleSubmit}>
        <Typography
          sx={{ fontSize: { xs: "17px", md: "22px", lg: "25px" } }}
          fontWeight={600}
          mb={2}
          color="#1f2937"
        >
          Add Practical Note
        </Typography>

        {fetchError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {fetchError}
          </Alert>
        )}

        <Grid container spacing={2}>
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
            />
          </Grid>

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
            />
          </Grid>

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
            />
          </Grid>

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
            >
              {students.map((s) => (
                <MenuItem key={s.student_id} value={s.student_id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Subject Name"
              name="sabject_name"
              value={noteData.sabject_name}
              onChange={handleChange}
              error={!!errors.sabject_name}
              helperText={errors.sabject_name}
              variant="outlined"
            />
          </Grid>

          {submitError && (
            <Grid item xs={12}>
              <Alert severity="error">{submitError}</Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box textAlign="left">
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
                }}
              >
                {submitting ? <CircularProgress size={24} /> : "Save Note"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </FormContainer>

      <Dialog
        open={modal.open}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
      >
        <DialogTitle sx={{ textAlign: "center" }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
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

export default AddPracticalNotes;
