import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BiteBuddy - AI Recipe Generator",
  description: "AI-powered recipe generator for foodies ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className = {`${inter.className}`}>
        Header
        <main className="min-h-screen">{children}</main>
        <footer className="py-8 px-4 border-t">
          <div className="max-w-6xl mx-auto flex justify-center items-center">
            <p className="text-stone-500 text-sm">
              Made by Anirudh ✌️
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
