import AboutPaanshalaSection from "@/components/home/AboutPaanshalaSection";
import InstagramSection from "@/components/home/InstagramSection";
import PaanJournalSection from "@/components/home/PaanJournalSection";
import PaanshalaRitual from "@/components/home/PaanshalaRitual";
import PaanshalaSpecialPaan from "@/components/home/PaanshalaSpecialPaan";
import SignatureCollections from "@/components/home/SignatureCollections";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import VideoBannerSection from "@/components/home/VideoBannerSection";

export default function HomePage() {
  return (
    <>
      {/* HERO VIDEO SECTION */}
      <VideoBannerSection />
      <AboutPaanshalaSection />
      <PaanshalaSpecialPaan />
      <SignatureCollections />
      <PaanshalaRitual />
      <TestimonialsSection />
      <PaanJournalSection />
      <InstagramSection />

      {/* NEXT SECTIONS (we’ll add one by one) */}
      {/* <SignaturePaanSection /> */}
      {/* <ShopByVideoSection /> */}
      {/* <CollectionsSection /> */}
    </>
  );
}
