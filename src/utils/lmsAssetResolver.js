/**
 * LMS Asset Resolver
 *
 * Resolves visual assets (banners, thumbnails) for courses, modules, and
 * content items from the /lms_banner_pack asset pack.
 *
 * Source of truth: public/lms_banner_pack/manifest.json
 * All paths are absolute from public root (e.g. "/lms_banner_pack/banners/...").
 *
 * Resolution priority:
 *  Course:  explicit fields > keyword match > deterministic hash > generic fallback > CSS
 *  Module:  explicit thumbnail > keyword match > generic module fallback > CSS
 *  Content: explicit thumbnail > content-type match > generic fallback > CSS
 */

// ────────────────────────────────────────────────────────────────────
// MANIFEST DATA  (inlined from public/lms_banner_pack/manifest.json)
// ────────────────────────────────────────────────────────────────────

const COURSE_THEMES = [
  { key: "mathematics",      banner: "/lms_banner_pack/banners/mathematics.svg",      thumbnail: "/lms_banner_pack/thumbnails/mathematics_thumb.svg",      accentColor: "#1d4ed8" },
  { key: "biology",          banner: "/lms_banner_pack/banners/biology.svg",          thumbnail: "/lms_banner_pack/thumbnails/biology_thumb.svg",          accentColor: "#15803d" },
  { key: "law",              banner: "/lms_banner_pack/banners/law.svg",              thumbnail: "/lms_banner_pack/thumbnails/law_thumb.svg",              accentColor: "#7c2d12" },
  { key: "history",          banner: "/lms_banner_pack/banners/history.svg",          thumbnail: "/lms_banner_pack/thumbnails/history_thumb.svg",          accentColor: "#92400e" },
  { key: "physics",          banner: "/lms_banner_pack/banners/physics.svg",          thumbnail: "/lms_banner_pack/thumbnails/physics_thumb.svg",          accentColor: "#4338ca" },
  { key: "chemistry",        banner: "/lms_banner_pack/banners/chemistry.svg",        thumbnail: "/lms_banner_pack/thumbnails/chemistry_thumb.svg",        accentColor: "#0f766e" },
  { key: "computer_science", banner: "/lms_banner_pack/banners/computer_science.svg", thumbnail: "/lms_banner_pack/thumbnails/computer_science_thumb.svg", accentColor: "#111827" },
  { key: "economics",        banner: "/lms_banner_pack/banners/economics.svg",        thumbnail: "/lms_banner_pack/thumbnails/economics_thumb.svg",        accentColor: "#7c3aed" },
  { key: "literature",       banner: "/lms_banner_pack/banners/literature.svg",       thumbnail: "/lms_banner_pack/thumbnails/literature_thumb.svg",       accentColor: "#be185d" },
  { key: "geography",        banner: "/lms_banner_pack/banners/geography.svg",        thumbnail: "/lms_banner_pack/thumbnails/geography_thumb.svg",        accentColor: "#0f766e" },
  { key: "medicine",         banner: "/lms_banner_pack/banners/medicine.svg",         thumbnail: "/lms_banner_pack/thumbnails/medicine_thumb.svg",         accentColor: "#b91c1c" },
  { key: "engineering",      banner: "/lms_banner_pack/banners/engineering.svg",      thumbnail: "/lms_banner_pack/thumbnails/engineering_thumb.svg",      accentColor: "#374151" },
  { key: "upsc",             banner: "/lms_banner_pack/banners/upsc.svg",             thumbnail: "/lms_banner_pack/thumbnails/upsc_thumb.svg",             accentColor: "#78350f" },
  { key: "business",         banner: "/lms_banner_pack/banners/business.svg",         thumbnail: "/lms_banner_pack/thumbnails/business_thumb.svg",         accentColor: "#1e3a8a" },
  { key: "education",        banner: "/lms_banner_pack/banners/education.svg",        thumbnail: "/lms_banner_pack/thumbnails/education_thumb.svg",        accentColor: "#166534" },
  { key: "general",          banner: "/lms_banner_pack/banners/general.svg",          thumbnail: "/lms_banner_pack/thumbnails/general_thumb.svg",          accentColor: "#334155" },
];

