"use client";

import { useEffect, useState } from "react";
import {
  FiUsers,
  FiEye,
  FiTrash2,
  FiX,
  FiEdit,
  FiBarChart2,
  FiArrowLeft,
  FiRefreshCw,
} from "react-icons/fi";
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
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { CheckCircle, Error as ErrorIcon } from "@mui/icons-material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import StudentStats from "./StudentStats";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: theme.palette.grey[50],
    transition: "background-color 0.3s ease",
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

const API =
  process.env.NEXT_PUBLIC_API_URL || "https://e-school-server.vercel.app";

export default function ViewStudents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [notification, setNotification] = useState({
    type: "success",
    message: "",
    show: false,
  });
  const [openModal, setOpenModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeStatsStudentId, setActiveStatsStudentId] = useState(null);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [modal, setModal] = useState({
    open: false,
    success: false,
    message: "",
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    section: "",
    nameschool: "",
    guardiannum: "",
    phone: "",
  });

  const handleReload = async () => {
    setReloading(true);
    try {
      const response = await fetch(`${API}/api/students`);
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      console.error("❌ reload error:", err.message);
    } finally {
      setReloading(false);
    }
  };

  const handleOpenEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name || "",
      specialization: student.specialization || "",
      section: student.section || "",
      nameschool: student.nameschool || "",
      guardiannum: student.guardiannum || "",
      phone: student.phone || "",
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `${API}/api/students/${selectedStudent.student_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const result = await res.json();

      if (res.ok) {
        setModal({
          open: true,
          success: true,
          message: "✅ Updated successfully",
        });

        setStudents((prev) =>
          prev.map((s) =>
            s.student_id === selectedStudent.student_id
              ? { ...s, ...formData }
              : s,
          ),
        );

        setEditModalOpen(false);
      } else {
        throw new Error(result.message || "فشل في التحديث");
      }
    } catch (err) {
      console.error("❌ خطأ في التحديث:", err);
      setModal({
        open: true,
        success: false,
        message: `❌ حدث خطأ أثناء التحديث: ${err.message}`,
      });
    }
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${API}/api/students`);
        if (!response.ok) throw new Error("فشل في جلب البيانات");

        const data = await response.json();
        setStudents(data);
      } catch (err) {
        console.error("❌ خطأ:", err.message);
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

  const handleOpenStats = (studentId) => {
    setActiveStatsStudentId(studentId);
  };

  const handleDelete = async (studentId) => {
    if (!confirm("هل تريد حذف هذا الطالب وكل بياناته؟")) return;

    try {
      const res = await fetch(`${API}/api/students/${studentId}`, {
        method: "DELETE",
      });
      setModal({
        open: true,
        success: true,
        message: "✅ تم حذف الطالب بنجاح",
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || res.statusText);
      }

      setStudents((prev) => prev.filter((s) => s.student_id !== studentId));
    } catch (err) {
      console.error("❌ خطأ في الحذف:", err);
      setModal({
        open: true,
        success: false,
        message: "❌ حدث خطأ أثناء الحذف",
      });
    }
  };

  const uniqueSections = [
    ...new Set(students.map((student) => student.section).filter(Boolean)),
  ];

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id?.toString().includes(searchTerm) ||
      student.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.specialization?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSection = !sectionFilter || student.section === sectionFilter;

    return matchesSearch && matchesSection;
  });

  if (activeStatsStudentId) {
    return (
      <Box
        sx={{
          p: { xs: 1.5, sm: 3 },
          backgroundColor: "grey.100",
          minHeight: "100vh",
        }}
      >
        <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
          <Button
            variant="contained"
            startIcon={<FiArrowLeft />}
            onClick={() => setActiveStatsStudentId(null)}
            sx={{ mb: 3, borderRadius: "8px", textTransform: "none" }}
          >
            Back to All Students
          </Button>

          <StudentStats initialStudentId={activeStatsStudentId} />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 3 },
        backgroundColor: "grey.100",
        minHeight: "100vh",
      }}
    >
      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
        {/* Header Bar */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", md: "center" },
            mb: 3,
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FiUsers style={{ fontSize: "1.5rem", color: "#2563eb" }} />
            <Typography
              sx={{
                fontWeight: "bold",
                color: "grey.800",
                fontSize: { xs: "18px", md: "22px" },
              }}
            >
              Manage Students
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              width: { xs: "100%", md: "auto" },
            }}
          >
            <TextField
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              size="small"
              sx={{ width: { xs: "100%", sm: 220, md: 260 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <svg
                      style={{
                        height: "1.1rem",
                        width: "1.1rem",
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
                sx: { borderRadius: "10px", backgroundColor: "#fff" },
              }}
            />

            <FormControl size="small" sx={{ width: { xs: "100%", sm: 160 } }}>
              <InputLabel id="section-filter-label">Group</InputLabel>
              <Select
                labelId="section-filter-label"
                value={sectionFilter}
                label="Group"
                onChange={(e) => setSectionFilter(e.target.value)}
                sx={{ borderRadius: "10px", backgroundColor: "#fff" }}
              >
                <MenuItem value="">All Groups</MenuItem>
                {uniqueSections.map((section, index) => (
                  <MenuItem key={index} value={section}>
                    {section}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Tooltip title="Reload">
              <IconButton
                size="small"
                color="primary"
                onClick={handleReload}
                sx={{
                  bgcolor: "#fff",
                  p: 1,
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  alignSelf: { xs: "flex-end", sm: "center" },
                }}
              >
                {reloading ? <CircularProgress size={18} /> : <FiRefreshCw />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Fully Responsive Table (No Horizontal Scroll) */}
        <Paper
          sx={{
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            p: { xs: 1, sm: 2 },
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="small" sx={{ minWidth: 600 }}>
                <TableHead sx={{ backgroundColor: "grey.50" }}>
                  <TableRow>
                    <TableCell
                      sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}
                    >
                      Name & ID
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        py: 1.5,
                        display: { xs: "none", sm: "table-cell" },
                      }}
                    >
                      Group
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        py: 1.5,
                        display: { xs: "none", md: "table-cell" },
                      }}
                    >
                      Specialization
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        py: 1.5,
                        display: { xs: "none", md: "table-cell" },
                      }}
                    >
                      School
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        py: 1.5,
                        display: { xs: "none", lg: "table-cell" },
                      }}
                    >
                      Guardian
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        py: 1.5,
                        display: { xs: "none", lg: "table-cell" },
                      }}
                    >
                      Phone
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredStudents.map((student, index) => (
                    <StyledTableRow key={index}>
                      {/* Name & ID Column */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, wordBreak: "break-word" }}
                        >
                          {student.name || "Not Found"}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            mt: 0.2,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: "grey.500" }}
                          >
                            ID: {student.student_id || "N/A"}
                          </Typography>
                          {student.student_id && (
                            <IconButton
                              size="small"
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  student.student_id,
                                )
                              }
                              sx={{ p: 0.2 }}
                            >
                              <ContentCopyIcon
                                sx={{ fontSize: 13, color: "grey.500" }}
                              />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>

                      {/* Group Column */}
                      <TableCell
                        sx={{
                          py: 1.5,
                          display: { xs: "none", sm: "table-cell" },
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {student.section || "—"}
                        </Typography>
                      </TableCell>

                      {/* Specialization Column */}
                      <TableCell
                        sx={{
                          py: 1.5,
                          display: { xs: "none", md: "table-cell" },
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {student.specialization || "—"}
                        </Typography>
                      </TableCell>

                      {/* School Column */}
                      <TableCell
                        sx={{
                          py: 1.5,
                          display: { xs: "none", md: "table-cell" },
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {student.nameschool || "—"}
                        </Typography>
                      </TableCell>

                      {/* Guardian Column */}
                      <TableCell
                        sx={{
                          py: 1.5,
                          display: { xs: "none", lg: "table-cell" },
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {student.guardiannum || "—"}
                        </Typography>
                      </TableCell>

                      {/* Phone Column */}
                      <TableCell
                        sx={{
                          py: 1.5,
                          display: { xs: "none", lg: "table-cell" },
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {student.phone || "—"}
                        </Typography>
                      </TableCell>

                      {/* Actions Column with Compact IconButtons */}
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 0.5,
                          }}
                        >
                          <Tooltip title="Analytics">
                            <IconButton
                              size="small"
                              sx={{
                                color: "success.main",
                                bgcolor: "#f0fdf4",
                                "&:hover": { bgcolor: "#dcfce7" },
                              }}
                              onClick={() =>
                                handleOpenStats(student.student_id)
                              }
                            >
                              <FiBarChart2 size={16} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Info">
                            <IconButton
                              size="small"
                              sx={{
                                color: "primary.main",
                                bgcolor: "#eff6ff",
                                "&:hover": { bgcolor: "#dbeafe" },
                              }}
                              onClick={() => handleViewStudent(student)}
                            >
                              <FiEye size={16} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              sx={{
                                color: "warning.main",
                                bgcolor: "#fffbeb",
                                "&:hover": { bgcolor: "#fef3c7" },
                              }}
                              onClick={() => handleOpenEditModal(student)}
                            >
                              <FiEdit size={16} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              sx={{
                                color: "error.main",
                                bgcolor: "#fef2f2",
                                "&:hover": { bgcolor: "#fee2e2" },
                              }}
                              onClick={() => handleDelete(student.student_id)}
                            >
                              <FiTrash2 size={16} />
                            </IconButton>
                          </Tooltip>
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
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              Student Details
            </Typography>
            <IconButton onClick={() => setOpenModal(false)}>
              <FiX />
            </IconButton>
          </Box>

          {selectedStudent && (
            <Box sx={{ "& > *": { py: 1.2 } }}>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Name:</Typography>
                <Typography fontWeight={600}>{selectedStudent.name}</Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">ID:</Typography>
                <Typography fontWeight={600}>
                  {selectedStudent.student_id}
                </Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Group:</Typography>
                <Typography fontWeight={600}>
                  {selectedStudent.section || "—"}
                </Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Specialization:</Typography>
                <Typography fontWeight={600}>
                  {selectedStudent.specialization || "—"}
                </Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">School:</Typography>
                <Typography fontWeight={600}>
                  {selectedStudent.nameschool || "—"}
                </Typography>
              </Box>
              <Divider />
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography color="text.secondary">Guardian Phone:</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography fontWeight={600}>
                    {selectedStudent.guardiannum || "—"}
                  </Typography>
                  {selectedStudent.guardiannum && (
                    <IconButton
                      size="small"
                      color="success"
                      component="a"
                      href={`https://wa.me/${selectedStudent.guardiannum}`}
                      target="_blank"
                    >
                      <WhatsAppIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>
              <Divider />
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography color="text.secondary">Student Phone:</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography fontWeight={600}>
                    {selectedStudent.phone || "—"}
                  </Typography>
                  {selectedStudent.phone && (
                    <IconButton
                      size="small"
                      color="success"
                      component="a"
                      href={`https://wa.me/${selectedStudent.phone}`}
                      target="_blank"
                    >
                      <WhatsAppIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </Box>
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
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              Update Student
            </Typography>
            <IconButton onClick={() => setEditModalOpen(false)}>
              <FiX />
            </IconButton>
          </Box>

          {selectedStudent && (
            <Box sx={{ "& > *": { mb: 2 } }}>
              <TextField
                fullWidth
                size="small"
                label="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <TextField
                fullWidth
                size="small"
                label="Specialization"
                value={formData.specialization}
                onChange={(e) =>
                  setFormData({ ...formData, specialization: e.target.value })
                }
              />
              <TextField
                fullWidth
                size="small"
                label="Group"
                value={formData.section}
                onChange={(e) =>
                  setFormData({ ...formData, section: e.target.value })
                }
              />
              <TextField
                fullWidth
                size="small"
                label="School"
                value={formData.nameschool}
                onChange={(e) =>
                  setFormData({ ...formData, nameschool: e.target.value })
                }
              />
              <TextField
                fullWidth
                size="small"
                label="Guardian Phone"
                value={formData.guardiannum}
                onChange={(e) =>
                  setFormData({ ...formData, guardiannum: e.target.value })
                }
              />
              <TextField
                fullWidth
                size="small"
                label="Student Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1,
                  mt: 2,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleUpdate}
                  disabled={!formData.name}
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
          )}
        </ModalContent>
      </StyledModal>

      {/* Notification Toast */}
      {notification.show && (
        <Alert
          severity={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
          sx={{ position: "fixed", bottom: 24, left: 24 }}
        >
          {notification.message}
        </Alert>
      )}

      {/* Dialog Status */}
      <Dialog
        open={modal.open}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
      >
        <DialogTitle sx={{ textAlign: "center" }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            {modal.success ? (
              <CheckCircle sx={{ fontSize: 50, color: "green" }} />
            ) : (
              <ErrorIcon sx={{ fontSize: 50, color: "red" }} />
            )}
          </Box>
          <Typography
            sx={{
              color: modal.success ? "green" : "red",
              fontWeight: 700,
              fontSize: "20px",
            }}
          >
            {modal.success ? "Success" : "Failed"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ textAlign: "center" }}>{modal.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button
            onClick={() => setModal((prev) => ({ ...prev, open: false }))}
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
