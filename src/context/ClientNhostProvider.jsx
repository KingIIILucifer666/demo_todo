// app/context/ClientNhostProvider.js

"use client";

import { NhostProvider } from "@nhost/nextjs";
import { nhost } from "@/lib/nhost";

const ClientNhostProvider = ({ children }) => {
  return <NhostProvider nhost={nhost}>{children}</NhostProvider>;
};

export default ClientNhostProvider;
