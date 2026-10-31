// app/site-map/page.jsx
// Route: paanshala.com/site-map
// Server component — fetches products, categories, blogs at request time.

import Link from "next/link";
import {
  SERVICES,
  SERVICE_SLUGS,
  AREAS,
  AREA_SLUGS,
  pagePath,
} from "@/lib/landing/data";
import { EVENTS } from "@/lib/landing/events";

const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080/api"
    : `${process.env.NEXT_PUBLIC_API_URL}/api`;

/* ── helpers ── */
async function fetchJson(path) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function flattenCategories(nodes = [], acc = []) {
  for (const node of nodes) {
    acc.push(node);
    if (node.children?.length) flattenCategories(node.children, acc);
  }
  return acc;
}

/* ── data ── */
async function getSitemapData() {
  const [productsData, categoriesData, blogsData] = await Promise.all([
    fetchJson("/products"),
    fetchJson("/categories"),
    fetchJson("/blogs"),
  ]);

  const products = (productsData?.products || []).filter((p) => p.slug);
  const categories = flattenCategories(categoriesData?.categories || []).filter(
    (c) => c.slug,
  );
  const blogs = (blogsData?.blogs || []).filter((b) => b.slug);

  return { products, categories, blogs };
}

/* ── sub-components ── */
function SectionHeading({ children }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-1 h-6 rounded-full bg-[#c9a227] shrink-0" />
      <h2 className="text-lg font-semibold text-[#2d5016]">{children}</h2>
    </div>
  );
}

function StaticLink({ href, label, sub }) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-2.5 py-2.5 border-b border-[#e8e0cc] last:border-0 hover:bg-[#f0ebe0] -mx-3 px-3 rounded-lg transition-colors"
    >
      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#c9a227] shrink-0 group-hover:scale-125 transition-transform" />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-[#1a2810] group-hover:text-[#2d5016] transition-colors">
          {label}
        </span>
        {sub && (
          <span className="block text-xs text-[#6b7a58] font-mono mt-0.5">
            {sub}
          </span>
        )}
      </span>
    </Link>
  );
}