const MODULE_THEMES = [
  { key: "general_module",       thumbnail: "/lms_banner_pack/module_thumbnails/general_module.svg",       accentColor: "#334155" },
  { key: "reading_module",       thumbnail: "/lms_banner_pack/module_thumbnails/reading_module.svg",       accentColor: "#1d4ed8" },
  { key: "lab_module",           thumbnail: "/lms_banner_pack/module_thumbnails/lab_module.svg",           accentColor: "#15803d" },
  { key: "discussion_module",    thumbnail: "/lms_banner_pack/module_thumbnails/discussion_module.svg",    accentColor: "#7c3aed" },
  { key: "assignment_module",    thumbnail: "/lms_banner_pack/module_thumbnails/assignment_module.svg",    accentColor: "#92400e" },
  { key: "recording_module",     thumbnail: "/lms_banner_pack/module_thumbnails/recording_module.svg",     accentColor: "#b91c1c" },
  { key: "presentation_module",  thumbnail: "/lms_banner_pack/module_thumbnails/presentation_module.svg",  accentColor: "#0f766e" },
  { key: "practice_module",      thumbnail: "/lms_banner_pack/module_thumbnails/practice_module.svg",      accentColor: "#7c2d12" },
];

const CONTENT_THEMES = [
  { key: "pdf_generic",          thumbnail: "/lms_banner_pack/content_thumbnails/pdf_generic.svg",          accentColor: "#dc2626", contentType: "document" },
  { key: "video_generic",        thumbnail: "/lms_banner_pack/content_thumbnails/video_generic.svg",        accentColor: "#2563eb", contentType: "play" },
  { key: "presentation_generic", thumbnail: "/lms_banner_pack/content_thumbnails/presentation_generic.svg", accentColor: "#7c3aed", contentType: "slides" },
  { key: "doc_generic",          thumbnail: "/lms_banner_pack/content_thumbnails/doc_generic.svg",          accentColor: "#0f766e", contentType: "document" },
  { key: "recording_generic",    thumbnail: "/lms_banner_pack/content_thumbnails/recording_generic.svg",    accentColor: "#b91c1c", contentType: "recording" },
  { key: "transcript_generic",   thumbnail: "/lms_banner_pack/content_thumbnails/transcript_generic.svg",   accentColor: "#374151", contentType: "text" },
  { key: "audio_generic",        thumbnail: "/lms_banner_pack/content_thumbnails/audio_generic.svg",        accentColor: "#0f766e", contentType: "audio" },
  { key: "mixed_generic",        thumbnail: "/lms_banner_pack/content_thumbnails/mixed_generic.svg",        accentColor: "#334155", contentType: "grid" },
];

const FALLBACKS = {
  courseBanner:           "/lms_banner_pack/banners/general.svg",
  courseThumbnail:        "/lms_banner_pack/thumbnails/general_thumb.svg",
  moduleThumbnail:        "/lms_banner_pack/module_thumbnails/general_module.svg",
  pdfThumbnail:           "/lms_banner_pack/content_thumbnails/pdf_generic.svg",
  videoThumbnail:         "/lms_banner_pack/content_thumbnails/video_generic.svg",
  presentationThumbnail:  "/lms_banner_pack/content_thumbnails/presentation_generic.svg",
  documentThumbnail:      "/lms_banner_pack/content_thumbnails/doc_generic.svg",
  recordingThumbnail:     "/lms_banner_pack/content_thumbnails/recording_generic.svg",
  transcriptThumbnail:    "/lms_banner_pack/content_thumbnails/transcript_generic.svg",
  audioThumbnail:         "/lms_banner_pack/content_thumbnails/audio_generic.svg",
  mixedThumbnail:         "/lms_banner_pack/content_thumbnails/mixed_generic.svg",
};


// ────────────────────────────────────────────────────────────────────
// KEYWORD MAPS
// ────────────────────────────────────────────────────────────────────

