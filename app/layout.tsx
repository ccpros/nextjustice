import Navbar from "@/components/Navbar";
import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'





const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata = {
  title: "CCPROS",
  description: "Empowering communities through civic & legal technology.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return ( 
  //  <ClerkProvider>
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-brand-light text-brand">
        <Navbar />
        
        {children}
        
      </body>
    </html>
 //   </ClerkProvider>
  );
}
