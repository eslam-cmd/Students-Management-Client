// src/components/StudentTheoryQuizCharts.jsx
"use client";

import React, { useMemo } from "react";
import {
  Paper,
  Typography,
  Grid,
  Box,
  Avatar,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Divider,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  FiAward,
  FiBook,
  FiTrendingUp,
  FiTarget,
  FiX,
  FiBarChart2,
  FiActivity,
  FiBookOpen,
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
  Legend,
} from "recharts";

/* ==================== Constants ==================== */

const COLORS = {
  primary: "#2A52BE",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  teal: "#14b8a6",
  slate: "#0f172a",
};

const CHART_COLORS = [
  "#2A52BE",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

/* ==================== Styled Components ==================== */

const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "12px",
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  boxShadow: "none",
  direction: "ltr",
}));

const MetricCard = styled(Card)(({ bgcolor }) => ({
  borderRadius: "10px",
  background: bgcolor,
  color: "#ffffff",
  border: "none",
  boxShadow: "none",
  transition: "transform 0.15s ease",
  "&:hover": {
    transform: "translateY(-2px)",
  },
}));

const ChartPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
  boxShadow: "none",
  backgroundColor: "#ffffff",
}));

/* ==================== Custom Tooltip ==================== */

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <Paper
      sx={{
        p: 1.5,
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: COLORS.slate }}
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
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: p.color || p.fill,
            }}
          />
          <Typography variant="caption" sx={{ color: "#6b7280" }}>
            {p.name}:
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
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
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "8px",
          backgroundColor: alpha(color, 0.1),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color,
          fontSize: "1rem",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: COLORS.slate, lineHeight: 1.2 }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: "#6b7280" }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/* ==================== Main Component ==================== */

