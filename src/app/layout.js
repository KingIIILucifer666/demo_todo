import ClientNhostProvider from "@/context/ClientNhostProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientNhostProvider>{children}</ClientNhostProvider>
      </body>
    </html>
  );
}
