import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type AuthState = Awaited<ReturnType<typeof auth>>;
type ClerkUser = Awaited<ReturnType<typeof currentUser>>;

export function getSession() {
  return auth();
}

export async function getCurrentUser() {
  return currentUser();
}

export async function getCurrentUserOrRedirect(): Promise<NonNullable<ClerkUser>> {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getCurrentSessionRedirect(): Promise<AuthState & { userId: string }> {
  const session = await auth();

  if (!session.userId) {
    redirect("/login");
  }

  return session as AuthState & { userId: string };
}
