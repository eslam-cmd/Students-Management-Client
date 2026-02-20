
import StudentLoginPage from "@/components/auth/login-student/Login";
import LoginPage from "@/components/auth/login-student/Login";
import Footer from "@/components/Ultimit/footer";
import Header from "@/components/Ultimit/header";
export const metadata = {
  title: " تسجيل الدخول",
  description: "تسجيل الدخول للطالب",
  openGraph: {
    title: "E-School | تسجيل الدخول",
    description: "منصة تعليمية متكاملة لإدارة الطلاب والدروس",
    url: "https://e-school-client.vercel.app",
    siteName: "E-School",
    images: [
      {
        url: "logo2.jpg",
        width: 1200,
        height: 630,
        alt: "E-School Dashboard"
      }
    ],
    locale: "ar_AR",
    type: "website"
  }
};
export default function Login() {
  return (
  <>
  <StudentLoginPage />
  </>) ;
}
