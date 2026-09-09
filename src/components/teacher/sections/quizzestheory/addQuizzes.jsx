// src/components/AddQuiz.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { CheckCircle, Error as ErrorIcon } from "@mui/icons-material";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app";

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "1rem",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  backgroundColor: "#fff",
  direction: "ltr",
}));

const subjectOptions = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Arabic Language",
  "English Language",
  "Religion",
];

export default function AddQuiz() {
  const [quizData, setQuizData] = useState({
    student_id: "",
    quiz_title: "",
    quiz_name: "",
    quiz_date: "",
    quiz_grade: "",
  });

  const [modal, setModal] = useState({
    open: false,
    success: false,
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setQuizData((prev) => ({ ...prev, quiz_date: today }));
  }, []);

  useEffect(() => {
    async function loadStudents() {
      setLoadingStudents(true);
      setFetchError("");
      try {
        const res = await fetch(`${API_URL}/api/students`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error("Fetch students error:", err);
        setFetchError("Failed to load students. Please check server.");
      } finally {
        setLoadingStudents(false);
      }
    }
    loadStudents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuizData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!quizData.student_id) newErrors.student_id = "Select a student";
    if (!quizData.quiz_title.trim())
      newErrors.quiz_title = "Quiz title is required";
    if (!quizData.quiz_name) newErrors.quiz_name = "Select a subject";
    if (!quizData.quiz_date) newErrors.quiz_date = "Date is required";
    if (!quizData.quiz_grade.trim())
      newErrors.quiz_grade = "Quiz grade is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`${API_URL}/api/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizData),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || "Unknown error");

      setModal({
        open: true,
        success: true,
        message: "✅ Quiz added successfully",
      });

      const today = new Date().toISOString().split("T")[0];
      setQuizData({
        student_id: "",
        quiz_title: "",
        quiz_name: "",
        quiz_date: today,
        quiz_grade: "",
      });
    } catch (err) {
      console.error("Submit quiz error:", err);
      setModal({
        open: true,
        success: false,
        message: "❌ Error occurred while adding",
      });
      setSubmitError(`Failed to save quiz: ${err.message}`);
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
          Add Theory Quiz
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
              label="Quiz Title"
              name="quiz_title"
              value={quizData.quiz_title}
              onChange={handleChange}
              placeholder="e.g., Unit 1 Test"
              error={!!errors.quiz_title}
              helperText={errors.quiz_title}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Quiz Grade"
              name="quiz_grade"
              value={quizData.quiz_grade}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!errors.quiz_grade}
              helperText={errors.quiz_grade}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Quiz Date"
              name="quiz_date"
              value={quizData.quiz_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!errors.quiz_date}
              helperText={errors.quiz_date}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Select Student"
              name="student_id"
              value={quizData.student_id}
              onChange={handleChange}
              disabled={loadingStudents}
              error={!!errors.student_id}
              helperText={errors.student_id}
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
              select
              fullWidth
              label="Select Subject"
              name="quiz_name"
              value={quizData.quiz_name}
              onChange={handleChange}
              error={!!errors.quiz_name}
              helperText={errors.quiz_name}
            >
              {subjectOptions.map((subj) => (
                <MenuItem key={subj} value={subj}>
                  {subj}
                </MenuItem>
              ))}
            </TextField>
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
                {submitting ? <CircularProgress size={24} /> : "Save Quiz"}
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
}