export default function StudentTheoryQuizCharts({ quiz = [], onClose }) {
  /* ============ Enrich Data ============ */
  const enriched = useMemo(() => {
    return quiz
      .map((q) => ({
        ...q,
        title: q.quiz_title || "—",
        subject: q.quiz_name || "Unknown",
        date: q.quiz_date,
        grade: Number(q.quiz_grade) || 0,
      }))
      .filter((q) => q.grade > 0 && q.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [quiz]);

  /* ============ Statistics ============ */
  const stats = useMemo(() => {
    if (enriched.length === 0) {
      return {
        total: 0,
        avg: 0,
        highest: 0,
        lowest: 0,
        bestSubject: "—",
        totalSubjects: 0,
      };
    }
    const grades = enriched.map((q) => q.grade);
    const avg = grades.reduce((s, g) => s + g, 0) / grades.length;
    const highest = Math.max(...grades);
    const lowest = Math.min(...grades);

    const subjectMap = new Map();
    enriched.forEach((q) => {
      const arr = subjectMap.get(q.subject) || [];
      arr.push(q.grade);
      subjectMap.set(q.subject, arr);
    });
    let bestSubject = "—";
    let bestAvg = 0;
    subjectMap.forEach((grades, subject) => {
      const a = grades.reduce((s, g) => s + g, 0) / grades.length;
      if (a > bestAvg) {
        bestAvg = a;
        bestSubject = subject;
      }
    });

    return {
      total: enriched.length,
      avg: avg.toFixed(2),
      highest,
      lowest,
      bestSubject,
      totalSubjects: subjectMap.size,
    };
  }, [enriched]);

  /* ============ Average per Subject ============ */
  const avgBySubject = useMemo(() => {
    const map = new Map();
    enriched.forEach((q) => {
      const arr = map.get(q.subject) || [];
      arr.push(q.grade);
      map.set(q.subject, arr);
    });
    return Array.from(map.entries())
      .map(([name, grades]) => ({
        name,
        average: Number(
          (grades.reduce((s, g) => s + g, 0) / grades.length).toFixed(2),
        ),
        count: grades.length,
        highest: Math.max(...grades),
        lowest: Math.min(...grades),
      }))
      .sort((a, b) => b.average - a.average);
  }, [enriched]);

  /* ============ Grade Distribution ============ */
  const gradeDistribution = useMemo(() => {
    const buckets = {
      "Excellent (90+)": 0,
      "Very Good (75-89)": 0,
      "Good (60-74)": 0,
      "Pass (50-59)": 0,
      "Fail (<50)": 0,
    };
    enriched.forEach((q) => {
      if (q.grade >= 90) buckets["Excellent (90+)"]++;
      else if (q.grade >= 75) buckets["Very Good (75-89)"]++;
      else if (q.grade >= 60) buckets["Good (60-74)"]++;
      else if (q.grade >= 50) buckets["Pass (50-59)"]++;
      else buckets["Fail (<50)"]++;
    });
    return Object.entries(buckets)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [enriched]);

  /* ============ Timeline ============ */
  const timeline = useMemo(
    () =>
      enriched.map((q) => ({
        date: new Date(q.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        grade: q.grade,
        title: q.title,
        subject: q.subject,
      })),
    [enriched],
  );

  /* ============ Monthly ============ */
  const monthlyData = useMemo(() => {
    const map = new Map();
    enriched.forEach((q) => {
      const d = new Date(q.date);
      const key = d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      const entry = map.get(key) || {
        name: key,
        total: 0,
        count: 0,
        grades: [],
        sortKey: d.getTime(),
      };
      entry.total += q.grade;
      entry.count += 1;
      entry.grades.push(q.grade);
      map.set(key, entry);
    });
    return Array.from(map.values())
      .sort((a, b) => a.sortKey - b.sortKey)
      .map((e) => ({
        name: e.name,
        average: Number((e.total / e.count).toFixed(2)),
        highest: Math.max(...e.grades),
        lowest: Math.min(...e.grades),
        count: e.count,
      }));
  }, [enriched]);

  /* ============ Radar ============ */
  const radarData = useMemo(
    () =>
      avgBySubject.slice(0, 6).map((s) => ({
        subject: s.name.length > 14 ? s.name.slice(0, 12) + "..." : s.name,
        average: s.average,
        fullMark: 100,
      })),
    [avgBySubject],
  );

  /* ============ Empty State ============ */
  if (enriched.length === 0) {
    return (
      <Container>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            📊 Theory Quiz Analytics
          </Typography>
          {onClose && (
            <Button
              onClick={onClose}
              startIcon={<FiX />}
              variant="outlined"
              size="small"
              sx={{
                borderRadius: "6px",
                textTransform: "none",
                borderColor: "#e5e7eb",
                color: "#6b7280",
              }}
            >
              Close
            </Button>
          )}
        </Box>
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
              fontSize: "1.5rem",
              color: "#9ca3af",
            }}
          >
            <FiBookOpen />
          </Box>
          <Typography color="#6b7280" variant="subtitle1" fontWeight={600}>
            No Data Available
          </Typography>
          <Typography color="#9ca3af" variant="body2">
            No theory quizzes to display
          </Typography>
        </Box>
      </Container>
    );
  }

  /* ============ Main Render ============ */
  return (
    <Container>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: "#eff6ff",
              color: COLORS.primary,
              width: 40,
              height: 40,
            }}
          >
            <FiBarChart2 size={20} />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700} color={COLORS.slate}>
              Theory Quiz Analytics
            </Typography>
            <Typography variant="caption" color="#6b7280">
              Visual breakdown of your theory quiz performance
            </Typography>
          </Box>
        </Box>

        {onClose && (
          <Button
            onClick={onClose}
            startIcon={<FiX />}
            variant="outlined"
            size="small"
            sx={{
              borderRadius: "6px",
              textTransform: "none",
              height: 36,
              borderColor: "#e5e7eb",
              color: "#6b7280",
              "&:hover": {
                borderColor: "#d1d5db",
                backgroundColor: "#f9fafb",
              },
            }}
          >
            Close
          </Button>
        )}
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <MetricCard bgcolor={COLORS.primary}>
            <CardContent sx={{ p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.9, fontWeight: 500 }}
                >
                  Total Quizzes
                </Typography>
                <FiBookOpen size={16} />
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {stats.total}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                {stats.totalSubjects} subjects
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={6} sm={3}>
          <MetricCard bgcolor={COLORS.success}>
            <CardContent sx={{ p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.9, fontWeight: 500 }}
                >
                  Average Grade
                </Typography>
                <FiTarget size={16} />
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {stats.avg}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Out of 100
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={6} sm={3}>
          <MetricCard bgcolor={COLORS.warning}>
            <CardContent sx={{ p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.9, fontWeight: 500 }}
                >
                  Highest Grade
                </Typography>
                <FiTrendingUp size={16} />
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {stats.highest}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Lowest: {stats.lowest}
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={6} sm={3}>
          <MetricCard bgcolor={COLORS.purple}>
            <CardContent sx={{ p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.9, fontWeight: 500 }}
                >
                  Best Subject
                </Typography>
                <FiAward size={16} />
              </Box>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  fontSize: "1rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={stats.bestSubject}
              >
                {stats.bestSubject}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Top performance
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={2.5}>
        {/* Grade Distribution */}
        <Grid item xs={12} md={5}>
          <ChartPaper>
            <SectionHeader
              icon={<FiTarget />}
              title="Grade Distribution"
              subtitle="Your grades by category"
              color={COLORS.purple}
            />
            <Box height={260}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {gradeDistribution.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </ChartPaper>
        </Grid>

        {/* Monthly Average */}
        <Grid item xs={12} md={7}>
          <ChartPaper>
            <SectionHeader
              icon={<FiTrendingUp />}
              title="Monthly Average Grade"
              subtitle="Your performance trend per month"
              color={COLORS.primary}
            />
            <Box height={260}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient
                      id="theoryQuizGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={COLORS.primary}
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="100%"
                        stopColor={COLORS.primary}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f3f4f6"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="average"
                    stroke={COLORS.primary}
                    strokeWidth={2.5}
                    fill="url(#theoryQuizGrad)"
                    name="Average"
                    dot={{ r: 4, fill: COLORS.primary }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </ChartPaper>
        </Grid>

        {/* Subject Average */}
        <Grid item xs={12} md={7}>
          <ChartPaper>
            <SectionHeader
              icon={<FiBook />}
              title="Average Grade per Subject"
              subtitle="Your performance across theory subjects"
              color={COLORS.success}
            />
            <Box height={280}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={avgBySubject} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f3f4f6"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="average"
                    fill={COLORS.success}
                    name="Average"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </ChartPaper>
        </Grid>

        {/* Radar */}
        {radarData.length >= 3 && (
          <Grid item xs={12} md={5}>
            <ChartPaper>
              <SectionHeader
                icon={<FiTarget />}
                title="Subject Radar"
                subtitle="Balanced view of your performance"
                color={COLORS.teal}
              />
              <Box height={280}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                    />
                    <PolarRadiusAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                    />
                    <Radar
                      name="Average"
                      dataKey="average"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.4}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            </ChartPaper>
          </Grid>
        )}

        {/* Monthly Range */}
        <Grid item xs={12}>
          <ChartPaper>
            <SectionHeader
              icon={<FiActivity />}
              title="Monthly Performance Range"
              subtitle="Highest, average, and lowest grade per month"
              color={COLORS.warning}
            />
            <Box height={280}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f3f4f6"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "0.75rem", paddingTop: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="highest"
                    stroke={COLORS.success}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Highest"
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke={COLORS.primary}
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    name="Average"
                  />
                  <Line
                    type="monotone"
                    dataKey="lowest"
                    stroke={COLORS.danger}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Lowest"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </ChartPaper>
        </Grid>

        {/* Timeline */}
        <Grid item xs={12}>
          <ChartPaper>
            <SectionHeader
              icon={<FiTrendingUp />}
              title="Quiz Timeline"
              subtitle="Every theory quiz grade in chronological order"
              color={COLORS.primary}
            />
            <Box height={260}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f3f4f6"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="grade"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      const color =
                        payload.grade >= 90
                          ? COLORS.success
                          : payload.grade >= 75
                            ? COLORS.primary
                            : payload.grade >= 60
                              ? COLORS.warning
                              : COLORS.danger;
                      return (
                        <circle
                          key={props.key}
                          cx={cx}
                          cy={cy}
                          r={3.5}
                          fill={color}
                          stroke="#fff"
                          strokeWidth={1.5}
                        />
                      );
                    }}
                    activeDot={{ r: 6 }}
                    name="Grade"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </ChartPaper>
        </Grid>

        {/* Subject Details Table */}
        <Grid item xs={12}>
          <ChartPaper>
            <SectionHeader
              icon={<FiBook />}
              title="Subject Performance Summary"
              subtitle="Detailed stats per subject"
              color={COLORS.primary}
            />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>
                      Subject
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, fontSize: "0.78rem" }}
                    >
                      Quizzes
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, fontSize: "0.78rem" }}
                    >
                      Highest
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, fontSize: "0.78rem" }}
                    >
                      Lowest
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>
                      Average
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {avgBySubject.map((s) => {
                    const color =
                      s.average >= 90
                        ? COLORS.success
                        : s.average >= 75
                          ? COLORS.primary
                          : s.average >= 60
                            ? COLORS.warning
                            : COLORS.danger;
                    return (
                      <TableRow key={s.name} hover>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                          {s.name}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: 600, fontSize: "0.8rem" }}
                        >
                          {s.count}
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            sx={{
                              color: COLORS.success,
                              fontWeight: 700,
                              fontSize: "0.8rem",
                            }}
                          >
                            {s.highest}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            sx={{
                              color: COLORS.danger,
                              fontWeight: 700,
                              fontSize: "0.8rem",
                            }}
                          >
                            {s.lowest}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              minWidth: 140,
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={s.average}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  backgroundColor: alpha(color, 0.12),
                                  "& .MuiLinearProgress-bar": {
                                    backgroundColor: color,
                                    borderRadius: 3,
                                  },
                                }}
                              />
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 700,
                                color: color,
                                minWidth: 40,
                              }}
                            >
                              {s.average}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </ChartPaper>
        </Grid>
      </Grid>
    </Container>
  );
}
