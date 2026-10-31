import { notFound } from "next/navigation";
import { eventMetadata, EventPage } from "@/lib/landing/route";
import { EVENT_SLUGS } from "@/lib/landing/events";

// Only the known events exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return EVENT_SLUGS.map((event) => ({ event }));
}

export async function generateMetadata({ params }) {
  const { event } = await params;
  return eventMetadata(event);
}

export default async function Page({ params }) {
  const { event } = await params;
  if (!EVENT_SLUGS.includes(event)) notFound();
  return <EventPage event={event} />;
}
