"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  IconButton,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
} from "@mui/material";
import {
  FiCalendar,
  FiBarChart2,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import RefreshIcon from "@mui/icons-material/Refresh";
import StudentAttendanceCharts from "./StudentAttendanceCharts";

// معالجة الرابط لضمان عدم وجود شرطة مائلة مضاعفة
const API = (
  process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app"
).replace(/\/$/, "");

export default function ViewAttendanceByMonth() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCharts, setShowCharts] = useState(false);

  /* ============ Fetch ============ */
  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/students/account/me`, {
        method: "GET",
        credentials: "include",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Fetch failed");

      return json.attendance || json.student?.attendance || [];
    } catch (err) {
      console.error("Attendance fetch error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance().then((data) => setAttendance(data));
  }, [fetchAttendance]);

  /* ============ Grouping ============ */
  const getMonthYear = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

  const groupedByMonth = useMemo(() => {
    return attendance.reduce((acc, entry) => {
      const key = getMonthYear(entry.attendance_date);
      if (!acc[key]) acc[key] = [];
      acc[key].push(entry);
      return acc;
    }, {});
  }, [attendance]);

  const getDayName = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" });

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /* ============ Quick Stats ============ */
  const stats = useMemo(() => {
    const present = attendance.filter((a) => a.status === "present").length;
    const absent = attendance.filter((a) => a.status === "absent").length;
    const total = attendance.length;
    const rate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    return { present, absent, total, rate };
  }, [attendance]);

  return (
    <Box>
      {/* Header */}
      <Paper
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 2.5,
          borderRadius: "12px",
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
          boxShadow: "none",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                backgroundColor: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2A52BE",
              }}
            >
              <FiCalendar size={20} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                color="#111827"
                fontSize={{ xs: "1.05rem", sm: "1.15rem" }}
              >
                Attendance Record
              </Typography>
              <Typography variant="caption" color="#6b7280">
                {stats.total} days recorded
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button
              variant={showCharts ? "contained" : "outlined"}
              startIcon={<FiBarChart2 />}
              onClick={() => setShowCharts((prev) => !prev)}
              size="small"
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                height: 38,
                px: 2,
                ...(showCharts
                  ? {
                      backgroundColor: "#2A52BE",
                      color: "#fff",
                      border: "none",
                      boxShadow: "none",
                      "&:hover": {
                        backgroundColor: "#1e3a8a",
                      },
                    }
                  : {
                      borderColor: "#e5e7eb",
                      color: "#2A52BE",
                      backgroundColor: "#fff",
                      "&:hover": {
                        borderColor: "#2A52BE",
                        backgroundColor: "#eff6ff",
                      },
                    }),
              }}
            >
              {showCharts ? "Hide Charts" : "Show Charts"}
            </Button>

            <IconButton
              onClick={async () => setAttendance(await fetchAttendance())}
              disabled={loading}
              sx={{
                width: 38,
                height: 38,
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                color: "#6b7280",
                "&:hover": {
                  backgroundColor: "#f9fafb",
                  color: "#2A52BE",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={18} />
              ) : (
                <RefreshIcon fontSize="small" />
              )}
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Charts Section */}
      {showCharts && (
        <Box mb={2.5}>
          <StudentAttendanceCharts
            attendance={attendance}
            onClose={() => setShowCharts(false)}
          />
        </Box>
      )}

      {/* Records List */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: "12px",
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
          boxShadow: "none",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 6,
              gap: 1.5,
            }}
          >
            <CircularProgress size={40} sx={{ color: "#2A52BE" }} />
            <Typography variant="body2" color="#6b7280">
              Loading...
            </Typography>
          </Box>
        ) : attendance.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                backgroundColor: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
                color: "#9ca3af",
                fontSize: "1.5rem",
              }}
            >
              <FiCalendar />
            </Box>
            <Typography color="#6b7280" variant="subtitle1" fontWeight={600}>
              No attendance records found
            </Typography>
          </Box>
        ) : (
          Object.entries(groupedByMonth).map(([monthYear, entries]) => {
            const monthPresent = entries.filter(
              (e) => e.status === "present",
            ).length;
            const monthAbsent = entries.length - monthPresent;
            const monthRate = ((monthPresent / entries.length) * 100).toFixed(
              0,
            );

            return (
              <Box key={monthYear} mb={4}>
                {/* Month Header */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1.5,
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color="#111827"
                    sx={{ fontSize: { xs: "1rem", sm: "1.05rem" } }}
                  >
                    {monthYear}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 0.75 }}>
                    <Chip
                      icon={<FiCheckCircle size={12} />}
                      label={`${monthPresent} Present`}
                      size="small"
                      sx={{
                        backgroundColor: "#f0fdf4",
                        color: "#10b981",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        height: 24,
                        border: "1px solid #86efac",
                        "& .MuiChip-icon": { color: "inherit" },
                      }}
                    />
                    <Chip
                      icon={<FiXCircle size={12} />}
                      label={`${monthAbsent} Absent`}
                      size="small"
                      sx={{
                        backgroundColor: "#fef2f2",
                        color: "#ef4444",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        height: 24,
                        border: "1px solid #fecaca",
                        "& .MuiChip-icon": { color: "inherit" },
                      }}
                    />
                    <Chip
                      label={`${monthRate}%`}
                      size="small"
                      sx={{
                        backgroundColor: "#eff6ff",
                        color: "#2A52BE",
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        height: 24,
                        border: "1px solid #bfdbfe",
                      }}
                    />
                  </Box>
                </Box>

                {/* Table */}
                <TableContainer
                  sx={{
                    overflowX: "auto",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            color: "#374151",
                            py: 1.2,
                          }}
                        >
                          Day
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            color: "#374151",
                            py: 1.2,
                          }}
                        >
                          Date
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            color: "#374151",
                            py: 1.2,
                          }}
                        >
                          Status
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {entries.map((entry, idx) => (
                        <TableRow
                          key={idx}
                          sx={{
                            "&:hover": { backgroundColor: "#f9fafb" },
                            "&:last-child td": { borderBottom: "none" },
                          }}
                        >
                          <TableCell
                            sx={{
                              fontSize: "0.8rem",
                              color: "#374151",
                              py: 1.1,
                            }}
                          >
                            {getDayName(entry.attendance_date)}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "0.8rem",
                              color: "#6b7280",
                              py: 1.1,
                            }}
                          >
                            {formatDate(entry.attendance_date)}
                          </TableCell>
                          <TableCell sx={{ py: 1.1 }}>
                            <Chip
                              label={
                                entry.status === "present"
                                  ? "Present"
                                  : "Absent"
                              }
                              size="small"
                              sx={{
                                backgroundColor:
                                  entry.status === "present"
                                    ? "#f0fdf4"
                                    : "#fef2f2",
                                color:
                                  entry.status === "present"
                                    ? "#10b981"
                                    : "#ef4444",
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                height: 22,
                                border: `1px solid ${
                                  entry.status === "present"
                                    ? "#86efac"
                                    : "#fecaca"
                                }`,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            );
          })
        )}
      </Paper>
    </Box>
  );
}
