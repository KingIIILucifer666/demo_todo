import "@/styles/globals.css";

import ClientNhostProvider from "@/context/ClientNhostProvider";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-center" />

        <ClientNhostProvider>{children}</ClientNhostProvider>
      </body>
    </html>
  );
}
