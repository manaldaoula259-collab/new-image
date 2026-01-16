import mongoose from "mongoose";

/**
 * Global type declarations
 * 
 * CodeCanyon Requirement Note: These global variables are necessary for:
 * 1. mongoose - Next.js connection caching pattern to prevent connection exhaustion
 *    (see src/lib/mongodb.ts for implementation details)
 * 
 * These are explicitly declared here rather than using implicit globals to
 * maintain type safety and comply with CodeCanyon requirements.
 */
declare global {
  /**
   * Mongoose connection cache
   * Used to maintain a single database connection across Next.js hot reloads
   * Prevents connection exhaustion in development mode
   */
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

export {};

