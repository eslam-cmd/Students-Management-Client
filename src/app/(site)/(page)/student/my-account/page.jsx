import DashboardStudent from "@/components/student/dashboard";

export const metadata = {
  title: "حسابي",
  description: "منصة تعليمية متكاملة لإدارة الطلاب والدروس",
  openGraph: {
    title: "E-School | لوحة التحكم",
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
export default function dashboardAdmin() {
  return (
    <>
      <DashboardStudent />
    </>
  );
}
