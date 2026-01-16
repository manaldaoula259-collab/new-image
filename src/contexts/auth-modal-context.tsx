"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type AuthMode = "signin" | "signup";

interface AuthModalContextType {
  isOpen: boolean;
  mode: AuthMode;
  openSignIn: () => void;
  openSignUp: () => void;
  close: () => void;
  switchMode: (mode: AuthMode) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signin");

  const openSignIn = useCallback(() => {
    setMode("signin");
    setIsOpen(true);
  }, []);

  const openSignUp = useCallback(() => {
    setMode("signup");
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const switchMode = useCallback((newMode: AuthMode) => {
    setMode(newMode);
  }, []);

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        mode,
        openSignIn,
        openSignUp,
        close,
        switchMode,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}



