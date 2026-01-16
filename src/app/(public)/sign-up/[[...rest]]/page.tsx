import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const SignUp = async () => {
  const user = await currentUser();

  if (user) {
    redirect("/dashboard");
  }

  // Redirect to home page - modal will be opened via buttons
  redirect("/");
};

export default SignUp;

