import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/app-shell";
import { StudyProvider } from "@/components/providers/study-provider";

export const metadata: Metadata = {
  title: { default: "Fiscal SC", template: "%s · Fiscal SC" },
  description: "Transparência pública que transforma Santa Catarina.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <StudyProvider>
          <AppShell>{children}</AppShell>
        </StudyProvider>
      </body>
    </html>
  );
}
