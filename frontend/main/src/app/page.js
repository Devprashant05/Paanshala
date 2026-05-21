import AboutPaanshalaSection from "@/components/home/AboutPaanshalaSection";
import InstagramSection from "@/components/home/InstagramSection";
import MarqueeSection from "@/components/home/MarqueeSection";
import OurRangeSection from "@/components/home/OurRangeSection";
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
      <MarqueeSection
        text="INDULGE IN INDIA'S MOST PREMIUM PAAN & MUKHWAS EXPERIENCE"
        topBgColor="transparent"
        bottomBgColor="#F2B65E"
      />
      <OurRangeSection
        parentCategorySlug="mukhwas-and-more"
        title="OUR PREMIUM MUKHWAS RANGE"
      />
      <AboutPaanshalaSection />
      {/* <PaanshalaRitual /> */}
      <PaanshalaSpecialPaan />
      {/* <SignatureCollections /> */}
      {/* <TestimonialsSection /> */}
      {/* <PaanJournalSection /> */}
      <InstagramSection />

      {/* NEXT SECTIONS (we’ll add one by one) */}
      {/* <SignaturePaanSection /> */}
      {/* <ShopByVideoSection /> */}
      {/* <CollectionsSection /> */}
    </>
  );
}