/** Course keyword → theme key mapping */
const COURSE_KEYWORD_MAP = [
  { keywords: ["math", "algebra", "calculus", "statistics", "trigonometry", "arithmetic", "geometry", "linear algebra", "discrete", "probability", "numerical"], themeKey: "mathematics" },
  { keywords: ["biology", "botany", "zoology", "life science", "microbiology", "genetics", "ecology", "biotechnology", "bioinformatics"], themeKey: "biology" },
  { keywords: ["law", "legal", "jurisprudence", "constitutional", "criminal law", "civil law", "judiciary", "arbitration", "tort"], themeKey: "law" },
  { keywords: ["history", "ancient", "medieval", "modern history", "civilization", "archaeology", "heritage", "renaissance"], themeKey: "history" },
  { keywords: ["physics", "quantum", "thermodynamics", "optics", "mechanics", "electromagnetism", "relativity", "astrophysics", "nuclear"], themeKey: "physics" },
  { keywords: ["chemistry", "organic", "inorganic", "biochem", "pharmaceutical", "chemical", "polymer", "analytical chemistry"], themeKey: "chemistry" },
  { keywords: ["computer", "programming", "cs ", "c.s.", "ai ", "a.i.", "ml ", "m.l.", "data structure", "algorithm", "software", "web dev", "database", "cyber", "machine learning", "artificial intelligence", "deep learning", "python", "java", "javascript", "cloud", "devops", "networking", "operating system", "compiler", "iot", "blockchain", "dsa", "data science", "nlp"], themeKey: "computer_science" },
  { keywords: ["economics", "economy", "micro economics", "macro economics", "econometrics", "fiscal", "monetary", "welfare economics"], themeKey: "economics" },
  { keywords: ["literature", "english", "language", "linguistics", "poetry", "novel", "literary", "hindi", "sanskrit", "odia", "french", "german", "spanish", "rhetoric", "prose"], themeKey: "literature" },
  { keywords: ["geography", "geospatial", "cartography", "climate", "topography", "gis ", "remote sensing", "oceanography"], themeKey: "geography" },
  { keywords: ["medicine", "anatomy", "physiology", "pathology", "pharmacology", "medical", "mbbs", "surgery", "clinical", "nursing", "dentistry", "epidemiology", "radiology"], themeKey: "medicine" },
  { keywords: ["engineering", "mechanics", "electronics", "electrical", "civil eng", "mechanical eng", "structural", "robotics", "vlsi", "signal processing", "control system", "materials science", "thermofluids"], themeKey: "engineering" },
  { keywords: ["upsc", "polity", "gs ", "civics", "governance", "public admin", "ias ", "ips ", "indian polity"], themeKey: "upsc" },
  { keywords: ["business", "management", "finance", "mba", "marketing", "accounting", "entrepreneurship", "hrm", "supply chain", "logistics", "commerce", "banking", "insurance", "investment", "corporate"], themeKey: "business" },
  { keywords: ["education", "pedagogy", "teaching", "curriculum", "b.ed", "bed ", "learning theory", "instructional", "assessment theory"], themeKey: "education" },
];

/** Module keyword → module theme key mapping */
const MODULE_KEYWORD_MAP = [
  { keywords: ["reading", "textbook", "chapter", "study material", "reference", "book", "ebook", "notes"], themeKey: "reading_module" },
  { keywords: ["lab", "experiment", "practical", "hands-on", "workshop", "simulation", "laboratory"], themeKey: "lab_module" },
  { keywords: ["discussion", "forum", "debate", "seminar", "group discussion", "q&a", "peer review"], themeKey: "discussion_module" },
  { keywords: ["assignment", "homework", "task", "project", "submission", "deliverable", "coursework"], themeKey: "assignment_module" },
  { keywords: ["recording", "recorded", "lecture recording", "class recording", "video lecture", "replay"], themeKey: "recording_module" },
  { keywords: ["presentation", "slides", "ppt", "powerpoint", "slide deck", "keynote"], themeKey: "presentation_module" },
  { keywords: ["practice", "exercise", "quiz", "test", "exam", "mock", "drill", "problem set", "tutorial"], themeKey: "practice_module" },
];

/**
 * Content type → content theme key mapping.
 * Keys here match the `selectedContentType` values used in the LMS:
 *   pdfs, ppts, videos, links
 * And also handle granular types from module contentItems:
 *   file (with fileType: pdf/presentation/image), video, text, link
 */
const CONTENT_TYPE_MAP = {
  // From content section selectedContentType
  pdfs:           "pdf_generic",
  ppts:           "presentation_generic",
  videos:         "video_generic",
  links:          "doc_generic",
  // From module contentItems type / fileType
  pdf:            "pdf_generic",
  video:          "video_generic",
  presentation:   "presentation_generic",
  image:          "doc_generic",
  text:           "transcript_generic",
  link:           "doc_generic",
  audio:          "audio_generic",
  recording:      "recording_generic",
  transcript:     "transcript_generic",
  document:       "doc_generic",
  doc:            "doc_generic",
  notes:          "doc_generic",
  // Catch-all
  unknown:        "mixed_generic",
  mixed:          "mixed_generic",
};


// ────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ────────────────────────────────────────────────────────────────────

const _courseThemeMap = new Map(COURSE_THEMES.map(t => [t.key, t]));
const _moduleThemeMap = new Map(MODULE_THEMES.map(t => [t.key, t]));
const _contentThemeMap = new Map(CONTENT_THEMES.map(t => [t.key, t]));

/** Pad text for word-boundary-ish matching */
function _matchKeywords(text, keywordMap) {
  if (!text) return null;
  const lower = ` ${text.toLowerCase()} `;
  for (const entry of keywordMap) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) return entry.themeKey;
    }
  }
  return null;
}

