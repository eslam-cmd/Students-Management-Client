"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Paper,
  Typography,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Avatar,
  Button,
  Chip,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  FiUser,
  FiBookOpen,
  FiClipboard,
  FiCheckCircle,
  FiAward,
  FiRefreshCw,
  FiBarChart2,
  FiTrendingUp,
  FiActivity,
  FiCalendar,
} from "react-icons/fi";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app";

// Glassmorphism Styled Container
const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3.5),
  borderRadius: "1.25rem",
  backgroundColor: "#ffffff",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
  direction: "ltr",
}));

// Dashboard Hero Metric Card
const MetricCard = styled(Card)(({ gradient }) => ({
  borderRadius: "1rem",
  background: gradient || "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
  color: "#ffffff",
  boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.2)",
  position: "relative",
  overflow: "hidden",
  transition: "transform 0.2s ease-in-out, boxShadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 20px 25px -5px rgba(37, 99, 235, 0.3)",
  },
}));

// Tab Panel Helper Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2.5 }}>{children}</Box>}
    </div>
  );
}

export default function StudentStats({ initialStudentId = "" }) {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId);

  // Raw data states
  const [attendance, setAttendance] = useState([]);
  const [theoryQuizzes, setTheoryQuizzes] = useState([]);
  const [practicalQuizzes, setPracticalQuizzes] = useState([]);
  const [theoryNotes, setTheoryNotes] = useState([]);
  const [practicalNotes, setPracticalNotes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  // Fetch all endpoints
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [
        studentsRes,
        attRes,
        theoryQuizRes,
        pracQuizRes,
        theoryNotesRes,
        pracNotesRes,
      ] = await Promise.all([
        fetch(`${API}/api/students`),
        fetch(`${API}/api/attendance`),
        fetch(`${API}/api/quiz`),
        fetch(`${API}/api/practical-quiz`),
        fetch(`${API}/api/sabject`),
        fetch(`${API}/api/practical-notes`),
      ]);

      if (!studentsRes.ok) throw new Error("Failed to fetch students");

      const [
        studentsData,
        attData,
        theoryQuizData,
        pracQuizData,
        theoryNotesData,
        pracNotesData,
      ] = await Promise.all([
        studentsRes.json(),
        attRes.ok ? attRes.json() : [],
        theoryQuizRes.ok ? theoryQuizRes.json() : [],
        pracQuizRes.ok ? pracQuizRes.json() : [],
        theoryNotesRes.ok ? theoryNotesRes.json() : [],
        pracNotesRes.ok ? pracNotesRes.json() : [],
      ]);

      setStudents(Array.isArray(studentsData) ? studentsData : studentsData.data || []);
      setAttendance(Array.isArray(attData) ? attData : attData.data || []);
      setTheoryQuizzes(Array.isArray(theoryQuizData) ? theoryQuizData : theoryQuizData.data || []);
      setPracticalQuizzes(Array.isArray(pracQuizData) ? pracQuizData : pracQuizData.data || []);
      setTheoryNotes(Array.isArray(theoryNotesData) ? theoryNotesData : theoryNotesData.data || []);
      setPracticalNotes(Array.isArray(pracNotesData) ? pracNotesData : pracNotesData.data || []);
    } catch (err) {
      console.error("Fetch Student Stats Error:", err);
      setError("Failed to load analytics dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (!selectedStudentId && students.length > 0) {
      setSelectedStudentId(students[0].student_id);
    }
  }, [students, selectedStudentId]);

  const activeStudent = useMemo(() => {
    return students.find((s) => s.student_id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // Attendance Statistics
  const studentAttendance = useMemo(() => {
    if (!selectedStudentId) return { total: 0, present: 0, absent: 0, percentage: 0 };
    const records = attendance.filter((a) => a.student_id === selectedStudentId);
    const total = records.length;
    const present = records.filter((a) => a.status === "present").length;
    const absent = records.filter((a) => a.status === "absent").length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    return { total, present, absent, percentage: parseFloat(percentage) };
  }, [attendance, selectedStudentId]);

  // Academic Filtered Records
  const studentTheoryQuizzes = useMemo(() => {
    return theoryQuizzes.filter((q) => q.student_id === selectedStudentId && q.type === "theory");
  }, [theoryQuizzes, selectedStudentId]);

  const studentPracticalQuizzes = useMemo(() => {
    return practicalQuizzes.filter((q) => q.student_id === selectedStudentId);
  }, [practicalQuizzes, selectedStudentId]);

  const studentTheoryNotes = useMemo(() => {
    return theoryNotes.filter((n) => n.student_id === selectedStudentId);
  }, [theoryNotes, selectedStudentId]);

  const studentPracticalNotes = useMemo(() => {
    return practicalNotes.filter((n) => n.student_id === selectedStudentId);
  }, [practicalNotes, selectedStudentId]);

  // Average Grade Calculator
  const calculateAverage = (items, gradeKey) => {
    if (!items || items.length === 0) return 0;
    const sum = items.reduce((acc, curr) => acc + (parseFloat(curr[gradeKey]) || 0), 0);
    return (sum / items.length).toFixed(1);
  };

  const theoryQuizAvg = useMemo(() => calculateAverage(studentTheoryQuizzes, "quiz_grade"), [studentTheoryQuizzes]);
  const practicalQuizAvg = useMemo(() => calculateAverage(studentPracticalQuizzes, "quiz_grade"), [studentPracticalQuizzes]);
  const theoryNotesAvg = useMemo(() => calculateAverage(studentTheoryNotes, "sabject_grade"), [studentTheoryNotes]);
  const practicalNotesAvg = useMemo(() => calculateAverage(studentPracticalNotes, "sabject_grade"), [studentPracticalNotes]);

  // Chart 1 Data: Comparative Bar Chart across Categories
  const overviewChartData = useMemo(() => [
    { category: "Theory Quiz", score: parseFloat(theoryQuizAvg) || 0, fill: "#2563eb" },
    { category: "Practical Quiz", score: parseFloat(practicalQuizAvg) || 0, fill: "#7c3aed" },
    { category: "Theory Notes", score: parseFloat(theoryNotesAvg) || 0, fill: "#f59e0b" },
    { category: "Practical Notes", score: parseFloat(practicalNotesAvg) || 0, fill: "#06b6d4" },
  ], [theoryQuizAvg, practicalQuizAvg, theoryNotesAvg, practicalNotesAvg]);

  // Chart 2 Data: Attendance Donut Pie Chart
  const attendancePieData = useMemo(() => [
    { name: "Present", value: studentAttendance.present, color: "#10b981" },
    { name: "Absent", value: studentAttendance.absent, color: "#ef4444" },
  ], [studentAttendance]);

  // Chart 3 Data: Historical Grades Timeline (Theory vs Practical Quizzes)
  const timelineChartData = useMemo(() => {
    const combined = [];
    studentTheoryQuizzes.forEach((q) => {
      combined.push({
        date: q.quiz_date || "N/A",
        title: q.quiz_title,
        theory: parseFloat(q.quiz_grade) || 0,
      });
    });
    studentPracticalQuizzes.forEach((q) => {
      combined.push({
        date: q.quiz_date || "N/A",
        title: q.quiz_title,
        practical: parseFloat(q.quiz_grade) || 0,
      });
    });
    return combined.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [studentTheoryQuizzes, studentPracticalQuizzes]);

  if (loading) {
    return (
      <Container sx={{ minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Box textAlign="center">
          <CircularProgress size={50} thickness={4} />
          <Typography mt={2} variant="h6" fontWeight={600} color="text.secondary">
            Preparing Analytics Dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      {/* 1. Header & Student Switcher Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{ bgcolor: "#eff6ff", color: "#2563eb", width: 44, height: 44 }}>
            <FiActivity size={24} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700} color="#0f172a">
              Student Performance Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time academic evaluation & performance breakdown
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={1.5}>
          <FormControl size="small" sx={{ minWidth: 240 }}>
            <InputLabel>Select Student Profile</InputLabel>
            <Select
              value={selectedStudentId}
              label="Select Student Profile"
              onChange={(e) => setSelectedStudentId(e.target.value)}
              sx={{ borderRadius: "0.75rem", backgroundColor: "#f8fafc" }}
            >
              {students.map((s) => (
                <MenuItem key={s.student_id} value={s.student_id}>
                  {s.name} ({s.student_id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={fetchAllData}
            startIcon={<FiRefreshCw />}
            sx={{ borderRadius: "0.75rem", textTransform: "none", height: 40 }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* 2. Selected Student Profile Banner */}
      {activeStudent && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 4,
            borderRadius: "1rem",
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            border: "1px solid #cbd5e1",
            display: "flex",
            alignItems: "center",
            gap: 2.5,
            flexWrap: "wrap",
          }}
        >
          <Avatar
            sx={{
              bgcolor: "#2563eb",
              width: 60,
              height: 60,
              fontSize: "1.75rem",
              fontWeight: 700,
              boxShadow: "0 4px 10px rgba(37, 99, 235, 0.3)",
            }}
          >
            {activeStudent.name ? activeStudent.name[0].toUpperCase() : <FiUser />}
          </Avatar>
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
              <Typography variant="h6" fontWeight={700} color="#0f172a">
                {activeStudent.name}
              </Typography>
              <Chip label={activeStudent.specialization || "General"} size="small" color="primary" />
            </Box>
            <Box display="flex" gap={3} flexWrap="wrap" color="text.secondary" fontSize="0.875rem">
              <span><strong>ID:</strong> {activeStudent.student_id}</span>
              <span><strong>Group:</strong> {activeStudent.section || "N/A"}</span>
              <span><strong>School:</strong> {activeStudent.nameschool || "N/A"}</span>
            </Box>
          </Box>
        </Paper>
      )}

      {/* 3. Top Metric Cards (KPI Ribbon) */}
      <Grid container spacing={2.5} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Attendance Rate
                </Typography>
                <FiCheckCircle size={24} />
              </Box>
              <Typography variant="h3" fontWeight={800} mt={1}>
                {studentAttendance.percentage}%
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {studentAttendance.present} present / {studentAttendance.total} total days
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard gradient="linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Theory Quizzes Avg
                </Typography>
                <FiBookOpen size={24} />
              </Box>
              <Typography variant="h3" fontWeight={800} mt={1}>
                {theoryQuizAvg}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Based on {studentTheoryQuizzes.length} completed tests
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard gradient="linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Practical Quizzes Avg
                </Typography>
                <FiAward size={24} />
              </Box>
              <Typography variant="h3" fontWeight={800} mt={1}>
                {practicalQuizAvg}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Based on {studentPracticalQuizzes.length} practical exams
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Theory Notes Avg
                </Typography>
                <FiClipboard size={24} />
              </Box>
              <Typography variant="h3" fontWeight={800} mt={1}>
                {theoryNotesAvg}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Based on {studentTheoryNotes.length} evaluations
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>
      </Grid>

      {/* 4. Visual Charts Section */}
      <Grid container spacing={3} mb={4}>
        {/* Chart A: Academic Averages Bar Chart */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: "1rem", border: "1px solid #f1f5f9", boxShadow: "none" }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <FiBarChart2 style={{ color: "#2563eb" }} size={20} />
              <Typography variant="h6" fontWeight={700} color="#0f172a">
                Subject Average Comparison
              </Typography>
            </Box>
            <Box height={260} width="100%">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overviewChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <RechartsTooltip cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={40}>
                    {overviewChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Chart B: Donut Attendance Distribution */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: "1rem", border: "1px solid #f1f5f9", boxShadow: "none" }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <FiCalendar style={{ color: "#10b981" }} size={20} />
              <Typography variant="h6" fontWeight={700} color="#0f172a">
                Attendance Distribution
              </Typography>
            </Box>
            <Box height={220} width="100%" display="flex" justifyContent="center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendancePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {attendancePieData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box display="flex" justifyContent="center" gap={3} mt={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box width={12} height={12} borderRadius="50%" bgcolor="#10b981" />
                <Typography variant="body2" fontWeight={600}>
                  Present ({studentAttendance.present})
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box width={12} height={12} borderRadius="50%" bgcolor="#ef4444" />
                <Typography variant="body2" fontWeight={600}>
                  Absent ({studentAttendance.absent})
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Chart C: Grades Timeline Chart */}
        {timelineChartData.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: "1rem", border: "1px solid #f1f5f9", boxShadow: "none" }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <FiTrendingUp style={{ color: "#7c3aed" }} size={20} />
                <Typography variant="h6" fontWeight={700} color="#0f172a">
                  Historical Quiz Score Progression
                </Typography>
              </Box>
              <Box height={240} width="100%">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTheory" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPractical" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="theory" stroke="#2563eb" fillOpacity={1} fill="url(#colorTheory)" name="Theory Grade" />
                    <Area type="monotone" dataKey="practical" stroke="#7c3aed" fillOpacity={1} fill="url(#colorPractical)" name="Practical Grade" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* 5. Detailed Tabbed Assessment Tables */}
      <Paper sx={{ borderRadius: "1rem", border: "1px solid #f1f5f9", boxShadow: "none", overflow: "hidden" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "#f8fafc", px: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={`Theory Quizzes (${studentTheoryQuizzes.length})`} icon={<FiBookOpen />} iconPosition="start" sx={{ textTransform: "none", fontWeight: 600 }} />
            <Tab label={`Practical Quizzes (${studentPracticalQuizzes.length})`} icon={<FiAward />} iconPosition="start" sx={{ textTransform: "none", fontWeight: 600 }} />
            <Tab label={`Theory Notes (${studentTheoryNotes.length})`} icon={<FiClipboard />} iconPosition="start" sx={{ textTransform: "none", fontWeight: 600 }} />
            <Tab label={`Practical Notes (${studentPracticalNotes.length})`} icon={<FiClipboard />} iconPosition="start" sx={{ textTransform: "none", fontWeight: 600 }} />
          </Tabs>
        </Box>

        {/* Tab 1: Theory Quizzes */}
        <TabPanel value={activeTab} index={0}>
          <TableContainer>
            <Table size="medium">
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Grade</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentTheoryQuizzes.map((q) => (
                  <TableRow key={q.id} hover>
                    <TableCell fontWeight={600}>{q.quiz_title}</TableCell>
                    <TableCell>{q.quiz_name}</TableCell>
                    <TableCell>{q.quiz_date}</TableCell>
                    <TableCell align="right">
                      <Chip label={q.quiz_grade} color="primary" variant="outlined" size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                  </TableRow>
                ))}
                {studentTheoryQuizzes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      No theory quiz records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 2: Practical Quizzes */}
        <TabPanel value={activeTab} index={1}>
          <TableContainer>
            <Table size="medium">
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Grade</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentPracticalQuizzes.map((q) => (
                  <TableRow key={q.id} hover>
                    <TableCell fontWeight={600}>{q.quiz_title}</TableCell>
                    <TableCell>{q.quiz_name}</TableCell>
                    <TableCell>{q.quiz_date}</TableCell>
                    <TableCell align="right">
                      <Chip label={q.quiz_grade} color="secondary" variant="outlined" size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                  </TableRow>
                ))}
                {studentPracticalQuizzes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      No practical quiz records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 3: Theory Notes */}
        <TabPanel value={activeTab} index={2}>
          <TableContainer>
            <Table size="medium">
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Grade</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentTheoryNotes.map((n) => (
                  <TableRow key={n.id} hover>
                    <TableCell fontWeight={600}>{n.sabject_title}</TableCell>
                    <TableCell>{n.sabject_name}</TableCell>
                    <TableCell>{n.sabject_date}</TableCell>
                    <TableCell align="right">
                      <Chip label={n.sabject_grade} color="warning" variant="outlined" size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                  </TableRow>
                ))}
                {studentTheoryNotes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      No theory notes found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 4: Practical Notes */}
        <TabPanel value={activeTab} index={3}>
          <TableContainer>
            <Table size="medium">
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Grade</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentPracticalNotes.map((n) => (
                  <TableRow key={n.id} hover>
                    <TableCell fontWeight={600}>{n.sabject_title}</TableCell>
                    <TableCell>{n.sabject_name}</TableCell>
                    <TableCell>{n.sabject_date}</TableCell>
                    <TableCell align="right">
                      <Chip label={n.sabject_grade} color="info" variant="outlined" size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                  </TableRow>
                ))}
                {studentPracticalNotes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      No practical notes found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
    </Container>
  );
}