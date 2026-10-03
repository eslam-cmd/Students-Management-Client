// src/components/StudentAttendanceCharts.jsx
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
  LinearProgress,
  Divider,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiTarget,
  FiX,
  FiAward,
  FiBarChart2,
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
  Legend,
} from "recharts";

/* ==================== Constants ==================== */

const COLORS = {
  present: "#10b981",
  absent: "#ef4444",
  primary: "#2A52BE",
  warning: "#f59e0b",
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
            {p.value}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};

/* ==================== Section Header ==================== */

function SectionHeader({ icon, title, subtitle, color = COLORS.primary }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        mb: 2.5,
      }}
    >
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

export default function StudentAttendanceCharts({ attendance = [], onClose }) {
  const [activeTab, setActiveTab] = useState(0);

  /* ============ Enrich Data ============ */
  const enriched = useMemo(() => {
    return attendance
      .map((a) => ({
        ...a,
        date: a.attendance_date,
        isPresent: a.status === "present",
        isAbsent: a.status === "absent",
      }))
      .filter((a) => a.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [attendance]);

  /* ============ Statistics ============ */
  const stats = useMemo(() => {
    const total = enriched.length;
    const present = enriched.filter((a) => a.isPresent).length;
    const absent = enriched.filter((a) => a.isAbsent).length;
    const rate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    // Calculate streak (longest consecutive present)
    let currentStreak = 0;
    let longestStreak = 0;
    enriched.forEach((a) => {
      if (a.isPresent) {
        currentStreak += 1;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    return {
      total,
      present,
      absent,
      rate: parseFloat(rate),
      longestStreak,
    };
  }, [enriched]);

  /* ============ Overall Pie ============ */
  const overallPie = useMemo(
    () => [
      { name: "Present", value: stats.present, color: COLORS.present },
      { name: "Absent", value: stats.absent, color: COLORS.absent },
    ],
    [stats],
  );

  /* ============ Monthly Stats ============ */
  const monthlyData = useMemo(() => {
    const map = new Map();
    enriched.forEach((a) => {
      const d = new Date(a.date);
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
      if (a.isPresent) entry.present += 1;
      else entry.absent += 1;
      entry.total += 1;
      map.set(key, entry);
    });
    return Array.from(map.values())
      .sort((a, b) => a.sortKey - b.sortKey)
      .map((e) => ({
        ...e,
        rate: Number(((e.present / e.total) * 100).toFixed(1)),
      }));
  }, [enriched]);

  /* ============ Day of Week ============ */
  const dayOfWeek = useMemo(() => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const map = new Map();
    days.forEach((d) =>
      map.set(d, { name: d, present: 0, absent: 0, total: 0 }),
    );
    enriched.forEach((a) => {
      const day = days[new Date(a.date).getDay()];
      const entry = map.get(day);
      if (a.isPresent) entry.present += 1;
      else entry.absent += 1;
      entry.total += 1;
    });
    return Array.from(map.values())
      .filter((d) => d.total > 0)
      .map((d) => ({
        ...d,
        rate: Number(((d.present / d.total) * 100).toFixed(1)),
      }));
  }, [enriched]);

  /* ============ Timeline ============ */
  const timeline = useMemo(
    () =>
      enriched.map((a) => ({
        date: new Date(a.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        value: a.isPresent ? 1 : 0,
        status: a.isPresent ? "Present" : "Absent",
      })),
    [enriched],
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
            📊 Attendance Analytics
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
            <FiCalendar />
          </Box>
          <Typography color="#6b7280" variant="subtitle1" fontWeight={600}>
            No Data Available
          </Typography>
          <Typography color="#9ca3af" variant="body2">
            No attendance records to display
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
              Attendance Analytics
            </Typography>
            <Typography variant="caption" color="#6b7280">
              Visual breakdown of your attendance record
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
                  Attendance Rate
                </Typography>
                <FiTarget size={16} />
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {stats.rate}%
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                {stats.present} of {stats.total} days
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={6} sm={3}>
          <MetricCard bgcolor={COLORS.present}>
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
                  Present Days
                </Typography>
                <FiCheckCircle size={16} />
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {stats.present}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Total attendance
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={6} sm={3}>
          <MetricCard bgcolor={COLORS.absent}>
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
                  Absent Days
                </Typography>
                <FiXCircle size={16} />
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {stats.absent}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Missed days
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
                  Best Streak
                </Typography>
                <FiAward size={16} />
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {stats.longestStreak}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Consecutive days
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={2.5}>
        {/* Overall Pie */}
        <Grid item xs={12} md={5}>
          <ChartPaper>
            <SectionHeader
              icon={<FiTarget />}
              title="Overall Distribution"
              subtitle="Present vs Absent ratio"
              color={COLORS.primary}
            />
            <Box height={260}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overallPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {overallPie.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 3,
                mt: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: COLORS.present,
                  }}
                />
                <Typography variant="caption" fontWeight={600}>
                  Present ({stats.present})
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: COLORS.absent,
                  }}
                />
                <Typography variant="caption" fontWeight={600}>
                  Absent ({stats.absent})
                </Typography>
              </Box>
            </Box>
          </ChartPaper>
        </Grid>

        {/* Monthly Rate */}
        <Grid item xs={12} md={7}>
          <ChartPaper>
            <SectionHeader
              icon={<FiTrendingUp />}
              title="Monthly Attendance Rate"
              subtitle="Your attendance percentage per month"
              color={COLORS.present}
            />
            <Box height={260}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="rate"
                    stroke={COLORS.primary}
                    strokeWidth={2.5}
                    fill="url(#rateGrad)"
                    name="Rate %"
                    dot={{ r: 4, fill: COLORS.primary }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </ChartPaper>
        </Grid>

        {/* Monthly Bars */}
        <Grid item xs={12} md={7}>
          <ChartPaper>
            <SectionHeader
              icon={<FiBarChart2 />}
              title="Monthly Breakdown"
              subtitle="Present vs Absent per month"
              color={COLORS.warning}
            />
            <Box height={280}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
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
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "0.75rem", paddingTop: 8 }}
                  />
                  <Bar
                    dataKey="present"
                    fill={COLORS.present}
                    name="Present"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="absent"
                    fill={COLORS.absent}
                    name="Absent"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </ChartPaper>
        </Grid>

        {/* Day of Week */}
        <Grid item xs={12} md={5}>
          <ChartPaper>
            <SectionHeader
              icon={<FiActivity />}
              title="Attendance by Day"
              subtitle="Which days you attend most"
              color={COLORS.purple}
            />
            <Box height={280}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeek} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f3f4f6"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="present"
                    fill={COLORS.present}
                    name="Present"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </ChartPaper>
        </Grid>

        {/* Timeline */}
        <Grid item xs={12}>
          <ChartPaper>
            <SectionHeader
              icon={<FiTrendingUp />}
              title="Daily Attendance Timeline"
              subtitle="1 = Present, 0 = Absent — full history"
              color={COLORS.primary}
            />
            <Box height={200}>
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
                    domain={[0, 1]}
                    ticks={[0, 1]}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      return (
                        <circle
                          key={props.key}
                          cx={cx}
                          cy={cy}
                          r={3.5}
                          fill={
                            payload.value === 1 ? COLORS.present : COLORS.absent
                          }
                          stroke="#fff"
                          strokeWidth={1.5}
                        />
                      );
                    }}
                    activeDot={{ r: 5 }}
                    name="Status"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </ChartPaper>
        </Grid>

        {/* Monthly Table Summary */}
        <Grid item xs={12}>
          <ChartPaper>
            <SectionHeader
              icon={<FiCalendar />}
              title="Monthly Summary"
              subtitle="Detailed breakdown per month"
              color={COLORS.primary}
            />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>
                      Month
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, fontSize: "0.78rem" }}
                    >
                      Present
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, fontSize: "0.78rem" }}
                    >
                      Absent
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, fontSize: "0.78rem" }}
                    >
                      Total
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>
                      Attendance Rate
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monthlyData.map((m) => {
                    const color =
                      m.rate >= 90
                        ? COLORS.present
                        : m.rate >= 75
                          ? COLORS.primary
                          : m.rate >= 60
                            ? COLORS.warning
                            : COLORS.absent;
                    return (
                      <TableRow key={m.name} hover>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                          {m.name}
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            sx={{
                              color: COLORS.present,
                              fontWeight: 700,
                              fontSize: "0.8rem",
                            }}
                          >
                            {m.present}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            sx={{
                              color: COLORS.absent,
                              fontWeight: 700,
                              fontSize: "0.8rem",
                            }}
                          >
                            {m.absent}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: 600, fontSize: "0.8rem" }}
                        >
                          {m.total}
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
                                value={m.rate}
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
                                minWidth: 45,
                              }}
                            >
                              {m.rate}%
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
