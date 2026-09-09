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
import { FiClipboard } from "react-icons/fi";

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

export default function ViewPracticalNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ جلب الملاحظات العملية اعتماداً على كوكي الجلسة فقط
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/students/account/me`, {
        method: "GET",
        credentials: "include", // يمرر الكوكي الموثق تلقائياً
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Fetch failed");

      const studentNotes = json.notes || json.student?.notes || [];

      // تصفية الملاحظات العملية فقط
      return studentNotes.filter((note) => note.type === "practical");
    } catch (err) {
      console.error("Practical notes fetch error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes().then((data) => setNotes(data));
  }, [fetchNotes]);

  const getMonthYear = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

  const groupedByMonth = useMemo(() => {
    return notes.reduce((acc, entry) => {
      const key = getMonthYear(entry.sabject_date);
      if (!acc[key]) acc[key] = [];
      acc[key].push(entry);
      return acc;
    }, {});
  }, [notes]);

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
          <FiClipboard style={{ color: "#2A52BE" }} />
          Practical Notes Record
        </Typography>
        <IconButton
          onClick={async () => setNotes(await fetchNotes())}
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
      ) : notes.length === 0 ? (
        <Typography align="center" sx={{ py: 4 }}>
          No practical notes found
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
                    <HeaderCell>Note Title</HeaderCell>
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
                        {getDayName(entry.sabject_date)}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                      >
                        {formatDate(entry.sabject_date)}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                      >
                        {entry.sabject_title}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                      >
                        {entry.sabject_name}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                      >
                        {entry.sabject_grade}
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
