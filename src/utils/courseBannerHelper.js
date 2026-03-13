/**
 * courseBannerHelper.js
 *
 * Shared helper for generating unique course banner gradients and
 * subject-specific symbols.  Used by TeacherCourses (cards) and
 * CourseManagement (full-width page banner).
 */
import React from "react";

// ── 24 unique vibrant gradient palettes ─────────────────────────────
export const CARD_GRADIENTS = [
  { from: "#0ea5e9", via: "#6366f1", to: "#a855f7" },
  { from: "#f43f5e", via: "#ec4899", to: "#d946ef" },
  { from: "#10b981", via: "#14b8a6", to: "#06b6d4" },
  { from: "#f97316", via: "#f59e0b", to: "#eab308" },
  { from: "#8b5cf6", via: "#a78bfa", to: "#c084fc" },
  { from: "#059669", via: "#047857", to: "#065f46" },
  { from: "#2563eb", via: "#3b82f6", to: "#60a5fa" },
  { from: "#dc2626", via: "#f43f5e", to: "#fb7185" },
  { from: "#7c3aed", via: "#6d28d9", to: "#4f46e5" },
  { from: "#0891b2", via: "#0e7490", to: "#155e75" },
  { from: "#ea580c", via: "#c2410c", to: "#9a3412" },
  { from: "#4f46e5", via: "#7c3aed", to: "#9333ea" },
  { from: "#0d9488", via: "#2dd4bf", to: "#5eead4" },
  { from: "#b91c1c", via: "#991b1b", to: "#7f1d1d" },
  { from: "#1d4ed8", via: "#2563eb", to: "#3b82f6" },
  { from: "#c026d3", via: "#a21caf", to: "#86198f" },
  { from: "#16a34a", via: "#22c55e", to: "#4ade80" },
  { from: "#0369a1", via: "#0284c7", to: "#0ea5e9" },
  { from: "#9333ea", via: "#c084fc", to: "#e879f9" },
  { from: "#d97706", via: "#b45309", to: "#92400e" },
  { from: "#4338ca", via: "#6366f1", to: "#818cf8" },
  { from: "#be185d", via: "#e11d48", to: "#f43f5e" },
  { from: "#047857", via: "#10b981", to: "#34d399" },
  { from: "#7e22ce", via: "#a855f7", to: "#c084fc" },
];

