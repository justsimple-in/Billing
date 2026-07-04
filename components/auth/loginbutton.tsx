"use client";

import { signIn } from "next-auth/react";
// import { useSession } from "next-auth/react";

export default function LoginButton() {
  // const { data: session, status } = useSession();

  // console.log(session);
  // console.log(status);
  return (
    <button
      onClick={() => signIn("google")}
      className="w-full rounded-xl bg-blue-600 py-3 font-medium text-white hover:bg-blue-700"
    >
      Continue with Google
    </button>
  );
}