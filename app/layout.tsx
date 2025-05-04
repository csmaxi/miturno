import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "./components/client-layout";

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
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
