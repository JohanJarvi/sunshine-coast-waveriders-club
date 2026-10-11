import Link from "next/link";
import { site } from "@/lib/site";

export function SiteHeader({ light = false }: { light?: boolean }) {
  const tone = light ? "text-sand" : "text-ink";
  return (
    <header
      className={`no-print relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5 sm:px-6 ${tone}`}
    >
      <Link href="/" className="font-display text-lg font-bold tracking-tight">
        {site.shortName}
        <span className="ml-1.5 hidden text-sm font-normal opacity-70 sm:inline">
          Sunshine Coast
        </span>
      </Link>
      <nav className="flex items-center gap-1 text-sm font-medium sm:gap-3">
        <Link href="/#how" className="rounded-full px-3 py-1.5 hover:bg-white/10">
          How it works
        </Link>
        <Link
          href="/event/"
          className={`rounded-full px-4 py-1.5 ${light ? "bg-sand text-ink hover:bg-white" : "bg-ink text-sand hover:bg-ocean-deep"}`}
        >
          Run a draw
        </Link>
      </nav>
    </header>
  );
}
