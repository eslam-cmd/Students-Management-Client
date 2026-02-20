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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FaUserCheck, FaUserTimes } from "react-icons/fa";
import { CheckCircle, Error as ErrorIcon } from "@mui/icons-material";

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "1rem",
  backgroundColor: "#fff",
}));

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

  // حالة المودال
  const [modal, setModal] = useState({
    open: false,
    success: false,
    message: "",
  });

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setAttendanceData((prev) => ({ ...prev, date: today }));

    setLoadingStudents(true);
    fetch("https://manager-students-server.vercel.app/api/students")
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
        `https://manager-students-server.vercel.app/api/attendance?student_id=${attendanceData.studentId}&attendance_date=${attendanceData.date}`
      );

      if (!checkRes.ok) throw new Error("Error in verifying records");

      const existing = await checkRes.json();

      if (Array.isArray(existing) && existing.length > 0) {
        setModal({
          open: true,
          success: true,
          message: "This student has already been added!",
        });
        setSubmitting(false);
        return; // إيقاف العملية
      }

      // ✅ إذا لم يوجد سجل، نكمل الحفظ
      const res = await fetch(
        "https://manager-students-server.vercel.app/api/attendance",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: attendanceData.studentId,
            attendance_date: attendanceData.date,
            status: attendanceData.status === "present" ? "present" : "absent",
          }),
        }
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
        message: "The inspection was successfully saved. ✅ ",
      });
    } catch (err) {
      console.error(err);
      setSubmitError("We were unable to save the inspection.");
      setModal({
        open: true,
        success: false,
        message: "An error occurred during saving.❌ ",
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
          sx={{ fontSize: { xs: "17px", md: "22px", lg: "25px" } }}
        >
          Register the student's status
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
              label="Select the student"
              name="studentId"
              value={attendanceData.studentId}
              onChange={handleChange}
              disabled={loadingStudents || submitting}
            >
              {loadingStudents ? (
                <MenuItem value="">
                  <CircularProgress size={24} />
                </MenuItem>
              ) : (
                students.map((s) => (
                  <MenuItem key={s.student_id} value={s.student_id}>
                    {s.name}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              type="date"
              label="Inspection date"
              name="date"
              value={attendanceData.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              disabled={submitting}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="status"
              name="status"
              value={attendanceData.status}
              onChange={handleChange}
              disabled={submitting}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor:
                      attendanceData.status === "present"
                        ? "success.main"
                        : attendanceData.status === "absent"
                          ? "error.main"
                          : "grey.400",
                  },
                  "&:hover fieldset": {
                    borderColor:
                      attendanceData.status === "present"
                        ? "success.dark"
                        : attendanceData.status === "absent"
                          ? "error.dark"
                          : "grey.600",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor:
                      attendanceData.status === "present"
                        ? "success.main"
                        : attendanceData.status === "absent"
                          ? "error.main"
                          : "primary.main",
                  },
                },
              }}
            >
              <MenuItem value="present">
                <FaUserCheck style={{ marginRight: 8 }} />
                present
              </MenuItem>
              <MenuItem value="absent">
                <FaUserTimes style={{ marginRight: 8 }} />
                absent
              </MenuItem>
            </TextField>
          </Grid>

          {submitError && (
            <Grid item xs={12}>
              <Alert severity="error">{submitError}</Alert>
            </Grid>
          )}

          <Grid item xs={12}>
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
              }}
              startIcon={
                submitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {submitting ? "saveing..." : "Save the check"}
            </Button>
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
            variant="h6"
            sx={{
              color: modal.success ? "green" : "red",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {modal.success ? "Success of the operation" : "Operation failed"}
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
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
