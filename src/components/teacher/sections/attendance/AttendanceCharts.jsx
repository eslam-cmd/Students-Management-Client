// src/components/AttendanceCharts.jsx
"use client";

import React, { useMemo, useState } from "react";
import {
  Paper,
  Typography,
  Grid,
  Box,
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
  LinearProgress,
  Divider,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  FiAward,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiTarget,
  FiUsers,
  FiBarChart2,
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiUserCheck,
  FiUserX,
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
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Legend,
} from "recharts";

/* ==================== Constants ==================== */

const COLORS = {
  primary: "#10b981", // Green (Present)
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444", // Red (Absent)
  purple: "#8b5cf6",
  pink: "#ec4899",
  teal: "#14b8a6",
  orange: "#f97316",
  indigo: "#4f46e5",
  blue: "#3b82f6",
  slate: "#0f172a",
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.blue,
  COLORS.warning,
  COLORS.purple,
  COLORS.pink,
  COLORS.teal,
  COLORS.orange,
  COLORS.indigo,
];

const GRADIENT_COLORS = [
  "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
  "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
];

/* ==================== Styled Components ==================== */

const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3.5),
  borderRadius: "1.25rem",
  backgroundColor: "#ffffff",
  boxShadow:
    "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
  direction: "ltr",
  fontFamily: '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
}));

const MetricCard = styled(Card)(({ gradient }) => ({
  borderRadius: "1rem",
  background: gradient || GRADIENT_COLORS[0],
  color: "#ffffff",
  boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.2)",
  position: "relative",
  overflow: "hidden",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.3)",
  },
}));

const ChartPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "1rem",
  border: "1px solid #f1f5f9",
  boxShadow: "none",
  backgroundColor: "#fff",
  transition: "box-shadow 0.2s ease",
  "&:hover": {
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },
}));

const SectionHeaderBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2.5),
  "& .icon-wrapper": {
    width: 40,
    height: 40,
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "1.1rem",
  },
}));

/* ==================== Tab Panel Helper ==================== */

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2.5 }}>{children}</Box>}
    </div>
  );
}

