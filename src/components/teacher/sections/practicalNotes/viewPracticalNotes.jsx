// components/ViewPracticalNotes.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  InputAdornment,
  Alert,
  Divider,
  Modal,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { CheckCircle, Error as ErrorIcon } from "@mui/icons-material";
import {
  FiTrash2,
  FiEdit,
  FiRefreshCw,
  FiBarChart2,
  FiEye,
  FiX,
  FiClipboard,
  FiFilter,
} from "react-icons/fi";
import PracticalNotesCharts from "./PracticalNotesCharts";

/* ==================== Styled Components ==================== */

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: theme.palette.grey[50],
    transition: "background-color 0.3s ease",
  },
}));

const StyledModal = styled(Modal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(4px)",
});

const ModalContent = styled(Paper)(({ theme }) => ({
  width: "100%",
  maxWidth: "448px",
  margin: theme.spacing(0, 2),
  padding: theme.spacing(3),
  borderRadius: "12px",
  border: `1px solid ${theme.palette.grey[200]}`,
  animation: "fadeIn 0.3s ease-out forwards",
  "@keyframes fadeIn": {
    from: { opacity: 0, transform: "translateY(10px) scale(0.95)" },
    to: { opacity: 1, transform: "translateY(0) scale(0.95)" },
  },
}));

/* ==================== Constants ==================== */

const API =
  process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app";

/* ==================== Main Component ==================== */