// ── Subject-specific symbols ────────────────────────────────────────
const SUBJECT_SYMBOLS = [
  { keywords: ["math", "algebra", "calculus", "statistics", "trigonometry", "arithmetic", "geometry", "linear algebra", "discrete", "probability", "numerical"],
    symbols: ["∑", "π", "∫", "√", "∞", "Δ", "±", "≈", "∂", "θ", "λ", "∮"] },
  { keywords: ["physics", "quantum", "thermodynamics", "optics", "mechanics", "electromagnetism", "relativity", "astrophysics", "nuclear"],
    symbols: ["⚛", "Ψ", "Ω", "ℏ", "∇", "⊗", "λ", "μ", "∝", "⇌", "Δ", "E=mc²"] },
  { keywords: ["chemistry", "organic", "inorganic", "biochem", "pharmaceutical", "chemical", "polymer"],
    symbols: ["⚗", "⬡", "H₂O", "CO₂", "→", "⇌", "Δ", "mol", "pH", "∆H", "≡", "⊕"] },
  { keywords: ["computer", "programming", "cs ", "software", "web dev", "database", "cyber", "python", "java", "javascript", "cloud", "devops", "networking", "dsa", "data science", "coding"],
    symbols: ["</>", "{ }", "01", "λ", ">>", "&&", "||", "=>", "++", "#!", "/*", "[]"] },
  { keywords: ["machine learning", "ml ", "m.l.", "ai ", "a.i.", "artificial intelligence", "deep learning", "nlp", "neural"],
    symbols: ["🧠", "⊕", "∑wᵢ", "σ(x)", "∇L", "η", "⊗", "ŷ", "f(x)", "θ", "Δw", "GPU"] },
  { keywords: ["biology", "botany", "zoology", "life science", "microbiology", "genetics", "ecology", "biotechnology", "bioinformatics"],
    symbols: ["🧬", "🔬", "🌿", "⊕", "∞", "ATP", "DNA", "RNA", "♀", "♂", "μm", "pH"] },
  { keywords: ["economics", "economy", "micro economics", "macro economics", "econometrics", "fiscal", "monetary"],
    symbols: ["₹", "$", "€", "£", "📈", "∑", "GDP", "Δ%", "μ", "σ²", "∞", "S&D"] },
  { keywords: ["history", "ancient", "medieval", "modern history", "civilization", "archaeology", "heritage", "renaissance"],
    symbols: ["⏳", "🏛", "⚔", "📜", "†", "∞", "AD", "BC", "Ω", "☆", "⚓", "♛"] },
  { keywords: ["literature", "english", "language", "linguistics", "poetry", "novel", "literary", "hindi", "sanskrit", "odia", "french"],
    symbols: ["✍", "📖", "❝❞", "¶", "…", "—", "Aa", "ℬ", "ℛ", "λόγ", "∞", "§"] },
  { keywords: ["law", "legal", "jurisprudence", "constitutional", "criminal law", "civil law", "judiciary"],
    symbols: ["⚖", "§", "¶", "†", "©", "™", "℗", "®", "Art.", "IPC", "⊕", "∴"] },
  { keywords: ["medicine", "anatomy", "physiology", "pathology", "pharmacology", "medical", "mbbs", "surgery", "clinical", "nursing"],
    symbols: ["⚕", "♡", "Rx", "℞", "⊕", "μg", "mL", "IV", "DNA", "ECG", "∴", "☤"] },
  { keywords: ["engineering", "mechanics", "electronics", "electrical", "civil eng", "mechanical eng", "structural", "robotics", "vlsi", "signal"],
    symbols: ["⚙", "⊕", "Ω", "V=IR", "∫", "Δ", "∇", "AC", "DC", "Hz", "kN", "⏚"] },
  { keywords: ["business", "management", "finance", "mba", "marketing", "accounting", "entrepreneurship", "commerce", "banking"],
    symbols: ["📊", "₹", "$", "ROI", "%", "KPI", "B2B", "∑", "SWOT", "P&L", "€", "IPO"] },
  { keywords: ["geography", "geospatial", "cartography", "climate", "topography", "gis ", "remote sensing", "oceanography"],
    symbols: ["🌍", "🧭", "📍", "∠", "°N", "°E", "Δh", "km²", "∞", "≈", "GPS", "⊕"] },
  { keywords: ["education", "pedagogy", "teaching", "curriculum", "b.ed", "learning theory"],
    symbols: ["🎓", "📚", "✏", "📝", "∞", "A+", "Q&A", "IQ", "EQ", "∴", "⊕", "Δ"] },
  { keywords: ["music", "vocal", "instrument", "rhythm", "melody", "classical music", "singing"],
    symbols: ["♪", "♫", "♩", "♬", "𝄞", "♭", "♯", "𝄢", "∞", "BPM", "4/4", "Δ"] },
  { keywords: ["art", "painting", "sculpture", "design", "drawing", "visual art", "fine art", "craft"],
    symbols: ["🎨", "✦", "◆", "△", "○", "◐", "⬡", "✿", "∞", "φ", "◎", "★"] },
  { keywords: ["psychology", "cognitive", "behavioral", "counseling", "mental health", "psychotherapy"],
    symbols: ["Ψ", "🧠", "∞", "⊕", "Id", "Ego", "IQ", "EQ", "σ", "μ", "Δ", "∴"] },
  { keywords: ["philosophy", "ethics", "metaphysics", "logic", "ontology", "epistemology"],
    symbols: ["∴", "∵", "∞", "⊕", "∃", "∀", "¬", "→", "↔", "Ψ", "Ω", "φ"] },
  { keywords: ["political", "polity", "governance", "public admin", "civics", "upsc", "ias", "international relations"],
    symbols: ["⚖", "🏛", "☆", "§", "†", "∴", "IAS", "GS", "Art.", "PIL", "∞", "⊕"] },
  { keywords: ["plumbing", "hvac", "mechanical system", "piping", "sanitary", "drainage"],
    symbols: ["🔧", "⊕", "PSI", "GPM", "∅", "Δp", "≈", "m³", "∞", "⏚", "∇", "kPa"] },
  { keywords: ["environmental", "sustainability", "ecology", "pollution", "green energy", "renewable"],
    symbols: ["🌱", "♻", "CO₂", "∞", "⊕", "H₂O", "kWh", "Δ°C", "O₃", "ppm", "∇", "☀"] },
  { keywords: ["astronomy", "space", "cosmos", "stellar", "planetary", "telescope"],
    symbols: ["★", "☆", "☽", "☀", "∞", "AU", "ly", "Mpc", "Ω", "Δv", "⊕", "λ"] },
];

const GENERIC_SYMBOLS = ["✦", "◆", "○", "△", "⊕", "∞", "★", "◎", "⬡", "⬢", "☆", "∴"];

/** Stable hash */
export function stableHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Match course against keyword map → return symbols */
export function matchSubjectSymbols(course) {
  const searchText = ` ${[
    course?.title,
    course?.courseCode,
    course?.department,
    course?.program,
    typeof course?.aboutCourse === "string" ? course.aboutCourse.slice(0, 200) : "",
  ].filter(Boolean).join(" ").toLowerCase()} `;

  for (const entry of SUBJECT_SYMBOLS) {
    for (const kw of entry.keywords) {
      if (searchText.includes(kw)) return entry.symbols;
    }
  }
  return GENERIC_SYMBOLS;
}

/**
 * Get gradient + symbols + seed for a course.
 * @param {object} course — course-like object with title, _id, etc.
 * @param {number} [index=0] — optional index for extra uniqueness
 */
export function getCourseBannerProps(course, index = 0) {
  const key = (course?._id || "") + (course?.title || "") + index;
  const h = stableHash(key);
  const grad = CARD_GRADIENTS[h % CARD_GRADIENTS.length];
  const symbols = matchSubjectSymbols(course);
  return { grad, symbols, seed: h % 1000 };
}

/** Generate deterministic scatter positions */
export function scatterPositions(seed, count, width = 400, height = 144) {
  const positions = [];
  let x = (seed * 7) % width;
  let y = (seed * 3) % (height - 44);
  for (let i = 0; i < count; i++) {
    x = (x + 137) % (width - 20) + 10;
    y = ((y + 53 + (i * 17)) % (height - 34)) + 10;
    const size = 14 + ((seed + i * 7) % 12);
    const opacity = 0.08 + ((seed + i * 11) % 10) / 100;
    const rotate = ((seed + i * 23) % 40) - 20;
    positions.push({ x, y, size, opacity, rotate });
  }
  return positions;
}
