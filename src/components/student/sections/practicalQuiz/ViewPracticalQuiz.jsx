"use client";
import React, { useState, useEffect, useMemo } from "react";
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
  fontSize: "1rem",
}));

const getDayName = (dateStr) =>
  new Date(dateStr).toLocaleDateString("ar-EG", { weekday: "long" });

export default function ViewPrecticalQuiz() {
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const studentId = localStorage.getItem("studentId");
      if (!studentId) return [];
      const res = await fetch(
        `https://manager-students-server.vercel.app/api/students/account/${studentId}`,
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Fetch failed");

      // فلترة الكويزات النظرية فقط
      return (json.student.quizzes || []).filter((q) => q.type === "practical");
    } catch (err) {
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz().then((data) => setQuiz(data));
  }, []);

  const getMonthYear = (dateStr) =>
    new Date(dateStr).toLocaleDateString("ar-EG", {
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
          sx={{ fontSize: { xs: "17px", md: "22px", lg: "25px" } }}
        >
          <FiBookOpen style={{ color: "#2A52BE" }} />
          Record practical tests
        </Typography>
        <IconButton
          onClick={async () => setQuiz(await fetchQuiz())}
          disabled={loading}
          color="primary"
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
          <Typography mt={1}>loading...</Typography>
        </Box>
      ) : quiz.length === 0 ? (
        <Typography align="center">There are no testing sessions</Typography>
      ) : (
        Object.entries(groupedByMonth).map(([monthYear, entries]) => (
          <Box key={monthYear} mb={4}>
            <Typography
              variant="h6"
              fontWeight={600}
              mb={1}
              color="text.secondary"
            >
              {monthYear}
            </Typography>
            <FancyTableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <HeaderCell>Day</HeaderCell>
                    <HeaderCell>Date</HeaderCell>
                    <HeaderCell>Study address</HeaderCell>
                    <HeaderCell>Article</HeaderCell>
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
                        "&:hover": { backgroundColor: "rgba(25,118,210,0.12)" },
                      }}
                    >
                      <TableCell>{getDayName(entry.quiz_date)}</TableCell>
                      <TableCell>{entry.quiz_date}</TableCell>
                      <TableCell>{entry.quiz_title}</TableCell>
                      <TableCell>{entry.quiz_name}</TableCell>
                      <TableCell>{entry.quiz_grade}</TableCell>
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
