"use client";
import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FaUserCheck, FaUserTimes } from "react-icons/fa";
import { CheckCircle, Error as ErrorIcon } from "@mui/icons-material";

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "1rem",
  backgroundColor: "#fff",
  direction: "ltr",
}));
const API =
  process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app/";
export default function AddAttendance() {
  const [attendanceData, setAttendanceData] = useState({
    studentId: "",
    date: "",
    status: "",
  });
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [errorStudents, setErrorStudents] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Modal state
  const [modal, setModal] = useState({
    open: false,
    success: false,
    message: "",
  });

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setAttendanceData((prev) => ({ ...prev, date: today }));

    setLoadingStudents(true);
    fetch(`${API}/api/students`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((json) => {
        const list = Array.isArray(json) ? json : json.data || [];
        setStudents(list);
      })
      .catch((err) => {
        console.error(err);
        setErrorStudents("Failed to load student list");
      })
      .finally(() => setLoadingStudents(false));
  }, []);

  const handleChange = (e) => {
    setAttendanceData({
      ...attendanceData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");

    try {
      const checkRes = await fetch(
        `${API}/api/attendance?student_id=${attendanceData.studentId}&attendance_date=${attendanceData.date}`,
      );

      if (!checkRes.ok) throw new Error("Error checking records");

      const existing = await checkRes.json();

      if (Array.isArray(existing) && existing.length > 0) {
        setModal({
          open: true,
          success: true,
          message: "This student has already been recorded!",
        });
        setSubmitting(false);
        return;
      }

      // Save if no existing record
      const res = await fetch(
        `${API}/api/attendance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: attendanceData.studentId,
            attendance_date: attendanceData.date,
            status: attendanceData.status === "Present" ? "present" : "absent",
          }),
        },
      );

      if (!res.ok) throw new Error("Server error");

      await res.json();
      setAttendanceData({
        studentId: "",
        date: attendanceData.date,
        status: "",
      });

      setModal({
        open: true,
        success: true,
        message: "✅ Attendance recorded successfully!",
      });
    } catch (err) {
      console.error(err);
      setSubmitError("Failed to save attendance");
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
      <FormContainer>
        <Typography
          fontWeight={600}
          mb={2}
          color="#1f2937"
          sx={{
            fontSize: { xs: "17px", md: "22px", lg: "25px" },
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          Record Student Attendance
        </Typography>

        {errorStudents && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorStudents}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Select Student"
              name="studentId"
              value={attendanceData.studentId}
              onChange={handleChange}
              disabled={loadingStudents || submitting}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            >
              {loadingStudents ? (
                <MenuItem value="">
                  <CircularProgress size={24} />
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

          <Grid item xs={12}>
            <TextField
              fullWidth
              type="date"
              label="Attendance Date"
              name="date"
              value={attendanceData.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              disabled={submitting}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Status"
              name="status"
              value={attendanceData.status}
              onChange={handleChange}
              disabled={submitting}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": {
                    borderColor:
                      attendanceData.status === "Present"
                        ? "success.main"
                        : attendanceData.status === "Absent"
                          ? "error.main"
                          : "grey.400",
                  },
                  "&:hover fieldset": {
                    borderColor:
                      attendanceData.status === "Present"
                        ? "success.dark"
                        : attendanceData.status === "Absent"
                          ? "error.dark"
                          : "grey.600",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor:
                      attendanceData.status === "Present"
                        ? "success.main"
                        : attendanceData.status === "Absent"
                          ? "error.main"
                          : "primary.main",
                  },
                },
              }}
            >
              <MenuItem
                value="Present"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <FaUserCheck style={{ marginRight: 8 }} />
                Present
              </MenuItem>
              <MenuItem
                value="Absent"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <FaUserTimes style={{ marginRight: 8 }} />
                Absent
              </MenuItem>
            </TextField>
          </Grid>

          {submitError && (
            <Grid item xs={12}>
              <Alert severity="error">{submitError}</Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <Tooltip
              title={
                !attendanceData.studentId
                  ? "Please select a student"
                  : !attendanceData.status
                    ? "Please select a status"
                    : ""
              }
              arrow
            >
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={
                    submitting ||
                    !attendanceData.studentId ||
                    !attendanceData.status
                  }
                  sx={{
                    borderRadius: "0.5rem",
                    px: 4,
                    py: 1.2,
                    fontWeight: 600,
                    backgroundColor: "#2563eb",
                    "&:hover": {
                      backgroundColor: "#1d4ed8",
                    },
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
                  {submitting ? "Saving..." : "Save Attendance"}
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
}
