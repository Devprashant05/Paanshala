"use client";

import { motion } from "framer-motion";

const TRUST_BADGES = [
  { emoji: "🌿", label: "Tobacco\nFree", bg: "#2d5016" },
  { emoji: "❄️", label: "Non\nAddictive", bg: "#1a6bb5" },
  { emoji: "🌾", label: "Natural\nIngredients", bg: "#e07b2a" },
];

export default function AboutPaanshala() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "#f5f2eb",
        padding: "80px 0",
        fontFamily: "Georgia, serif",
      }}
    >
      {/* Dot pattern background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(45,80,22,0.12) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 40px",
          display: "flex",
          alignItems: "center",
          gap: "clamp(40px, 6vw, 80px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* LEFT: Rotating Paan Image with background */}
        <div
          style={{
            flex: "0 0 auto",
            width: "clamp(300px, 40vw, 460px)",
            aspectRatio: "1 / 1",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* ✅ Background Image Layer - Behind everything */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url(/asset-bg.webp)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />

          {/* ✅ Rotating Paan Platter - Smaller to show background */}
          <motion.img
            src="/asset.png"
            alt="Paan platter"
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            style={{
              width: "85%", // ✅ Made smaller (was 100%)
              height: "85%",
              objectFit: "contain",
              display: "block",
              position: "relative",
              zIndex: 1,
            }}
          />

          {/* ✅ Static centered logo (white/inverted) */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              pointerEvents: "none",
              zIndex: 2,
            }}
          >
            <img
              src="/paan-logo.png"
              alt="Paanshala Logo"
              style={{
                width: "clamp(80px, 12vw, 140px)",
                height: "auto",
                filter: "brightness(0) invert(1)", // Makes logo white
                opacity: 0.95,
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        </div>

        {/* RIGHT: Content */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ flex: 1, minWidth: 0 }}
        >
          <p
            style={{
              color: "#c0392b",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 14,
              margin: "0 0 14px 0",
            }}
          >
            ABOUT PAANSHALA
          </p>

          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: 800,
              color: "#1a1a1a",
              lineHeight: 1.15,
              margin: "0 0 24px 0",
              fontFamily: "Georgia, serif",
            }}
          >
            A Modern Twist To
            <br />
            India's Healthy Dessert
          </h2>

          <p
            style={{
              fontSize: 17,
              color: "#555",
              lineHeight: 1.85,
              margin: "0 0 16px 0",
              maxWidth: 560,
            }}
          >
            Paanshala is deeply connected with traditions, culture, and
            delectable foods and flavors. The recipes are passed down through
            the generations. We proud to bringing this Indian tradition past to
            21 century.
          </p>
          <p
            style={{
              fontSize: 17,
              color: "#555",
              lineHeight: 1.85,
              margin: "0 0 40px 0",
              maxWidth: 560,
            }}
          >
            Paan is one such thing that has ruled the world's food culture for a
            long time. It is a delightful treat and a very effective mouth freshener
            loved by all.
          </p>

          {/* Trust Badges */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {TRUST_BADGES.map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.06, y: -4 }}
                style={{
                  background: badge.bg,
                  color: "white",
                  borderRadius: 14,
                  padding: "14px 22px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontWeight: 700,
                  fontSize: 15,
                  minWidth: 148,
                  boxShadow: "0 4px 18px rgba(0,0,0,0.18)",
                  cursor: "default",
                  whiteSpace: "pre-line",
                  lineHeight: 1.3,
                }}
              >
                <span style={{ fontSize: 26, flexShrink: 0 }}>
                  {badge.emoji}
                </span>
                <span>{badge.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}