export default function ViewPracticalNotes() {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [students, setStudents] = useState([]);
  const [sectionFilter, setSectionFilter] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [error, setError] = useState("");
  const [reloading, setReloading] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [showCharts, setShowCharts] = useState(false);

  // Modals
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [modal, setModal] = useState({
    open: false,
    success: false,
    message: "",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    student_id: "",
    name: "",
    sabject_title: "",
    sabject_name: "",
    sabject_date: "",
    sabject_grade: "",
  });
  const [editErrors, setEditErrors] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  /* ==================== Load Data ==================== */
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [studRes, notesRes] = await Promise.all([
        fetch(`${API}/api/students`),
        fetch(`${API}/api/practical-notes`),
      ]);
      if (!studRes.ok) throw new Error("Failed to fetch students");
      if (!notesRes.ok) throw new Error("Failed to fetch notes");

      const studentsData = await studRes.json();
      const notesData = await notesRes.json();

      const nameMap = new Map(studentsData.map((s) => [s.student_id, s.name]));

      const mergedNotes = Array.isArray(notesData) ? notesData : notesData.data;
      const notesWithNames = mergedNotes.map((n) => ({
        ...n,
        name: nameMap.get(n.student_id) || "—",
      }));

      setStudents(studentsData);
      setNotes(notesWithNames);
    } catch (err) {
      console.error(err);
      setError("Failed to load data. Please check server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    fetch(`${API}/api/practical-notes/subjects`)
      .then((res) => res.json())
      .then((data) => setSubjectOptions(data.subjects || []))
      .catch((err) => console.error("Failed to fetch subjects:", err));
  }, []);

  /* ==================== Reload ==================== */
  const handleReload = async () => {
    setReloading(true);
    await loadData();
    setReloading(false);
  };

  /* ==================== Delete ==================== */
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      const res = await fetch(`${API}/api/sabject/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setModal({
        open: true,
        success: true,
        message: "✅ Note deleted successfully",
      });
    } catch (err) {
      console.error(err);
      setModal({
        open: true,
        success: false,
        message: "❌ Error deleting note",
      });
    }
  };

  /* ==================== View ==================== */
  const handleView = (note) => {
    setSelectedNote(note);
    setViewOpen(true);
  };

  /* ==================== Edit ==================== */
  const handleEdit = (note) => {
    setEditData({ ...note });
    setEditErrors({});
    setEditError("");
    setEditOpen(true);
  };

  const handleEditCancel = () => setEditOpen(false);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
    setEditErrors((prev) => ({ ...prev, [name]: "" }));
    setEditError("");
  };

  const validateEdit = () => {
    const errs = {};
    if (!editData.sabject_title?.trim())
      errs.sabject_title = "Title is required";
    if (!editData.sabject_name) errs.sabject_name = "Select subject";
    if (!editData.sabject_date) errs.sabject_date = "Date is required";
    if (!editData.sabject_grade?.toString().trim())
      errs.sabject_grade = "Grade is required";
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEditSave = async () => {
    if (!validateEdit()) return;

    setEditSubmitting(true);
    setEditError("");
    try {
      const res = await fetch(`${API}/api/sabject/${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sabject_title: editData.sabject_title,
          sabject_name: editData.sabject_name,
          sabject_date: editData.sabject_date,
          sabject_grade: editData.sabject_grade,
        }),
      });

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.message || "Update failed");
      }

      setNotes((prev) =>
        prev.map((n) => (n.id === editData.id ? { ...editData } : n)),
      );
      setEditOpen(false);
      setModal({
        open: true,
        success: true,
        message: "✅ Note updated successfully",
      });
    } catch (err) {
      console.error(err);
      setEditError(err.message);
      setModal({
        open: true,
        success: false,
        message: `❌ Update failed: ${err.message}`,
      });
    } finally {
      setEditSubmitting(false);
    }
  };

  /* ==================== Filters ==================== */
  const uniqueSections = [
    ...new Set(students.map((student) => student.section).filter(Boolean)),
  ];
  const uniqueSpecialization = [
    ...new Set(
      students.map((student) => student.specialization).filter(Boolean),
    ),
  ];

  const filteredNotes = notes.filter((note) => {
    const student = students.find((s) => s.student_id === note.student_id);

    const matchesStudent =
      !selectedStudent || note.student_id === selectedStudent;
    const matchesSubject =
      !selectedSubject || note.sabject_name === selectedSubject;
    const matchesSection =
      !sectionFilter || (student && student.section === sectionFilter);
    const matchesSpecialization =
      !specializationFilter ||
      (student && student.specialization === specializationFilter);
    const matchesSearch =
      !searchTerm ||
      (student &&
        student.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      note.sabject_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.sabject_name?.toLowerCase().includes(searchTerm.toLowerCase());

    return (
      matchesStudent &&
      matchesSubject &&
      matchesSection &&
      matchesSpecialization &&
      matchesSearch
    );
  });

  /* ==================== Loading ==================== */
  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          backgroundColor: "grey.100",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={50} thickness={4} />
          <Typography
            mt={2}
            variant="h6"
            fontWeight={600}
            color="text.secondary"
          >
            Loading Practical Notes...
          </Typography>
        </Box>
      </Box>
    );
  }

  /* ==================== Main Render ==================== */
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 3 },
        backgroundColor: "grey.100",
        minHeight: "100vh",
      }}
    >
      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
        {/* ============ Header Bar ============ */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", md: "center" },
            mb: 3,
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FiClipboard style={{ fontSize: "1.5rem", color: "#06b6d4" }} />
            <Typography
              sx={{
                fontWeight: "bold",
                color: "grey.800",
                fontSize: { xs: "18px", md: "22px" },
              }}
            >
              Practical Notes Management
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              width: { xs: "100%", md: "auto" },
            }}
          >
            <Button
              variant={showCharts ? "contained" : "outlined"}
              startIcon={<FiBarChart2 />}
              onClick={() => setShowCharts((prev) => !prev)}
              size="small"
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                height: 40,
                px: 2,
                ...(showCharts
                  ? {
                      background:
                        "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                      color: "#fff",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(6, 182, 212, 0.3)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
                      },
                    }
                  : {
                      borderColor: "#cbd5e1",
                      color: "#06b6d4",
                      backgroundColor: "#fff",
                      "&:hover": {
                        borderColor: "#06b6d4",
                        backgroundColor: "#ecfeff",
                      },
                    }),
              }}
            >
              {showCharts ? "Hide Charts" : "Show Charts"}
            </Button>

            <Tooltip title="Reload">
              <IconButton
                size="small"
                color="primary"
                onClick={handleReload}
                sx={{
                  bgcolor: "#fff",
                  p: 1,
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  alignSelf: { xs: "flex-end", sm: "center" },
                }}
              >
                {reloading ? <CircularProgress size={18} /> : <FiRefreshCw />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* ============ Charts Section ============ */}
        {showCharts && (
          <Box mb={3}>
            <PracticalNotesCharts
              notes={filteredNotes}
              students={students}
              onClose={() => setShowCharts(false)}
            />
          </Box>
        )}

        {/* ============ Filters ============ */}
        <Paper
          sx={{
            borderRadius: "12px",
            p: 2,
            mb: 3,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <FiFilter style={{ color: "#64748b", fontSize: "1.1rem" }} />
            <Typography
              variant="body2"
              fontWeight={600}
              color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: "0.5px" }}
            >
              Filters
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <TextField
              placeholder="Search students, subjects, titles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              size="small"
              sx={{ width: { xs: "100%", sm: 260, md: 300 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <svg
                      style={{
                        height: "1.1rem",
                        width: "1.1rem",
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
                sx: { borderRadius: "10px", backgroundColor: "#fff" },
              }}
            />

            <FormControl
              size="small"
              sx={{ minWidth: 160, width: { xs: "100%", sm: "auto" } }}
            >
              <InputLabel>Subject</InputLabel>
              <Select
                value={selectedSubject}
                label="Subject"
                onChange={(e) => setSelectedSubject(e.target.value)}
                sx={{ borderRadius: "10px", backgroundColor: "#fff" }}
              >
                <MenuItem value="">All Subjects</MenuItem>
                {subjectOptions.map((subj) => (
                  <MenuItem key={subj} value={subj}>
                    {subj}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              size="small"
              sx={{ minWidth: 170, width: { xs: "100%", sm: "auto" } }}
            >
              <InputLabel>Specialization</InputLabel>
              <Select
                value={specializationFilter}
                label="Specialization"
                onChange={(e) => setSpecializationFilter(e.target.value)}
                sx={{ borderRadius: "10px", backgroundColor: "#fff" }}
              >
                <MenuItem value="">All Specializations</MenuItem>
                {uniqueSpecialization.map((specialization, index) => (
                  <MenuItem key={index} value={specialization}>
                    {specialization}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              size="small"
              sx={{ minWidth: 140, width: { xs: "100%", sm: "auto" } }}
            >
              <InputLabel>Group</InputLabel>
              <Select
                value={sectionFilter}
                label="Group"
                onChange={(e) => setSectionFilter(e.target.value)}
                sx={{ borderRadius: "10px", backgroundColor: "#fff" }}
              >
                <MenuItem value="">All Groups</MenuItem>
                {uniqueSections.map((section, index) => (
                  <MenuItem key={index} value={section}>
                    {section}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* ============ Table ============ */}
        <Paper
          sx={{
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            p: { xs: 1, sm: 2 },
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              px: 1,
            }}
          >
            <Typography variant="h6" fontWeight={700} color="#0f172a">
              Notes List
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filteredNotes.length} record{filteredNotes.length !== 1 && "s"}
            </Typography>
          </Box>

          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 800 }}>
              <TableHead sx={{ backgroundColor: "grey.50" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>
                    Student
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      py: 1.5,
                      display: { xs: "none", sm: "table-cell" },
                    }}
                  >
                    Group
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      py: 1.5,
                      display: { xs: "none", md: "table-cell" },
                    }}
                  >
                    Specialization
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      py: 1.5,
                      display: { xs: "none", md: "table-cell" },
                    }}
                  >
                    Title
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      py: 1.5,
                      display: { xs: "none", sm: "table-cell" },
                    }}
                  >
                    Subject
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      py: 1.5,
                      display: { xs: "none", md: "table-cell" },
                    }}
                  >
                    Date
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      py: 1.5,
                      display: { xs: "none", md: "table-cell" },
                    }}
                  >
                    Grade
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredNotes.map((note) => {
                  const student = students.find(
                    (s) => s.student_id === note.student_id,
                  );
                  const gradeColor =
                    note.sabject_grade >= 90
                      ? "#10b981"
                      : note.sabject_grade >= 75
                        ? "#06b6d4"
                        : note.sabject_grade >= 60
                          ? "#f59e0b"
                          : "#ef4444";
                  return (
                    <StyledTableRow key={note.id}>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, wordBreak: "break-word" }}
                        >
                          {student?.name || note.student_id}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "grey.500" }}
                        >
                          ID: {note.student_id || "N/A"}
                        </Typography>
                      </TableCell>

                      <TableCell
                        sx={{
                          py: 1.5,
                          display: { xs: "none", sm: "table-cell" },
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {student?.section || "—"}
                        </Typography>
                      </TableCell>

                      <TableCell
                        sx={{
                          py: 1.5,
                          display: { xs: "none", md: "table-cell" },
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {student?.specialization || "—"}
                        </Typography>
                      </TableCell>

                      <TableCell
                        sx={{
                          py: 1.5,
                          display: { xs: "none", md: "table-cell" },
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {note.sabject_title || "—"}
                        </Typography>
                      </TableCell>

                      <TableCell
                        sx={{
                          py: 1.5,
                          display: { xs: "none", sm: "table-cell" },
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {note.sabject_name || "—"}
                        </Typography>
                      </TableCell>

                      <TableCell
                        sx={{
                          py: 1.5,
                          display: { xs: "none", md: "table-cell" },
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {note.sabject_date || "—"}
                        </Typography>
                      </TableCell>

                      <TableCell
                        sx={{
                          py: 1.5,
                          display: { xs: "none", md: "table-cell" },
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, color: gradeColor }}
                        >
                          {note.sabject_grade}
                        </Typography>
                      </TableCell>

                      <TableCell align="center" sx={{ py: 1.5 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 0.5,
                          }}
                        >
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              sx={{
                                color: "success.main",
                                bgcolor: "#f0fdf4",
                                "&:hover": { bgcolor: "#dcfce7" },
                              }}
                              onClick={() => handleView(note)}
                            >
                              <FiEye size={16} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              sx={{
                                color: "warning.main",
                                bgcolor: "#fffbeb",
                                "&:hover": { bgcolor: "#fef3c7" },
                              }}
                              onClick={() => handleEdit(note)}
                            >
                              <FiEdit size={16} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              sx={{
                                color: "error.main",
                                bgcolor: "#fef2f2",
                                "&:hover": { bgcolor: "#fee2e2" },
                              }}
                              onClick={() => handleDelete(note.id)}
                            >
                              <FiTrash2 size={16} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </StyledTableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredNotes.length === 0 && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="grey.500">No records found</Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* ==================== View Modal ==================== */}
      <StyledModal open={viewOpen} onClose={() => setViewOpen(false)}>
        <ModalContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              Note Details
            </Typography>
            <IconButton onClick={() => setViewOpen(false)}>
              <FiX />
            </IconButton>
          </Box>

          {selectedNote && (
            <Box sx={{ "& > *": { py: 1.2 } }}>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Student:</Typography>
                <Typography fontWeight={600}>
                  {students.find((s) => s.student_id === selectedNote.student_id)
                    ?.name || selectedNote.student_id}
                </Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Group:</Typography>
                <Typography fontWeight={600}>
                  {students.find((s) => s.student_id === selectedNote.student_id)
                    ?.section || "—"}
                </Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Specialization:</Typography>
                <Typography fontWeight={600}>
                  {students.find((s) => s.student_id === selectedNote.student_id)
                    ?.specialization || "—"}
                </Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Title:</Typography>
                <Typography fontWeight={600}>
                  {selectedNote.sabject_title || "—"}
                </Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Subject:</Typography>
                <Typography fontWeight={600}>
                  {selectedNote.sabject_name || "—"}
                </Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Date:</Typography>
                <Typography fontWeight={600}>
                  {selectedNote.sabject_date || "—"}
                </Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Grade:</Typography>
                <Typography
                  fontWeight={700}
                  sx={{
                    color:
                      selectedNote.sabject_grade >= 90
                        ? "#10b981"
                        : selectedNote.sabject_grade >= 75
                          ? "#06b6d4"
                          : selectedNote.sabject_grade >= 60
                            ? "#f59e0b"
                            : "#ef4444",
                  }}
                >
                  {selectedNote.sabject_grade}
                </Typography>
              </Box>
            </Box>
          )}
        </ModalContent>
      </StyledModal>

      {/* ==================== Edit Modal ==================== */}
      <StyledModal open={editOpen} onClose={handleEditCancel}>
        <ModalContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              Update Note
            </Typography>
            <IconButton onClick={handleEditCancel}>
              <FiX />
            </IconButton>
          </Box>

          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}

          <Box sx={{ "& > *": { mb: 2 } }}>
            <TextField
              fullWidth
              size="small"
              label="Note Title"
              name="sabject_title"
              value={editData.sabject_title}
              onChange={handleEditChange}
              error={!!editErrors.sabject_title}
              helperText={editErrors.sabject_title}
            />

            <FormControl fullWidth size="small" error={!!editErrors.sabject_name}>
              <InputLabel>Subject</InputLabel>
              <Select
                name="sabject_name"
                value={editData.sabject_name}
                onChange={handleEditChange}
                label="Subject"
              >
                {subjectOptions.map((subj) => (
                  <MenuItem key={subj} value={subj}>
                    {subj}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              type="date"
              label="Date"
              name="sabject_date"
              value={editData.sabject_date}
              onChange={handleEditChange}
              InputLabelProps={{ shrink: true }}
              error={!!editErrors.sabject_date}
              helperText={editErrors.sabject_date}
            />

            <TextField
              fullWidth
              size="small"
              type="number"
              label="Grade"
              name="sabject_grade"
              value={editData.sabject_grade}
              onChange={handleEditChange}
              error={!!editErrors.sabject_grade}
              helperText={editErrors.sabject_grade}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleEditCancel}
                disabled={editSubmitting}
                sx={{ borderRadius: "8px", textTransform: "none" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleEditSave}
                disabled={editSubmitting}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  background:
                    "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                  boxShadow: "0 4px 12px rgba(6, 182, 212, 0.3)",
                }}
              >
                {editSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </Box>
        </ModalContent>
      </StyledModal>

      {/* ==================== Status Dialog ==================== */}
      <Dialog
        open={modal.open}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
      >
        <DialogTitle sx={{ textAlign: "center" }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            {modal.success ? (
              <CheckCircle sx={{ fontSize: 50, color: "green" }} />
            ) : (
              <ErrorIcon sx={{ fontSize: 50, color: "red" }} />
            )}
          </Box>
          <Typography
            sx={{
              color: modal.success ? "green" : "red",
              fontWeight: 700,
              fontSize: "20px",
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
            sx={{ borderRadius: "8px", textTransform: "none" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
