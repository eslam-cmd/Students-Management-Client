"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
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
export default function ViewAttendanceByMonth() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // دالة جلب السجلات
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const studentId = localStorage.getItem("studentId");
      if (!studentId) return [];

      const res = await fetch(
        `https://manager-students-server.vercel.app/api/students/account/${studentId}`,
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Fetch failed");

      return json.student.attendance || [];
    } catch (err) {
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // fetch عند التحميل الأول
  useEffect(() => {
    fetchAttendance().then((data) => setAttendance(data));
  }, []);

  // تجميع حسب الشهر والسنة
  const getMonthYear = (dateStr) =>
    new Date(dateStr).toLocaleDateString("ar-EG", {
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

  // استخراج اسم اليوم بالعربي
  const getDayName = (dateStr) =>
    new Date(dateStr).toLocaleDateString("ar-EG", { weekday: "long" });

  return (
    <Paper sx={{ p: 3, borderRadius: "1rem", backgroundColor: "#fff" }}>
      {/* عنوان وزر إعادة التحميل */}
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
          sx={{ fontSize: { xs: "17px", md: "22px", lg: "25px" } }}
        >
          <FiCalendar style={{ color: "#2A52BE" }} />
          Attendance record
        </Typography>

        <IconButton
          onClick={async () => setAttendance(await fetchAttendance())}
          disabled={loading}
          color="primary"
        >
          {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
        </IconButton>
      </Box>

      {/* عند التحميل: عرض spinner */}
      {loading ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          sx={{ height: 200 }}
        >
          <CircularProgress />
          <Typography mt={1}>loading...</Typography>
        </Box>
      ) : attendance.length === 0 ? (
        <Typography>There are no attendance records</Typography>
      ) : (
        /* العرض حسب الأشهر */
        Object.entries(groupedByMonth).map(([monthYear, entries]) => (
          <Box key={monthYear} mb={4}>
            <Typography variant="h6" fontWeight={600} mb={1}>
              {monthYear}
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#5D8AA8" }}>
                    <TableCell
                      sx={{
                        color: "#000000",
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                    >
                      Day
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#000000",
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                    >
                      Date
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#000000",
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                    >
                      State
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.map((entry, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{getDayName(entry.attendance_date)}</TableCell>
                      <TableCell>{entry.attendance_date}</TableCell>
                      <TableCell
                        sx={{
                          color: entry.status === "present" ? "green" : "red",
                          fontWeight: 600,
                        }}
                      >
                        {entry.status === "present" ?"present" : "absent"}
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
