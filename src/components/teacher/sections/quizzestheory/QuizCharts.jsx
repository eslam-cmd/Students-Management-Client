// src/components/QuizCharts.jsx
"use client";

import React, { useMemo, useState } from "react";
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
  LinearProgress,
  Divider,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  FiUser,
  FiBookOpen,
  FiClipboard,
  FiCheckCircle,
  FiAward,
  FiRefreshCw,
  FiBarChart2,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiCalendar,
  FiTarget,
  FiUsers,
  FiX,
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
  primary: "#2563eb",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#7c3aed",
  pink: "#ec4899",
  teal: "#06b6d4",
  orange: "#f97316",
  indigo: "#4f46e5",
  slate: "#0f172a",
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.purple,
  COLORS.warning,
  COLORS.teal,
  COLORS.success,
  COLORS.pink,
  COLORS.orange,
  COLORS.indigo,
];

const GRADIENT_COLORS = [
  "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
  "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
  "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
];

/* ==================== Styled Components ==================== */

const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3.5),
  borderRadius: "1.25rem",
  backgroundColor: "#ffffff",
  boxShadow:
    "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
  direction: "rtl",
  fontFamily:
    '"Cairo", "Tajawal", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
}));

const MetricCard = styled(Card)(({ gradient }) => ({
  borderRadius: "1rem",
  background: gradient || GRADIENT_COLORS[0],
  color: "#ffffff",
  boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.2)",
  position: "relative",
  overflow: "hidden",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 20px 25px -5px rgba(37, 99, 235, 0.3)",
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
        direction: "rtl",
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

export default function QuizCharts({ quizzes = [], students = [], onClose }) {
  const [activeTab, setActiveTab] = useState(0);

  /* ========== Enrich Data ========== */
  const enriched = useMemo(() => {
    return quizzes
      .map((q) => {
        const student = students.find((s) => s.student_id === q.student_id);
        return {
          ...q,
          studentName: student?.name || q.student_id,
          section: student?.section || "—",
          grade: Number(q.quiz_grade) || 0,
        };
      })
      .filter((q) => q.grade > 0);
  }, [quizzes, students]);

  /* ========== 1) Average per Student ========== */
  const avgByStudent = useMemo(() => {
    const map = new Map();
    enriched.forEach((q) => {
      const key = q.studentName;
      const entry = map.get(key) || { name: key, total: 0, count: 0, grades: [] };
      entry.total += q.grade;
      entry.count += 1;
      entry.grades.push(q.grade);
      map.set(key, entry);
    });
    return Array.from(map.values())
      .map((e) => ({
        name: e.name,
        average: Number((e.total / e.count).toFixed(2)),
        quizzes: e.count,
        highest: Math.max(...e.grades),
        lowest: Math.min(...e.grades),
      }))
      .sort((a, b) => b.average - a.average);
  }, [enriched]);

  /* ========== 2) Average per Subject ========== */
  const avgBySubject = useMemo(() => {
    const map = new Map();
    enriched.forEach((q) => {
      const key = q.quiz_name || "غير محدد";
      const entry = map.get(key) || { name: key, total: 0, count: 0, grades: [] };
      entry.total += q.grade;
      entry.count += 1;
      entry.grades.push(q.grade);
      map.set(key, entry);
    });
    return Array.from(map.values()).map((e) => ({
      name: e.name,
      average: Number((e.total / e.count).toFixed(2)),
      count: e.count,
      highest: Math.max(...e.grades),
      lowest: Math.min(...e.grades),
    }));
  }, [enriched]);

  /* ========== 3) Grade Distribution ========== */
  const gradeDistribution = useMemo(() => {
    const buckets = {
      "ممتاز (90-100)": 0,
      "جيد جداً (75-89)": 0,
      "جيد (60-74)": 0,
      "مقبول (50-59)": 0,
      "ضعيف (أقل من 50)": 0,
    };
    enriched.forEach((q) => {
      if (q.grade >= 90) buckets["ممتاز (90-100)"]++;
      else if (q.grade >= 75) buckets["جيد جداً (75-89)"]++;
      else if (q.grade >= 60) buckets["جيد (60-74)"]++;
      else if (q.grade >= 50) buckets["مقبول (50-59)"]++;
      else buckets["ضعيف (أقل من 50)"]++;
    });
    return Object.entries(buckets)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [enriched]);

  /* ========== 4) Timeline ========== */
  const timeline = useMemo(() => {
    return [...enriched]
      .sort((a, b) => new Date(a.quiz_date) - new Date(b.quiz_date))
      .map((q) => ({
        date: q.quiz_date,
        grade: q.grade,
        student: q.studentName,
        subject: q.quiz_name,
      }));
  }, [enriched]);

  /* ========== 5) Average per Section ========== */
  const avgBySection = useMemo(() => {
    const map = new Map();
    enriched.forEach((q) => {
      const key = q.section;
      const entry = map.get(key) || { name: key, total: 0, count: 0 };
      entry.total += q.grade;
      entry.count += 1;
      map.set(key, entry);
    });
    return Array.from(map.values()).map((e) => ({
      name: e.name,
      average: Number((e.total / e.count).toFixed(2)),
      count: e.count,
    }));
  }, [enriched]);

  /* ========== 6) Pass / Fail ========== */
  const passFail = useMemo(() => {
    const pass = enriched.filter((q) => q.grade >= 50).length;
    const fail = enriched.length - pass;
    return [
      { name: "ناجح", value: pass, color: COLORS.success },
      { name: "راسب", value: fail, color: COLORS.danger },
    ];
  }, [enriched]);

  /* ========== 7) Subject Radar ========== */
  const radarData = useMemo(() => {
    return avgBySubject.slice(0, 6).map((s) => ({
      subject: s.name.length > 14 ? s.name.slice(0, 12) + "..." : s.name,
      average: s.average,
      fullMark: 100,
    }));
  }, [avgBySubject]);

  /* ========== 8) Top 5 Students Progress ========== */
  const studentProgress = useMemo(() => {
    const topStudents = avgByStudent.slice(0, 5).map((s) => s.name);
    const dateMap = new Map();
    enriched
      .filter((q) => topStudents.includes(q.studentName))
      .forEach((q) => {
        const key = q.quiz_date;
        const entry = dateMap.get(key) || { date: key };
        entry[q.studentName] = q.grade;
        dateMap.set(key, entry);
      });
    return Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
  }, [enriched, avgByStudent]);

  /* ========== Statistics ========== */
  const stats = useMemo(() => {
    if (enriched.length === 0) {
      return {
        total: 0,
        avg: 0,
        passRate: 0,
        topStudent: "—",
        topGrade: 0,
        totalStudents: 0,
      };
    }
    const total = enriched.length;
    const avg = enriched.reduce((s, q) => s + q.grade, 0) / total;
    const passRate = (passFail[0].value / total) * 100;
    const top = avgByStudent[0];
    return {
      total,
      avg: avg.toFixed(2),
      passRate: passRate.toFixed(1),
      topStudent: top?.name || "—",
      topGrade: top?.average || 0,
      totalStudents: avgByStudent.length,
    };
  }, [enriched, passFail, avgByStudent]);

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
            📊 تحليلات الاختبارات
          </Typography>
          {onClose && (
            <Button
              onClick={onClose}
              startIcon={<FiX />}
              variant="outlined"
              size="small"
              sx={{ borderRadius: "0.75rem", textTransform: "none" }}
            >
              إغلاق
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
            <FiBarChart2 />
          </Box>
          <Typography color="text.secondary" variant="h6" fontWeight={600}>
            لا توجد بيانات كافية
          </Typography>
          <Typography color="text.secondary" variant="body2">
            قم بإضافة اختبارات لعرض الرسوم البيانية
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
              bgcolor: "#eff6ff",
              color: COLORS.primary,
              width: 44,
              height: 44,
            }}
          >
            <FiActivity size={24} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700} color={COLORS.slate}>
              📊 لوحة تحليلات الاختبارات
            </Typography>
            <Typography variant="body2" color="text.secondary">
              نظرة شاملة على أداء الطلاب والمواد الدراسية
            </Typography>
          </Box>
        </Box>

        {onClose && (
          <Button
            onClick={onClose}
            startIcon={<FiX />}
            variant="outlined"
            sx={{ borderRadius: "0.75rem", textTransform: "none", height: 40 }}
          >
            إغلاق اللوحة
          </Button>
        )}
      </Box>

      {/* ============ 2. Metric Cards (KPI Ribbon) ============ */}
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
                  إجمالي الاختبارات
                </Typography>
                <FiBookOpen size={24} />
              </Box>
              <Typography variant="h3" fontWeight={800} mt={1}>
                {stats.total}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                في {avgBySubject.length} مادة دراسية
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard gradient={GRADIENT_COLORS[3]}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  المتوسط العام
                </Typography>
                <FiTarget size={24} />
              </Box>
              <Typography variant="h3" fontWeight={800} mt={1}>
                {stats.avg}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                من 100 درجة
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard gradient={GRADIENT_COLORS[1]}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  نسبة النجاح
                </Typography>
                <FiCheckCircle size={24} />
              </Box>
              <Typography variant="h3" fontWeight={800} mt={1}>
                {stats.passRate}%
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {passFail[0].value} ناجح / {passFail[1].value} راسب
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard gradient={GRADIENT_COLORS[2]}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  الطالب المتميز
                </Typography>
                <FiAward size={24} />
              </Box>
              <Typography variant="h3" fontWeight={800} mt={1}>
                {stats.topGrade.toFixed(1)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }} noWrap>
                {stats.topStudent}
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
        <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "#f8fafc", px: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                minHeight: 56,
              },
            }}
          >
            <Tab
              icon={<FiBarChart2 />}
              iconPosition="start"
              label="نظرة عامة"
            />
            <Tab icon={<FiUsers />} iconPosition="start" label="تحليل الطلاب" />
            <Tab
              icon={<FiBookOpen />}
              iconPosition="start"
              label="تحليل المواد"
            />
            <Tab
              icon={<FiTrendingUp />}
              iconPosition="start"
              label="التطور الزمني"
            />
            <Tab icon={<FiAward />} iconPosition="start" label="لوحة الشرف" />
          </Tabs>
        </Box>

        {/* ============ Tab 0: Overview ============ */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Grade Distribution */}
              <Grid item xs={12} md={6}>
                <ChartPaper>
                  <SectionHeader
                    icon={<FiTarget />}
                    title="توزيع الدرجات"
                    subtitle="عدد الطلاب في كل فئة"
                    color={COLORS.purple}
                  />
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={gradeDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={3}
                          label={({ name, value }) => `${name}: ${value}`}
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

              {/* Pass/Fail */}
              <Grid item xs={12} md={6}>
                <ChartPaper>
                  <SectionHeader
                    icon={<FiActivity />}
                    title="نسبة النجاح والرسوب"
                    subtitle="بناءً على درجة النجاح 50"
                    color={COLORS.success}
                  />
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={passFail}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={3}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(1)}%`
                          }
                        >
                          {passFail.map((entry, i) => (
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

              {/* Avg by Section */}
              {avgBySection.length > 0 && (
                <Grid item xs={12}>
                  <ChartPaper>
                    <SectionHeader
                      icon={<FiUsers />}
                      title="متوسط الدرجات لكل قسم"
                      subtitle="مقارنة أداء الأقسام المختلفة"
                      color={COLORS.teal}
                    />
                    <Box height={320}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={avgBySection}>
                          <defs>
                            <linearGradient
                              id="sectionGrad"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor={COLORS.teal}
                                stopOpacity={1}
                              />
                              <stop
                                offset="100%"
                                stopColor={COLORS.teal}
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
                            tick={{ fontSize: 12, fill: "#64748b" }}
                          />
                          <YAxis
                            domain={[0, 100]}
                            tick={{ fontSize: 12, fill: "#64748b" }}
                          />
                          <RechartsTooltip content={<CustomTooltip />} />
                          <Bar
                            dataKey="average"
                            fill="url(#sectionGrad)"
                            name="المتوسط"
                            radius={[8, 8, 0, 0]}
                            maxBarSize={60}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </ChartPaper>
                </Grid>
              )}

              {/* Radar Subjects */}
              {radarData.length >= 3 && (
                <Grid item xs={12} md={6}>
                  <ChartPaper>
                    <SectionHeader
                      icon={<FiTarget />}
                      title="مقارنة المواد (رادار)"
                      subtitle="أداء المواد في نظرة شاملة"
                      color={COLORS.indigo}
                    />
                    <Box height={340}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fontSize: 11 }}
                          />
                          <PolarRadiusAxis domain={[0, 100]} />
                          <Radar
                            name="المتوسط"
                            dataKey="average"
                            stroke={COLORS.indigo}
                            fill={COLORS.indigo}
                            fillOpacity={0.5}
                          />
                          <RechartsTooltip content={<CustomTooltip />} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </Box>
                  </ChartPaper>
                </Grid>
              )}

              {/* Subject Average Bar */}
              <Grid item xs={12} md={radarData.length >= 3 ? 6 : 12}>
                <ChartPaper>
                  <SectionHeader
                    icon={<FiBookOpen />}
                    title="متوسط الدرجات لكل مادة"
                    subtitle="ترتيب المواد حسب الأداء"
                    color={COLORS.success}
                  />
                  <Box height={340}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={avgBySubject} layout="vertical">
                        <defs>
                          <linearGradient
                            id="subjectGrad"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                          >
                            <stop
                              offset="0%"
                              stopColor={COLORS.success}
                              stopOpacity={0.7}
                            />
                            <stop
                              offset="100%"
                              stopColor={COLORS.success}
                              stopOpacity={1}
                            />
                          </linearGradient>
                        </defs>
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
                          width={110}
                          tick={{ fontSize: 11 }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="average"
                          fill="url(#subjectGrad)"
                          name="المتوسط"
                          radius={[0, 8, 8, 0]}
                          maxBarSize={30}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartPaper>
              </Grid>
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
                    title="متوسط الدرجات لكل طالب"
                    subtitle="مقارنة أداء الطلاب (أعلى / أدنى / متوسط)"
                    color={COLORS.primary}
                  />
                  <Box height={380}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={avgByStudent}>
                        <defs>
                          <linearGradient
                            id="avgGrad"
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
                          dataKey="average"
                          fill="url(#avgGrad)"
                          name="المتوسط"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={50}
                        />
                        <Line
                          type="monotone"
                          dataKey="highest"
                          stroke={COLORS.success}
                          strokeWidth={2}
                          name="أعلى درجة"
                          dot={{ r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="lowest"
                          stroke={COLORS.danger}
                          strokeWidth={2}
                          name="أدنى درجة"
                          dot={{ r: 3 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartPaper>
              </Grid>

              <Grid item xs={12}>
                <ChartPaper>
                  <SectionHeader
                    icon={<FiTrendingUp />}
                    title="تطور أداء أفضل 5 طلاب"
                    subtitle="متابعة الدرجات عبر الزمن"
                    color={COLORS.purple}
                  />
                  <Box height={360}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={studentProgress}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fontSize: 12, fill: "#64748b" }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        {avgByStudent.slice(0, 5).map((s, i) => (
                          <Line
                            key={s.name}
                            type="monotone"
                            dataKey={s.name}
                            stroke={CHART_COLORS[i % CHART_COLORS.length]}
                            strokeWidth={2.5}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartPaper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* ============ Tab 2: Subjects ============ */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ChartPaper>
                  <SectionHeader
                    icon={<FiBookOpen />}
                    title="الأداء التفصيلي لكل مادة"
                    subtitle="أعلى / أدنى / متوسط لكل مادة"
                    color={COLORS.warning}
                  />
                  <Box height={380}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={avgBySubject}>
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
                        <Bar
                          dataKey="highest"
                          fill={COLORS.success}
                          name="أعلى درجة"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={40}
                        />
                        <Bar
                          dataKey="average"
                          fill={COLORS.warning}
                          name="المتوسط"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={40}
                        />
                        <Bar
                          dataKey="lowest"
                          fill={COLORS.danger}
                          name="أدنى درجة"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartPaper>
              </Grid>

              <Grid item xs={12}>
                <ChartPaper>
                  <SectionHeader
                    icon={<FiActivity />}
                    title="عدد الاختبارات لكل مادة"
                    subtitle="كمية الاختبارات المنجزة"
                    color={COLORS.primary}
                  />
                  <Box height={320}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={avgBySubject}>
                        <defs>
                          <linearGradient
                            id="areaGrad"
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
                        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke={COLORS.primary}
                          strokeWidth={2.5}
                          fill="url(#areaGrad)"
                          name="عدد الاختبارات"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartPaper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* ============ Tab 3: Timeline ============ */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ChartPaper>
                  <SectionHeader
                    icon={<FiTrendingUp />}
                    title="تطور الدرجات عبر الزمن"
                    subtitle="كل النقاط على خط زمني واحد"
                    color={COLORS.orange}
                  />
                  <Box height={380}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeline}>
                        <defs>
                          <linearGradient
                            id="timelineGrad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={COLORS.orange}
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="100%"
                              stopColor={COLORS.orange}
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
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fontSize: 12, fill: "#64748b" }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="grade"
                          stroke={COLORS.orange}
                          strokeWidth={2.5}
                          fill="url(#timelineGrad)"
                          name="الدرجة"
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
                    title="مقارنة الأداء الكلي"
                    subtitle="جميع الدرجات على خط زمني"
                    color={COLORS.pink}
                  />
                  <Box height={320}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeline}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fontSize: 12, fill: "#64748b" }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="grade"
                          stroke={COLORS.pink}
                          strokeWidth={2}
                          dot={{ r: 3, fill: COLORS.pink }}
                          activeDot={{ r: 6 }}
                          name="الدرجة"
                        />
                      </LineChart>
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
                title="🏆 لوحة الشرف - ترتيب الطلاب"
                subtitle="الترتيب حسب المتوسط العام"
                color={COLORS.warning}
              />

              {/* Top 3 Podium */}
              {avgByStudent.length >= 3 && (
                <Grid container spacing={2} sx={{ mb: 4, mt: 1 }}>
                  {[1, 0, 2].map((idx) => {
                    const student = avgByStudent[idx];
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
                            {student.name.charAt(0)}
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
                            {student.average}
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{ display: "block", mt: 1, color: "grey.600" }}
                          >
                            {student.quizzes} اختبار
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
                  <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>الطالب</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>المتوسط</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>التقدم</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        عدد الاختبارات
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>أعلى / أدنى</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {avgByStudent.map((r, i) => {
                      const medal =
                        i === 0
                          ? "🥇"
                          : i === 1
                            ? "🥈"
                            : i === 2
                              ? "🥉"
                              : i + 1;
                      const color =
                        r.average >= 90
                          ? COLORS.success
                          : r.average >= 75
                            ? COLORS.primary
                            : r.average >= 60
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
                                {r.name.charAt(0)}
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
                                  {r.average}
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={r.average}
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
                            {r.average >= 75 ? (
                              <Chip
                                icon={<FiTrendingUp />}
                                label="متميز"
                                color="success"
                                size="small"
                              />
                            ) : r.average >= 60 ? (
                              <Chip
                                icon={<FiActivity />}
                                label="جيد"
                                color="warning"
                                size="small"
                              />
                            ) : (
                              <Chip
                                icon={<FiTrendingDown />}
                                label="يحتاج تحسين"
                                color="error"
                                size="small"
                              />
                            )}
                          </TableCell>
                          <TableCell>{r.quizzes}</TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              <span
                                style={{
                                  color: COLORS.success,
                                  fontWeight: "bold",
                                }}
                              >
                                {r.highest}
                              </span>
                              {" / "}
                              <span
                                style={{
                                  color: COLORS.danger,
                                  fontWeight: "bold",
                                }}
                              >
                                {r.lowest}
                              </span>
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
