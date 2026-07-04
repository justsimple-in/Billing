"use client";
// import Link from "next/link";
// import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { slugify } from "@/lib/slug";

export default function SignupPage() {
  
  const router = useRouter();

const [businessName, setBusinessName] = useState("");
const [slug, setSlug] = useState("");
const [address, setAddress] = useState("");
const [phone, setPhone] = useState("");

const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
const [checkingSlug, setCheckingSlug] = useState(false);
const [slugEdited, setSlugEdited] = useState(false);
const [loading, setLoading] = useState(false);


useEffect(() => {
  if (!slugEdited) {
    setSlug(slugify(businessName));
  }
}, [businessName, slugEdited]);

useEffect(() => {
  if (!slug) {
    setSlugAvailable(null);
    return;
  }

  const timer = setTimeout(async () => {
    setCheckingSlug(true);

    const res = await fetch(
      `/api/business/check-slug?slug=${slug}`
    );

    const data = await res.json();

    setSlugAvailable(data.available);
    setCheckingSlug(false);
  }, 500);

  return () => clearTimeout(timer);
}, [slug]);

const createWorkspace = async () => {
  if (!slugAvailable) return;

  setLoading(true);

  const res = await fetch("/api/business/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: businessName,
      slug,
      address,
      phone,
    }),
  });

  const data = await res.json();

  setLoading(false);

  if (!res.ok) {
    alert(data.error);
    return;
  }

  // router.push(`/${data.slug}`);
  router.replace(`/${data.slug}`);
};
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <div className="w-full max-w-xl rounded-2xl border bg-gray-800 p-8 shadow-sm">

        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black"
        >
          <ArrowLeft size={18} />
          Back
        </Link>

        <h1 className="text-3xl font-bold">
          Create Your Workspace
        </h1>

        <p className="mt-2 text-neutral-500">
          You're signed in. Let's set up your business.
        </p>

        <div className="mt-8 space-y-5">

          <div>
            <label className="mb-2 block text-sm font-medium">
              Business Name
            </label>

            <input
            value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Shree Balaji Fruits & Vegetables"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Workspace URL
            </label>

            <div className="flex overflow-hidden rounded-xl border">

              <span className="bg-neutral-100 px-4 py-3 text-neutral-500">
                billing.justsimple.in/
              </span>

              <input
                value={slug}
  onChange={(e) => {
    setSlugEdited(true);
    setSlug(slugify(e.target.value));
  }}
                className="flex-1 px-4 py-3 outline-none"
                placeholder="shree-balaji"
              />

            </div>

            {checkingSlug && (
  <p className="mt-2 text-sm text-neutral-500">
    Checking...
  </p>
)}

{slugAvailable === true && (
  <p className="mt-2 text-sm text-green-600">
    ✓ Available
  </p>
)}

{slugAvailable === false && (
  <p className="mt-2 text-sm text-red-600">
    ✗ Already Taken
  </p>
)}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Business Address
            </label>

            <textarea
            value={address}
  onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Business Address"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Contact Number
            </label>

            <input
            value={phone}
  onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
              placeholder="+91 9876543210"
            />
          </div>

        </div>

        <button
  onClick={createWorkspace}
  disabled={loading || !slugAvailable}
  className="mt-8 w-full rounded-xl bg-blue-600 py-3 font-medium text-white disabled:opacity-50"
>
  {loading ? "Creating..." : "Create Workspace"}
</button>

      </div>
    </main>
  );
}