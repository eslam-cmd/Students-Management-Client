"use client";
import { useEffect, useState } from "react";
import { FiUsers, FiEye, FiTrash2, FiX,FiEdit } from "react-icons/fi";
import {
  Box,
  Typography,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  IconButton,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  Modal,
  FormControl,
  InputLabel, Select,
  MenuItem,
  Divider,
  Alert,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FiRefreshCw } from "react-icons/fi";
import { CheckCircle, Error as ErrorIcon } from "@mui/icons-material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: theme.palette.grey[50],
    transition: "background-color 0.3s ease",
  },
}));
const handleCopy = () => {
  navigator.clipboard.writeText(id)
    .then(() => {
      setModal({
        open: true,
        success: true,
        message: "✅ The identifier has been copied successfully.",
      });
    })
    .catch(() => {
      setModal({
        open: true,
        success: false,
        message: "❌ An error occurred during copying.",
      });
    });
};

 
const ActionButton = styled(Button)(({ theme, color }) => ({
  display: "flex",
  alignItems: "center",
  gap: "4px",
  minWidth: "auto",
  textTransform: "none",
  color:
    color === "error" ? theme.palette.error.main : theme.palette.primary.main,
  "&:hover": {
    color:
      color === "error" ? theme.palette.error.dark : theme.palette.primary.dark,
    backgroundColor: "transparent",
  },
}));
const StyledModal = styled(Modal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(4px)",
});

const ModalContent = styled(Paper)(({ theme }) => ({
  width: "100%",
  maxWidth: "448px",
  margin: theme.spacing(0, 2),
  padding: theme.spacing(3),
  borderRadius: "12px",
  border: `1px solid ${theme.palette.grey[200]}`,
  transform: "scale(0.95)",
  animation: "fadeIn 0.3s ease-out forwards",
  "@keyframes fadeIn": {
    from: {
      opacity: 0,
      transform: "translateY(10px) scale(0.95)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0) scale(0.95)",
    },
  },
}));

