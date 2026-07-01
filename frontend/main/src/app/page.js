import AboutPaanshalaSection from "@/components/home/AboutPaanshalaSection";
import BannerStyle from "@/components/home/BannerStyle";
import InstagramSection from "@/components/home/InstagramSection";
import MarqueeSection from "@/components/home/MarqueeSection";
import OurRangeSection from "@/components/home/OurRangeSection";
import PaanJournalSection from "@/components/home/PaanJournalSection";
import PaanshalaRitual from "@/components/home/PaanshalaRitual";
import PaanshalaSpecialPaan from "@/components/home/PaanshalaSpecialPaan";
import SignatureCollections from "@/components/home/SignatureCollections";
import SignatureCollectionsSlide from "@/components/home/SignatureCollectionsSlide";
import SignatureEditorial from "@/components/home/SignatureEditorial";
import SignatureMasonry from "@/components/home/SignatureMasonry";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import VideoBannerSection from "@/components/home/VideoBannerSection";

export default function HomePage() {
  return (
    <>
      {/* HERO VIDEO SECTION */}
      <VideoBannerSection />
      <AboutPaanshalaSection />
      <PaanshalaRitual />
      <SignatureCollectionsSlide />
      <PaanshalaSpecialPaan />
      <TestimonialsSection />
      <InstagramSection />
    </>
  );
}
