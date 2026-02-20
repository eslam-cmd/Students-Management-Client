// components/ViewExams.jsx

"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  InputAdornment
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import {DeleteIcon} from "@mui/icons-material/Delete";
import { FiTrash2,FiEdit} from "react-icons/fi";
import { FiRefreshCw } from "react-icons/fi";const API_URL ="https://manager-students-server.vercel.app";

const StyledPaper = styled(Paper)(({ theme }) => ({ 
  padding: theme.spacing(3), 
  borderRadius: "1rem", 
  backgroundColor: "#fff", 
}));

// قائمة المواد


export default function ViewPracticalNotes() { 
  const [loading, setLoading] = useState(false); 
  const [notes, setNotes] = useState([]); 
  const [students, setStudents] = useState([]); 
  const [sectionFilter, setSectionFilter] = useState(""); 
  const [specializationFilter, setSpecializationFilter] = useState(""); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [selectedStudent, setSelectedStudent] = useState(""); 
  const [selectedSubject, setSelectedSubject] = useState(""); 
  const [error, setError] = useState("");
  const [reloading, setReloading] = useState(false);
  
  // states للمودال
  const [editOpen, setEditOpen] = useState(false); 
  const [editData, setEditData] = useState({ 
    id: "", 
    student_id: "", 
    name: "", 
    sabject_title: "", 
    sabject_name: "", 
    sabject_date: "", 
    sabject_grade: "", 
  }); 
  const [editErrors, setEditErrors] = useState({}); 
  const [editSubmitting, setEditSubmitting] = useState(false); 
  const [editError, setEditError] = useState(""); 
  const [practicalSubjects, setPracticalSubjects] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  // جلب الطلاب والملاحظات
  const loadData = async () => { 
    setLoading(true); 
    setError("");
    try { 
      const [studRes, notesRes] = await Promise.all([
        fetch(`${API_URL}/api/students`),
        fetch(`${API_URL}/api/practical-notes`),
        fetch(`${API_URL}/api/practical-subjects`)
      ]); 
      if (!studRes.ok) throw new Error("فشل جلب الطلاب"); 
      if (!notesRes.ok) throw new Error("فشل جلب الملاحظات"); 

      const studentsData = await studRes.json();
      const notesData = await notesRes.json();

      // إنشاء خريطة لأسماء الطلاب
      const nameMap = new Map(
        studentsData.map((s) => [s.student_id, s.name])
      );
      
      // دمج البيانات
      const mergedNotes = Array.isArray(notesData) ? notesData : notesData.data;
      const notesWithNames = mergedNotes.map((n) => ({
        ...n,
        name: nameMap.get(n.student_id) || "—",
      }));

      setStudents(studentsData);
      setNotes(notesWithNames);
    } catch (err) { 
      console.error(err);
      setError("Failed to load data. Please check the server connection..");
    } finally { 
      setLoading(false); 
    } 
  };

  useEffect(() => { 
    loadData(); 
  }, []);
  useEffect(() => {
    fetch(`${API_URL}/api/practical-notes/subjects`)
      .then(res => res.json())
      .then(data => setSubjectOptions(data.subjects))
      .catch(err => console.error("Failed to bring the practical materials:", err));
  }, []);
  // حذف ملاحظة
  const handleDelete = async (id) => { 
    if (!confirm("Are you sure you want to delete it permanently?")) return; 
    try { 
      const res = await fetch(`${API_URL}/api/sabject/${id}`, { method: "DELETE" }); 
      if (!res.ok) throw new Error("فشل الحذف"); 
      setNotes((prev) => prev.filter((n) => n.id !== id)); 
    } catch (err) { 
      console.error(err); 
      alert("An error occurred while deleting."); 
    } 
  };


  // فتح المودال بالبيانات
  const handleEdit = (note) => { 
    setEditData({ ...note }); 
    setEditErrors({}); 
    setEditError(""); 
    setEditOpen(true); 
  };

  // غلق المودال
  const handleEditCancel = () => { 
    setEditOpen(false); 
  };

  // تغييرات حقول المودال
  const handleEditChange = (e) => { 
    const { name, value } = e.target; 
    setEditData((prev) => ({ ...prev, [name]: value })); 
    setEditErrors((prev) => ({ ...prev, [name]: "" })); 
    setEditError(""); 
  };

  // تحقق قبل الحفظ
  const validateEdit = () => { 
    const errs = {}; 
    if (!editData.sabject_title.trim()) errs.sabject_title = "The title is required."; 
    if (!editData.sabject_name) errs.sabject_name = "Choose the subject"; 
    if (!editData.sabject_date) errs.sabject_date = "History is required."; 
    if (!editData.sabject_grade.toString().trim()) errs.sabject_grade = "The mark is required."; 
    setEditErrors(errs); 
    return Object.keys(errs).length === 0; 
  };

  // حفظ التعديلات
  const handleEditSave = async () => { 
    if (!validateEdit()) return;

    setEditSubmitting(true);
    setEditError("");
    try {
      const res = await fetch(`${API_URL}/api/sabject/${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sabject_title: editData.sabject_title,
          sabject_name: editData.sabject_name,
          sabject_date: editData.sabject_date,
          sabject_grade: editData.sabject_grade,
        }),
      });
      
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.message || "Update failed");
      }
      
      setNotes((prev) =>
        prev.map((n) => (n.id === editData.id ? { ...editData } : n))
      );
      setEditOpen(false);
    } catch (err) {
      console.error(err);
      setEditError(err.message);
    } finally {
      setEditSubmitting(false);
    }
  };

  const uniqueSections = [...new Set(students.map(student => student.section).filter(Boolean))];
  const uniquespecialization = [...new Set(students.map(student => student.specialization).filter(Boolean))];

  // student filter list
  const uniqueStudents = students.map((s) => ({ 
    id: s.student_id, 
    name: s.name, 
    section: s.section ,
    specialization: s.specialization // إضافة القسم للاستخدام في الفلترة 
  }));

  // filtered notes - التصحيح هنا
  const filteredNotes = notes.filter((note) => {
    // البحث عن الطالب المرتبط بهذه الملاحظة
    const student = students.find(s => s.student_id === note.student_id);
    
    const matchesStudent = !selectedStudent || note.student_id === selectedStudent;
    const matchesSubject = !selectedSubject || note.sabject_name === selectedSubject;
    const matchesSection = !sectionFilter || (student && student.section === sectionFilter);
    const matchesSpecialization = !specializationFilter || (student && student.specialization === specializationFilter);
    const matchesSearch = !searchTerm || 
      (student && student.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      note.sabject_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.sabject_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStudent && matchesSubject && matchesSection && matchesSpecialization && matchesSearch ;
  });

  const handleReload = async () => {
    setReloading(true);
    try {
      await loadData();
    } catch (err) {
      console.error("❌ Failed to reload:", err.message);
    } finally {
      setReloading(false);
    }
  };

  if (loading) { 
    return <Box textAlign="center" mt={4}><CircularProgress /></Box>; 
  }

  return ( 
    <Box sx={{ p: 3, backgroundColor: "grey.100", minHeight: "100vh" }}> 
      <Box sx={{ maxWidth: "1200px", mx: "auto" }}> 
        {/* Header */} 
        <Box sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", md: "row" }, 
          justifyContent: "space-between", 
          alignItems: { xs: "flex-start", md: "center" }, 
          mb: 4, 
          gap: 2, 
        }} > 
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}> 
            <svg  
              style={{ fontSize: "1.5rem", color: "#2563eb" }}  
              fill="none"  
              viewBox="0 0 24 24"  
              stroke="currentColor" 
            > 
              <path  
                strokeLinecap="round"  
                strokeLinejoin="round"  
                strokeWidth={2}  
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"  
              /> 
            </svg> 
            <Typography  sx={{ fontWeight: "bold", color: "grey.800" ,fontSize:{xs:"17px",md:"22px",lg:"25px"}}} > 
              Practical Examination Administration
            </Typography> 
          </Box>

          <Tooltip title="Reload">
            <IconButton
              size="small"
              color="primary"
              onClick={handleReload}
              sx={{ ml: 1 }}
            >
              {reloading ? <CircularProgress size={20} /> : <FiRefreshCw />}
            </IconButton>
          </Tooltip>
        </Box>

        <StyledPaper>
          <Typography variant="h6" mb={2}>
            List of notes by student
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* فلترات البحث */}
          <Box sx={{ 
            display: "flex", 
            flexDirection: { xs: "column", sm: "row" }, 
            alignItems: "center", 
            mb: 3, 
            gap: 2,
            flexWrap: 'wrap'
          }}>
            <TextField
              placeholder="Search for students, subjects, or titles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: { xs: "100%", sm: 300 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <svg
                      style={{
                        height: "1.25rem",
                        width: "1.25rem",
                        color: "#9ca3af",
                      }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "12px",
                  "&:focus-within": {
                    borderColor: "primary.light",
                    boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                  },
                },
              }}
            />
            
            <FormControl fullWidth>
  <InputLabel>Choose the practical subject </InputLabel>
  <Select
    value={selectedSubject}
    onChange={(e) => setSelectedSubject(e.target.value)}
  >
    <MenuItem value="">All</MenuItem>
    {subjectOptions.map((subj) => (
      <MenuItem key={subj} value={subj}>
        {subj}
      </MenuItem>
    ))}
  </Select>
</FormControl>

<FormControl sx={{ minWidth: 180, width: { xs: "100%", sm: "auto" } }}>
              <InputLabel>Choose the student's specialization</InputLabel>
              <Select
                value={specializationFilter}
                label="specialization"
                onChange={(e) => setSpecializationFilter(e.target.value)}
                sx={{ borderRadius: "12px" }}
              >
                <MenuItem value="">All sections</MenuItem>
                {uniquespecialization.map((specialization, index) => (
                  <MenuItem key={index} value={specialization}>{specialization}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 180, width: { xs: "100%", sm: "auto" } }}>
              <InputLabel>The section</InputLabel>
              <Select
                value={sectionFilter}
                label="The section"
                onChange={(e) => setSectionFilter(e.target.value)}
                sx={{ borderRadius: "12px" }}
              >
                <MenuItem value="">All sections</MenuItem>
                {uniqueSections.map((section, index) => (
                  <MenuItem key={index} value={section}>{section}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: "grey.50" }}>
                <TableRow>
                  {["الطالب", "القسم","اختصاص الطالب","العنوان",  "المادة", "التاريخ", "العلامة", "الإجراءات"].map((header, i) => (
                    <TableCell
                      key={i}
                      sx={{
                        textAlign: "right",
                        fontWeight: "medium",
                        color: "grey.500",
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredNotes.map((note) => {
                  const student = students.find((s) => s.student_id === note.student_id);
                  return (
                    <TableRow key={note.id} hover>
  <TableCell sx={{ textAlign: "right" }}>{student?.name || note.student_id}</TableCell>
  <TableCell sx={{ textAlign: "right" }}>{student?.section || "غير محدد"}</TableCell>
  <TableCell sx={{ textAlign: "right" }}>{student?.specialization || "غير محدد"}</TableCell> {/* ← الجديد */}
  <TableCell sx={{ textAlign: "right" }}>{note.sabject_title}</TableCell>
  <TableCell sx={{ textAlign: "right" }}>{note.sabject_name}</TableCell>
  <TableCell sx={{ textAlign: "right" }}>{note.sabject_date}</TableCell>
  <TableCell sx={{ textAlign: "right" }}>{note.sabject_grade}</TableCell>
  <TableCell align="center">
    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
      <IconButton
        onClick={() => handleEdit(note)}
        sx={{ color: "#2563eb" }}
        size="small"
      >
        <FiEdit />
      </IconButton>
      <IconButton
        onClick={() => handleDelete(note.id)}
        sx={{ color: "#dc2626" }}
        size="small"
      >
        <FiTrash2 />
      </IconButton>
    </Box>
  </TableCell>
</TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredNotes.length === 0 && !loading && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="grey.500">
                لا توجد نتائج مطابقة للبحث
              </Typography>
            </Box>
          )}
        </StyledPaper>

        {/* مودال التعديل */}
        <Dialog open={editOpen} onClose={handleEditCancel} fullWidth maxWidth="sm">
          <DialogTitle>تعديل ملاحظة للطالب: {editData.name}</DialogTitle>
          <DialogContent dividers>
            {editError && (
              <Typography color="error" sx={{ mb: 2 }}>
                {editError}
              </Typography>
            )}
            <TextField
              fullWidth
              label="Note title"
              name="sabject_title"
              value={editData.sabject_title}
              onChange={handleEditChange}
              error={!!editErrors.sabject_title}
              helperText={editErrors.sabject_title}
              sx={{ mb: 2 }}
            />
       
<FormControl fullWidth error={!!editErrors.sabject_name}>
  <InputLabel>The practical material</InputLabel>
  <Select
    name="sabject_name"
    value={editData.sabject_name}
    onChange={handleEditChange}
  >
    {subjectOptions.map((subj) => (
      <MenuItem key={subj} value={subj}>
        {subj}
      </MenuItem>
    ))}
  </Select>
</FormControl>
            <TextField
              fullWidth
              type="date"
              label="التاريخ"
              name="sabject_date"
              value={editData.sabject_date}
              onChange={handleEditChange}
              InputLabelProps={{ shrink: true }}
              error={!!editErrors.sabject_date}
              helperText={editErrors.sabject_date}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="number"
              label="العلامة"
              name="sabject_grade"
              value={editData.sabject_grade}
              onChange={handleEditChange}
              error={!!editErrors.sabject_grade}
              helperText={editErrors.sabject_grade}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditCancel} disabled={editSubmitting}>
              إلغاء
            </Button>
            <Button
              variant="contained"
              onClick={handleEditSave}
              disabled={editSubmitting}
            >
              {editSubmitting ? "جارٍ الحفظ..." : "حفظ التعديلات"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box> 
 </Box>
);
}