import { LANDING_KEYWORDS } from "./keywords";

export const BASE_URL = "https://paanshala.com";
export const PHONE_DISPLAY = "+91 8510851039";
export const PHONE_TEL = "tel:+918510851039";

/* ─────────────────────────────────────────────
   AREAS — one landing page per service per area.
   "delhi" is the root page (/wedding-paan-counter); every other
   area lives at /wedding-paan-counter/<slug>.
   `blurb` + `venues` are what make each area page unique, so keep
   them factual and different per area (edit freely).
───────────────────────────────────────────── */
export const AREAS = {
  delhi: {
    slug: "delhi",
    name: "Delhi",
    region: "Delhi",
    blurb:
      "From South Delhi farmhouses to Old Delhi haveli weddings, Paanshala brings a fully staffed live paan counter to celebrations across the capital.",
    venues: [
      "Banquet halls",
      "Farmhouses",
      "Hotels & resorts",
      "Marriage gardens",
    ],
  },
  "delhi-ncr": {
    slug: "delhi-ncr",
    name: "Delhi NCR",
    region: "Delhi NCR",
    blurb:
      "Planning a wedding that spans Delhi and the NCR? We set up the same premium paan experience at venues across the region, with one team handling the whole booking.",
    venues: [
      "Destination venues",
      "Hotels & resorts",
      "Farmhouses",
      "Banquet halls",
    ],
  },
  dwarka: {
    slug: "dwarka",
    name: "Dwarka",
    region: "West Delhi",
    blurb:
      "Dwarka's sector-wise banquet halls and community centres host weddings all season. We handle setup, live service and clean-up so your hosts can focus on guests.",
    venues: [
      "Banquet halls",
      "Community centres",
      "Hotels near the airport",
      "Party lawns",
    ],
  },
  rohini: {
    slug: "rohini",
    name: "Rohini",
    region: "North-West Delhi",
    blurb:
      "Rohini's large banquet and lawn venues suit big guest lists. Our counters scale from intimate engagements to receptions with a thousand guests.",
    venues: [
      "Banquet halls",
      "Party lawns",
      "Community halls",
      "Marriage gardens",
    ],
  },
  pitampura: {
    slug: "pitampura",
    name: "Pitampura",
    region: "North-West Delhi",
    blurb:
      "Pitampura families trust us for sangeets, receptions and family functions. We coordinate directly with your caterer and decorator so the counter fits the venue.",
    venues: ["Banquet halls", "Party lawns", "Clubs", "Community halls"],
  },
  "punjabi-bagh": {
    slug: "punjabi-bagh",
    name: "Punjabi Bagh",
    region: "West Delhi",
    blurb:
      "Punjabi Bagh's clubs and banquets host some of West Delhi's grandest weddings. Our decorated counters are designed to match a classic Punjabi wedding spread.",
    venues: ["Clubs", "Banquet halls", "Farmhouses", "Home functions"],
  },
  "rajouri-garden": {
    slug: "rajouri-garden",
    name: "Rajouri Garden",
    region: "West Delhi",
    blurb:
      "Rajouri Garden is one of West Delhi's busiest wedding belts. Book early for peak dates and we will hold your slot with the setup tailored to your venue.",
    venues: [
      "Banquet halls",
      "Hotels",
      "Wedding planner venues",
      "Home functions",
    ],
  },
};

export const AREA_SLUGS = Object.keys(AREAS);
export const NON_ROOT_AREA_SLUGS = AREA_SLUGS.filter((s) => s !== "delhi");

