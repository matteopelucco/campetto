export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black gap-4">
      <h1 className="text-4xl font-bold text-black dark:text-white">Campetto 🌱</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        Stack: Next.js + TypeScript + Tailwind + Prisma + Neon
      </p>
      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
        Stack OK
      </span>
    </div>
  );
}
