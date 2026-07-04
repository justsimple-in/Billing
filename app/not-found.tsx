import Link from "next/link";
import { Home, LogIn, Building2, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <SearchX className="h-8 w-8 text-neutral-700" />
        </div>

        <h1 className="text-3xl font-bold text-neutral-900">
          Page not found
        </h1>

        <p className="mt-3 text-sm leading-6 text-neutral-600">
          The page you're looking for doesn't exist, or you may not have
          permission to access it.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Link>

          

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}