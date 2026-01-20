import Providers from "@/components/Providers";
import { Metadata } from "next";
// Suppress Chakra UI warnings (must be imported before React renders)
import "@/lib/suppress-warnings";

type Props = {
  children: React.ReactNode;
};

const description =
  "Generate AI avatars that perfectly capture your unique style. Write a prompt and let our Dreambooth and Stable diffusion technology do the rest.";
const image = "https://photoshot.app/og-cover.jpg";

export const metadata: Metadata = {
  metadataBase: new URL("https://photoshot.app"),
  title: {
    template: "%s | poweraitool",
    default: "Generate Custom AI avatar",
  },
  description,
  keywords: [
    "AI avatar",
    "AI image generator",
    "Dreambooth",
    "Stable Diffusion",
    "AI photo editor",
    "avatar generator",
    "AI art",
    "image generation",
  ],
  authors: [{ name: "poweraitool" }],
  creator: "poweraitool",
  publisher: "poweraitool",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  twitter: {
    card: "summary_large_image",
    site: "@shinework",
    creator: "@shinework",
    title: { template: "%s | poweraitool", default: "Generate Custom AI avatar" },
    description,
    images: [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: "poweraitool - AI Avatar Generator",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://photoshot.app",
    siteName: "poweraitool",
    title: { template: "%s | poweraitool", default: "Generate Custom AI avatar" },
    description,
    images: [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: "poweraitool - AI Avatar Generator",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Clerk resend code link visibility */
            .cl-form button[type="reset"],
            .cl-form a[href*="resend"],
            .cl-formButtonReset,
            .cl-formResendCodeLink,
            .cl-form button.cl-formButtonReset,
            .cl-form a.cl-formResendCodeLink {
              color: #F8FAFC !important;
              font-weight: 600 !important;
              opacity: 1 !important;
              text-decoration: underline;
            }
            .cl-form button[type="reset"]:hover,
            .cl-form a[href*="resend"]:hover,
            .cl-formButtonReset:hover,
            .cl-formResendCodeLink:hover {
              color: #FFFFFF !important;
              opacity: 1 !important;
            }
            /* Clerk alternative methods button visibility */
            .cl-alternativeMethodsBlockButton,
            button.cl-alternativeMethodsBlockButton {
              color: #F8FAFC !important;
              font-weight: 500 !important;
              opacity: 1 !important;
              background: rgba(15, 23, 42, 0.65) !important;
              border: 1px solid rgba(148, 163, 184, 0.35) !important;
            }
            .cl-alternativeMethodsBlockButton:hover,
            button.cl-alternativeMethodsBlockButton:hover {
              color: #FFFFFF !important;
              opacity: 1 !important;
              background: rgba(30, 41, 59, 0.85) !important;
              border: 1px solid rgba(248, 250, 252, 0.35) !important;
            }
            /* Clerk back link visibility */
            .cl-backLink,
            p.cl-backLink {
              color: #F8FAFC !important;
              font-weight: 500 !important;
              opacity: 1 !important;
              text-decoration: none !important;
              cursor: pointer;
            }
            .cl-backLink:hover,
            p.cl-backLink:hover {
              color: #FFFFFF !important;
              opacity: 1 !important;
              text-decoration: underline !important;
            }
            /* Clerk footer sign-in link visibility */
            .cl-footer,
            .cl-footerActionLink,
            a.cl-footerActionLink,
            [class*="cl-footerActionLink"] {
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
            }
            .cl-footerActionLink {
              color: #573cff !important;
              font-weight: 600 !important;
              text-decoration: underline !important;
            }
            .cl-footerActionLink:hover {
              color: #4a2fd9 !important;
            }
            /* Google Sign-in Button Visibility */
            .cl-socialButtonsBlockButton,
            button.cl-socialButtonsBlockButton,
            [class*="cl-socialButtonsBlockButton"] {
              background: #ffffff !important;
              border: 1px solid rgba(0, 0, 0, 0.15) !important;
              color: #000000 !important;
              font-weight: 500 !important;
              opacity: 1 !important;
              box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.08) !important;
            }
            .cl-socialButtonsBlockButton:hover,
            button.cl-socialButtonsBlockButton:hover,
            [class*="cl-socialButtonsBlockButton"]:hover {
              background: #f8f9fa !important;
              border: 1px solid rgba(0, 0, 0, 0.25) !important;
              color: #000000 !important;
              opacity: 1 !important;
              box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.12) !important;
            }
            .cl-socialButtonsBlockButtonText,
            [class*="cl-socialButtonsBlockButtonText"] {
              color: #000000 !important;
              font-weight: 500 !important;
              opacity: 1 !important;
              display: block !important;
              visibility: visible !important;
            }
            .cl-socialButtonsBlockButtonIcon,
            [class*="cl-socialButtonsBlockButtonIcon"] {
              opacity: 1 !important;
              display: block !important;
              visibility: visible !important;
            }
            /* Hide Clerk branding elements */
            .cl-branding,
            [class*="cl-branding"],
            .cl-poweredByClerk,
            [class*="cl-poweredByClerk"],
            .cl-poweredBy,
            [class*="cl-poweredBy"],
            .cl-securedBy,
            [class*="cl-securedBy"],
            .cl-securedByClerk,
            [class*="cl-securedByClerk"],
            .cl-developerEnvironment,
            [class*="cl-developerEnvironment"],
            [data-localization-key*="securedBy"],
            [data-localization-key*="developmentMode"],
            [data-localization-key*="poweredBy"],
            .cl-logo,
            [class*="cl-logo"] {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
            }
          `
        }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
