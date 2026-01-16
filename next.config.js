/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Server Actions are stable in Next.js 14+, no experimental flag needed
  // Suppress unhandled promise rejection warnings during build
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Proper configuration for Next.js 14+ with Clerk and Mongoose
  experimental: {
    serverComponentsExternalPackages: [
      "mongoose",
      "@prisma/instrumentation",
      "@opentelemetry/instrumentation",
    ],
    instrumentationHook: true, // Enable instrumentation hook for warning suppression
  },
  webpack: (config, { isServer, nextRuntime }) => {
    // Only replace OpenTelemetry for Edge Runtime (middleware)
    // Next.js needs the real OpenTelemetry on the server side
    const isEdgeRuntime = nextRuntime === 'edge';
    
    if (isEdgeRuntime) {
      const webpack = require('webpack');
      
      // Replace OpenTelemetry imports with stubs for Edge Runtime only
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^@opentelemetry\/api$/,
          require.resolve('./src/lib/stubs/opentelemetry-stub.js')
        ),
        new webpack.NormalModuleReplacementPlugin(
          /^@opentelemetry\/instrumentation$/,
          require.resolve('./src/lib/stubs/opentelemetry-stub.js')
        )
      );

      // Alias OpenTelemetry to stub for Edge Runtime
      config.resolve.alias = {
        ...config.resolve.alias,
        '@opentelemetry/api': require.resolve('./src/lib/stubs/opentelemetry-stub.js'),
        '@opentelemetry/instrumentation': require.resolve('./src/lib/stubs/opentelemetry-stub.js'),
      };
    }

    // Don't externalize OpenTelemetry - we're replacing it with a stub instead
    // Externalization would still try to require it at runtime, which fails in Edge Runtime

    // Client-side webpack config - prevent Node.js modules from being bundled
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    } else {
      // Server-side: Externalize additional packages to prevent bundling and webpack warnings
      config.externals = [
        ...config.externals,
        "mongoose",
        // Externalize instrumentation packages to avoid webpack warnings
        // These packages use dynamic requires which trigger warnings but work fine at runtime
        function ({ request }, callback) {
          if (
            request?.startsWith('@prisma/instrumentation') ||
            request === 'require-in-the-middle'
          ) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        },
      ];
    }
    return config;
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
