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
  FormHelperText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FiTrash2, FiEdit } from "react-icons/fi";
import { FiRefreshCw } from "react-icons/fi";

const API =
  process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "1rem",
  backgroundColor: "#fff",
}));

const subjectOptions = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Arabic Language",
  "English Language",
  "Religion",
];

export default function ViewQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [sectionFilter, setSectionFilter] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [reloading, setReloading] = useState(false);

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

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [studRes, quizRes] = await Promise.all([
          fetch(`${API}/api/students`),
          fetch(`${API}/api/quiz`),
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
        setError("Failed to load data. Please check connection.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleEditClick = (quiz) => {
    setEditData({ ...quiz });
    setEditErrors({});
    setEditError("");
    setEditOpen(true);
  };

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

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
    setEditErrors((prev) => ({ ...prev, [name]: "" }));
    setEditError("");
  };

  const validateEdit = () => {
    const errs = {};
    if (!editData.student_id) errs.student_id = "Select a student";
    if (!editData.quiz_title.trim()) errs.quiz_title = "Title is required";
    if (!editData.quiz_name) errs.quiz_name = "Select a subject";
    if (!editData.quiz_date) errs.quiz_date = "Date is required";
    if (!editData.quiz_grade?.toString().trim()) {
      errs.quiz_grade = "Grade is required";
    }
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEditSave = async () => {
    if (!validateEdit()) return;

    setEditSubmitting(true);
    setEditError("");
    try {
      const res = await fetch(`${API}/api/quiz/${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editData.id,
          student_id: editData.student_id,
          quiz_title: editData.quiz_title,
          quiz_name: editData.quiz_name,
          quiz_date: editData.quiz_date,
          quiz_grade: editData.quiz_grade,
          type: editData.type || "theory",
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || "Unknown error");

      await handleReload();
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
      const res = await fetch(`${API}/api/quiz/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error("Delete quiz error:", err);
      alert("Error deleting quiz. Please try again.");
    }
  };

  const uniqueSections = [
    ...new Set(students.map((student) => student.section).filter(Boolean)),
  ];

  const uniqueStudents = students.map((s) => ({
    id: s.student_id,
    name: s.name,
    section: s.section,
  }));

  const filteredQuizzes = quizzes.filter((quiz) => {
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
        fetch(`${API}/api/students`),
        fetch(`${API}/api/quiz`),
      ]);

      if (!studRes.ok) throw new Error("Failed to fetch students");
      if (!quizRes.ok) throw new Error("Failed to fetch quizzes");

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
          <Typography
            sx={{
              fontWeight: "bold",
              color: "grey.800",
              fontSize: { xs: "17px", md: "22px", lg: "25px" },
            }}
          >
            Theory Quiz Management
          </Typography>

          <Tooltip title="Reload">
            <IconButton size="small" color="primary" onClick={handleReload}>
              {reloading ? <CircularProgress size={20} /> : <FiRefreshCw />}
            </IconButton>
          </Tooltip>
        </Box>

        <StyledPaper>
          <Typography variant="h6" mb={2}>
            Quiz List
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              mb: 3,
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <TextField
              placeholder="Search students, subjects, titles..."
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
              }}
            />

            <FormControl
              sx={{ minWidth: 180, width: { xs: "100%", sm: "auto" } }}
            >
              <InputLabel>Student</InputLabel>
              <Select
                value={selectedStudent}
                label="Student"
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
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
              <InputLabel>Subject</InputLabel>
              <Select
                value={selectedSubject}
                label="Subject"
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
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
              <InputLabel>Section</InputLabel>
              <Select
                value={sectionFilter}
                label="Section"
                onChange={(e) => setSectionFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
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
                    "Student",
                    "Section",
                    "Title",
                    "Subject",
                    "Date",
                    "Grade",
                    "Actions",
                  ].map((header, i) => (
                    <TableCell
                      key={i}
                      sx={{
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
                    (s) => s.student_id === quiz.student_id,
                  );
                  return (
                    <TableRow key={quiz.id} hover>
                      <TableCell>{student?.name || quiz.student_id}</TableCell>
                      <TableCell>{student?.section || "—"}</TableCell>
                      <TableCell>{quiz.quiz_title}</TableCell>
                      <TableCell>{quiz.quiz_name}</TableCell>
                      <TableCell>{quiz.quiz_date}</TableCell>
                      <TableCell>{quiz.quiz_grade}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleEditClick(quiz)}
                          size="small"
                        >
                          <FiEdit />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(quiz.id)}
                          size="small"
                          color="error"
                        >
                          <FiTrash2 />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredQuizzes.length === 0 && !loading && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="grey.500">No records found</Typography>
            </Box>
          )}
        </StyledPaper>

        <Dialog
          open={editOpen}
          onClose={handleEditClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Quiz</DialogTitle>
          <DialogContent dividers>
            {editError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {editError}
              </Alert>
            )}

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Student</InputLabel>
              <Select
                name="student_id"
                value={editData.student_id}
                onChange={handleEditChange}
                label="Student"
                error={!!editErrors.student_id}
              >
                {students.map((s) => (
                  <MenuItem key={s.student_id} value={s.student_id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
              {editErrors.student_id && (
                <FormHelperText error>{editErrors.student_id}</FormHelperText>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Title"
              name="quiz_title"
              value={editData.quiz_title}
              onChange={handleEditChange}
              error={!!editErrors.quiz_title}
              helperText={editErrors.quiz_title}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Subject</InputLabel>
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
                <FormHelperText error>{editErrors.quiz_name}</FormHelperText>
              )}
            </FormControl>

            <TextField
              fullWidth
              type="date"
              label="Date"
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
              label="Grade"
              name="quiz_grade"
              value={editData.quiz_grade}
              onChange={handleEditChange}
              error={!!editErrors.quiz_grade}
              helperText={editErrors.quiz_grade}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={handleEditClose} disabled={editSubmitting}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleEditSave}
              disabled={editSubmitting}
            >
              {editSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
