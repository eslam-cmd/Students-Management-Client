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
import { FiClipboard } from "react-icons/fi";

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

export default function ViewNotesByMonth() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const studentId = localStorage.getItem("studentId");
      if (!studentId) return [];
      const res = await fetch(`https://manager-students-server.vercel.app/api/students/account/${studentId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Fetch failed");
  
      // فلترة المذاكرات العملية فقط
      return (json.student.notes || []).filter(note => note.type === "theory");
    } catch (err) {
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes().then((data) => setNotes(data));
  }, []);

  const getMonthYear = (dateStr) =>
    new Date(dateStr).toLocaleDateString("ar-EG", {
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700} color="text.primary" sx={{fontSize:{xs:"17px",md:"22px",lg:"25px"}}}>
        <FiClipboard style={{color:"#2A52BE"}}/>
          Record of theoretical notes
        </Typography>
        <IconButton
          onClick={async () => setNotes(await fetchNotes())}
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
      ) : notes.length === 0 ? (
        <Typography align="center">There are no study sessions.</Typography>
      ) : (
        Object.entries(groupedByMonth).map(([monthYear, entries]) => (
          <Box key={monthYear} mb={4}>
            <Typography variant="h6" fontWeight={600} mb={1} color="text.secondary">
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
                        "&:nth-of-type(odd)": { backgroundColor: "rgba(25,118,210,0.04)" },
                        "&:hover": { backgroundColor: "rgba(25,118,210,0.12)" },
                      }}
                    >
                      <TableCell>{getDayName(entry.sabject_date)}</TableCell>
                      <TableCell>{entry.sabject_date}</TableCell>
                      <TableCell>{entry.sabject_title}</TableCell>
                      <TableCell>{entry.sabject_name}</TableCell>
                      <TableCell>{entry.sabject_grade}</TableCell>
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