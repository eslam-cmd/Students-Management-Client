"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { styled } from "@mui/material/styles";
import { FiBookOpen, FiBarChart2 } from "react-icons/fi";
import StudentPracticalQuizCharts from "./StudentPracticalQuizCharts";

/* ==================== Styled Components ==================== */

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "12px",
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  boxShadow: "none",
  direction: "ltr",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const FancyTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: "8px",
  overflow: "auto",
  border: "1px solid #e5e7eb",
}));

const HeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: "#f9fafb",
  color: "#374151",
  fontWeight: 700,
  fontSize: "0.75rem",
  paddingTop: theme.spacing(1.2),
  paddingBottom: theme.spacing(1.2),
}));

/* ==================== Helpers ==================== */

const getDayName = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" });

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getGradeColor = (grade) => {
  const g = Number(grade);
  if (g >= 90) return "#10b981";
  if (g >= 75) return "#2A52BE";
  if (g >= 60) return "#f59e0b";
  return "#ef4444";
};

const API = (
  process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app"
).replace(/\/$/, "");

/* ==================== Main Component ==================== */

export default function ViewPracticalQuiz() {
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCharts, setShowCharts] = useState(false);

  /* ============ Fetch ============ */
  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/students/account/me`, {
        method: "GET",
        credentials: "include",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Fetch failed");

      const studentQuizzes = json.quizzes || json.student?.quizzes || [];
      return studentQuizzes.filter((q) => q.type === "practical");
    } catch (err) {
      console.error("Practical quiz fetch error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuiz().then((data) => setQuiz(data));
  }, [fetchQuiz]);

  /* ============ Grouping ============ */
  const getMonthYear = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

  const groupedByMonth = useMemo(() => {
    return quiz.reduce((acc, entry) => {
      const key = getMonthYear(entry.quiz_date);
      if (!acc[key]) acc[key] = [];
      acc[key].push(entry);
      return acc;
    }, {});
  }, [quiz]);

  /* ============ Quick Stats ============ */
  const overallStats = useMemo(() => {
    if (quiz.length === 0) return { avg: 0, total: 0 };
    const sum = quiz.reduce((s, q) => s + (Number(q.quiz_grade) || 0), 0);
    return {
      avg: (sum / quiz.length).toFixed(1),
      total: quiz.length,
    };
  }, [quiz]);

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
              <FiBookOpen size={20} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                color="#111827"
                fontSize={{ xs: "1.05rem", sm: "1.15rem" }}
              >
                Practical Quiz Record
              </Typography>
              <Typography variant="caption" color="#6b7280">
                {overallStats.total} quizzes • Avg: {overallStats.avg}
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
              onClick={async () => setQuiz(await fetchQuiz())}
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
          <StudentPracticalQuizCharts
            quiz={quiz}
            onClose={() => setShowCharts(false)}
          />
        </Box>
      )}

      {/* Records List */}
      <StyledPaper>
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
        ) : quiz.length === 0 ? (
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
              <FiBookOpen />
            </Box>
            <Typography color="#6b7280" variant="subtitle1" fontWeight={600}>
              No practical quizzes found
            </Typography>
          </Box>
        ) : (
          Object.entries(groupedByMonth).map(([monthYear, entries]) => {
            const monthGrades = entries.map((e) => Number(e.quiz_grade) || 0);
            const monthAvg = (
              monthGrades.reduce((s, g) => s + g, 0) / entries.length
            ).toFixed(1);

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
                      label={`${entries.length} quizzes`}
                      size="small"
                      sx={{
                        backgroundColor: "#f3f4f6",
                        color: "#374151",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        height: 24,
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Chip
                      label={`Avg: ${monthAvg}`}
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
                <FancyTableContainer>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <HeaderCell>Day</HeaderCell>
                        <HeaderCell>Date</HeaderCell>
                        <HeaderCell>Quiz Title</HeaderCell>
                        <HeaderCell>Subject</HeaderCell>
                        <HeaderCell>Grade</HeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {entries.map((entry) => (
                        <TableRow
                          key={entry.id}
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
                            {getDayName(entry.quiz_date)}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "0.8rem",
                              color: "#6b7280",
                              py: 1.1,
                            }}
                          >
                            {formatDate(entry.quiz_date)}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "0.8rem",
                              color: "#374151",
                              fontWeight: 500,
                              py: 1.1,
                            }}
                          >
                            {entry.quiz_title}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "0.8rem",
                              color: "#6b7280",
                              py: 1.1,
                            }}
                          >
                            {entry.quiz_name}
                          </TableCell>
                          <TableCell sx={{ py: 1.1 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                color: getGradeColor(entry.quiz_grade),
                              }}
                            >
                              {entry.quiz_grade}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </FancyTableContainer>
              </Box>
            );
          })
        )}
      </StyledPaper>
    </Box>
  );
}
