import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import {
  ImageGenerator,
  TextSummarizer,
  ImageAnalyzer,
  RateLimitDisplay,
} from "~/app/_components/ml";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="min-h-screen bg-black text-white">
        {/* Header Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-5xl font-extrabold tracking-tight sm:text-[5rem]">
              ML <span className="text-white">T3</span> Template
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-300">
              A production-ready ML web app template built with Next.js, tRPC,
              Prisma, and Replicate AI
            </p>
          </div>

          {/* Quick Info */}
          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
              <h3 className="mb-2 text-xl font-bold">🚀 Quick Start</h3>
              <p className="text-gray-300">
                {hello ? hello.greeting : "Loading tRPC query..."}
              </p>
              <div className="mt-4">
                {session ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Logged in as {session.user?.name}
                    </span>
                    <Link
                      href="/api/auth/signout"
                      className="rounded bg-gray-800 border border-gray-700 px-3 py-1 text-sm transition-colors hover:bg-gray-700"
                    >
                      Sign out
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/api/auth/signin"
                    className="inline-block rounded bg-gray-800 border border-gray-700 px-4 py-2 transition-colors hover:bg-gray-700"
                  >
                    Sign in to get started
                  </Link>
                )}
              </div>
            </div>

            <RateLimitDisplay />
          </div>

          {/* ML Features */}
          <div className="space-y-12">
            <ImageGenerator />
            <TextSummarizer />
            <ImageAnalyzer />
          </div>

          {/* Footer */}
          <div className="mt-16 border-t border-gray-800 pt-8">
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Link
                className="flex flex-col gap-2 rounded-xl bg-gray-900 border border-gray-800 p-4 transition-colors hover:bg-gray-800"
                href="https://create.t3.gg/en/usage/first-steps"
                target="_blank"
              >
                <h3 className="text-lg font-bold">T3 Documentation →</h3>
                <div className="text-sm text-gray-300">
                  Learn about the T3 stack and how to customize this template
                </div>
              </Link>
              <Link
                className="flex flex-col gap-2 rounded-xl bg-gray-900 border border-gray-800 p-4 transition-colors hover:bg-gray-800"
                href="https://replicate.com/docs"
                target="_blank"
              >
                <h3 className="text-lg font-bold">Replicate API →</h3>
                <div className="text-sm text-gray-300">
                  Explore more ML models and API documentation
                </div>
              </Link>
            </div>

            {session?.user && <LatestPost />}
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
