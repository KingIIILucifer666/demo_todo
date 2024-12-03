"use client";
import React, { createContext, useContext } from "react";
import { NhostReactProvider } from "@nhost/react";
import { nhost } from "@/lib/nhost";

const NhostContext = createContext(null);

export const NhostProvider = ({ children }) => (
  <NhostReactProvider nhost={nhost}>
    <NhostContext.Provider value={nhost}>{children}</NhostContext.Provider>
  </NhostReactProvider>
);

export const useNhost = () => {
  const context = useContext(NhostContext);
  if (!context) {
    throw new Error("useNhost must be used within an NhostProvider");
  }
  return context;
};