export default function ViewStudents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sectionFilter, setSectionFilter] = useState(""); // حالة جديدة للفلتر
  const [notification, setNotification] = useState({
    type: "success",
    message: "",
    show: false,
  });
  const [openModal, setOpenModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [modal, setModal] = useState({
    open: false,
    success: false,
    message: "",
  });
  const [editModalOpen, setEditModalOpen] = useState(false); // حالة جديدة لموال التعديل
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    section: "",
    nameschool: "",
    guardiannum: "",
    phone: ""
  });

  const handleReload = async () => {
    setReloading(true);
    try {
      const response = await fetch("https://manager-students-server.vercel.app/api/students");
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      console.error("❌ Failed to reload:", err.message);
    } finally {
      setReloading(false);
    }
  };

  // وظيفة فتح مودال التعديل مع بيانات الطالب
  const handleOpenEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name || "",
      specialization: student.specialization || "",
      section: student.section || "",
      nameschool: student.nameschool || "",
      guardiannum: student.guardiannum || "",
      phone: student.phone || ""
    });
    setEditModalOpen(true);
  };

  // update
  const handleUpdate = async () => {
    try {
      const res = await fetch(`https://manager-students-server.vercel.app/api/students/${selectedStudent.student_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setModal({
          open: true,
          success: true,
          message: "✅ The student's data has been successfully updated.",
        });
        
        // تحديث البيانات المحلية
        setStudents(prev => prev.map(s => 
          s.student_id === selectedStudent.student_id 
            ? { ...s, ...formData } 
            : s
        ));
        
        setEditModalOpen(false);
      } else {
        throw new Error(result.message || "Failed to update");
      }
    } catch (err) {
      console.error("❌ Error in the update:", err);
      setModal({
        open: true,
        success: false,
        message: `❌ An error occurred during the update.: ${err.message}`,
      });
    }
  };

  // get student
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("https://manager-students-server.vercel.app/api/students");
        if (!response.ok) throw new Error("Failed to fetch the data");

        const data = await response.json();
        setStudents(data);
      } catch (err) {
        console.error("❌ Error:", err.message);
        setNotification({
          type: "error",
          message: "Failed to fetch students",
          show: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setOpenModal(true);
  };
  
  // delete student
  const handleDelete = async (studentId) => {
    if (!confirm("Do you want to delete this student and all of their data?")) return;
  
    try {
      const res = await fetch(`https://manager-students-server.vercel.app/api/students/${studentId}`, {
        method: "DELETE",
        
      });
      setModal({
        open: true,
        success: true,
        message: "✅ The student has been successfully deleted.",
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || res.statusText);
      }

      // حدّث حالة الطلاب في الواجهة
      setStudents(prev => prev.filter(s => s.student_id !== studentId));
    } catch (err) {
      console.error("❌ Error in deletion:", err);
      setModal({
        open: true,
        success: false,
        message: "❌ An error occurred while deleting.",
      });
    }
  };
  
  // استخراج الأقسام الفريدة من بيانات الطلاب
  const uniqueSections = [...new Set(students.map(student => student.section).filter(Boolean))];

  // فلترة الطلاب بناءً على البحث والفلتر
  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id?.toString().includes(searchTerm) ||
      student.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSection = !sectionFilter || student.section === sectionFilter;
    
    return matchesSearch && matchesSection;
  });

  return (
    <>
    <Box sx={{ p: 3, backgroundColor: "grey.100", minHeight: "100vh" }}>
      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            mb: 4,
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FiUsers style={{ fontSize: "1.5rem", color: "#2563eb" }} />
            <Typography
              sx={{ fontWeight: "bold", color: "grey.800",fontSize:{xs:"17px",md:"22px",lg:"25px"}}}
            >
              Student Management
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" }, width: { xs: "100%", md: "auto" } }}>
            <TextField
              placeholder="Search for students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: { xs: "100%", md: 256 } }}
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
            
            {/* فلتر الأقسام */}
            <FormControl sx={{ minWidth: 120, width: { xs: "100%", md: 180 } }}>
              <InputLabel id="section-filter-label">The section</InputLabel>
              <Select
                labelId="section-filter-label"
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
            
            <Tooltip title="Reload">
              <IconButton
                size="small"
                color="primary"
                onClick={handleReload}
                sx={{ ml: 1, alignSelf: { xs: "flex-start", sm: "center" } }}
              >
                {reloading ? <CircularProgress size={20} /> : <FiRefreshCw />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Students Table */}
        <Paper sx={{ borderRadius: "12px", overflow: "hidden", boxShadow: 1, p: 2 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: "grey.50" }}>
                  <TableRow>
                    {["Name", "Group", "Specialization", "School", "Guardian's Number", "Phone", "Procedures"].map((header, i) => (
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
                  {filteredStudents.map((student, index) => (
                    <StyledTableRow key={index}>
                      <TableCell sx={{ textAlign: "right" }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                              {student.name || "Not available"}
                            </Typography>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <Typography variant="body2" sx={{ color: "grey.500" }}>
                                ID: {student.student_id || "Not available"}
                              </Typography>

                              {student.student_id && (
                                <Tooltip title="Copy ID">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      navigator.clipboard.writeText(student.student_id);
                                    }}
                                  >
                                    <ContentCopyIcon fontSize="inherit" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ textAlign: "right" }}>
                        <Typography variant="body2" sx={{ color: "grey.500" }}>
                          {student.section || "There is none."}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ textAlign: "right" }}>
                        <Typography variant="body2" sx={{ color: "grey.500" }}>
                          {student.specialization || "There is none."}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ textAlign: "right" }}>
                        <Typography variant="body2" sx={{ color: "grey.500" }}>
                          {student.nameschool || "There is none."}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ textAlign: "right" }}>
                        <Typography variant="body2" sx={{ color: "grey.500" }}>
                          {student.guardiannum || "There is none."}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ textAlign: "right" }}>
                        <Typography variant="body2" sx={{ color: "grey.500" }}>
                          {student.phone || "There is none."}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ textAlign: "right" }}>
                        <Box sx={{ display: "flex" }}>
                          <ActionButton
                            startIcon={<FiEye />}
                            onClick={() => handleViewStudent(student)}
                          />
                          <ActionButton
                            color="error"
                            startIcon={<FiTrash2 />}
                            onClick={() => handleDelete(student.student_id)}
                          />
                          
                          <ActionButton
                            color="primary"
                            startIcon={<FiEdit />}
                            onClick={() => handleOpenEditModal(student)}
                          />
                        </Box>
                      </TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      {/* Student Details Modal */}
      <StyledModal open={openModal} onClose={() => setOpenModal(false)}>
        <ModalContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Information about the student
            </Typography>
            <IconButton onClick={() => setOpenModal(false)}>
              <FiX style={{ fontSize: "1.5rem" }} />
            </IconButton>
          </Box>

          {selectedStudent && (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6">{selectedStudent.name}</Typography>
                <Typography variant="body2" sx={{ color: "grey.500" }}>
                  ID: {selectedStudent.student_id || "Not available"}
                </Typography>
              </Box>

              <Box sx={{ "& > *": { py: 1 } }}>
                <Divider />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ color: "grey.600" }}>
                    The group
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                    {selectedStudent.section || "Not available"}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ color: "grey.600" }}>
                    The specialty
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                    {selectedStudent.specialization || "Not available"}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ color: "grey.600" }}>
                    The school
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                    {selectedStudent.nameschool || "Not available"}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ color: "grey.600" }}>
                    Guardian's number
                  </Typography>
                   <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                   <Typography variant="body2" sx={{ fontWeight: "medium" }}>
      {/* عرض الرقم مع رمز الدولة */}
      {selectedStudent.guardiannum
        ? `+963${selectedStudent.guardiannum}`
        : "Not available"}
    </Typography>

      {selectedStudent.guardiannum && (
        <IconButton
          color="success"
          component="a"
          href={`https://wa.me/${selectedStudent.guardiannum}`}
          target="_blank"
          rel="noopener noreferrer"
          
        >
          <WhatsAppIcon />
        </IconButton>
      )}
    </Box>
                </Box>
                <Divider />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ color: "grey.600" }}>
                    The phone
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: "medium" }}>
      {/* عرض الرقم مع رمز الدولة */}
      {selectedStudent.phone
        ? `+963${selectedStudent.phone}`
        : "Not available"}
    </Typography>
      {selectedStudent.phone && (
        <IconButton
          color="success"
          component="a"
          href={`https://wa.me/${selectedStudent.phone}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsAppIcon />
        </IconButton>
      )}
    </Box>

                </Box>
                <Divider />
              </Box>
            </>
          )}
        </ModalContent>
      </StyledModal>

      {/* Edit Student Modal */}
      <StyledModal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <ModalContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Edit student data
            </Typography>
            <IconButton onClick={() => setEditModalOpen(false)}>
              <FiX style={{ fontSize: "1.5rem" }} />
            </IconButton>
          </Box>

          {selectedStudent && (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6">{selectedStudent.name}</Typography>
                <Typography variant="body2" sx={{ color: "grey.500" }}>
                  ID: {selectedStudent.student_id || "Not available"}
                </Typography>
              </Box>

              <Box sx={{ "& > *": { mb: 2 } }}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <TextField
                  fullWidth
                  label="The specialty"
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                />
                <TextField
                  fullWidth
                  label="The group"
                  value={formData.section}
                  onChange={(e) => setFormData({...formData, section: e.target.value})}
                />
                <TextField
                  fullWidth
                  label="The school"
                  value={formData.nameschool}
                  onChange={(e) => setFormData({...formData, nameschool: e.target.value})}
                />
                <TextField
                  fullWidth
                  label="Guardian's number"
                  value={formData.guardiannum}
                  onChange={(e) => setFormData({...formData, guardiannum: e.target.value})}
                />
                <TextField
                  fullWidth
                  label="The phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setEditModalOpen(false)}
                >
                  Cansel
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleUpdate}
                  disabled={!formData.name} // التأكد من أن الاسم غير فارغ
                >
                  Save change
                </Button>
              </Box>
            </>
          )}
        </ModalContent>
      </StyledModal>

      {/* Notification */}
      {notification.show && (
        <Alert
          severity={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
          sx={{
            position: "fixed",
            bottom: 24,
            left: 24,
            animation: "fadeIn 0.3s ease-out forwards",
            "@keyframes fadeIn": {
              from: {
                opacity: 0,
                transform: "translateY(10px)",
              },
              to: {
                opacity: 1,
                transform: "translateY(0)",
              },
            },
          }}
        >
          {notification.message}
        </Alert>
      )}
      
      {/* مودال عصري للحالة */}
      <Dialog
        open={modal.open}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
      >
        <DialogTitle sx={{ textAlign: "center" }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1, borderRadius:"20px" }}>
            {modal.success ? (
              <CheckCircle sx={{ fontSize: 60, color: "green" }} />
            ) : (
              <ErrorIcon sx={{ fontSize: 60, color: "red" }} />
            )}
          </Box>
          <Typography
            sx={{
              color: modal.success ? "green" : "red",
              fontWeight: "bold",
              textAlign: "center",
              fontSize:"25px"
            }}
          >
            {modal.success ? "The success of the operation" : "The operation failed."}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ textAlign: "center" }}>
            {modal.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button
            onClick={() => setModal((prev) => ({ ...prev, open: false }))}
            variant="contained"
            sx={{
              backgroundColor: modal.success ? "green" : "red",
              "&:hover": {
                backgroundColor: modal.success ? "#0f7b0f" : "#b71c1c",
              },
            }}
          >
            Exsit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </>
  );
}