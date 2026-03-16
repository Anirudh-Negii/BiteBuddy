import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 px-4">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center text-center">
        <p className="mb-4 rounded-full border border-orange-200 bg-orange-50 px-4 py-1 text-sm font-semibold tracking-wide text-orange-700">
          404 Error
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl md:text-6xl">
          Page Not Found
        </h1>

        <p className="mt-4 max-w-lg text-base text-stone-600 sm:text-lg">
          The page you are looking for does not exist or may have been moved.
        </p>

        <div className="mt-10 flex justify-center">
          <Button asChild variant="primary" size="lg" className="px-8">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
