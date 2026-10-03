// components/ViewAttendance.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Paper,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
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
  IconButton,
  Chip,
  Box,
  Avatar,
  Divider,
  Tooltip,
  Modal,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { CheckCircle, Error as ErrorIcon } from "@mui/icons-material";
import {
  FiTrash2,
  FiEdit,
  FiRefreshCw,
  FiBarChart2,
  FiEye,
  FiX,
  FiCalendar,
  FiFilter,
  FiUserCheck,
  FiUserX,
} from "react-icons/fi";
import AttendanceCharts from "./AttendanceCharts";

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

const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "1rem",
  backgroundColor: "#fff",
  direction: "ltr",
}));

/* ==================== Constants ==================== */

const API =
  process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app";

/* ==================== Main Component ==================== */

export default function ViewAttendance() {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloading, setReloading] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Modals
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modal, setModal] = useState({
    open: false,
    success: false,
    message: "",
  });

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    student: "",
    attendance_date: "",
    status: "",
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  /* ==================== Fetch Data ==================== */
  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [stuRes, attRes] = await Promise.all([
        fetch(`${API}/api/students`),
        fetch(`${API}/api/attendance`),
      ]);
      if (!stuRes.ok || !attRes.ok) throw new Error("Request failed");

      const stuJson = await stuRes.json();
      const attJson = await attRes.json();
      const studentsArray = Array.isArray(stuJson)
        ? stuJson
        : stuJson.data || [];
      const recordsArray = Array.isArray(attJson)
        ? attJson
        : attJson.data || [];

      setStudents(studentsArray);
      setRecords(recordsArray);
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ==================== Reload ==================== */
  const handleReload = async () => {
    setReloading(true);
    await fetchData();
    setReloading(false);
  };

  /* ==================== Enrich ==================== */
  const enriched = useMemo(() => {
    const mapNames = {};
    const mapSections = {};
    students.forEach((s) => {
      mapNames[s.student_id] = s.name;
      mapSections[s.student_id] = s.section;
    });
    return records.map((r) => ({
      ...r,
      student: mapNames[r.student_id] || r.student_id,
      section: mapSections[r.student_id] || "—",
    }));
  }, [students, records]);

  /* ==================== Filter ==================== */
  const filtered = useMemo(
    () =>
      enriched.filter((r) => {
        if (selectedStudent && r.student !== selectedStudent) return false;
        if (fromDate && r.attendance_date < fromDate) return false;
        if (toDate && r.attendance_date > toDate) return false;
        return true;
      }),
    [enriched, selectedStudent, fromDate, toDate],
  );

  /* ==================== Group By Month ==================== */
  const groupedByMonth = useMemo(() => {
    const groups = {};
    filtered.forEach((r) => {
      const d = new Date(r.attendance_date);
      const key = d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const da = new Date(groups[a][0].attendance_date);
      const db = new Date(groups[b][0].attendance_date);
      return da - db;
    });
    return sortedKeys.map((key) => ({
      month: key,
      entries: groups[key].sort(
        (x, y) => new Date(x.attendance_date) - new Date(y.attendance_date),
      ),
    }));
  }, [filtered]);

  /* ==================== Delete ==================== */
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(`${API}/api/attendance/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setModal({
        open: true,
        success: true,
        message: "✅ Attendance record deleted successfully",
      });
    } catch (err) {
      console.error(err);
      setModal({
        open: true,
        success: false,
        message: "❌ Failed to delete record",
      });
    }
  };

  /* ==================== View ==================== */
  const handleView = (entry) => {
    setSelectedRecord(entry);
    setViewOpen(true);
  };

  /* ==================== Edit ==================== */
  const handleEditClick = (entry) => {
    setEditData({
      id: entry.id,
      student: entry.student,
      attendance_date: entry.attendance_date,
      status: entry.status,
    });
    setEditError("");
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    setEditSubmitting(true);
    setEditError("");
    try {
      const res = await fetch(`${API}/api/attendance/${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendance_date: editData.attendance_date,
          status: editData.status,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Update failed");
      }
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editData.id
            ? {
                ...r,
                attendance_date: editData.attendance_date,
                status: editData.status,
              }
            : r,
        ),
      );
      setEditOpen(false);
      setModal({
        open: true,
        success: true,
        message: "✅ Attendance record updated successfully",
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

  /* ==================== Helpers ==================== */
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDayName = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
    });
  };

  /* ==================== Loading ==================== */
  if (loading) {
    return (
      <Container>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{ height: 200 }}
        >
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading...</Typography>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
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
            <FiCalendar style={{ fontSize: "1.5rem", color: "#10b981" }} />
            <Typography
              sx={{
                fontWeight: "bold",
                color: "grey.800",
                fontSize: { xs: "18px", md: "22px" },
              }}
            >
              Attendance Management
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
                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      color: "#fff",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #059669 0%, #047857 100%)",
                      },
                    }
                  : {
                      borderColor: "#cbd5e1",
                      color: "#10b981",
                      backgroundColor: "#fff",
                      "&:hover": {
                        borderColor: "#10b981",
                        backgroundColor: "#f0fdf4",
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
            <AttendanceCharts
              records={filtered}
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

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Student</InputLabel>
                <Select
                  value={selectedStudent}
                  label="Select Student"
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  sx={{ borderRadius: "10px", backgroundColor: "#fff" }}
                >
                  <MenuItem value="">Show All</MenuItem>
                  {students.map((s) => (
                    <MenuItem key={s.student_id} value={s.name}>
                      {s.name} {s.student_id ? `(${s.student_id})` : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="From Date"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    backgroundColor: "#fff",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="To Date"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    backgroundColor: "#fff",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setSelectedStudent("");
                  setFromDate("");
                  setToDate("");
                }}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  height: 40,
                  borderColor: "#cbd5e1",
                  color: "#64748b",
                  "&:hover": {
                    borderColor: "#10b981",
                    color: "#10b981",
                    backgroundColor: "#f0fdf4",
                  },
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* ============ Records Counter ============ */}
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
            Attendance Records
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {filtered.length} record{filtered.length !== 1 && "s"}
          </Typography>
        </Box>

        {/* ============ Monthly Sections ============ */}
        {groupedByMonth.map((grp) => (
          <React.Fragment key={grp.month}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              mt={3}
              mb={1}
              color="#333"
              sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}
            >
              {grp.month}
            </Typography>

            <Paper
              sx={{
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                p: { xs: 1, sm: 2 },
                mb: 2,
              }}
            >
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table size="small" sx={{ minWidth: 700 }}>
                  <TableHead sx={{ backgroundColor: "grey.50" }}>
                    <TableRow>
                      <TableCell
                        sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}
                      >
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
                          display: { xs: "none", sm: "table-cell" },
                        }}
                      >
                        Day
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
                        sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}
                      >
                        Status
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
                    {grp.entries.map((ent, i) => {
                      const dayName = getDayName(ent.attendance_date);
                      return (
                        <StyledTableRow key={i}>
                          <TableCell sx={{ py: 1.5 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, wordBreak: "break-word" }}
                            >
                              {ent.student}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "grey.500" }}
                            >
                              ID: {ent.student_id || "N/A"}
                            </Typography>
                          </TableCell>

                          <TableCell
                            sx={{
                              py: 1.5,
                              display: { xs: "none", sm: "table-cell" },
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              {ent.section || "—"}
                            </Typography>
                          </TableCell>

                          <TableCell
                            sx={{
                              py: 1.5,
                              display: { xs: "none", sm: "table-cell" },
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              {dayName}
                            </Typography>
                          </TableCell>

                          <TableCell
                            sx={{
                              py: 1.5,
                              display: { xs: "none", md: "table-cell" },
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(ent.attendance_date)}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ py: 1.5 }}>
                            <Chip
                              icon={
                                ent.status === "present" ? (
                                  <FiUserCheck size={14} />
                                ) : (
                                  <FiUserX size={14} />
                                )
                              }
                              label={
                                ent.status === "present" ? "Present" : "Absent"
                              }
                              size="small"
                              sx={{
                                backgroundColor:
                                  ent.status === "present"
                                    ? "#f0fdf4"
                                    : "#fef2f2",
                                color:
                                  ent.status === "present"
                                    ? "#10b981"
                                    : "#ef4444",
                                fontWeight: 600,
                                border: `1px solid ${
                                  ent.status === "present"
                                    ? "#86efac"
                                    : "#fecaca"
                                }`,
                                "& .MuiChip-icon": {
                                  color: "inherit",
                                },
                              }}
                            />
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
                                  onClick={() => handleView(ent)}
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
                                  onClick={() => handleEditClick(ent)}
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
                                  onClick={() => handleDelete(ent.id)}
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
            </Paper>
          </React.Fragment>
        ))}

        {filtered.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="grey.500">
              No records match your filters
            </Typography>
          </Box>
        )}
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
              Attendance Details
            </Typography>
            <IconButton onClick={() => setViewOpen(false)}>
              <FiX />
            </IconButton>
          </Box>

          {selectedRecord && (
            <Box sx={{ "& > *": { py: 1.2 } }}>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Student:</Typography>
                <Typography fontWeight={600}>
                  {selectedRecord.student}
                </Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Student ID:</Typography>
                <Typography fontWeight={600}>
                  {selectedRecord.student_id || "—"}
                </Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Group:</Typography>
                <Typography fontWeight={600}>
                  {selectedRecord.section || "—"}
                </Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Day:</Typography>
                <Typography fontWeight={600}>
                  {getDayName(selectedRecord.attendance_date)}
                </Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Date:</Typography>
                <Typography fontWeight={600}>
                  {formatDate(selectedRecord.attendance_date)}
                </Typography>
              </Box>
              <Divider />
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography color="text.secondary">Status:</Typography>
                <Chip
                  icon={
                    selectedRecord.status === "present" ? (
                      <FiUserCheck size={14} />
                    ) : (
                      <FiUserX size={14} />
                    )
                  }
                  label={
                    selectedRecord.status === "present" ? "Present" : "Absent"
                  }
                  size="small"
                  sx={{
                    backgroundColor:
                      selectedRecord.status === "present"
                        ? "#f0fdf4"
                        : "#fef2f2",
                    color:
                      selectedRecord.status === "present"
                        ? "#10b981"
                        : "#ef4444",
                    fontWeight: 600,
                    border: `1px solid ${
                      selectedRecord.status === "present"
                        ? "#86efac"
                        : "#fecaca"
                    }`,
                    "& .MuiChip-icon": {
                      color: "inherit",
                    },
                  }}
                />
              </Box>
            </Box>
          )}
        </ModalContent>
      </StyledModal>

      {/* ==================== Edit Modal ==================== */}
      <StyledModal open={editOpen} onClose={() => setEditOpen(false)}>
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
              Edit Attendance Record
            </Typography>
            <IconButton onClick={() => setEditOpen(false)}>
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
              label="Attendance Date"
              type="date"
              value={editData.attendance_date}
              onChange={(e) =>
                setEditData((prev) => ({
                  ...prev,
                  attendance_date: e.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={editData.status}
                label="Status"
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
              >
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="absent">Absent</MenuItem>
              </Select>
            </FormControl>

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
                onClick={() => setEditOpen(false)}
                disabled={editSubmitting}
                sx={{ borderRadius: "8px", textTransform: "none" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveEdit}
                disabled={editSubmitting}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
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
