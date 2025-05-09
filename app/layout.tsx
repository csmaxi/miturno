import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "./components/client-layout";
import { UserProvider } from "@/lib/context/UserContext";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MiTurno - Gestioná tus citas y turnos",
  description: "Plataforma para gestionar citas y turnos con tu propia URL personalizada",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <UserProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ClientLayout>{children}</ClientLayout>
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}
