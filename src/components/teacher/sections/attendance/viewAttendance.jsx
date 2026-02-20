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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FiTrash2,FiEye } from "react-icons/fi";
import Tooltip from "@mui/material/Tooltip";

const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "1rem",
  backgroundColor: "#fff",
}));

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
        fetch("https://manager-students-server.vercel.app/api/students"),
        fetch("https://manager-students-server.vercel.app/api/attendance"),
      ]);
      if (!stuRes.ok || !attRes.ok) throw new Error("خطأ في الطلب");

      const stuJson = await stuRes.json();
      const attJson = await attRes.json();
      const studentsArray = Array.isArray(stuJson) ? stuJson : stuJson.data || [];
      const recordsArray = Array.isArray(attJson) ? attJson : attJson.data || [];

      setStudents(studentsArray);
      setRecords(recordsArray);
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching the data.");
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
      const key = d.toLocaleDateString("ar-EG", {
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
    if (!confirm("Do you want to delete this record?")) return;
    try {
      const res = await fetch(
        `https://manager-students-server.vercel.app/api/attendance/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Deletion failed");
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete the record");
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
        `https://manager-students-server.vercel.app/api/attendance/${editData.id}`,
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
        <Typography fontWeight={600} color="#1f2937" sx={{fontSize:{xs:"17px",md:"22px",lg:"25px"}}}>
          Inspection record
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
          {loading ? "Saveing..." : "Reload"}
        </Button>
      </Grid>

      {/* فلترة الطالب */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>The student chose.</InputLabel>
        <Select
          value={selectedStudent}
          label="The student chose."
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <MenuItem value="">View All</MenuItem>
          {students.map((s) => (
            <MenuItem key={s.student_id} value={s.name}>
              {s.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* فلترة التواريخ */}
      <Grid container spacing={2} mb={3}>
        <Grid item>
          <TextField
            label="From history"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </Grid>
        <Grid item>
          <TextField
            label="Up to date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </Grid>
      </Grid>

      {/* الأقسام الشهرية مع إجراءات */}
      {groupedByMonth.map((grp) => (
        <React.Fragment key={grp.month}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            mt={4}
            mb={1}
            color="#333"
          >
            {grp.month}
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f3f4f6" }}>
                  <TableCell>The student</TableCell>
                  <TableCell>Today</TableCell>
                  <TableCell>date</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell align="center">Procedures</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {grp.entries.map((ent, i) => {
                  const dayName = new Date(ent.attendance_date).toLocaleDateString(
                    "ar-EG",
                    { weekday: "long" }
                  );
                  return (
                    <TableRow key={i}>
                      <TableCell>{ent.student}</TableCell>
                      <TableCell>{dayName}</TableCell>
                      <TableCell>{ent.attendance_date}</TableCell>
                      <TableCell
                        sx={{
                          color: ent.status === "present" ? "green" : "red",
                          fontWeight: 600,
                        }}
                      >
                        {ent.status === "present" ? "present" : "absent"}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Update">
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(ent)}
                          >
                            <FiEye />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
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
        <Typography mt={2} color="text.secondary">
There are no records matching the filter.        </Typography>
      )}

      {/* حوار التعديل */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit inspection record</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {editError && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {editError}
            </Alert>
          )}
          <TextField
            margin="dense"
            label="Inspection date"
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
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>State</InputLabel>
            <Select
              value={editData.status}
              label="State"
              onChange={(e) =>
                setEditData((prev) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
            >
              <MenuItem value="present">present</MenuItem>
              <MenuItem value="absent">absent</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} disabled={editSubmitting}>
            Cansel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            disabled={editSubmitting}
          >
            {editSubmitting ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}