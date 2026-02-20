
import createEmotionCache from "@/utils/emotionCache";
import Head from 'next/head';
const clientSideEmotionCache = createEmotionCache();


export const metadata = {
  title: "الواجهة الرئيسية",
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






export default function RootLayout({ children }) {


  return (
    <>
     <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&family=Fjalla+One&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Lalezar&display=swap" rel="stylesheet"
        />
      </Head>

    <html lang="ar" suppressHydrationWarning >
<body suppressHydrationWarning>{children}</body>
    </html>
    </>
  );
}
