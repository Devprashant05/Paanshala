/* ─────────────────────────────────────────────
   EVENT PAGES — /paan-counter-for/<slug>
   One page per event type (13), covering all of Delhi NCR.
   Not one page per event per area: 100+ near-identical pages would
   read as doorway pages, so areas are served by the wedding and
   bulk-order pages instead.
   `kind` decides which package set and cross-link the page uses.
   Content is unique per event; the shared template does the rest.
───────────────────────────────────────────── */
export const EVENTS = [
  {
    slug: "reception",
    name: "Reception",
    titleName: "Wedding Reception",
    kind: "wedding",
    bookingTitle: "Wedding",
    intro:
      "A reception brings the whole guest list under one roof, and paan is how the evening ends. Paanshala sets up a decorated live counter timed to your dinner so guests walk straight to fresh paan.",
    highlights: [
      { title: "Timed to your dinner", text: "We open as the main course winds down, so paan is the natural last stop." },
      { title: "Built for big crowds", text: "Extra paan makers keep the line moving when most of the guests arrive together." },
    ],
    venues: ["Banquet halls", "Hotels", "Party lawns", "Farmhouses"],
    faqs: [
      { q: "When should the paan counter open at a reception?", a: "Most hosts open it once the main course is being served, so guests get paan right after dinner. We confirm timings with you and your planner." },
      { q: "How do you handle a large reception crowd?", a: "Share your guest count and we add paan makers so there is no long queue at the counter." },
    ],
  },
  {
    slug: "engagement",
    name: "Engagement",
    titleName: "Engagement Ceremony",
    kind: "wedding",
    bookingTitle: "Wedding",
    intro:
      "An engagement is a smaller, closer gathering, and the paan counter fits it well. Paanshala brings a neat, decorated live counter with a menu sized for your family and friends.",
    highlights: [
      { title: "Sized for smaller gatherings", text: "A compact counter and the right amount of staff, with nothing oversized for your venue." },
      { title: "Classic crowd-pleasers", text: "A menu built around meetha, Banarasi and sugar-free so every age group is covered." },
    ],
    venues: ["Home functions", "Banquet halls", "Clubs", "Restaurants with private halls"],
    faqs: [
      { q: "Is a paan counter suitable for a small engagement?", a: "Yes. We scale the counter and staff to your guest count, so a smaller event still gets the full live experience." },
      { q: "Can you set up at a home or a small hall?", a: "Yes. Tell us the space available and we will plan a counter that fits it." },
    ],
  },
  {
    slug: "sangeet",
    name: "Sangeet",
    titleName: "Sangeet",
    kind: "wedding",
    bookingTitle: "Wedding",
    intro:
      "Sangeet nights run on music, dance and energy, and a live paan counter keeps guests happy between performances. Paanshala brings fun flavours and a counter that matches your theme.",
    highlights: [
      { title: "Fun, high-energy menu", text: "Chocolate, fire and other showpiece paans guests enjoy watching being made." },
      { title: "Placed away from the dance floor", text: "We work with your decorator so the counter is easy to reach without blocking the crowd." },
    ],
    venues: ["Banquet halls", "Party lawns", "Farmhouses", "Clubs"],
    faqs: [
      { q: "Can the paan counter match our sangeet theme?", a: "Yes. Share your theme and colours and we will style the counter to fit." },
      { q: "Which paan flavours work best for a sangeet?", a: "Guests usually enjoy chocolate, fire and sweet paans, alongside classic meetha. We can add a sugar-free option." },
    ],
  },
  {
    slug: "mehendi",
    name: "Mehendi",
    titleName: "Mehendi",
    kind: "wedding",
    bookingTitle: "Wedding",
    intro:
      "Mehendi is a relaxed daytime function where guests are often busy with henna. Paanshala serves easy, bite-sized paan from a bright live counter that suits the mood of the day.",
    highlights: [
      { title: "Easy to eat with henna on", text: "Smaller, easy-to-handle paan so guests with fresh mehendi can still enjoy it." },
      { title: "Light, fresh flavours", text: "A daytime menu with gulkand, sweet and sugar-free options." },
    ],
    venues: ["Home functions", "Party lawns", "Banquet halls", "Farmhouses"],
    faqs: [
      { q: "Can paan be served to guests who are getting mehendi applied?", a: "Yes. We keep portions easy to eat, and staff can serve guests at their seats if you ask." },
      { q: "Do you serve at daytime mehendi functions?", a: "Yes. Tell us the timing in the booking form and we will confirm availability." },
    ],
  },
  {
    slug: "haldi",
    name: "Haldi",
    titleName: "Haldi Ceremony",
    kind: "wedding",
    bookingTitle: "Wedding",
    intro:
      "Haldi is a bright, casual morning ceremony, and a simple live paan counter adds to the celebration. Paanshala brings a light setup that works at homes, lawns and halls.",
    highlights: [
      { title: "Simple, compact setup", text: "A counter that works in a courtyard, lawn or home without heavy equipment." },
      { title: "Fresh, light menu", text: "Sweet and gulkand paan along with sugar-free choices for a morning crowd." },
    ],
    venues: ["Home functions", "Courtyards", "Party lawns", "Banquet halls"],
    faqs: [
      { q: "Can you set up outdoors for a haldi ceremony?", a: "Yes. Share the layout and any shade or table space available, and we will plan the setup around it." },
      { q: "Can we book paan for just the haldi function?", a: "Yes. You can book for a single function or for several wedding events together." },
    ],
  },
  {
    slug: "destination-wedding",
    name: "Destination Wedding",
    titleName: "Destination Wedding",
    kind: "wedding",
    bookingTitle: "Wedding",
    intro:
      "A destination wedding needs vendors who plan ahead. Paanshala handles menu, stock and logistics in advance so your paan counter is one less thing to worry about.",
    highlights: [
      { title: "Planned in advance", text: "Logistics, ingredients and staff are confirmed well before your dates." },
      { title: "Multi-day friendly", text: "One team can cover several functions across your wedding days." },
    ],
    venues: ["Resorts", "Hotels", "Farmhouses", "Heritage venues"],
    faqs: [
      { q: "Can you serve at a venue outside Delhi?", a: "Share the venue and dates in the booking form and we will confirm whether we can take it up and how." },
      { q: "Can one booking cover several wedding functions?", a: "Yes. Tell us each function and we will plan the menu and staff for every one." },
    ],
  },
  {
    slug: "banquet-hall",
    name: "Banquet Hall",
    titleName: "Banquet Hall Events",
    kind: "wedding",
    bookingTitle: "Wedding",
    intro:
      "Banquet halls have their own rules on space, power and timing. Paanshala works within them, coordinating with your venue manager so the live paan counter slots in smoothly.",
    highlights: [
      { title: "Works with venue rules", text: "We confirm space, power and entry timings with the hall in advance." },
      { title: "Clean, tidy service", text: "Setup and clean-up are done without disturbing other events or staff." },
    ],
    venues: ["Banquet halls", "Community halls", "Hotel ballrooms", "Clubs"],
    faqs: [
      { q: "Do you coordinate with the banquet hall manager?", a: "Yes. Share the hall details and we will coordinate on space, access and timing." },
      { q: "What space does a live paan counter need?", a: "A compact counter fits most halls. Tell us the available space and we will plan the layout." },
    ],
  },
  {
    slug: "marriage-garden",
    name: "Marriage Garden",
    titleName: "Marriage Garden Weddings",
    kind: "wedding",
    bookingTitle: "Wedding",
    intro:
      "Outdoor weddings in marriage gardens call for a counter that works in open space. Paanshala plans shade, table space and stock handling around your lawn and season.",
    highlights: [
      { title: "Planned for outdoor setups", text: "We check shade, ground and table space so the counter works in the open." },
      { title: "Fresh through long evenings", text: "Ingredients are covered and kept cool so quality holds over a long event." },
    ],
    venues: ["Marriage gardens", "Party lawns", "Farmhouses", "Open-air venues"],
    faqs: [
      { q: "Can the counter be set up outdoors?", a: "Yes. We plan for shade and table space and can adapt to your lawn layout." },
      { q: "What if the weather changes?", a: "Tell us if you have a covered area and we will plan a backup position for the counter." },
    ],
  },
  {
    slug: "corporate-event",
    name: "Corporate Event",
    titleName: "Corporate Events",
    kind: "corporate",
    bookingTitle: "Corporate Catering",
    intro:
      "A live paan counter gives clients and teams something to talk about. Paanshala serves corporate events with professional staff, tidy setups and a hygiene-first process.",
    highlights: [
      { title: "Professional on-site team", text: "Uniformed staff, quick service and a neat counter suited to a business setting." },
      { title: "Flexible for event formats", text: "Launches, client dinners, festive office parties and conferences can all be planned." },
    ],
    venues: ["Offices", "Hotels", "Conference venues", "Banquet halls"],
    faqs: [
      { q: "Can you provide an invoice for a corporate booking?", a: "Yes. Mention that you need an invoice in the booking form and we will share the billing details." },
      { q: "Can you serve a large office party?", a: "Yes. Share the headcount and timing and we will plan staff and stock for it." },
    ],
  },
  {
    slug: "birthday-party",
    name: "Birthday Party",
    titleName: "Birthday Parties",
    kind: "party",
    bookingTitle: "Birthday Party",
    intro:
      "Make a birthday memorable with a live paan counter that guests of all ages enjoy. Paanshala brings milder, colourful options for younger guests and classic flavours for adults.",
    highlights: [
      { title: "Flavours for all ages", text: "Mild and sweet choices for kids, classic and Banarasi paan for adults." },
      { title: "A fun live element", text: "Guests watch their paan being made, which is as much entertainment as dessert." },
    ],
    venues: ["Home parties", "Banquet halls", "Restaurants", "Party lawns"],
    faqs: [
      { q: "Is paan suitable for kids at a birthday party?", a: "We offer milder, sweet options. Tell us the age group and we will plan a menu that suits it." },
      { q: "Can you serve at a home birthday party?", a: "Yes. Share the space available and we will set up a counter that fits." },
    ],
  },
  {
    slug: "anniversary-party",
    name: "Anniversary Party",
    titleName: "Anniversary Parties",
    kind: "party",
    bookingTitle: "Private Party",
    intro:
      "Anniversary parties are for family and close friends, and a paan counter adds a traditional touch. Paanshala keeps the setup elegant and the menu tailored to your guests.",
    highlights: [
      { title: "Elegant, understated setup", text: "A decorated counter that suits a family celebration." },
      { title: "A menu for every generation", text: "Classic paan for elders and lighter, sweeter options for younger guests." },
    ],
    venues: ["Home parties", "Banquet halls", "Restaurants", "Clubs"],
    faqs: [
      { q: "Can you handle a milestone anniversary with a bigger guest list?", a: "Yes. Share the guest count and we will scale the counter and staff." },
      { q: "Can we choose the paan menu?", a: "Yes. Pick from sweet, Banarasi, chocolate and sugar-free options, or ask for a custom flavour." },
    ],
  },
  {
    slug: "family-function",
    name: "Family Function",
    titleName: "Family Functions",
    kind: "party",
    bookingTitle: "Private Party",
    intro:
      "From festive gatherings to house functions, a paan counter makes a family occasion feel complete. Paanshala handles setup, service and clean-up so the family can enjoy the day.",
    highlights: [
      { title: "Works at home", text: "A neat counter that fits a living room, terrace or courtyard." },
      { title: "Simple booking", text: "Share the date, location and guest count and we will take care of the rest." },
    ],
    venues: ["Home functions", "Community halls", "Terraces", "Banquet halls"],
    faqs: [
      { q: "Do you serve small family functions?", a: "Yes. Tell us the guest count and we will plan a counter and menu sized to it." },
      { q: "Do we need to arrange anything for the setup?", a: "Usually just a table and a power point if possible. We will confirm details when you book." },
    ],
  },
  {
    slug: "wedding-planner",
    name: "Wedding Planner",
    titleName: "Wedding Planners",
    kind: "wedding",
    bookingTitle: "Wedding",
    intro:
      "Wedding planners need vendors who stick to the run-of-show. Paanshala works with your timeline, your decorator and your caterer, and supports repeat bookings across your events.",
    highlights: [
      { title: "Fits your run-of-show", text: "We plan around your schedule and confirm timings with you in advance." },
      { title: "Repeat bookings made easy", text: "Planners can book multiple events and we keep your preferences on file for the next one." },
    ],
    venues: ["Banquet halls", "Hotels", "Farmhouses", "Destination venues"],
    faqs: [
      { q: "Do you work with wedding planners and decorators?", a: "Yes. We coordinate directly with planners, decorators and caterers so the counter fits the overall plan." },
      { q: "Can planners book for several client events?", a: "Yes. Share the event list and dates, and we will confirm availability for each." },
    ],
  },
];

export const EVENT_SLUGS = EVENTS.map((e) => e.slug);
export const getEvent = (slug) => EVENTS.find((e) => e.slug === slug);
