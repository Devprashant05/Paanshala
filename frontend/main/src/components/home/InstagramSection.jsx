"use client";

import { motion } from "framer-motion";
import {
  Instagram,
  Heart,
  Users,
  Camera,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Script from "next/script";

export default function InstagramSection() {
  return (
    <section className="relative bg-linear-to-br from-[#f9f5f0] via-white to-[#fef8f3] py-20 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-20 -right-20 w-96 h-96 bg-linear-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-linear-to-tr from-orange-400/20 to-yellow-400/20 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT SIDE - MESSAGE */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-linear-to-r from-pink-500/10 to-purple-500/10 px-4 py-2 rounded-full">
              <Instagram className="w-4 h-4 text-pink-600" />
              <span className="text-sm font-semibold text-pink-600 tracking-wide">
                FOLLOW US ON INSTAGRAM
              </span>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Join Our{" "}
                <span className="bg-linear-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Community
                </span>
              </h2>

              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                Get a daily dose of inspiration, behind-the-scenes moments, and
                exclusive offers. Be part of the Paanshala family!
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <StatCard
                icon={<Users className="w-6 h-6 text-pink-600" />}
                value="3K+"
                label="Followers"
              />
              <StatCard
                icon={<Camera className="w-6 h-6 text-purple-600" />}
                value="500+"
                label="Posts"
              />
              <StatCard
                icon={<Heart className="w-6 h-6 text-red-500" />}
                value="50K+"
                label="Likes"
              />
            </div>

            {/* Features List */}
            <div className="space-y-4">
              <Feature icon="✨" text="Daily paan inspiration and recipes" />
              <Feature icon="🎁" text="Exclusive offers for followers" />
              <Feature icon="🎬" text="Behind-the-scenes content" />
              <Feature icon="💬" text="Connect with paan lovers worldwide" />
            </div>

            {/* CTA Button */}
            <div className="flex flex-wrap gap-4">
              <a
                href="https://www.instagram.com/paanshalaofficial/"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Button
                  size="lg"
                  className="bg-linear-to-r from-pink-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-semibold px-8 h-14 text-base shadow-xl bg-size-[200%_100%] hover:bg-right transition-all duration-500"
                >
                  <Instagram className="w-5 h-5 mr-2" />
                  Follow @paanshalaofficial
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </motion.span>
                </Button>
              </a>

              {/* <a
                href="https://www.instagram.com/paanshalaofficial/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white font-semibold px-8 h-14 text-base"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  View Gallery
                </Button>
              </a> */}
            </div>

            {/* Trust Badge */}
            {/* <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 px-4 py-3 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-green-800 font-medium">
                Join 10,000+ happy followers
              </span>
            </div> */}
          </motion.div>

          {/* RIGHT SIDE - INSTAGRAM EMBED */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden shadow-2xl border-2 border-gray-100 hover:border-pink-200 transition-colors duration-300">
              <CardContent className="p-0">
                {/* Instagram Embed Container */}
                <div className="relative bg-white">
                  {/* Decorative Header */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-pink-600 via-purple-600 to-pink-600" />

                  {/* Instagram Embed */}
                  <div className="instagram-embed-container">
                    <blockquote
                      className="instagram-media"
                      data-instgrm-permalink="https://www.instagram.com/paanshalaofficial/?utm_source=ig_embed&utm_campaign=loading"
                      data-instgrm-version="14"
                      style={{
                        background: "#FFF",
                        border: 0,
                        borderRadius: "3px",
                        boxShadow:
                          "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
                        margin: "1px",
                        maxWidth: "658px",
                        minWidth: "326px",
                        padding: 0,
                        width: "99.375%",
                      }}
                    >
                      <div style={{ padding: "16px" }}>
                        <a
                          href="https://www.instagram.com/paanshalaofficial/?utm_source=ig_embed&utm_campaign=loading"
                          style={{
                            background: "#FFFFFF",
                            lineHeight: 0,
                            padding: "0 0",
                            textAlign: "center",
                            textDecoration: "none",
                            width: "100%",
                          }}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                backgroundColor: "#F4F4F4",
                                borderRadius: "50%",
                                flexGrow: 0,
                                height: "40px",
                                marginRight: "14px",
                                width: "40px",
                              }}
                            />
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                flexGrow: 1,
                                justifyContent: "center",
                              }}
                            >
                              <div
                                style={{
                                  backgroundColor: "#F4F4F4",
                                  borderRadius: "4px",
                                  flexGrow: 0,
                                  height: "14px",
                                  marginBottom: "6px",
                                  width: "100px",
                                }}
                              />
                              <div
                                style={{
                                  backgroundColor: "#F4F4F4",
                                  borderRadius: "4px",
                                  flexGrow: 0,
                                  height: "14px",
                                  width: "60px",
                                }}
                              />
                            </div>
                          </div>
                          <div style={{ padding: "19% 0" }} />
                          <div
                            style={{
                              display: "block",
                              height: "50px",
                              margin: "0 auto 12px",
                              width: "50px",
                            }}
                          >
                            <svg
                              width="50px"
                              height="50px"
                              viewBox="0 0 60 60"
                              version="1.1"
                            >
                              <g
                                stroke="none"
                                strokeWidth="1"
                                fill="none"
                                fillRule="evenodd"
                              >
                                <g
                                  transform="translate(-511.000000, -20.000000)"
                                  fill="#000000"
                                >
                                  <g>
                                    <path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631" />
                                  </g>
                                </g>
                              </g>
                            </svg>
                          </div>
                          <div style={{ paddingTop: "8px" }}>
                            <div
                              style={{
                                color: "#3897f0",
                                fontFamily: "Arial,sans-serif",
                                fontSize: "14px",
                                fontStyle: "normal",
                                fontWeight: 550,
                                lineHeight: "18px",
                              }}
                            >
                              View this profile on Instagram
                            </div>
                          </div>
                          <div style={{ padding: "12.5% 0" }} />
                        </a>
                      </div>
                    </blockquote>
                  </div>

                  {/* Loading Script */}
                  <Script
                    async
                    src="//platform.instagram.com/en_US/embeds.js"
                    strategy="lazyOnload"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Mobile CTA */}
            <div className="mt-6 lg:hidden">
              <a
                href="https://www.instagram.com/paanshalaofficial/"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  size="lg"
                  className="w-full bg-linear-to-r from-pink-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-semibold h-14"
                >
                  <Instagram className="w-5 h-5 mr-2" />
                  Follow @paanshalaofficial
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* =========================
   STAT CARD
========================= */
function StatCard({ icon, value, label }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="text-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </motion.div>
  );
}

/* =========================
   FEATURE ITEM
========================= */
function Feature({ icon, text }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="flex items-center gap-3 group"
    >
      <div className="shrink-0 w-10 h-10 rounded-full bg-linear-to-br from-pink-100 to-purple-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-gray-700 font-medium">{text}</span>
    </motion.div>
  );
}
