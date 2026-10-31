import { landingMetadata, LandingPage } from "@/lib/landing/route";

const SERVICE = "paan-catering";

export const generateMetadata = () => landingMetadata(SERVICE, "delhi");

export default function Page() {
  return <LandingPage service={SERVICE} area="delhi" />;
}
