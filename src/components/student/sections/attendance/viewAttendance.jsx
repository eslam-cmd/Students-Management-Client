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
} from "@mui/material";
import { FiCalendar } from "react-icons/fi";
import RefreshIcon from "@mui/icons-material/Refresh";

// معالجة الرابط لضمان عدم وجود شرطة مائلة مضاعفة
const API = (
  process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app"
).replace(/\/$/, "");

export default function ViewAttendanceByMonth() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ جلب سجلات الحضور بالاعتماد المباشر على كوكي الجلسة الحالية
  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/students/account/me`, {
        method: "GET",
        credentials: "include", // يمرر الكوكي الموثق في المتصفح تلقائياً
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Fetch failed");

      // إرجاع قائمة الحضور من الكائن المجلوب من السيرفر
      return json.attendance || json.student?.attendance || [];
    } catch (err) {
      console.error("Attendance fetch error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAttendance().then((data) => setAttendance(data));
  }, [fetchAttendance]);

  // Group by month and year
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

  // Get day name in English
  const getDayName = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" });

  // Format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: "1rem",
        backgroundColor: "#fff",
        direction: "ltr",
      }}
    >
      {/* Title and Refresh Button */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography
          variant="h5"
          fontWeight={600}
          color="#1f2937"
          sx={{ fontSize: { xs: "16px", sm: "20px", md: "22px", lg: "25px" } }}
        >
          <FiCalendar style={{ color: "#2A52BE", marginRight: "8px" }} />
          Attendance Record
        </Typography>

        <IconButton
          onClick={async () => setAttendance(await fetchAttendance())}
          disabled={loading}
          color="primary"
          size={loading ? "medium" : "large"}
        >
          {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
        </IconButton>
      </Box>

      {/* Loading State */}
      {loading ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          sx={{ height: 200 }}
        >
          <CircularProgress />
          <Typography mt={1}>Loading...</Typography>
        </Box>
      ) : attendance.length === 0 ? (
        <Typography sx={{ textAlign: "center", py: 4 }}>
          No attendance records found
        </Typography>
      ) : (
        /* Display by Month */
        Object.entries(groupedByMonth).map(([monthYear, entries]) => (
          <Box key={monthYear} mb={4}>
            <Typography
              variant="h6"
              fontWeight={600}
              mb={1}
              sx={{ fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" } }}
            >
              {monthYear}
            </Typography>

            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="medium">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#5D8AA8" }}>
                    <TableCell
                      sx={{
                        color: "#000000",
                        fontWeight: 700,
                        fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 1, sm: 2 },
                      }}
                    >
                      Day
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#000000",
                        fontWeight: 700,
                        fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 1, sm: 2 },
                      }}
                    >
                      Date
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#000000",
                        fontWeight: 700,
                        fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 1, sm: 2 },
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
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      <TableCell
                        sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                      >
                        {getDayName(entry.attendance_date)}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                      >
                        {formatDate(entry.attendance_date)}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: entry.status === "present" ? "green" : "red",
                          fontWeight: 600,
                          fontSize: { xs: "0.8rem", sm: "0.9rem" },
                        }}
                      >
                        {entry.status === "present" ? "Present" : "Absent"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))
      )}
    </Paper>
  );
}