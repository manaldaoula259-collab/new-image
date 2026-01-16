/**
 * Next.js Instrumentation Hook
 * Runs before the server starts and can be used to set up global configurations
 * This suppresses Chakra UI warnings that occur during SSR
 */

export async function register() {
  if (process.env.NODE_ENV === "development") {
    // Suppress React warnings about defaultProps from Chakra UI
    const originalError = console.error;
    const originalWarn = console.warn;

    const shouldSuppress = (...args: any[]): boolean => {
      const fullMessage = args.map(arg => 
        typeof arg === 'string' ? arg : JSON.stringify(arg)
      ).join(' ');
      
      return (
        fullMessage.includes("defaultProps will be removed") ||
        fullMessage.includes("defaultProps") && (
          fullMessage.includes("Modal") ||
          fullMessage.includes("Portal") ||
          fullMessage.includes("@chakra-ui") ||
          fullMessage.includes("chakra-ui")
        )
      );
    };

    console.error = (...args: any[]) => {
      if (shouldSuppress(...args)) {
        return;
      }
      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      if (shouldSuppress(...args)) {
        return;
      }
      originalWarn.apply(console, args);
    };
  }
}

