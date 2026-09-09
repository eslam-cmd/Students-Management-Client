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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FiTrash2, FiEdit } from "react-icons/fi";
import Tooltip from "@mui/material/Tooltip";

const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "1rem",
  backgroundColor: "#fff",
  direction: "ltr",
}));
const API =
  process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app/";
export default function ViewAttendance() {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedStudent, setSelectedStudent] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // states for edit/delete
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    student: "",
    attendance_date: "",
    status: "",
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  // fetch students + attendance
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
      const studentsArray = Array.isArray(stuJson) ? stuJson : stuJson.data || [];
      const recordsArray = Array.isArray(attJson) ? attJson : attJson.data || [];

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

  // merge student name into attendance record
  const enriched = useMemo(() => {
    const mapNames = {};
    students.forEach((s) => {
      mapNames[s.student_id] = s.name;
    });
    return records.map((r) => ({
      ...r,
      student: mapNames[r.student_id] || r.student_id,
    }));
  }, [students, records]);

  // filter by student + date range
  const filtered = useMemo(
    () =>
      enriched.filter((r) => {
        if (selectedStudent && r.student !== selectedStudent) return false;
        if (fromDate && r.attendance_date < fromDate) return false;
        if (toDate && r.attendance_date > toDate) return false;
        return true;
      }),
    [enriched, selectedStudent, fromDate, toDate]
  );

  // group by month-year
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
        (x, y) =>
          new Date(x.attendance_date) - new Date(y.attendance_date)
      ),
    }));
  }, [filtered]);

  // delete a record
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(
        `${API}/api/attendance/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Delete failed");
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete record");
    }
  };

  // open edit dialog
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

  // save edited record
  const handleSaveEdit = async () => {
    setEditSubmitting(true);
    setEditError("");
    try {
      const res = await fetch(
        `${API}/api/attendance/${editData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attendance_date: editData.attendance_date,
            status: editData.status,
          }),
        }
      );
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
            : r
        )
      );
      setEditOpen(false);
    } catch (err) {
      console.error(err);
      setEditError(err.message);
    } finally {
      setEditSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get day name
  const getDayName = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
    });
  };

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

  return (
    <Container>
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography 
          fontWeight={600} 
          color="#1f2937" 
          sx={{
            fontSize: { xs: "17px", md: "22px", lg: "25px" },
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          Attendance Records
        </Typography>
        <Button
          variant="outlined"
          onClick={() => {
            setSelectedStudent("");
            setFromDate("");
            setToDate("");
            fetchData();
          }}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </Grid>

      {/* Student Filter */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Student</InputLabel>
        <Select
          value={selectedStudent}
          label="Select Student"
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <MenuItem value="">Show All</MenuItem>
          {students.map((s) => (
            <MenuItem key={s.student_id} value={s.name}>
              {s.name} {s.student_id ? `(${s.student_id})` : ""}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Date Range Filter */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="From Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="To Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              setSelectedStudent("");
              setFromDate("");
              setToDate("");
            }}
            sx={{ height: "100%", minHeight: "56px" }}
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>

      {/* Monthly Sections with Actions */}
      {groupedByMonth.map((grp) => (
        <React.Fragment key={grp.month}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            mt={4}
            mb={1}
            color="#333"
            sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}
          >
            {grp.month}
          </Typography>

          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f3f4f6" }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                    Student
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                    Day
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                    Status
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {grp.entries.map((ent, i) => {
                  const dayName = getDayName(ent.attendance_date);
                  return (
                    <TableRow 
                      key={i}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#f8fafc",
                        },
                      }}
                    >
                      <TableCell sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                        {ent.student}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                        {dayName}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                        {formatDate(ent.attendance_date)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ent.status === "present" ? "Present" : "Absent"}
                          size="small"
                          sx={{
                            backgroundColor: ent.status === "present" ? "#22c55e" : "#ef4444",
                            color: "white",
                            fontWeight: 600,
                            fontSize: { xs: "0.7rem", sm: "0.8rem" },
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(ent)}
                            sx={{ color: "#3b82f6" }}
                          >
                            <FiEdit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(ent.id)}
                          >
                            <FiTrash2 />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </React.Fragment>
      ))}

      {filtered.length === 0 && (
        <Typography mt={2} color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
          No records match your filters
        </Typography>
      )}

      {/* Edit Dialog */}
      <Dialog 
        open={editOpen} 
        onClose={() => setEditOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            minWidth: { xs: "90%", sm: "400px" },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Edit Attendance Record
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}
          <TextField
            margin="dense"
            label="Attendance Date"
            type="date"
            fullWidth
            value={editData.attendance_date}
            onChange={(e) =>
              setEditData((prev) => ({
                ...prev,
                attendance_date: e.target.value,
              }))
            }
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense">
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
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button 
            onClick={() => setEditOpen(false)} 
            disabled={editSubmitting}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            disabled={editSubmitting}
            sx={{
              backgroundColor: "#2563eb",
              "&:hover": {
                backgroundColor: "#1d4ed8",
              },
            }}
          >
            {editSubmitting ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}