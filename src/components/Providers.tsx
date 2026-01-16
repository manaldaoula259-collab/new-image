"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ChakraProvider, Flex, PortalManager } from "@chakra-ui/react";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import Header from "./layout/Header";
import { AuthModalProvider, useAuthModal } from "@/contexts/auth-modal-context";
import AuthModal from "./auth/AuthModal";

import theme from "@/styles/theme";
import "react-medium-image-zoom/dist/styles.css";

// Client-side warning suppression (server-side is handled in instrumentation.ts and suppress-warnings.ts)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  const shouldSuppress = (...args: any[]): boolean => {
    const fullMessage = args.map(arg => 
      typeof arg === 'string' ? arg : JSON.stringify(arg)
    ).join(' ');
    
    return (
      fullMessage.includes("defaultProps will be removed") ||
      (fullMessage.includes("defaultProps") && (
        fullMessage.includes("Modal") ||
        fullMessage.includes("Portal") ||
        fullMessage.includes("@chakra-ui") ||
        fullMessage.includes("chakra-ui")
      ))
    );
  };
  
  console.warn = (...args: any[]) => {
    if (shouldSuppress(...args)) {
      return;
    }
    originalWarn.apply(console, args);
  };

  console.error = (...args: any[]) => {
    if (shouldSuppress(...args)) {
      return;
    }
    originalError.apply(console, args);
  };
}

const ClientClerkProvider = ClerkProvider as unknown as React.FC<
  React.PropsWithChildren<{ appearance?: any }>
>;

const queryClient = new QueryClient();
export const inter = Inter({ subsets: ["latin"] });

function AuthModalWrapper() {
  const { isOpen, mode, close, switchMode } = useAuthModal();
  return <AuthModal isOpen={isOpen} onClose={close} mode={mode} onSwitchMode={switchMode} />;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideHeaderRoutes = ["/dashboard", "/admin", "/login", "/sign-up", "/signup"];
  const shouldRenderHeader = !hideHeaderRoutes.some((route) =>
    pathname?.startsWith(route)
  );

  return (
    <ClientClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#1a1a1a",
          colorBackground: "#000000",
          colorText: "#F8FAFC",
          colorTextSecondary: "#E2E8F0",
        },
        elements: {
          userButtonPopoverCard: {
            background: "#000000",
            border: "1px solid rgba(248, 250, 252, 0.1)",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.6)",
          },
          userButtonPopoverMain: {
            background: "#000000",
            color: "#F8FAFC",
          },
          userButtonPopoverFooter: {
            background: "#000000",
            borderTop: "1px solid rgba(248, 250, 252, 0.1)",
            color: "#94A3B8",
          },
          userButtonPopoverHeader: {
            background: "#000000",
            borderBottom: "1px solid rgba(248, 250, 252, 0.1)",
          },
          userButtonPopoverSessionPage: {
            background: "#000000",
          },
          userButtonPopoverActionButton: {
            color: "#F8FAFC !important",
            "&:hover": {
              background: "rgba(248, 250, 252, 0.08)",
            },
          },
          userButtonPopoverActionButtonText: {
            color: "#F8FAFC !important",
          },
          userButtonPopoverActionButtonIcon: {
            color: "#F8FAFC !important",
          },
          userPreviewMainIdentifier: {
            color: "#F8FAFC",
          },
          userPreviewSecondaryIdentifier: {
            color: "#94A3B8",
          },
        },
      }}
    >
      <ChakraProvider theme={theme}>
        <PortalManager>
          <QueryClientProvider client={queryClient}>
            <AuthModalProvider>
              <Flex className={inter.className} flexDirection="column" minH="100vh" bg="transparent">
                {shouldRenderHeader && <Header />}
                {children}
                <Analytics />
                <AuthModalWrapper />
              </Flex>
            </AuthModalProvider>
          </QueryClientProvider>
        </PortalManager>
      </ChakraProvider>
    </ClientClerkProvider>
  );
}
