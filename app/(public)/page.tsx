import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const features = [
  "Invoice Generation",
  "Customer Management",
  "Product Management",
  "Reports",
  "PDF & Image Download",
  "WhatsApp Sharing",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-700">
      {/* Navbar */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <h1 className="text-2xl font-bold">
            JustSimple <span className="text-blue-600">Billing</span>
          </h1>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-neutral-100 hover:text-black"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Create Workspace
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">
        <span className="rounded-full border text-black bg-neutral-50 px-4 py-1 text-sm font-medium">
          🚀 Simple Billing Software
        </span>

        <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-tight">
          Professional Billing Software
          <br />
          for Businesses
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-neutral-200">
          Create invoices, manage customers, track balances and grow your
          business with JustSimple Billing.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Create Workspace
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/login"
            className="rounded-xl border px-6 py-3 font-medium transition hover:bg-neutral-100 hover:text-black"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Features */}
      {/* <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-10 text-center text-3xl font-bold">
          Everything you need to run your business
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature}
              className="rounded-xl border p-6 transition hover:shadow-lg"
            >
              <CheckCircle2 className="mb-4 text-green-600" />

              <h3 className="text-lg font-semibold">{feature}</h3>

              <p className="mt-2 text-sm text-neutral-500">
                Built for speed, simplicity and daily business operations.
              </p>
            </div>
          ))}
        </div>
      </section> */}

      {/* CTA */}
      <section className="border-t bg-neutral-50">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-20 text-center">
          <h2 className="text-3xl font-bold">
            Ready to simplify your billing?
          </h2>

          <p className="mt-4 text-neutral-600">
            Create your workspace and start generating invoices in minutes.
          </p>

          <Link
            href="/signup"
            className="mt-8 rounded-xl bg-blue-600 px-8 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-neutral-200 md:flex-row">
          <p>© {new Date().getFullYear()} JustSimple Billing</p>

          <p className="mt-1">
              Need help?{" "}
              <a
                href="mailto:justsimple.in@gmail.com"
                className="text-blue-400 hover:text-blue-300"
              >
                justsimple.in@gmail.com
              </a>
            </p>

          <div className="flex gap-6">
            
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}