import { landingMetadata, LandingPage } from "@/lib/landing/route";

const SERVICE = "wedding-paan-counter";

export const generateMetadata = () => landingMetadata(SERVICE, "delhi");

export default function Page() {
  return <LandingPage service={SERVICE} area="delhi" />;
}
