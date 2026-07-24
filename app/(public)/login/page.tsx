"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoginButton from "@/components/auth/loginbutton";
import BusinessSwitcherDialog, {
  BusinessOption,
} from "@/components/business/BusinessSwitcherDialog";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function LoginPage() {
  const { status } = useSession();

  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [businesses, setBusinesses] = useState<
    BusinessOption[]
  >([]);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function loadBusinesses() {
      const res = await fetch("/api/business/me");

      const data = await res.json();

      if (data.businesses.length === 0) {
        router.replace("/signup");
      } else if (data.businesses.length === 1) {
        router.replace(`/${data.businesses[0].slug}`);
      } else {
        setBusinesses(data.businesses);
        setOpen(true);
      }
    }

    loadBusinesses();
  }, [status, router]);

  return (
    <>
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

      <BusinessSwitcherDialog
  open={open}
  onOpenChange={(nextOpen) => {
    // Ignore attempts to close the dialog
    if (nextOpen) {
      setOpen(true);
    }
  }}
  businesses={businesses}
  onSelect={(business) => {
    setOpen(false);
    router.replace(`/${business.slug}`);
  }}
/>
    </>
  );
}