/* ==================== Custom Tooltip ==================== */

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <Paper
      sx={{
        p: 1.5,
        borderRadius: 2,
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        border: "none",
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontWeight: "bold", color: "grey.700" }}
      >
        {label}
      </Typography>
      <Divider sx={{ my: 0.5 }} />
      {payload.map((p, i) => (
        <Box
          key={i}
          sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: p.color || p.fill,
            }}
          />
          <Typography variant="caption" sx={{ color: "grey.600" }}>
            {p.name}:
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
            {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};

/* ==================== Section Header ==================== */

function SectionHeader({ icon, title, subtitle, color = COLORS.primary }) {
  return (
    <SectionHeaderBox>
      <Box className="icon-wrapper" sx={{ backgroundColor: color }}>
        {icon}
      </Box>
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: COLORS.slate,
            lineHeight: 1.2,
            fontSize: "1.05rem",
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </SectionHeaderBox>
  );
}

/* ==================== Main Component ==================== */

export default function AttendanceCharts({
  records = [],
  students = [],
  onClose,
}) {
  const [activeTab, setActiveTab] = useState(0);

  /* ========== Enrich Data ========== */
  const enriched = useMemo(() => {
    return records
      .map((r) => {
        const student = students.find((s) => s.student_id === r.student_id);
        return {
          ...r,
          studentName: student?.name || r.student_id,
          section: student?.section || "—",
          specialization: student?.specialization || "—",
          isPresent: r.status === "present",
          isAbsent: r.status === "absent",
          date: r.attendance_date,
        };
      })
      .filter((r) => r.date);
  }, [records, students]);

  /* ========== 1) Attendance per Student ========== */
  const attendanceByStudent = useMemo(() => {
    const map = new Map();
    enriched.forEach((r) => {
      const key = r.studentName;
      const entry = map.get(key) || {
        name: key,
        present: 0,
        absent: 0,
        total: 0,
      };
      if (r.isPresent) entry.present += 1;
      else if (r.isAbsent) entry.absent += 1;
      entry.total += 1;
      map.set(key, entry);
    });
    return Array.from(map.values())
      .map((e) => ({
        name: e.name,
        present: e.present,
        absent: e.absent,
        total: e.total,
        percentage: Number(((e.present / e.total) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [enriched]);

  /* ========== 2) Attendance by Section ========== */
  const attendanceBySection = useMemo(() => {
    const map = new Map();
    enriched.forEach((r) => {
      const key = r.section;
      const entry = map.get(key) || { name: key, present: 0, absent: 0, total: 0 };
      if (r.isPresent) entry.present += 1;
      else if (r.isAbsent) entry.absent += 1;
      entry.total += 1;
      map.set(key, entry);
    });
    return Array.from(map.values()).map((e) => ({
      name: e.name,
      present: e.present,
      absent: e.absent,
      total: e.total,
      percentage: Number(((e.present / e.total) * 100).toFixed(1)),
    }));
  }, [enriched]);

  /* ========== 3) Overall Status ========== */
  const overallStatus = useMemo(() => {
    const present = enriched.filter((r) => r.isPresent).length;
    const absent = enriched.filter((r) => r.isAbsent).length;
    return [
      { name: "Present", value: present, color: COLORS.success },
      { name: "Absent", value: absent, color: COLORS.danger },
    ];
  }, [enriched]);

  /* ========== 4) Timeline ========== */
  const timeline = useMemo(() => {
    return [...enriched]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((r) => ({
        date: r.date,
        present: r.isPresent ? 1 : 0,
        absent: r.isAbsent ? 1 : 0,
      }));
  }, [enriched]);

  /* ========== 5) Monthly Attendance ========== */
  const monthlyAttendance = useMemo(() => {
    const map = new Map();
    enriched.forEach((r) => {
      const d = new Date(r.date);
      const key = d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      const entry = map.get(key) || {
        name: key,
        present: 0,
        absent: 0,
        total: 0,
        sortKey: d.getTime(),
      };
      if (r.isPresent) entry.present += 1;
      else if (r.isAbsent) entry.absent += 1;
      entry.total += 1;
      map.set(key, entry);
    });
    return Array.from(map.values())
      .sort((a, b) => a.sortKey - b.sortKey)
      .map((e) => ({
        name: e.name,
        present: e.present,
        absent: e.absent,
        total: e.total,
        percentage: Number(((e.present / e.total) * 100).toFixed(1)),
      }));
  }, [enriched]);

  /* ========== 6) Day of Week Analysis ========== */
  const dayOfWeekData = useMemo(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const map = new Map();
    days.forEach((d) => map.set(d, { name: d, present: 0, absent: 0, total: 0 }));
    enriched.forEach((r) => {
      const d = new Date(r.date);
      const dayName = days[d.getDay()];
      const entry = map.get(dayName);
      if (r.isPresent) entry.present += 1;
      else if (r.isAbsent) entry.absent += 1;
      entry.total += 1;
    });
    return Array.from(map.values())
      .filter((d) => d.total > 0)
      .map((d) => ({
        ...d,
        percentage: Number(((d.present / d.total) * 100).toFixed(1)),
      }));
  }, [enriched]);

  /* ========== Statistics ========== */
  const stats = useMemo(() => {
    if (enriched.length === 0) {
      return {
        total: 0,
        present: 0,
        absent: 0,
        rate: 0,
        totalStudents: 0,
      };
    }
    const total = enriched.length;
    const present = enriched.filter((r) => r.isPresent).length;
    const absent = total - present;
    const rate = ((present / total) * 100).toFixed(1);
    return {
      total,
      present,
      absent,
      rate,
      totalStudents: attendanceByStudent.length,
    };
  }, [enriched, attendanceByStudent]);

  /* ========== Top & Bottom Performers ========== */
  const topAttendees = useMemo(() => {
    return attendanceByStudent.slice(0, 5);
  }, [attendanceByStudent]);

  const lowestAttendees = useMemo(() => {
    return [...attendanceByStudent]
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 5);
  }, [attendanceByStudent]);

  /* ============ Empty State ============ */
  if (enriched.length === 0) {
    return (
      <Container>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" fontWeight={700}>
            📅 Attendance Analytics
          </Typography>
          {onClose && (
            <Button
              onClick={onClose}
              startIcon={<FiX />}
              variant="outlined"
              size="small"
              sx={{ borderRadius: "0.75rem", textTransform: "none" }}
            >
              Close
            </Button>
          )}
        </Box>
        <Box textAlign="center" py={6}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: alpha(COLORS.primary, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
              fontSize: "2rem",
              color: COLORS.primary,
            }}
          >
            <FiCalendar />
          </Box>
          <Typography color="text.secondary" variant="h6" fontWeight={600}>
            No Data Available
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Add attendance records to display the charts
          </Typography>
        </Box>
      </Container>
    );
  }

  /* ============ Main Render ============ */
  return (
    <Container>
      {/* ============ 1. Header ============ */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar
            sx={{
              bgcolor: "#f0fdf4",
              color: COLORS.primary,
              width: 44,
              height: 44,
            }}
          >
            <FiCalendar size={24} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700} color={COLORS.slate}>
              📅 Attendance Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive attendance insights by student, group & time
            </Typography>
          </Box>
        </Box>

        {onClose && (
          <Button
            onClick={onClose}
            startIcon={<FiX />}
            variant="outlined"
            sx={{
              borderRadius: "0.75rem",
              textTransform: "none",
              height: 40,
              borderColor: COLORS.primary,
              color: COLORS.primary,
              "&:hover": {
                borderColor: COLORS.primary,
                backgroundColor: "#f0fdf4",
              },
            }}
          >
            Close Dashboard
          </Button>
        )}
      </Box>

      {/* ============ 2. Metric Cards ============ */}
      <Grid container spacing={2.5} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard gradient={GRADIENT_COLORS[0]}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Attendance Rate
                </Typography>
                <FiTarget size={24} />
              </Box>
              <Typography variant="h3" fontWeight={800} mt={1}>
                {stats.rate}%
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {stats.present} present / {stats.total} total
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)">
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Students
                </Typography>
                <FiUsers size={24} />
              </Box>
              <Typography variant="h3" fontWeight={800} mt={1}>
                {stats.totalStudents}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Active attendees
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard gradient={GRADIENT_COLORS[0]}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Present
                </Typography>
                <FiUserCheck size={24} />
              </Box>
              <Typography variant="h3" fontWeight={800} mt={1}>
                {stats.present}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Across all records
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)">
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Absent
                </Typography>
                <FiUserX size={24} />
              </Box>
              <Typography variant="h3" fontWeight={800} mt={1}>
                {stats.absent}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Requires attention
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>
      </Grid>

      {/* ============ 3. Tabs ============ */}
      <Paper
        sx={{
          borderRadius: "1rem",
          border: "1px solid #f1f5f9",
          boxShadow: "none",
          mb: 3,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "#f0fdf4",
            px: 2,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            textColor="success"
            indicatorColor="success"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                minHeight: 56,
              },
            }}
          >
            <Tab icon={<FiBarChart2 />} iconPosition="start" label="Overview" />
            <Tab icon={<FiUsers />} iconPosition="start" label="Students" />
            <Tab icon={<FiActivity />} iconPosition="start" label="Trends" />
            <Tab icon={<FiCalendar />} iconPosition="start" label="Monthly" />
            <Tab icon={<FiAward />} iconPosition="start" label="Leaderboard" />
          </Tabs>
        </Box>

        {/* ============ Tab 0: Overview ============ */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Overall Status */}
              <Grid item xs={12} md={6}>
                <ChartPaper>
                  <SectionHeader
                    icon={<FiTarget />}
                    title="Overall Attendance Distribution"
                    subtitle="Present vs Absent across all records"
                    color={COLORS.purple}
                  />
                  <Box height={320}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={overallStatus}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={110}
                          paddingAngle={3}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(1)}%`
                          }
                        >
                          {overallStatus.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartPaper>
              </Grid>

              {/* Attendance by Section */}
              <Grid item xs={12} md={6}>
                <ChartPaper>
                  <SectionHeader
                    icon={<FiUsers />}
                    title="Attendance Rate by Group"
                    subtitle="Compare attendance across groups"
                    color={COLORS.blue}
                  />
                  <Box height={320}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attendanceBySection}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12, fill: "#64748b" }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fontSize: 12, fill: "#64748b" }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="percentage"
                          fill={COLORS.primary}
                          name="Attendance %"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={60}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartPaper>
              </Grid>

              {/* Monthly Attendance */}
              <Grid item xs={12}>
                <ChartPaper>
                  <SectionHeader
                    icon={<FiCalendar />}
                    title="Monthly Attendance Overview"
                    subtitle="Present vs Absent per month"
                    color={COLORS.warning}
                  />
                  <Box height={340}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyAttendance}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12, fill: "#64748b" }}
                        />
                        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                          dataKey="present"
                          fill={COLORS.success}
                          name="Present"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={40}
                        />
                        <Bar
                          dataKey="absent"
                          fill={COLORS.danger}
                          name="Absent"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartPaper>
              </Grid>

              {/* Day of Week */}
              {dayOfWeekData.length > 0 && (
                <Grid item xs={12}>
                  <ChartPaper>
                    <SectionHeader
                      icon={<FiActivity />}
                      title="Attendance by Day of Week"
                      subtitle="Attendance rate distribution across weekdays"
                      color={COLORS.teal}
                    />
                    <Box height={320}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={dayOfWeekData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: "#64748b" }}
                          />
                          <YAxis
                            yAxisId="left"
                            tick={{ fontSize: 12, fill: "#64748b" }}
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            domain={[0, 100]}
                            tick={{ fontSize: 12, fill: "#64748b" }}
                          />
                          <RechartsTooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar
                            yAxisId="left"
                            dataKey="present"
                            fill={COLORS.success}
                            name="Present"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={40}
                          />
                          <Bar
                            yAxisId="left"
                            dataKey="absent"
                            fill={COLORS.danger}
                            name="Absent"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={40}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="percentage"
                            stroke={COLORS.primary}
                            strokeWidth={3}
                            name="Attendance %"
                            dot={{ r: 4 }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </Box>
                  </ChartPaper>
                </Grid>
              )}
            </Grid>
          </Box>
        </TabPanel>

        {/* ============ Tab 1: Students ============ */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ChartPaper>
                  <SectionHeader
                    icon={<FiUsers />}
                    title="Attendance Percentage per Student"
                    subtitle="Ranked by attendance rate"
                    color={COLORS.primary}
                  />
                  <Box height={380}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={attendanceByStudent}>
                        <defs>
                          <linearGradient
                            id="attendanceGrad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={COLORS.primary}
                              stopOpacity={1}
                            />
                            <stop
                              offset="100%"
                              stopColor={COLORS.primary}
                              stopOpacity={0.6}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="name"
                          angle={-20}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fontSize: 12, fill: "#64748b" }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                          dataKey="percentage"
                          fill="url(#attendanceGrad)"
                          name="Attendance %"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={50}
                        />
                        <Line
                          type="monotone"
                          dataKey="present"
                          stroke={COLORS.success}
                          strokeWidth={2}
                          name="Present"
                          dot={{ r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="absent"
                          stroke={COLORS.danger}
                          strokeWidth={2}
                          name="Absent"
                          dot={{ r: 3 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartPaper>
              </Grid>

              <Grid item xs={12} md={6}>
                <ChartPaper>
                  <SectionHeader
                    icon={<FiTrendingUp />}
                    title="Top 5 Attendees"
                    subtitle="Students with highest attendance rate"
                    color={COLORS.success}
                  />
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topAttendees} layout="vertical">
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          tick={{ fontSize: 12, fill: "#64748b" }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={100}
                          tick={{ fontSize: 11 }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="percentage"
                          fill={COLORS.success}
                          name="Attendance %"
                          radius={[0, 8, 8, 0]}
                          maxBarSize={25}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartPaper>
              </Grid>

              <Grid item xs={12} md={6}>
                <ChartPaper>
                  <SectionHeader
                    icon={<FiTrendingDown />}
                    title="Bottom 5 Attendees"
                    subtitle="Students needing attention"
                    color={COLORS.danger}
                  />
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={lowestAttendees} layout="vertical">
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          tick={{ fontSize: 12, fill: "#64748b" }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={100}
                          tick={{ fontSize: 11 }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="percentage"
                          fill={COLORS.danger}
                          name="Attendance %"
                          radius={[0, 8, 8, 0]}
                          maxBarSize={25}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartPaper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* ============ Tab 2: Trends ============ */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ChartPaper>
                  <SectionHeader
                    icon={<FiTrendingUp />}
                    title="Attendance Timeline"
                    subtitle="Daily attendance records over time"
                    color={COLORS.primary}
                  />
                  <Box height={380}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeline}>
                        <defs>
                          <linearGradient
                            id="timelinePresGrad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={COLORS.success}
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="100%"
                              stopColor={COLORS.success}
                              stopOpacity={0.05}
                            />
                          </linearGradient>
                          <linearGradient
                            id="timelineAbsGrad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={COLORS.danger}
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="100%"
                              stopColor={COLORS.danger}
                              stopOpacity={0.05}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                        />
                        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="present"
                          stroke={COLORS.success}
                          strokeWidth={2.5}
                          fill="url(#timelinePresGrad)"
                          name="Present"
                        />
                        <Area
                          type="monotone"
                          dataKey="absent"
                          stroke={COLORS.danger}
                          strokeWidth={2.5}
                          fill="url(#timelineAbsGrad)"
                          name="Absent"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartPaper>
              </Grid>

              <Grid item xs={12}>
                <ChartPaper>
                  <SectionHeader
                    icon={<FiActivity />}
                    title="Monthly Attendance Rate Trend"
                    subtitle="Attendance percentage over months"
                    color={COLORS.purple}
                  />
                  <Box height={320}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyAttendance}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fontSize: 12, fill: "#64748b" }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="percentage"
                          stroke={COLORS.primary}
                          strokeWidth={3}
                          name="Attendance %"
                          dot={{ r: 5, fill: COLORS.primary }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartPaper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* ============ Tab 3: Monthly ============ */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ChartPaper>
                  <SectionHeader
                    icon={<FiCalendar />}
                    title="Monthly Breakdown"
                    subtitle="Present vs Absent per month"
                    color={COLORS.warning}
                  />
                  <Box height={380}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyAttendance}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                        />
                        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                          dataKey="present"
                          fill={COLORS.success}
                          name="Present"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={50}
                        />
                        <Bar
                          dataKey="absent"
                          fill={COLORS.danger}
                          name="Absent"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={50}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartPaper>
              </Grid>

              <Grid item xs={12}>
                <ChartPaper>
                  <SectionHeader
                    icon={<FiTarget />}
                    title="Monthly Attendance Rate"
                    subtitle="Percentage per month"
                    color={COLORS.primary}
                  />
                  <Box height={320}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={monthlyAttendance}>
                        <defs>
                          <linearGradient
                            id="monthlyRateGrad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={COLORS.primary}
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="100%"
                              stopColor={COLORS.primary}
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fontSize: 12, fill: "#64748b" }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="percentage"
                          stroke={COLORS.primary}
                          strokeWidth={2.5}
                          fill="url(#monthlyRateGrad)"
                          name="Attendance %"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartPaper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* ============ Tab 4: Leaderboard ============ */}
        <TabPanel value={activeTab} index={4}>
          <Box sx={{ p: 3 }}>
            <ChartPaper>
              <SectionHeader
                icon={<FiAward />}
                title="🏆 Attendance Leaderboard"
                subtitle="Ranked by attendance percentage"
                color={COLORS.warning}
              />

              {/* Top 3 Podium */}
              {attendanceByStudent.length >= 3 && (
                <Grid container spacing={2} sx={{ mb: 4, mt: 1 }}>
                  {[1, 0, 2].map((idx) => {
                    const student = attendanceByStudent[idx];
                    if (!student) return null;
                    const medals = ["🥇", "🥈", "🥉"];
                    const colors = ["#fbbf24", "#94a3b8", "#d97706"];
                    const rank = idx;
                    return (
                      <Grid item xs={12} md={4} key={student.name}>
                        <Box
                          sx={{
                            textAlign: "center",
                            p: 2,
                            borderRadius: "1rem",
                            background: `linear-gradient(180deg, ${alpha(
                              colors[rank],
                              0.15,
                            )} 0%, ${alpha(colors[rank], 0.05)} 100%)`,
                            border: `2px solid ${alpha(colors[rank], 0.3)}`,
                            transition: "transform 0.2s",
                            "&:hover": { transform: "scale(1.03)" },
                          }}
                        >
                          <Typography sx={{ fontSize: "2.5rem", mb: 1 }}>
                            {medals[rank]}
                          </Typography>
                          <Avatar
                            sx={{
                              width: 60,
                              height: 60,
                              mx: "auto",
                              mb: 1,
                              backgroundColor: colors[rank],
                              fontSize: "1.5rem",
                              fontWeight: "bold",
                            }}
                          >
                            {student.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: "bold", mb: 0.5 }}
                            noWrap
                          >
                            {student.name}
                          </Typography>
                          <Box
                            sx={{
                              display: "inline-block",
                              px: 2,
                              py: 0.5,
                              borderRadius: 2,
                              backgroundColor: colors[rank],
                              color: "#fff",
                              fontWeight: "bold",
                            }}
                          >
                            {student.percentage}%
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{ display: "block", mt: 1, color: "grey.600" }}
                          >
                            {student.present}/{student.total} days
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              )}

              {/* Full Table */}
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f0fdf4" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Rate</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Present</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Absent</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceByStudent.map((r, i) => {
                      const medal =
                        i === 0
                          ? "🥇"
                          : i === 1
                            ? "🥈"
                            : i === 2
                              ? "🥉"
                              : i + 1;
                      const color =
                        r.percentage >= 90
                          ? COLORS.success
                          : r.percentage >= 75
                            ? COLORS.blue
                            : r.percentage >= 60
                              ? COLORS.warning
                              : COLORS.danger;
                      return (
                        <TableRow key={r.name} hover>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            {medal}
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  backgroundColor: color,
                                  fontSize: "0.85rem",
                                }}
                              >
                                {r.name.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {r.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ minWidth: 120 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  mb: 0.5,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: "bold", color }}
                                >
                                  {r.percentage}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={r.percentage}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  backgroundColor: alpha(color, 0.15),
                                  "& .MuiLinearProgress-bar": {
                                    backgroundColor: color,
                                    borderRadius: 3,
                                  },
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            {r.percentage >= 90 ? (
                              <Chip
                                icon={<FiCheckCircle />}
                                label="Excellent"
                                color="success"
                                size="small"
                              />
                            ) : r.percentage >= 75 ? (
                              <Chip
                                icon={<FiActivity />}
                                label="Good"
                                color="primary"
                                size="small"
                              />
                            ) : r.percentage >= 60 ? (
                              <Chip
                                icon={<FiActivity />}
                                label="Warning"
                                color="warning"
                                size="small"
                              />
                            ) : (
                              <Chip
                                icon={<FiXCircle />}
                                label="Critical"
                                color="error"
                                size="small"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: COLORS.success }}
                            >
                              {r.present}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: COLORS.danger }}
                            >
                              {r.absent}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {r.total}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </ChartPaper>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
}