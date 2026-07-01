// lib/schema/organization.js
// Central schema data — import this wherever structured data is needed.
// Keeping it here (not inline in layout.js) means store hours/address changes
// only need updating in one place, not hunted down inside JSX.

export const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://paanshala.com/#organization",
      name: "Paanshala",
      url: "https://paanshala.com",
      logo: "https://paanshala.com/logo.png",
      description:
        "Paanshala is a premium Indian paan and gourmet mouth freshener brand, offering signature paan, digestives, and luxury gifting experiences across Delhi NCR and online.",
      email: "info@paanshala.com",
      telephone: "+91-8510851039",
      sameAs: [
        "https://www.instagram.com/paanshalaofficial/",
        "https://www.facebook.com/Paanshalaofficial",
        "https://www.youtube.com/@paanshala",
        "https://x.com/paanshala",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://paanshala.com/#website",
      url: "https://paanshala.com",
      name: "Paanshala",
      publisher: { "@id": "https://paanshala.com/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://paanshala.com/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Store",
      "@id": "https://paanshala.com/#store-mansarover-garden",
      name: "Paanshala - Mansarover Garden (HQ)",
      image: "https://paanshala.com/logo.png",
      url: "https://paanshala.com/get-in-touch",
      telephone: "+91-8510851039",
      priceRange: "₹₹",
      address: {
        "@type": "PostalAddress",
        streetAddress: "First Floor, FB-130, Block FA, Mansarover Garden",
        addressLocality: "Delhi",
        postalCode: "110015",
        addressCountry: "IN",
      },
      parentOrganization: { "@id": "https://paanshala.com/#organization" },
      hasMap:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.524996985071!2d77.13146267068444!3d28.64399513473844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d031154f6c133%3A0x1f3e6d1e54f7a5d1!2sPaanshala!5e0!3m2!1sen!2sin!4v1781870175425!5m2!1sen!2sin",
    },
    {
      "@type": "Store",
      "@id": "https://paanshala.com/#store-punjabi-bagh",
      name: "Paanshala - Punjabi Bagh",
      image: "https://paanshala.com/logo.png",
      url: "https://paanshala.com/get-in-touch",
      telephone: "+91-9324184406",
      priceRange: "₹₹",
      address: {
        "@type": "PostalAddress",
        streetAddress:
          "Punjabi Bagh Club Flyover, West Punjabi Bagh, Sudershan Park",
        addressLocality: "New Delhi",
        postalCode: "110026",
        addressCountry: "IN",
      },
      parentOrganization: { "@id": "https://paanshala.com/#organization" },
      hasMap:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112085.10147891827!2d77.06050553305855!3d28.60999239566904!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d030068429319%3A0x921f466437c725f!2sPaanshala!5e0!3m2!1sen!2sin!4v1781870276405!5m2!1sen!2sin",
    },
    {
      "@type": "Store",
      "@id": "https://paanshala.com/#store-skymarkone",
      name: "Paanshala - Skymark One, Noida",
      image: "https://paanshala.com/logo.png",
      url: "https://paanshala.com/get-in-touch",
      telephone: "+91-8510851039",
      priceRange: "₹₹",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Skymark One, Sector 98",
        addressLocality: "Noida",
        addressRegion: "Uttar Pradesh",
        postalCode: "201304",
        addressCountry: "IN",
      },
      parentOrganization: { "@id": "https://paanshala.com/#organization" },
      hasMap:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3505.2548080185516!2d77.3584241770568!3d28.532059888633345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce780de3c258d%3A0x636cbd25227b8579!2sPaanshala!5e0!3m2!1sen!2sin!4v1782215301260!5m2!1sen!2sin",
    },
  ],
};