/** Simple deterministic hash for stable per-title fallback */
function _stableHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Build CSS gradient from an accent color (darker shade → accent) */
function _gradientCSS(accentColor) {
  // Darken the accent by mixing toward black for the start stop
  return `linear-gradient(135deg, #1e293b, ${accentColor})`;
}


// ════════════════════════════════════════════════════════════════════
//  PUBLIC API: COURSE RESOLUTION
// ════════════════════════════════════════════════════════════════════

/**
 * Resolve the visual theme for a course.
 *
 * @param {object} course – any course-like object with at least { title }
 *   Optional: courseCode, department, program, themeKey, bannerUrl, thumbnailUrl, aboutCourse
 *
 * @returns {{
 *   themeKey:      string,
 *   bannerUrl:     string,
 *   thumbnailUrl:  string,
 *   accentColor:   string,
 *   gradientCSS:   string,
 *   label:         string,
 *   isFallback:    boolean
 * }}
 */
export function resolveCourseTheme(course = {}) {
  const fb = _courseThemeMap.get("general");

  // 1. Explicit theme key from backend
  if (course.themeKey && _courseThemeMap.has(course.themeKey)) {
    return _formatCourse(_courseThemeMap.get(course.themeKey), false);
  }

  // 2. Explicit banner/thumbnail URLs on the course object
  if (course.bannerUrl || course.thumbnailUrl) {
    return {
      themeKey: "custom",
      bannerUrl: course.bannerUrl || fb.banner,
      thumbnailUrl: course.thumbnailUrl || fb.thumbnail,
      accentColor: fb.accentColor,
      gradientCSS: _gradientCSS(fb.accentColor),
      label: "Custom",
      isFallback: false,
    };
  }

  // 3. Keyword matching
  const searchText = [
    course.title,
    course.courseCode,
    course.department,
    course.program,
    typeof course.aboutCourse === "string" ? course.aboutCourse.slice(0, 200) : "",
  ].filter(Boolean).join(" ");

  const matched = _matchKeywords(searchText, COURSE_KEYWORD_MAP);
  if (matched) {
    return _formatCourse(_courseThemeMap.get(matched), false);
  }

  // 4. Deterministic hash fallback (stable per title, avoids "general")
  if (course.title) {
    const nonGeneric = COURSE_THEMES.filter(t => t.key !== "general");
    const idx = _stableHash(course.title) % nonGeneric.length;
    return _formatCourse(nonGeneric[idx], true);
  }

  // 5. Absolute fallback
  return _formatCourse(fb, true);
}

function _formatCourse(t, isFallback) {
  return {
    themeKey: t.key,
    bannerUrl: t.banner,
    thumbnailUrl: t.thumbnail,
    accentColor: t.accentColor,
    gradientCSS: _gradientCSS(t.accentColor),
    label: t.key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    isFallback,
  };
}

/** Alias for backward compatibility */
export function getCourseTheme(course) {
  return resolveCourseTheme(course);
}

/** Get CSS gradient fallback string for a course (no image needed) */
export function getCourseGradient(course) {
  return resolveCourseTheme(course).gradientCSS;
}


// ════════════════════════════════════════════════════════════════════
//  PUBLIC API: MODULE RESOLUTION
// ════════════════════════════════════════════════════════════════════

/**
 * Resolve the visual theme for a module/chapter/unit.
 *
 * @param {object} mod – module-like object with at least { moduleTitle }
 *   Optional: description, thumbnail
 *
 * @returns {{
 *   themeKey:          string,
 *   moduleThumbnailUrl: string,
 *   accentColor:       string,
 *   gradientCSS:       string,
 *   isFallback:        boolean
 * }}
 */
export function resolveModuleTheme(mod = {}) {
  const fb = _moduleThemeMap.get("general_module");

  // 1. Explicit thumbnail from backend
  if (mod.thumbnail && typeof mod.thumbnail === "string") {
    return {
      themeKey: "custom",
      moduleThumbnailUrl: mod.thumbnail,
      accentColor: fb.accentColor,
      gradientCSS: _gradientCSS(fb.accentColor),
      isFallback: false,
    };
  }

  // 2. Keyword matching from title + description
  const searchText = [mod.moduleTitle, mod.title, mod.description].filter(Boolean).join(" ");
  const matched = _matchKeywords(searchText, MODULE_KEYWORD_MAP);
  if (matched) {
    const t = _moduleThemeMap.get(matched);
    return _formatModule(t, false);
  }

  // 3. Deterministic hash fallback
  const titleStr = mod.moduleTitle || mod.title || "";
  if (titleStr) {
    const nonGeneric = MODULE_THEMES.filter(t => t.key !== "general_module");
    const idx = _stableHash(titleStr) % nonGeneric.length;
    return _formatModule(nonGeneric[idx], true);
  }

  // 4. Generic fallback
  return _formatModule(fb, true);
}

