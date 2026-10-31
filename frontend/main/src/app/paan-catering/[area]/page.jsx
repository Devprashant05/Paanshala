import { notFound } from "next/navigation";
import { landingMetadata, LandingPage } from "@/lib/landing/route";
import { NON_ROOT_AREA_SLUGS } from "@/lib/landing/data";

const SERVICE = "paan-catering";

// Only the known areas exist; anything else is a 404. "delhi" is the root page, not /delhi.
export const dynamicParams = false;

export function generateStaticParams() {
  return NON_ROOT_AREA_SLUGS.map((area) => ({ area }));
}

export async function generateMetadata({ params }) {
  const { area } = await params;
  return landingMetadata(SERVICE, area);
}

export default async function Page({ params }) {
  const { area } = await params;
  if (!NON_ROOT_AREA_SLUGS.includes(area)) notFound();
  return <LandingPage service={SERVICE} area={area} />;
}
