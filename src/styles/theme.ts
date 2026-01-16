import { inter } from "@/components/Providers";
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#1a1a1a",
      600: "#0a0a0a",
      700: "#000000",
      800: "#000000",
      900: "#000000",
    },
    slate: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5f5",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
    emerald: {
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
    },
  },
  semanticTokens: {
    colors: {
      "bg.canvas": {
        default: "#05060f",
      },
      "bg.surface": {
        default: "rgba(11, 17, 28, 0.92)",
      },
      "bg.surfaceMuted": {
        default: "rgba(13, 22, 36, 0.7)",
      },
      "bg.glass": {
        default: "rgba(15, 23, 42, 0.65)",
      },
      "border.subtle": {
        default: "rgba(148, 163, 184, 0.25)",
      },
      "border.emphasis": {
        default: "rgba(26, 26, 26, 0.55)",
      },
      "text.primary": {
        default: "#e2e8f0",
      },
      "text.muted": {
        default: "#94a3b8",
      },
      "accent.glow": {
        default: "rgba(26, 26, 26, 0.45)",
      },
    },
  },
  styles: {
    global: {
      ":root": {
        "--bg-canvas": "var(--chakra-colors-bg-canvas)",
        "--bg-surface": "var(--chakra-colors-bg-surface)",
        "--bg-surface-muted": "var(--chakra-colors-bg-surfaceMuted)",
        "--bg-glass": "var(--chakra-colors-bg-glass)",
        "--border-subtle": "var(--chakra-colors-border-subtle)",
        "--border-emphasis": "var(--chakra-colors-border-emphasis)",
        "--text-primary": "var(--chakra-colors-text-primary)",
        "--text-muted": "var(--chakra-colors-text-muted)",
        "--accent": "var(--chakra-colors-brand-500)",
        "--accent-strong": "var(--chakra-colors-brand-600)",
        "--accent-glow": "var(--chakra-colors-accent-glow)",
      },
      body: {
        bg: "var(--bg-canvas)",
        color: "var(--text-primary)",
        fontSmoothing: "antialiased",
      },
      "*": {
        borderColor: "var(--border-subtle)",
      },
      "::selection": {
        backgroundColor: "#573cff",
        color: "white",
      },
      "a, button": {
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      },
      // Clerk resend code link visibility
      ".cl-form button[type='reset'], .cl-form a[href*='resend'], .cl-formButtonReset, .cl-formResendCodeLink": {
        color: "#F8FAFC !important",
        fontWeight: "600 !important",
        opacity: "1 !important",
        textDecoration: "underline",
        "&:hover": {
          color: "#FFFFFF !important",
          opacity: "1 !important",
        },
      },
      // Clerk alternative methods button visibility
      ".cl-alternativeMethodsBlockButton, button.cl-alternativeMethodsBlockButton": {
        color: "#F8FAFC !important",
        fontWeight: "500 !important",
        opacity: "1 !important",
        background: "rgba(15, 23, 42, 0.65) !important",
        border: "1px solid rgba(148, 163, 184, 0.35) !important",
        "&:hover": {
          color: "#FFFFFF !important",
          opacity: "1 !important",
          background: "rgba(30, 41, 59, 0.85) !important",
          border: "1px solid rgba(248, 250, 252, 0.35) !important",
        },
      },
      // Clerk back link visibility
      ".cl-backLink, p.cl-backLink": {
        color: "#F8FAFC !important",
        fontWeight: "500 !important",
        opacity: "1 !important",
        textDecoration: "none !important",
        cursor: "pointer",
        "&:hover": {
          color: "#FFFFFF !important",
          opacity: "1 !important",
          textDecoration: "underline !important",
        },
      },
    },
  },
  fonts: {
    heading: `'${inter.style.fontFamily}', sans-serif`,
    body: `'${inter.style.fontFamily}', sans-serif`,
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "full",
        fontWeight: 600,
        letterSpacing: "0.01em",
      },
      variants: {
        brand: {
          bg: "var(--accent)",
          color: "white",
          border: "1px solid transparent",
          boxShadow: "0 14px 45px -10px var(--accent-glow)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          _hover: {
            bg: "var(--accent-strong)",
            boxShadow: "0 20px 55px -12px rgba(26,26,26,0.65)",
            transform: "translateY(-2px)",
          },
          _active: {
            transform: "translateY(0px)",
            boxShadow: "0 12px 35px -12px rgba(26,26,26,0.55)",
          },
        },
        ghostOnDark: {
          bg: "transparent",
          color: "var(--text-muted)",
          border: "1px solid transparent",
          _hover: {
            color: "var(--text-primary)",
            borderColor: "var(--border-subtle)",
            bg: "rgba(100, 116, 139, 0.08)",
            transform: "translateY(-1px)",
          },
          _active: {
            transform: "translateY(0px)",
          },
        },
        glass: {
          bg: "var(--bg-glass)",
          color: "var(--text-primary)",
          backdropFilter: "blur(14px)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 10px 35px rgba(15, 23, 42, 0.55)",
          _hover: {
            borderColor: "var(--border-emphasis)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    Link: {
      baseStyle: {
        color: "var(--text-primary)",
        _hover: {
          color: "var(--accent)",
          textDecoration: "none",
        },
      },
      variants: {
        brand: {
          color: "var(--accent)",
          borderBottom: "1px solid transparent",
          _hover: {
            color: "var(--accent-strong)",
            borderBottomColor: "rgba(26, 26, 26, 0.4)",
          },
        },
      },
    },
    Tooltip: {
      baseStyle: {
        bg: "var(--bg-surfaceMuted)",
        color: "var(--text-primary)",
        borderRadius: "md",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--border-subtle)",
      },
    },
    Toast: {
      baseStyle: {
        container: {
          bg: "var(--bg-surface)",
          color: "var(--text-primary)",
          borderRadius: "lg",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(18px)",
        },
      },
    },
  },
});

export default theme;
