import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { EventBuilder } from "@/components/EventBuilder";

export const metadata: Metadata = {
  title: "Run a draw",
  description: "Register surfers on the beach and draw heats with bib colours.",
};

export default function EventPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-20 sm:px-6">
        <EventBuilder />
      </main>
    </>
  );
}
