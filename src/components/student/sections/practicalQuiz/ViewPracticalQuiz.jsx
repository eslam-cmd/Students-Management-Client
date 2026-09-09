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
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { styled } from "@mui/material/styles";
import { FiBookOpen } from "react-icons/fi";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[4],
  direction: "ltr",
}));

const FancyTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  overflow: "auto",
  boxShadow: theme.shadows[2],
}));

const HeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: "#5D8AA8",
  color: "#000000",
  fontWeight: 700,
  fontSize: "0.9rem",
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
}));

const getDayName = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" });

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// معالجة الرابط لضمان عدم وجود شرطة مائلة مضاعفة
const API = (
  process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app"
).replace(/\/$/, "");

export default function ViewPracticalQuiz() {
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ جلب الاختبارات العملية بالاعتماد المباشر على كوكي الجلسة الحالية
  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/students/account/me`, {
        method: "GET",
        credentials: "include", // يمرر الكوكي الموثق تلقائياً
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Fetch failed");

      const studentQuizzes = json.quizzes || json.student?.quizzes || [];

      // تصفية الاختبارات العملية فقط
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

  return (
    <StyledPaper>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography
          fontWeight={700}
          color="text.primary"
          sx={{
            fontSize: { xs: "16px", sm: "20px", md: "22px", lg: "25px" },
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FiBookOpen style={{ color: "#2A52BE" }} />
          Practical Quiz Record
        </Typography>
        <IconButton
          onClick={async () => setQuiz(await fetchQuiz())}
          disabled={loading}
          color="primary"
          size={loading ? "medium" : "large"}
        >
          {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
        </IconButton>
      </Box>

      {loading ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height={200}
        >
          <CircularProgress />
          <Typography mt={1}>Loading...</Typography>
        </Box>
      ) : quiz.length === 0 ? (
        <Typography align="center" sx={{ py: 4 }}>
          No practical quizzes found
        </Typography>
      ) : (
        Object.entries(groupedByMonth).map(([monthYear, entries]) => (
          <Box key={monthYear} mb={4}>
            <Typography
              variant="h6"
              fontWeight={600}
              mb={1}
              color="text.secondary"
              sx={{ fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" } }}
            >
              {monthYear}
            </Typography>
            <FancyTableContainer>
              <Table stickyHeader size="medium">
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
                        "&:nth-of-type(odd)": {
                          backgroundColor: "rgba(25,118,210,0.04)",
                        },
                        "&:hover": {
                          backgroundColor: "rgba(25,118,210,0.12)",
                        },
                      }}
                    >
                      <TableCell
                        sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                      >
                        {getDayName(entry.quiz_date)}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                      >
                        {formatDate(entry.quiz_date)}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                      >
                        {entry.quiz_title}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                      >
                        {entry.quiz_name}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                      >
                        {entry.quiz_grade}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </FancyTableContainer>
          </Box>
        ))
      )}
    </StyledPaper>
  );
}