function DynamicList({ items, getHref, getLabel, getSub, emptyText }) {
  if (!items.length) {
    return <p className="text-sm text-[#6b7a58] italic py-2">{emptyText}</p>;
  }
  return (
    <ul className="space-y-0">
      {items.map((item, i) => (
        <li key={i}>
          <Link
            href={getHref(item)}
            className="group flex items-start gap-2.5 py-2 border-b border-[#e8e0cc] last:border-0 hover:bg-[#f0ebe0] -mx-3 px-3 rounded-lg transition-colors"
          >
            <span className="mt-1.5 w-1 h-1 rounded-full bg-[#2d5016]/40 shrink-0 group-hover:bg-[#2d5016] transition-colors" />
            <span className="min-w-0">
              <span className="block text-sm text-[#1a2810] group-hover:text-[#2d5016] transition-colors truncate">
                {getLabel(item)}
              </span>
              {getSub && (
                <span className="block text-xs text-[#6b7a58] font-mono mt-0.5 truncate">
                  {getSub(item)}
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Card({ children }) {
  return (
    <div className="bg-white border border-[#ddd5be] rounded-2xl p-6 shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
      {children}
    </div>
  );
}

/* ── page ── */
export const metadata = {
  title: "Site Map",

  description:
    "Browse every Paanshala page in one place: shop paan and mouth fresheners, collections, journal, event catering, store locations and policies.",

  alternates: {
    canonical: "https://paanshala.com/site-map",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default async function SiteMapPage() {
  const { products, categories, blogs } = await getSitemapData();

  const rootCategories = categories.filter((c) => !c.parent);
  const subCategories = categories.filter((c) => c.parent);

  return (
    <main className="min-h-screen bg-[#f6f2e9]">
      {/* ── Hero ── */}
      <section className="bg-[#2d5016] text-white py-14 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-[.18em] uppercase text-[#c9a227] font-semibold mb-3">
            Navigate
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">
            Site Map
          </h1>
          <div className="w-12 h-px bg-[#c9a227] mx-auto mb-4" />
          <p className="text-white/60 text-sm max-w-sm mx-auto">
            Every page on Paanshala, organised by section.
          </p>
        </div>
      </section>

      {/* ── Quick counts ── */}
      <section className="border-b border-[#ddd5be] bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex flex-wrap gap-6 justify-center">
          {[
            { n: products.length, label: "Products" },
            { n: categories.length, label: "Collections" },
            { n: blogs.length, label: "Journal Posts" },
          ].map(({ n, label }) => (
            <div key={label} className="text-center">
              <span className="block text-xl font-bold text-[#2d5016] font-serif leading-none">
                {n}
              </span>
              <span className="block text-xs text-[#6b7a58] mt-0.5 uppercase tracking-wide">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event & Catering Services — landing pages (full width) */}
        <div className="md:col-span-2">
          <Card>
            <SectionHeading>Event &amp; Catering Services</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {SERVICE_SLUGS.map((service) => (
                <div key={service}>
                  <StaticLink
                    href={pagePath(service, "delhi")}
                    label={SERVICES[service].short}
                    sub={pagePath(service, "delhi")}
                  />
                  <DynamicList
                    items={AREA_SLUGS.filter((a) => a !== "delhi")}
                    getHref={(a) => pagePath(service, a)}
                    getLabel={(a) =>
                      `${SERVICES[service].short} in ${AREAS[a].name}`
                    }
                    getSub={(a) => pagePath(service, a)}
                    emptyText=""
                  />
                </div>
              ))}
            </div>
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wide text-[#6b7a58] mb-2">
                By event
              </p>
              <DynamicList
                items={EVENTS}
                getHref={(e) => `/paan-counter-for/${e.slug}`}
                getLabel={(e) => `Paan Counter for ${e.titleName}`}
                getSub={(e) => `/paan-counter-for/${e.slug}`}
                emptyText=""
              />
            </div>
          </Card>
        </div>

        {/* Main Pages */}
        <Card>
          <SectionHeading>Main Pages</SectionHeading>
          <StaticLink href="/" label="Homepage" sub="paanshala.com/" />
          <StaticLink
            href="/create-your-paan"
            label="Create Your Paan"
            sub="/create-your-paan"
          />
          <StaticLink
            href="/paan-catering"
            label="Paan Catering"
            sub="/paan-catering"
          />
          <StaticLink href="/bulk-order" label="Bulk Order" sub="/bulk-order" />
          <StaticLink href="/our-story" label="Our Story" sub="/our-story" />
          <StaticLink
            href="/get-in-touch"
            label="Get In Touch"
            sub="/get-in-touch"
          />
        </Card>

        {/* Shop */}
        <Card>
          <SectionHeading>Shop ({products.length} products)</SectionHeading>
          <DynamicList
            items={products}
            getHref={(p) => `/shop/${p.slug}`}
            getLabel={(p) => p.name}
            getSub={(p) => `/shop/${p.slug}`}
            emptyText="No products found"
          />
        </Card>

        {/* Collections — root */}
        <Card>
          <SectionHeading>Collections ({rootCategories.length})</SectionHeading>
          <DynamicList
            items={rootCategories}
            getHref={(c) => `/collections/${c.slug}`}
            getLabel={(c) => c.name}
            getSub={(c) => `/collections/${c.slug}`}
            emptyText="No categories found"
          />
        </Card>

        {/* Sub-collections */}
        {subCategories.length > 0 && (
          <Card>
            <SectionHeading>
              Sub-Collections ({subCategories.length})
            </SectionHeading>
            <DynamicList
              items={subCategories}
              getHref={(c) => `/collections/${c.slug}`}
              getLabel={(c) => c.name}
              getSub={(c) => `/collections/${c.slug}`}
              emptyText="No sub-categories found"
            />
          </Card>
        )}

        {/* Journal */}
        <Card>
          <SectionHeading>Journal ({blogs.length} posts)</SectionHeading>
          <StaticLink href="/journal" label="Journal Home" sub="/journal" />
          <DynamicList
            items={blogs}
            getHref={(b) => `/journal/${b.slug}`}
            getLabel={(b) => b.title}
            getSub={(b) => `/journal/${b.slug}`}
            emptyText="No posts found"
          />
        </Card>

        {/* Legal */}
        <Card>
          <SectionHeading>Policies &amp; Legal</SectionHeading>
          <StaticLink
            href="/shipping"
            label="Shipping Policy"
            sub="/shipping"
          />
          <StaticLink
            href="/return-policy"
            label="Return Policy"
            sub="/return-policy"
          />
          <StaticLink href="/terms" label="Terms of Service" sub="/terms" />
          <StaticLink href="/privacy" label="Privacy Policy" sub="/privacy" />
        </Card>
      </section>
    </main>
  );
}