/* ─────────────────────────────────────────────
   SERVICES — the shared template reads everything from here.
   {area} is replaced with the area name.
   Packages are descriptive tiers with no prices on purpose
   (pricing depends on guest count). Confirm the details with
   the client before launch.
───────────────────────────────────────────── */
export const SERVICES = {
  "wedding-paan-counter": {
    slug: "wedding-paan-counter",
    short: "Wedding Paan Counter",
    bookingTitle: "Wedding",
    otherService: "bulk-paan-order",
    otherLabel: "Bulk paan orders",
    titleFn: (a) => `Wedding Paan Counter in ${a}`,
    h1Fn: (a) => `Wedding Paan Counter in ${a}`,
    descFn: (a) =>
      `Book a live, decorated wedding paan counter in ${a}. Fresh meetha, Banarasi & chocolate paan made on the spot by trained staff. Get a quote today.`,
    eyebrow: "Live paan counters for weddings",
    intro: (a) =>
      `A wedding is incomplete without paan. Paanshala sets up a beautifully decorated live paan counter at your venue in ${a}, with trained paan makers, fresh ingredients and a menu planned around your guests.`,
    occasions: [
      "Wedding reception",
      "Engagement",
      "Sangeet",
      "Mehendi",
      "Haldi",
      "Destination wedding",
      "Cocktail night",
      "Anniversary party",
    ],
    features: [
      {
        icon: "Sparkles",
        title: "Decorated live counter",
        text: "A styled counter that matches your wedding theme, set up before guests arrive.",
      },
      {
        icon: "Users",
        title: "Trained paan makers",
        text: "Professional staff prepare each paan fresh, so there are no queues or stale stock.",
      },
      {
        icon: "Leaf",
        title: "Fresh, quality ingredients",
        text: "Betel leaves, gulkand, fennel and fillings sourced fresh for your event date.",
      },
      {
        icon: "Utensils",
        title: "Menu built for your guests",
        text: "Sweet, classic, chocolate and sugar-free options so everyone has something.",
      },
      {
        icon: "Clock",
        title: "On-time setup and service",
        text: "We arrive early, serve through your event and clear up without disturbing hosts.",
      },
      {
        icon: "Shield",
        title: "Hygiene first",
        text: "Gloves, clean tools and covered ingredients throughout service.",
      },
    ],
    menu: [
      "Meetha paan",
      "Banarasi paan",
      "Chocolate paan",
      "Gulkand paan",
      "Fire paan",
      "Sugar-free paan",
      "Mukhwas & digestives",
      "Custom paan",
    ],
    packages: [
      {
        name: "Classic",
        tag: "Intimate functions",
        points: [
          "Single counter with live service",
          "Classic and sweet paan menu",
          "Suited to smaller guest lists",
        ],
      },
      {
        name: "Premium",
        tag: "Most booked",
        points: [
          "Decorated themed counter",
          "Wider menu incl. chocolate and Banarasi",
          "Extra staff for larger crowds",
        ],
        highlight: true,
      },
      {
        name: "Royal",
        tag: "Grand weddings",
        points: [
          "Full custom styling and signage",
          "Complete menu plus mukhwas bar",
          "Dedicated event lead on the day",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does a wedding paan counter cost in {area}?",
        a: "Pricing depends on your guest count, menu and counter styling. Share the date, venue and approximate guests in the booking form and we will send a clear quote.",
      },
      {
        q: "How far in advance should I book a paan counter in {area}?",
        a: "For peak wedding dates we recommend booking as early as you can. Last-minute bookings are possible depending on availability, so call us.",
      },
      {
        q: "Do you provide the counter, decoration and staff?",
        a: "Yes. We bring the counter, styling, ingredients and trained paan makers, and handle setup and clean-up.",
      },
      {
        q: "Can you serve paan for different functions like sangeet or mehendi?",
        a: "Yes. Many families book us for reception, sangeet, mehendi, haldi and engagement. Tell us the functions and we will plan the menu for each.",
      },
      {
        q: "Can we customise the paan menu?",
        a: "Yes. Choose from classic, sweet, chocolate, Banarasi and sugar-free options, or ask for a custom flavour.",
      },
      {
        q: "Do you coordinate with our caterer or wedding planner?",
        a: "Yes. We work with your caterer, decorator and planner so the counter fits your venue layout and timings.",
      },
    ],
  },

  "bulk-paan-order": {
    slug: "bulk-paan-order",
    short: "Bulk Paan Orders",
    bookingTitle: "Private Party",
    otherService: "wedding-paan-counter",
    otherLabel: "Wedding paan counter",
    titleFn: (a) => `Bulk Paan Orders in ${a}`,
    h1Fn: (a) => `Bulk Paan Orders & Supply in ${a}`,
    descFn: (a) =>
      `Order paan in bulk in ${a} for weddings, events and corporate functions. Fresh paan for 100 to 1000+ guests, delivered on time. Request a quote.`,
    eyebrow: "Bulk paan supply for events",
    intro: (a) =>
      `Need paan for a crowd? Paanshala supplies freshly made paan in bulk across ${a}, delivered on time for weddings, parties, corporate events and festive gatherings. Pre-made boxes or live service, planned around your guest count.`,
    occasions: [
      "Weddings & marriage functions",
      "Corporate events",
      "Birthday & anniversary parties",
      "Hotel & banquet events",
      "Caterers & event planners",
      "Festive gatherings",
      "Family functions",
      "Return gifts & hampers",
    ],
    features: [
      {
        icon: "Users",
        title: "Any guest count",
        text: "Orders for 100, 500, 1000 guests or more, planned with enough stock and staff.",
      },
      {
        icon: "Truck",
        title: "Timed delivery",
        text: "Delivery scheduled to your event time so paan arrives fresh, not early.",
      },
      {
        icon: "Leaf",
        title: "Made fresh for your date",
        text: "Prepared close to your event with fresh leaves and fillings.",
      },
      {
        icon: "Utensils",
        title: "Flavour mix you choose",
        text: "Meetha, Banarasi, chocolate, sugar-free and more, split to suit your guests.",
      },
      {
        icon: "Handshake",
        title: "Partner for caterers and planners",
        text: "We supply paan to caterers, event planners and hotels with repeat-order support.",
      },
      {
        icon: "Shield",
        title: "Hygienic packing",
        text: "Clean, sealed packaging that holds freshness through transport.",
      },
    ],
    menu: [
      "Meetha paan",
      "Banarasi paan",
      "Chocolate paan",
      "Gulkand paan",
      "Sugar-free paan",
      "Mukhwas boxes",
      "Gift-ready boxes",
      "Custom paan",
    ],
    packages: [
      {
        name: "100+ guests",
        tag: "Small events",
        points: [
          "Boxed paan, delivered to venue",
          "Mixed flavour selection",
          "Ideal for parties and offices",
        ],
      },
      {
        name: "500+ guests",
        tag: "Most booked",
        points: [
          "Bulk delivery with staged drop-off",
          "Wider flavour split",
          "Optional live counter add-on",
        ],
        highlight: true,
      },
      {
        name: "1000+ guests",
        tag: "Large weddings & events",
        points: [
          "Planned production and logistics",
          "Dedicated coordinator",
          "Live counter and bulk combined",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the minimum bulk paan order in {area}?",
        a: "Share your guest count and event date in the booking form and we will confirm the minimum and quote for your order.",
      },
      {
        q: "Can you deliver bulk paan for 500 or 1000 guests in {area}?",
        a: "Yes. We plan stock, staff and delivery in advance for large guest lists. Book early for peak dates.",
      },
      {
        q: "Do you supply paan to caterers, hotels and event planners?",
        a: "Yes. We work with caterers, hotels and planners and can set up repeat orders for regular events.",
      },
      {
        q: "Can we choose the flavours in a bulk order?",
        a: "Yes. Choose a mix of meetha, Banarasi, chocolate and sugar-free paan, or ask for a custom flavour.",
      },
      {
        q: "Can I add a live paan counter to a bulk order?",
        a: "Yes. Many clients combine boxed paan with a live counter. Ask for the combined option when you request a quote.",
      },
      {
        q: "How is bulk paan kept fresh during delivery?",
        a: "We prepare close to your event time and use protective packaging so the paan arrives fresh at your venue.",
      },
    ],
  },
};

export const SERVICE_SLUGS = Object.keys(SERVICES);

/* ── helpers ── */
export const fill = (str, areaName) => str.replaceAll("{area}", areaName);

export function pagePath(service, area) {
  return area === "delhi" ? `/${service}` : `/${service}/${area}`;
}

export function getKeywords(service, area) {
  return LANDING_KEYWORDS[service]?.[area] || [];
}

/** Everything the page, metadata and schema need, in one place. */
export function getLandingConfig(service, area) {
  const svc = SERVICES[service];
  const ar = AREAS[area];
  if (!svc || !ar) return null;

  const keywords = getKeywords(service, area);
  return {
    service,
    area,
    path: pagePath(service, area),
    url: `${BASE_URL}${pagePath(service, area)}`,
    title: svc.titleFn(ar.name),
    description: svc.descFn(ar.name),
    h1: svc.h1Fn(ar.name),
    intro: svc.intro(ar.name),
    eyebrow: svc.eyebrow,
    areaName: ar.name,
    region: ar.region,
    areaBlurb: ar.blurb,
    venues: ar.venues,
    occasions: svc.occasions,
    features: svc.features,
    menu: svc.menu,
    packages: svc.packages,
    faqs: svc.faqs.map((f) => ({
      q: fill(f.q, ar.name),
      a: fill(f.a, ar.name),
    })),
    keywords,
    primaryKeyword: keywords[0],
    bookingTitle: svc.bookingTitle,
    shortName: svc.short,
    otherService: {
      slug: svc.otherService,
      label: svc.otherLabel,
      href: pagePath(svc.otherService, area),
    },
    siblingAreas: AREA_SLUGS.filter((s) => s !== area).map((s) => ({
      slug: s,
      name: AREAS[s].name,
      href: pagePath(service, s),
    })),
  };
}

/** For sitemap.js — all 14 landing pages. */
export function landingSitemapEntries() {
  const entries = [];
  for (const service of SERVICE_SLUGS) {
    for (const area of AREA_SLUGS) {
      entries.push({
        url: `${BASE_URL}${pagePath(service, area)}`,
        changeFrequency: "monthly",
        priority: area === "delhi" ? 0.8 : 0.7,
      });
    }
  }
  return entries;
}
