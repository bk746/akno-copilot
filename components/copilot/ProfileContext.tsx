"use client";

import { createContext, useContext } from "react";

export const ProfileContext = createContext<{ openProfile: () => void }>({
  openProfile: () => {},
});

export function useProfilePanel() {
  return useContext(ProfileContext);
}
