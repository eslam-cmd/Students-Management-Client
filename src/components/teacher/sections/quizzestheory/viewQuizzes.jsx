// src/components/ViewQuizzes.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  Tooltip,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FiTrash2, FiEdit } from "react-icons/fi";
import { FiRefreshCw } from "react-icons/fi";
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "1rem",
  backgroundColor: "#fff",
}));

export default function ViewQuizzes() {
  const API_URL = "https://manager-students-server.vercel.app";

  const [quizzes, setQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [sectionFilter, setSectionFilter] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [reloading, setReloading] = useState(false);

  // states for edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    student_id: "",
    quiz_title: "",
    quiz_name: "",
    quiz_date: "",
    quiz_grade: "",
  });
  const [editErrors, setEditErrors] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  // قائمة المواد
  const subjectOptions = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Arabic Language",
    "English Language",
    "Religion",
  ];

  // load quizzes & students
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [studRes, quizRes] = await Promise.all([
          fetch(`${API_URL}/api/students`),
          fetch(`${API_URL}/api/quiz`),
        ]);
        if (!studRes.ok) throw new Error(`Students HTTP ${studRes.status}`);
        if (!quizRes.ok) throw new Error(`Quizzes HTTP ${quizRes.status}`);

        const [studData, quizData] = await Promise.all([
          studRes.json(),
          quizRes.json(),
        ]);
        setStudents(studData);
        setQuizzes(Array.isArray(quizData) ? quizData : quizData.data);
      } catch (err) {
        console.error("Load data error:", err);
        setError("Failed to fetch the data. Make sure the server is running.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [API_URL]);

  // open dialog and populate fields
  const handleEditClick = (quiz) => {
    setEditData({ ...quiz });
    setEditErrors({});
    setEditError("");
    setEditOpen(true);
  };

  // close dialog
  const handleEditClose = () => {
    setEditOpen(false);
    setEditData({
      id: "",
      student_id: "",
      quiz_title: "",
      quiz_name: "",
      quiz_date: "",
      quiz_grade: "",
    });
  };

  // track changes in modal
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
    setEditErrors((prev) => ({ ...prev, [name]: "" }));
    setEditError("");
  };

  // validate before PUT
  const validateEdit = () => {
    const errs = {};
    if (!editData.student_id) errs.student_id = "The student chose.";
    if (!editData.quiz_title.trim()) errs.quiz_title = "The title is required.";
    if (!editData.quiz_name) errs.quiz_name = "Choose the subject";
    if (!editData.quiz_date) errs.quiz_date = "History is required.";
    if (!editData.quiz_grade.trim())
      errs.quiz_grade = "The degree is required.";
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // send PUT to update
  const handleEditSave = async () => {
    if (!validateEdit()) return;

    setEditSubmitting(true);
    setEditError("");
    try {
      const res = await fetch(`${API_URL}/api/quiz/${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || "Unknown error");

      // update local list
      setQuizzes((prev) =>
        prev.map((q) => (q.id === editData.id ? { ...editData } : q))
      );
      handleEditClose();
    } catch (err) {
      console.error("Edit quiz error:", err);
      setEditError(`Update failed: ${err.message}`);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      const res = await fetch(`${API_URL}/api/quiz/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error("Delete quiz error:", err);
      alert("Error while deleting the quiz. Please try again.");
    }
  };

  const uniqueSections = [
    ...new Set(students.map((student) => student.section).filter(Boolean)),
  ];

  // student filter list
  const uniqueStudents = students.map((s) => ({
    id: s.student_id,
    name: s.name,
    section: s.section, // إضافة القسم للاستخدام في الفلترة
  }));

  // filtered quizzes - التصحيح هنا
  const filteredQuizzes = quizzes.filter((quiz) => {
    // البحث عن الطالب المرتبط بهذا الكويز
    const student = students.find((s) => s.student_id === quiz.student_id);
    const matchesType = quiz.type === "theory";
    const matchesStudent =
      !selectedStudent || quiz.student_id === selectedStudent;
    const matchesSubject =
      !selectedSubject || quiz.quiz_name === selectedSubject;
    const matchesSection =
      !sectionFilter || (student && student.section === sectionFilter);
    const matchesSearch =
      !searchTerm ||
      (student &&
        student.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      quiz.quiz_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.quiz_name?.toLowerCase().includes(searchTerm.toLowerCase());

    return (
      matchesType &&
      matchesStudent &&
      matchesSubject &&
      matchesSection &&
      matchesSearch
    );
  });

  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  const handleReload = async () => {
    setReloading(true);
    try {
      const [studRes, quizRes] = await Promise.all([
        fetch(`${API_URL}/api/students`),
        fetch(`${API_URL}/api/quiz`),
      ]);

      if (!studRes.ok) throw new Error("Failed to attract the students");
      if (!quizRes.ok) throw new Error("Failed to fetch the quizzes.");

      const [studData, quizData] = await Promise.all([
        studRes.json(),
        quizRes.json(),
      ]);

      setStudents(studData);
      setQuizzes(Array.isArray(quizData) ? quizData : quizData.data);
    } catch (err) {
      console.error("❌ Failed to reload:", err.message);
      setError("Failed to reload");
    } finally {
      setReloading(false);
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "grey.100", minHeight: "100vh" }}>
      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            mb: 4,
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <svg
              style={{ fontSize: "1.5rem", color: "#2563eb" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <Typography
              sx={{
                fontWeight: "bold",
                color: "grey.800",
                fontSize: { xs: "17px", md: "22px", lg: "25px" },
              }}
            >
              Management of theoretical quizzes
            </Typography>
          </Box>

          <Tooltip title="Reload">
            <IconButton
              size="small"
              color="primary"
              onClick={handleReload}
              sx={{ ml: 1 }}
            >
              {reloading ? <CircularProgress size={20} /> : <FiRefreshCw />}
            </IconButton>
          </Tooltip>
        </Box>

        <StyledPaper>
          <Typography variant="h6" mb={2}>
            List of quizzes by student
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* فلترات البحث */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              mb: 3,
              gap: 2,
            }}
          >
            <TextField
              placeholder="Search for students, subjects, or titles.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: { xs: "100%", sm: 300 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <svg
                      style={{
                        height: "1.25rem",
                        width: "1.25rem",
                        color: "#9ca3af",
                      }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "12px",
                  "&:focus-within": {
                    borderColor: "primary.light",
                    boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                  },
                },
              }}
            />

            <FormControl
              sx={{ minWidth: 180, width: { xs: "100%", sm: "auto" } }}
            >
              <InputLabel>The student chose.</InputLabel>
              <Select
                value={selectedStudent}
                label="The student chose"
                onChange={(e) => setSelectedStudent(e.target.value)}
                sx={{ borderRadius: "12px" }}
              >
                <MenuItem value="">All the students</MenuItem>
                {uniqueStudents.map((stu) => (
                  <MenuItem key={stu.id} value={stu.id}>
                    {stu.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              sx={{ minWidth: 180, width: { xs: "100%", sm: "auto" } }}
            >
              <InputLabel>Choose the subject</InputLabel>
              <Select
                value={selectedSubject}
                label="Choose the subject"
                onChange={(e) => setSelectedSubject(e.target.value)}
                sx={{ borderRadius: "12px" }}
              >
                <MenuItem value="">All materials</MenuItem>
                {subjectOptions.map((subject) => (
                  <MenuItem key={subject} value={subject}>
                    {subject}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              sx={{ minWidth: 180, width: { xs: "100%", sm: "auto" } }}
            >
              <InputLabel>The section</InputLabel>
              <Select
                value={sectionFilter}
                label="The section"
                onChange={(e) => setSectionFilter(e.target.value)}
                sx={{ borderRadius: "12px" }}
              >
                <MenuItem value="">All sections</MenuItem>
                {uniqueSections.map((section, index) => (
                  <MenuItem key={index} value={section}>
                    {section}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: "grey.50" }}>
                <TableRow>
                  {[
                    "student",
                    "section",
                    "title",
                    "subject",
                    "date",
                    "grade",
                    "actions",
                  ].map((header, i) => (
                    <TableCell
                      key={i}
                      sx={{
                        textAlign: "right",
                        fontWeight: "medium",
                        color: "grey.500",
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredQuizzes.map((quiz) => {
                  const student = students.find(
                    (s) => s.student_id === quiz.student_id
                  );
                  return (
                    <TableRow key={quiz.id} hover>
                      <TableCell sx={{ textAlign: "right" }}>
                        {student?.name || quiz.student_id}
                      </TableCell>
                      <TableCell sx={{ textAlign: "right" }}>
                        {student?.section || "غير محدد"}
                      </TableCell>
                      <TableCell sx={{ textAlign: "right" }}>
                        {quiz.quiz_title}
                      </TableCell>
                      <TableCell sx={{ textAlign: "right" }}>
                        {quiz.quiz_name}
                      </TableCell>
                      <TableCell sx={{ textAlign: "right" }}>
                        {quiz.quiz_date}
                      </TableCell>
                      <TableCell sx={{ textAlign: "right" }}>
                        {quiz.quiz_grade}
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "center",
                          }}
                        >
                          <IconButton
                            onClick={() => handleEditClick(quiz)}
                            sx={{ color: "#2563eb" }}
                            size="small"
                          >
                            <FiEdit />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(quiz.id)}
                            sx={{ color: "#dc2626" }}
                            size="small"
                          >
                            <FiTrash2 />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredQuizzes.length === 0 && !loading && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="grey.500">
                No matching results found for the search.
              </Typography>
            </Box>
          )}
        </StyledPaper>

        {/* Edit Modal */}
        <Dialog
          open={editOpen}
          onClose={handleEditClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit the quiz</DialogTitle>
          <DialogContent dividers>
            {editError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {editError}
              </Alert>
            )}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>The student chose.</InputLabel>
              <Select
                name="student_id"
                value={editData.student_id}
                onChange={handleEditChange}
                label="The student chose"
                error={!!editErrors.student_id}
              >
                {students.map((s) => (
                  <MenuItem key={s.student_id} value={s.student_id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
              {editErrors.student_id && (
                <Typography color="error" variant="caption">
                  {editErrors.student_id}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="title"
              name="quiz_title"
              value={editData.quiz_title}
              onChange={handleEditChange}
              error={!!editErrors.quiz_title}
              helperText={editErrors.quiz_title}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>subject</InputLabel>
              <Select
                name="quiz_name"
                value={editData.quiz_name}
                onChange={handleEditChange}
                label="Subject"
                error={!!editErrors.quiz_name}
              >
                {subjectOptions.map((subj) => (
                  <MenuItem key={subj} value={subj}>
                    {subj}
                  </MenuItem>
                ))}
              </Select>
              {editErrors.quiz_name && (
                <Typography color="error" variant="caption">
                  {editErrors.quiz_name}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              type="date"
              label="date"
              name="quiz_date"
              value={editData.quiz_date}
              onChange={handleEditChange}
              InputLabelProps={{ shrink: true }}
              error={!!editErrors.quiz_date}
              helperText={editErrors.quiz_date}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              type="number"
              label="grade"
              name="quiz_grade"
              value={editData.quiz_grade}
              onChange={handleEditChange}
              error={!!editErrors.quiz_grade}
              helperText={editErrors.quiz_grade}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={handleEditClose} disabled={editSubmitting}>
              Close
            </Button>
            <Button
              variant="contained"
              onClick={handleEditSave}
              disabled={editSubmitting}
            >
              {editSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