function _formatModule(t, isFallback) {
  return {
    themeKey: t.key,
    moduleThumbnailUrl: t.thumbnail,
    accentColor: t.accentColor,
    gradientCSS: _gradientCSS(t.accentColor),
    isFallback,
  };
}


// ════════════════════════════════════════════════════════════════════
//  PUBLIC API: CONTENT ITEM RESOLUTION
// ════════════════════════════════════════════════════════════════════

/**
 * Resolve the visual thumbnail for a content item.
 *
 * @param {object} item – content item with at least one of:
 *   { thumbnail, type, fileType, contentType, name, title, fileUrl, videoUrl }
 * @param {string} [contentTypeHint] – optional hint from the parent
 *   section's selectedContentType (e.g. "pdfs", "videos", "ppts", "links")
 *
 * @returns {{
 *   themeKey:             string,
 *   contentThumbnailUrl:  string,
 *   accentColor:          string,
 *   gradientCSS:          string,
 *   isFallback:           boolean
 * }}
 */
export function resolveContentTheme(item = {}, contentTypeHint) {
  const fb = _contentThemeMap.get("mixed_generic");

  // 1. Explicit thumbnail from backend (uploaded by teacher)
  if (item.thumbnail?.thumbnailUrl) {
    return {
      themeKey: "custom",
      contentThumbnailUrl: item.thumbnail.thumbnailUrl,
      accentColor: fb.accentColor,
      gradientCSS: _gradientCSS(fb.accentColor),
      isFallback: false,
    };
  }

  // 2. Resolve from content type
  const resolvedKey = _resolveContentTypeKey(item, contentTypeHint);
  const theme = _contentThemeMap.get(resolvedKey) || fb;
  return _formatContent(theme, resolvedKey === "mixed_generic");
}

/**
 * Determine the content theme key from item metadata.
 */
function _resolveContentTypeKey(item, contentTypeHint) {
  // Try the explicit contentTypeHint first (from the section: "pdfs", "videos", etc.)
  if (contentTypeHint && CONTENT_TYPE_MAP[contentTypeHint]) {
    return CONTENT_TYPE_MAP[contentTypeHint];
  }

  // Try item.fileType (from module contentItems: "pdf", "presentation", "image")
  if (item.fileType && CONTENT_TYPE_MAP[item.fileType]) {
    return CONTENT_TYPE_MAP[item.fileType];
  }

  // Try item.type (from module contentItems: "video", "text", "link", "file")
  if (item.type && CONTENT_TYPE_MAP[item.type]) {
    return CONTENT_TYPE_MAP[item.type];
  }

  // Try to infer from file URL extension
  const url = item.fileUrl || item.videoUrl || item.url || item.link || "";
  if (url) {
    const ext = url.split("?")[0].split(".").pop().toLowerCase();
    if (ext === "pdf") return "pdf_generic";
    if (["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv"].includes(ext)) return "video_generic";
    if (["ppt", "pptx", "odp"].includes(ext)) return "presentation_generic";
    if (["doc", "docx", "odt", "txt", "rtf"].includes(ext)) return "doc_generic";
    if (["mp3", "wav", "ogg", "flac", "aac", "m4a"].includes(ext)) return "audio_generic";
  }

  // Try to infer from item name/title
  const name = (item.name || item.title || "").toLowerCase();
  if (name.includes("recording") || name.includes("recorded")) return "recording_generic";
  if (name.includes("transcript")) return "transcript_generic";
  if (name.includes("audio") || name.includes("podcast")) return "audio_generic";
  if (name.includes("slide") || name.includes("presentation") || name.includes("ppt")) return "presentation_generic";

  return "mixed_generic";
}

function _formatContent(t, isFallback) {
  return {
    themeKey: t.key,
    contentThumbnailUrl: t.thumbnail,
    accentColor: t.accentColor,
    gradientCSS: _gradientCSS(t.accentColor),
    isFallback,
  };
}


// ════════════════════════════════════════════════════════════════════
//  CONVENIENCE: get fallback URLs directly
// ════════════════════════════════════════════════════════════════════

export const fallbacks = FALLBACKS;

export default resolveCourseTheme;
