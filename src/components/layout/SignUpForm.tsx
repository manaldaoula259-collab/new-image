"use client";

import { Box, Container, Flex, Text, Link, HStack, Button } from "@chakra-ui/react";
import { SignUp } from "@clerk/nextjs";
import NextLink from "next/link";

export default function SignUpForm() {
  return (
    <Container 
      maxW={{ base: "100%", sm: "450px", md: "500px" }} 
      centerContent 
      py={{ base: 0, sm: 4, md: 8 }}
      px={0}
      w="100%"
    >
      <Flex
        direction="column"
        w="100%"
        align="center"
        justify="center"
      >
        <Box 
          w="100%" 
          px={{ base: 4, sm: 0 }}
          position="relative"
          zIndex={1}
          sx={{
            "& [class*='cl-footer']": {
              display: "block !important",
            },
            "& [class*='cl-footerActionLink']": {
              color: "#573cff !important",
              fontWeight: "600 !important",
              textDecoration: "underline !important",
              opacity: "1 !important",
              "&:hover": {
                color: "#4a2fd9 !important",
              },
            },
            // Hide Clerk branding
            "& [class*='cl-branding']": {
              display: "none !important",
            },
            "& [class*='cl-poweredByClerk']": {
              display: "none !important",
            },
            "& [class*='cl-poweredBy']": {
              display: "none !important",
            },
            "& [class*='cl-securedBy']": {
              display: "none !important",
            },
            "& [class*='cl-developerEnvironment']": {
              display: "none !important",
            },
            "& [data-localization-key*='securedBy']": {
              display: "none !important",
            },
            "& [data-localization-key*='developmentMode']": {
              display: "none !important",
            },
            "& [class*='cl-logo']": {
              display: "none !important",
            },
          }}
        >
          {/* Sign In Link at Top */}
          <Box mb={4} textAlign="center">
            <Text
              fontSize={{ base: "14px", sm: "15px" }}
              color="rgba(0, 0, 0, 0.7)"
              fontFamily="'General Sans', 'Inter', sans-serif"
              display="inline"
            >
              Already have an account?{" "}
            </Text>
            <Link
              as={NextLink}
              href="/login"
              color="#573cff"
              fontWeight="600"
              fontSize={{ base: "14px", sm: "15px" }}
              textDecoration="underline"
              fontFamily="'General Sans', 'Inter', sans-serif"
              _hover={{ color: "#4a2fd9" }}
            >
              Sign in
            </Link>
          </Box>
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/login"
            appearance={{
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
                  background: "#ffffff",
                  backdropFilter: "blur(24px)",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  boxShadow: "0px 42px 42px 0px rgba(0,0,0,0.09), 0px 11px 23px 0px rgba(0,0,0,0.1)",
                  borderRadius: "16px",
                  padding: { base: "1.5rem", sm: "1.75rem", md: "2rem" },
                  color: "#000000",
                  width: "100%",
                  position: "relative",
                  zIndex: 1,
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
                formFieldLabel: {
                  color: "#000000",
                  fontSize: { base: "0.85rem", sm: "0.875rem", md: "0.9rem" },
                  fontWeight: "500",
                  fontFamily: "'General Sans', 'Inter', sans-serif",
                },
                formFieldInput: {
                  background: "#ffffff",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: "8px",
                  color: "#000000",
                  height: { base: "44px", sm: "46px", md: "48px" },
                  fontSize: { base: "0.9rem", sm: "0.925rem", md: "0.95rem" },
                  fontFamily: "'General Sans', 'Inter', sans-serif",
                  minHeight: { base: "44px", sm: "46px", md: "48px" },
                  "&:focus": {
                    border: "1px solid #573cff",
                    boxShadow: "0 0 0 3px rgba(87, 60, 255, 0.1)",
                  },
                },
                formFieldInput__danger: {
                  border: "1px solid rgba(248, 113, 113, 0.75)",
                },
                formFieldWarningText: {
                  color: "#FEE2E2",
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
                socialButtonsBlockButton: {
                  background: "#ffffff !important",
                  border: "1px solid rgba(0, 0, 0, 0.15) !important",
                  borderRadius: "8px",
                  height: { base: "44px", sm: "46px", md: "48px" },
                  color: "#000000 !important",
                  fontSize: { base: "0.9rem", sm: "0.925rem", md: "0.95rem" },
                  fontFamily: "'General Sans', 'Inter', sans-serif",
                  fontWeight: "500 !important",
                  minHeight: { base: "44px", sm: "46px", md: "48px" },
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.08) !important",
                  opacity: "1 !important",
                  "&:hover": {
                    background: "#f8f9fa !important",
                    border: "1px solid rgba(0, 0, 0, 0.25) !important",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.12) !important",
                    color: "#000000 !important",
                    opacity: "1 !important",
                  },
                },
                socialButtonsBlockButtonText: {
                  color: "#000000 !important",
                  fontWeight: "500 !important",
                  fontSize: "0.9rem !important",
                  fontFamily: "'General Sans', 'Inter', sans-serif !important",
                  opacity: "1 !important",
                  display: "block !important",
                  visibility: "visible !important",
                },
                socialButtonsBlockButtonIcon: {
                  opacity: "1 !important",
                  display: "block !important",
                  visibility: "visible !important",
                },
                dividerLine: {
                  background: "rgba(0, 0, 0, 0.1)",
                },
                dividerText: {
                  color: "rgba(0, 0, 0, 0.6)",
                  fontFamily: "'General Sans', 'Inter', sans-serif",
                },
                formFieldInputShowPasswordButton: {
                  color: "rgba(0, 0, 0, 0.6)",
                },
                identityPreviewText: {
                  color: "#000000",
                  fontFamily: "'General Sans', 'Inter', sans-serif",
                },
                identityPreviewEditButton: {
                  color: "#573cff",
                },
                footer: {
                  display: "block !important",
                  visibility: "visible !important",
                  opacity: "1 !important",
                  color: "rgba(0, 0, 0, 0.6)",
                  fontFamily: "'General Sans', 'Inter', sans-serif",
                },
                footerActionText: {
                  display: "inline !important",
                  visibility: "visible !important",
                  opacity: "1 !important",
                  color: "rgba(0, 0, 0, 0.7)",
                  fontFamily: "'General Sans', 'Inter', sans-serif",
                },
                developerEnvironment: {
                  display: "none !important",
                },
                branding: {
                  display: "none !important",
                },
                poweredByClerk: {
                  display: "none !important",
                },
                securedByClerk: {
                  display: "none !important",
                },
                formResendCodeLink: {
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
                formButtonReset: {
                  color: "#573cff !important",
                  fontWeight: "600",
                  fontSize: { base: "0.875rem", sm: "0.9rem", md: "0.95rem" },
                  fontFamily: "'General Sans', 'Inter', sans-serif",
                  "&:hover": {
                    color: "#4a2fd9 !important",
                  },
                },
                alternativeMethodsBlockButton: {
                  background: "#ffffff",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: "8px",
                  height: { base: "44px", sm: "46px", md: "48px" },
                  color: "#000000 !important",
                  fontSize: { base: "0.9rem", sm: "0.925rem", md: "0.95rem" },
                  fontFamily: "'General Sans', 'Inter', sans-serif",
                  fontWeight: "500",
                  minHeight: { base: "44px", sm: "46px", md: "48px" },
                  opacity: "1 !important",
                  "&:hover": {
                    background: "rgba(0, 0, 0, 0.05)",
                    border: "1px solid rgba(0, 0, 0, 0.2)",
                    color: "#000000 !important",
                    opacity: "1 !important",
                  },
                },
                backLink: {
                  color: "#573cff !important",
                  fontWeight: "500",
                  fontSize: { base: "0.875rem", sm: "0.9rem", md: "0.95rem" },
                  fontFamily: "'General Sans', 'Inter', sans-serif",
                  opacity: "1 !important",
                  textDecoration: "none",
                  "&:hover": {
                    color: "#4a2fd9 !important",
                    opacity: "1 !important",
                    textDecoration: "underline",
                  },
                },
              },
            }}
          />
          {/* Login Link */}
          <Box mt={6} textAlign="center">
            <Text
              fontSize={{ base: "14px", sm: "15px" }}
              color="rgba(0, 0, 0, 0.7)"
              fontFamily="'General Sans', 'Inter', sans-serif"
              mb={2}
            >
              Already have an account?{" "}
              <Link
                as={NextLink}
                href="/login"
                color="#573cff"
                fontWeight="600"
                textDecoration="underline"
                _hover={{ color: "#4a2fd9" }}
              >
                Sign in
              </Link>
            </Text>
          </Box>
        </Box>
      </Flex>
    </Container>
  );
}

