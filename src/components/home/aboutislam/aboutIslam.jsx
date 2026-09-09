import { Modal, Box, Typography, Button, Avatar, Stack } from "@mui/material";
import { FaWhatsapp } from "react-icons/fa";

const AboutIslam = ({ open, handleClose }) => {
  const whatsappNumber = "+963932642429";
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 420, md: 480 },
          maxWidth: "90%",
          bgcolor: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          borderRadius: 4,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          p: { xs: 3, sm: 4 },
          outline: "none",
          animation: "fadeIn 0.4s ease-in-out",
          "@keyframes fadeIn": {
            from: { opacity: 0, transform: "translateY(-10px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
        }}
      >
        {/* Image or Icon */}
        <Stack alignItems="center" spacing={2} mb={2}>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: { xs: 64, sm: 72, md: 80 },
              height: { xs: 64, sm: 72, md: 80 },
              fontSize: { xs: 28, sm: 36 },
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
            src="https://my-profile-personal-nextjs.vercel.app/logo/my-photo2.jpg"
          />
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
          >
            Who is Islam?
          </Typography>
        </Stack>

        {/* Description Text */}
        <Typography
          variant="body1"
          mb={3}
          sx={{
            textAlign: "center",
            lineHeight: 1.8,
            fontSize: { xs: "0.9rem", sm: "1rem" },
            direction: "ltr",
          }}
        >
          Software Engineer - Building secure and scalable web and mobile
          systems with flexible interfaces and organized, clean logic across
          platforms.
        </Typography>

        {/* WhatsApp Button */}
        <Button
          variant="contained"
          fullWidth
          href={whatsappLink}
          target="_blank"
          startIcon={<FaWhatsapp />}
          sx={{
            bgcolor: "#25D366",
            "&:hover": { bgcolor: "#1ebe5d" },
            fontWeight: "bold",
            py: { xs: 1, sm: 1.2 },
            borderRadius: 3,
            fontSize: { xs: "0.9rem", sm: "1rem" },
            boxShadow: "0 4px 12px rgba(37, 211, 102, 0.4)",
            textTransform: "none",
          }}
        >
          Book Your Design Here
        </Button>
      </Box>
    </Modal>
  );
};

export default AboutIslam;
