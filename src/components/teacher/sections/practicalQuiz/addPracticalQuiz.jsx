// src/components/AddExams.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { CheckCircle, Error as ErrorIcon } from "@mui/icons-material";
// قاعدة الـ API (يمكنك تغييرها في .env.local)
const API_URL = "https://manager-students-server.vercel.app";

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "1rem",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  backgroundColor: "#ffffff",
}));

const AddPracticalQuiz = () => {
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

  // ضبط تاريخ اليوم تلقائيًا
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setQuizData((prev) => ({ ...prev, quiz_date: today }));
  }, []);

  // جلب قائمة الطلاب
  useEffect(() => {
    async function fetchStudents() {
      setLoadingStudents(true);
      setFetchError("");
      try {
        const res = await fetch(`${API_URL}/api/students`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error("Error in fetching students:", err);
        setFetchError(
          "We were unable to fetch the student list. Please make sure the backend server is running.",
        );
      } finally {
        setLoadingStudents(false);
      }
    }
    fetchStudents();
  }, []);

  // مسح خطأ الحقل عند التعديل وتحديث quizData
  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuizData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  // التحقق من الحقول المطلوبة
  const validate = () => {
    const newErrors = {};
    if (!quizData.quiz_title.trim())
      newErrors.quiz_title = "The study title is required.";
    if (!quizData.quiz_grade.trim())
      newErrors.quiz_grade = "Student's grade is required.";
    if (!quizData.quiz_date)
      newErrors.quiz_date = "The study date is required.";
    if (!quizData.student_id) newErrors.student_id = "The student chose.";
    if (!quizData.quiz_name) newErrors.quiz_name = "Choose the subject";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`${API_URL}/api/practical-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...quizData, type: "practical" }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Unknown error");

      setModal({
        open: true,
        success: true,
        message: "✅ The quiz has been added successfully.",
      });

      // إعادة ضبط الحقول
      const today = new Date().toISOString().split("T")[0];
      setQuizData({
        student_id: "",
        quiz_title: "",
        quiz_name: "",
        quiz_date: today,
        quiz_grade: "",
      });
      setErrors({});
    } catch (err) {
      console.error("Error during submission:", err);
      setSubmitError(`The note has not been saved.: ${err.message}`);
      setModal({
        open: true,
        success: false,
        message: "❌ An error occurred during the addition.",
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
          Add a practical test
        </Typography>

        {fetchError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {fetchError}
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* عنوان المذاكرة */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Study title"
              name="quiz_title"
              value={quizData.quiz_title}
              onChange={handleChange}
              error={!!errors.quiz_title}
              helperText={errors.quiz_title}
              placeholder="For example: Review of Unit Two"
              variant="outlined"
            />
          </Grid>

          {/* علامة الطالب */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="quiz grade"
              name="quiz_grade"
              value={quizData.quiz_grade}
              onChange={handleChange}
              error={!!errors.quiz_grade}
              helperText={errors.quiz_grade}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />
          </Grid>

          {/* تاريخ المذاكرة */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="quiz date"
              name="quiz_date"
              value={quizData.quiz_date}
              onChange={handleChange}
              error={!!errors.quiz_date}
              helperText={errors.quiz_date}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />
          </Grid>

          {/* اختيار الطالب */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="The student chose."
              name="student_id"
              value={quizData.student_id}
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

          {/* اختيار المادة */}
          {/* اسم المادة العملية */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="quiz name"
              name="quiz_name"
              value={quizData.quiz_name}
              onChange={handleChange}
              error={!!errors.quiz_name}
              helperText={errors.quiz_name}
              variant="outlined"
            />
          </Grid>

          {/* خطأ عام في الإرسال */}
          {submitError && (
            <Grid item xs={12}>
              <Alert severity="error">{submitError}</Alert>
            </Grid>
          )}

          {/* زر الحفظ */}
          <Grid item xs={12}>
            <Box textAlign="right">
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
                {submitting ? <CircularProgress size={24} /> : "Save"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </FormContainer>
      {/* مودال عصري للحالة */}
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
            {modal.success
              ? "The success of the operation"
              : "The operation failed."}
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

export default AddPracticalQuiz;
