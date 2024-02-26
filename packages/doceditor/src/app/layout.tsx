import { Inter } from "next/font/google";
import "../styles/globals.css";

// import StyledComponentsRegistry from "@/utils/registry";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link id="favicon" rel="shortcut icon" type="image/x-icon" />
      </head>
      <body className={inter.className}>
        {/* <StyledComponentsRegistry>{children}</StyledComponentsRegistry> */}
        {children}
      </body>
    </html>
  );
}
