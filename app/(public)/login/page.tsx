"use client"
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoginButton from "@/components/auth/loginbutton";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
export default function LoginPage() {
const { status } = useSession();
  const router = useRouter();

 useEffect(() => {
    if (status !== "authenticated") return;

    async function checkBusiness() {
      const res = await fetch("/api/business/me");

      const data = await res.json();

      console.log(data);

      if (data.slug) {
        router.replace(`/${data.slug}`);
      } else {
        router.replace("/signup");
      }
    }

    checkBusiness();
  }, [status, router]);
   
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <div className="w-full max-w-md rounded-2xl border bg-gray-800 p-8 shadow-sm">

        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black"
        >
          <ArrowLeft size={18} />
          Back
        </Link>

        <h1 className="text-3xl font-bold">
          Welcome Back
        </h1>

        <p className="mt-2 text-neutral-500">
          Sign in to your workspace.
        </p>

        {/* <button
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border py-3 font-medium transition hover:bg-neutral-100"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="h-5 w-5"
            alt=""
          />

          Continue with Google
        </button> */}

        <LoginButton />

        <p className="mt-8 text-center text-sm text-neutral-500">
          Don't have a workspace?{" "}
          <Link
            href="/signup"
            className="font-medium text-blue-600"
          >
            Create one
          </Link>
        </p>

      </div>
    </main>
  );
}