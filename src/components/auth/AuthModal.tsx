"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Box,
} from "@chakra-ui/react";
import { SignIn, SignUp } from "@clerk/nextjs";
import { useEffect } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "signin" | "signup";
  onSwitchMode: (mode: "signin" | "signup") => void;
}

const clerkAppearance = {
  variables: {
    colorPrimary: "#573cff",
    colorText: "#000000",
    colorTextSecondary: "rgba(0, 0, 0, 0.7)",
    colorBackground: "#f0f0f0",
    colorInputBackground: "#ffffff",
    colorInputText: "#000000",
  },
  elements: {
    rootBox: {
      width: "100%",
    },
    card: {
      background: "#f0f0f0",
      backdropFilter: "blur(24px)",
      border: "1px solid rgba(0, 0, 0, 0.1)",
      boxShadow: "0px 42px 42px 0px rgba(0,0,0,0.09), 0px 11px 23px 0px rgba(0,0,0,0.1)",
      borderRadius: "16px",
      padding: "2rem",
      paddingTop: "2.5rem",
      color: "#000000",
      width: "100%",
      position: "relative",
    },
    headerTitle: {
      color: "#000000",
      fontSize: { base: "1.5rem", sm: "1.625rem", md: "1.75rem" },
      fontWeight: "500",
      fontFamily: "'General Sans', 'Inter', sans-serif",
    },
    headerSubtitle: {
      color: "rgba(0, 0, 0, 0.7)",
      fontSize: { base: "0.875rem", sm: "0.9rem", md: "1rem" },
      fontFamily: "'General Sans', 'Inter', sans-serif",
    },
    formButtonPrimary: {
      background: "#000000",
      borderRadius: "8px",
      height: { base: "44px", sm: "46px", md: "48px" },
      fontSize: { base: "13px", sm: "14px", md: "15px" },
      fontWeight: "500",
      fontFamily: "'IBM Plex Mono', monospace",
      letterSpacing: "0.6px",
      textTransform: "uppercase",
      boxShadow: "0px 42px 42px 0px rgba(0,0,0,0.09), 0px 11px 23px 0px rgba(0,0,0,0.1)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      minHeight: { base: "44px", sm: "46px", md: "48px" },
      "&:hover": {
        background: "#1a1a1a",
        transform: "translateY(-2px)",
      },
    },
    footer: {
      display: "block !important",
      visibility: "visible !important",
      opacity: "1 !important",
    },
    footerActionLink: {
      color: "#573cff !important",
      fontWeight: "600",
      fontSize: { base: "0.875rem", sm: "0.9rem", md: "0.95rem" },
      fontFamily: "'General Sans', 'Inter', sans-serif",
      textDecoration: "underline",
      opacity: "1 !important",
      display: "inline-block !important",
      "&:hover": {
        color: "#4a2fd9 !important",
        opacity: "1 !important",
      },
    },
    footerPages: {
      display: "block !important",
    },
    footerPageLink: {
      display: "inline-block !important",
      color: "#573cff !important",
      fontWeight: "600",
      fontSize: { base: "0.875rem", sm: "0.9rem", md: "0.95rem" },
      fontFamily: "'General Sans', 'Inter', sans-serif",
      textDecoration: "underline",
      opacity: "1 !important",
      "&:hover": {
        color: "#4a2fd9 !important",
        opacity: "1 !important",
      },
    },
    developerEnvironment: {
      display: "none !important",
    },
  },
};

export default function AuthModal({ isOpen, onClose, mode, onSwitchMode }: AuthModalProps) {
  // Handle switching between signin and signup when user clicks footer links
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a, button');
      if (!link) return;

      const text = link.textContent?.toLowerCase() || "";

      if (mode === "signin" && text.includes("sign up")) {
        e.preventDefault();
        e.stopPropagation();
        onSwitchMode("signup");
      } else if (mode === "signup" && text.includes("sign in")) {
        e.preventDefault();
        e.stopPropagation();
        onSwitchMode("signin");
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [isOpen, mode, onSwitchMode]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="rgba(0, 0, 0, 0.6)" backdropFilter="blur(8px)" />
      <ModalContent
        maxW={{ base: "90%", sm: "500px", md: "550px" }}
        borderRadius="16px"
        overflow="visible"
        bg="transparent"
        boxShadow="none"
        position="relative"
      >
        <ModalBody p={0} position="relative">
          <Box
            px={{ base: 4, sm: 0 }}
            position="relative"
            sx={{
              "& [class*='cl-footer']": {
                display: "block !important",
                visibility: "visible !important",
                opacity: "1 !important",
              },
              "& [class*='cl-footerPageLink']": {
                color: "#573cff !important",
                fontWeight: "600 !important",
                textDecoration: "underline !important",
              },
              "& [class*='cl-footerActionLink']": {
                color: "#573cff !important",
                fontWeight: "600 !important",
                textDecoration: "underline !important",
              },
              "& [class*='cl-developerEnvironment']": {
                display: "none !important",
              },
            }}
          >
            {mode === "signin" ? (
              <SignIn
                routing="virtual"
                appearance={clerkAppearance}
                afterSignInUrl="/dashboard"
                signUpUrl="/sign-up"
              />
            ) : (
              <SignUp
                routing="virtual"
                appearance={clerkAppearance}
                afterSignUpUrl="/dashboard"
                signInUrl="/login"
              />
            )}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
