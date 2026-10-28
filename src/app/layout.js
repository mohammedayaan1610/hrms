import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HrmsProvider } from "@/context/HrmsContext";
import AuthProvider from "@/components/providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "HRMS Pulse | Enterprise Human Resource Management",
  description: "Modern, unified HR platform for employee management, leave requests, and workforce analytics.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <AuthProvider>
          <HrmsProvider>{children}</HrmsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
