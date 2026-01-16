import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Check if the current user is an admin
 * Admin users are identified by having the "admin" role in Clerk
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await currentUser();
    if (!user) return false;
    
    // Check if user has admin role in public metadata or org role
    const isAdminRole = 
      user.publicMetadata?.role === "admin" ||
      user.publicMetadata?.admin === true ||
      (user as any).orgRole === "admin";
    
    return !!isAdminRole;
  } catch (error) {
    return false;
  }
}

/**
 * Get admin user ID or throw error
 */
export async function requireAdmin(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Forbidden: Admin access required");
  }
  
  return userId;
}


