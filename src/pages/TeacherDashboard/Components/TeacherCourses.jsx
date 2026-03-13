import React, { useState, useEffect, useMemo } from "react";
import { MonitorPlay, Search, ChevronDown, Calendar, BookOpen, Users, ClipboardList, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { getAllCourses } from "../../../services/course.service";
import { useMeetingsV2 } from "../../../context/MeetingV2Context"; // New meeting context
import { resolveCourseTheme } from "../../../utils/courseThemeResolver";
import { getPeriodLabel } from "../../../utils/periodLabel";

// ── 24 unique vibrant gradient palettes for course banners ──────────
const CARD_GRADIENTS = [
  { from: "#0ea5e9", via: "#6366f1", to: "#a855f7" },   // Sky → Indigo → Purple
  { from: "#f43f5e", via: "#ec4899", to: "#d946ef" },   // Rose → Pink → Fuchsia
  { from: "#10b981", via: "#14b8a6", to: "#06b6d4" },   // Emerald → Teal → Cyan
  { from: "#f97316", via: "#f59e0b", to: "#eab308" },   // Orange → Amber → Yellow
  { from: "#8b5cf6", via: "#a78bfa", to: "#c084fc" },   // Violet → Lavender → Purple
  { from: "#059669", via: "#047857", to: "#065f46" },   // Emerald deep tones
  { from: "#2563eb", via: "#3b82f6", to: "#60a5fa" },   // Blue spectrum
  { from: "#dc2626", via: "#f43f5e", to: "#fb7185" },   // Red → Rose → Pink
  { from: "#7c3aed", via: "#6d28d9", to: "#4f46e5" },   // Purple → Violet → Indigo
  { from: "#0891b2", via: "#0e7490", to: "#155e75" },   // Cyan deep tones
  { from: "#ea580c", via: "#c2410c", to: "#9a3412" },   // Orange deep tones
  { from: "#4f46e5", via: "#7c3aed", to: "#9333ea" },   // Indigo → Violet → Purple
  { from: "#0d9488", via: "#2dd4bf", to: "#5eead4" },   // Teal bright
  { from: "#b91c1c", via: "#991b1b", to: "#7f1d1d" },   // Red deep tones
  { from: "#1d4ed8", via: "#2563eb", to: "#3b82f6" },   // Blue deep → bright
  { from: "#c026d3", via: "#a21caf", to: "#86198f" },   // Fuchsia tones
  { from: "#16a34a", via: "#22c55e", to: "#4ade80" },   // Green vibrant
  { from: "#0369a1", via: "#0284c7", to: "#0ea5e9" },   // Blue ocean
  { from: "#9333ea", via: "#c084fc", to: "#e879f9" },   // Purple → Light Purple → Pink
  { from: "#d97706", via: "#b45309", to: "#92400e" },   // Amber deep tones
  { from: "#4338ca", via: "#6366f1", to: "#818cf8" },   // Indigo spectrum
  { from: "#be185d", via: "#e11d48", to: "#f43f5e" },   // Pink → Rose
  { from: "#047857", via: "#10b981", to: "#34d399" },   // Emerald bright
  { from: "#7e22ce", via: "#a855f7", to: "#c084fc" },   // Purple bright
];

// ── Subject-specific symbols rendered as SVG text/paths on banners ───
// Each entry: keywords to match, array of unicode/text symbols to scatter
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

// Fallback generic symbols for courses that don't match any subject
const GENERIC_SYMBOLS = ["✦", "◆", "○", "△", "⊕", "∞", "★", "◎", "⬡", "⬢", "☆", "∴"];

/** Match course text against keyword map → return matching symbols */
function _matchSubjectSymbols(course) {
  const searchText = ` ${[
    course.title,
    course.courseCode,
    course.department,
    course.program,
    typeof course.aboutCourse === "string" ? course.aboutCourse.slice(0, 200) : "",
  ].filter(Boolean).join(" ").toLowerCase()} `;

  for (const entry of SUBJECT_SYMBOLS) {
    for (const kw of entry.keywords) {
      if (searchText.includes(kw)) return entry.symbols;
    }
  }
  return GENERIC_SYMBOLS;
}

/** Stable hash for deterministic per-course selection */
function _hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Generate unique banner props for a course */
function getUniqueBanner(course, index) {
  const key = (course._id || "") + (course.title || "") + index;
  const h = _hash(key);
  const grad = CARD_GRADIENTS[h % CARD_GRADIENTS.length];
  const symbols = _matchSubjectSymbols(course);
  return { grad, symbols, seed: h % 1000 };
}

/**
 * Scatter subject symbols across the banner as semi-transparent text.
 * Uses deterministic positions based on seed so they're stable per course.
 */
function _scatterPositions(seed, count) {
  const positions = [];
  // Golden-ratio-ish spacing for nice distribution
  let x = (seed * 7) % 400;
  let y = (seed * 3) % 100;
  for (let i = 0; i < count; i++) {
    x = (x + 137) % 380 + 10;            // Wrap within 10–390
    y = ((y + 53 + (i * 17)) % 110) + 10; // Wrap within 10–120
    const size = 14 + ((seed + i * 7) % 12);   // Font size 14–25
    const opacity = 0.08 + ((seed + i * 11) % 10) / 100; // 0.08–0.17
    const rotate = ((seed + i * 23) % 40) - 20;  // –20° to +20°
    positions.push({ x, y, size, opacity, rotate });
  }
  return positions;
}

/** Inline SVG banner – unique gradient + subject symbols per course */
const CourseBannerSVG = ({ grad, symbols, seed }) => {
  // Pick 8 symbols from the pool using seed for determinism
  const picked = [];
  for (let i = 0; i < 8; i++) {
    picked.push(symbols[(seed + i * 3) % symbols.length]);
  }
  const positions = _scatterPositions(seed, 8);

  return (
    <svg
      viewBox="0 0 400 144"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`cg-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={grad.from} />
          <stop offset="50%" stopColor={grad.via} />
          <stop offset="100%" stopColor={grad.to} />
        </linearGradient>
      </defs>
      <rect width="400" height="144" fill={`url(#cg-${seed})`} />

      {/* Decorative background circles for depth */}
      <circle cx={320 + (seed % 60)} cy={40 + (seed % 40)} r={55 + (seed % 25)} fill="white" opacity="0.06" />
      <circle cx={80 + (seed % 50)} cy={90 + (seed % 30)} r={40 + (seed % 20)} fill="white" opacity="0.05" />

      {/* Subject-specific symbols scattered across the banner */}
      {picked.map((sym, i) => (
        <text
          key={i}
          x={positions[i].x}
          y={positions[i].y}
          fontSize={positions[i].size}
          fill="white"
          opacity={positions[i].opacity}
          fontFamily="system-ui, sans-serif"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(${positions[i].rotate}, ${positions[i].x}, ${positions[i].y})`}
        >
          {sym}
        </text>
      ))}

      {/* Large hero symbol — top-right, bigger & bolder */}
      <text
        x={340 + (seed % 40)}
        y={50 + (seed % 30)}
        fontSize="42"
        fill="white"
        opacity="0.12"
        fontFamily="system-ui, sans-serif"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="central"
        transform={`rotate(${(seed % 30) - 15}, ${340 + (seed % 40)}, ${50 + (seed % 30)})`}
      >
        {symbols[seed % symbols.length]}
      </text>
    </svg>
  );
};

const TeacherCourses = () => {
  const [coursesData, setCoursesData] = useState({
    teacher: {},
    courses: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSemester, setFilterSemester] = useState("All");
  const [filterYear, setFilterYear] = useState("All");

  // 2. Get meetings data from the new context
  const { getMeetingsForCourse, fetchMeetingsForCourse } = useMeetingsV2();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getAllCourses();
        setCoursesData(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load courses. Please try again later.");
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Pre-fetch meetings for all courses once when courses are loaded
  useEffect(() => {
    if (coursesData.courses && coursesData.courses.length > 0) {
      const uniqueCourseIds = [...new Set((coursesData?.courses || []).map(c => c._id).filter(Boolean))];
      // Fire-and-forget: fetch meetings for all courses in parallel
      uniqueCourseIds.forEach(courseId => {
        fetchMeetingsForCourse(courseId).catch(() => {});
      });
    }
  }, [coursesData.courses, fetchMeetingsForCourse]);

  const getSemesterInfo = (course) => {
    const startDate = course.semester?.startDate;
    if (!startDate) return { season: "Unknown", year: "Unknown", periodLabel: getPeriodLabel(course.semester?.periodType) };

    const date = new Date(startDate);
    const month = date.getMonth();
    const year = date.getFullYear();
    const periodType = course.semester?.periodType || "semester";
    const label = getPeriodLabel(periodType);
    const semNumber = course.semester?.semNumber;

    // For non-semester period types, use the period name directly
    if (periodType !== "semester") {
      const season = semNumber ? `${label} ${semNumber}` : `${label}`;
      return { season, year: year.toString(), periodLabel: label };
    }

    // Semester: use Spring/Fall convention
    let season = (month >= 0 && month <= 4) ? "Spring" : "Fall";
    return { season, year: year.toString(), periodLabel: label };
  };

  const groupCoursesBySemester = (courses) => {
    if (!courses || courses.length === 0) return [];
    const semesterMap = {};

    courses.forEach((course) => {
      if (!course.semester || !course.semester.startDate) return;
      const { season, year, periodLabel: pLabel } = getSemesterInfo(course);
      const semesterId = `${season}-${year}`;

      if (!semesterMap[semesterId]) {
        semesterMap[semesterId] = {
          season,
          year,
          periodLabel: pLabel,
          semesterId: course.semester._id,
          courses: [],
        };
      }

      semesterMap[semesterId].courses.push({
        ...course,
        students: course.students ? course.students.length : 0,
      });
    });

    return Object.values(semesterMap).sort((a, b) => {
      if (b.year !== a.year) return parseInt(b.year) - parseInt(a.year);
      // Sort by season name for non-semester types
      return a.season.localeCompare(b.season);
    });
  };

  // 3. Helper function to find a live meeting for any course within a semester
  // NOTE: This only reads from already-loaded meetings; fetching happens in useEffect above
  const findLiveMeetingForSemester = (semesterCourses) => {
    if (!semesterCourses) return null;

    for (const course of semesterCourses) {
      if (!course?._id) continue;
      // Only read from already-loaded meetings (no fetching here to avoid recursion)
      const courseMeetings = getMeetingsForCourse(course._id) || [];
      const liveMeeting = courseMeetings.find(
        (meeting) =>
          meeting.course === course._id &&
          meeting.status === "live"
      );
      if (liveMeeting) return liveMeeting;
    }

    return null;
  };


  const semesters = groupCoursesBySemester(coursesData.courses);
  const uniqueSeasons = [...new Set(semesters.map((s) => s.season))];

  const filteredSemesters = semesters.filter((semester) => {
    const semesterMatch = filterSemester === "All" || semester.season === filterSemester;
    const yearMatch = filterYear === "All" || semester.year === filterYear;
    return semesterMatch && yearMatch;
  });

  const filteredCourses = filteredSemesters.map((semester) => ({
    ...semester,
    courses: semester.courses.filter((course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  }));

  const uniqueYears = [...new Set(semesters.map((semester) => semester.year))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900">
        <div className="text-red-500 dark:text-red-400 text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl mx-auto max-w-xl border border-red-200 dark:border-red-800 shadow-sm">
          <h3 className="text-lg font-bold mb-2">Error Loading Courses</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 bg-gray-50 dark:bg-gray-900">
      {/* Page Header Gradient Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 px-8 py-8 shadow-lg">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 right-20 w-24 h-24 bg-white/5 rounded-full" />
        <div className="absolute top-4 left-[40%] w-16 h-16 bg-white/5 rounded-full" />
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">My Courses</h1>
            <p className="text-white/80 text-sm font-medium mt-1.5">Manage and track your courses</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-tertiary/10 p-4">
        <div className="flex flex-wrap gap-4 w-full justify-between items-center">
          <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-2.5 w-full md:w-1/3">
            <Search className="h-5 w-5 text-primary dark:text-primary/90 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none w-full text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative w-fit">
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="appearance-none bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-2.5 text-gray-700 dark:text-gray-200 pr-9 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="All">All Periods</option>
                {uniqueSeasons.map((season) => (
                  <option key={season} value={season}>
                    {season}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-3 h-4 w-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
            </div>
            <div className="relative w-fit">
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="appearance-none bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-2.5 text-gray-700 dark:text-gray-200 pr-9 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="All">All Years</option>
                {uniqueYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <Calendar className="absolute right-2.5 top-3 h-4 w-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-tertiary/10 p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">No courses found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        filteredCourses.map((semester, index) => {
          // 4. For each semester, check if there's a live meeting via backend status
          const activeMeeting = findLiveMeetingForSemester(semester.courses);

          return (
            <div key={semester.semesterId || index} className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-3">
                  <span className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-700 px-5 py-2 rounded-full text-sm font-medium">
                    {semester.season}
                  </span>
                  <span className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/30 dark:to-sky-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-700 px-5 py-2 rounded-full text-sm font-medium">
                    {semester.year}
                  </span>
                </div>
                {/* 5. DYNAMIC BUTTON - Uses only VConf URLs */}
                {activeMeeting ? (
                  <a
                    href={activeMeeting.vconfHostUrl || activeMeeting.vconfJoinUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!activeMeeting.vconfHostUrl && !activeMeeting.vconfJoinUrl) {
                        e.preventDefault();
                        alert("Video conference room is not ready yet. Please try again in a moment.");
                      }
                    }}
                    className="bg-green-600 dark:bg-green-500 text-white px-6 py-2 rounded-xl text-sm hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center gap-2 animate-pulse shadow-sm"
                  >
                    <MonitorPlay className="h-5 w-5" />
                    Join Live
                  </a>
                ) : (
                  <button
                    disabled
                    className="bg-gray-400 dark:bg-gray-600 text-white dark:text-gray-300 px-6 py-2 rounded-xl text-sm flex items-center gap-2 cursor-not-allowed"
                  >
                    <MonitorPlay className="h-5 w-5" />
                    No Live Lecture
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {semester.courses.map((course, idx) => {
                  const query = new URLSearchParams();
                  if (course.assignmentId) query.set("assignmentId", course.assignmentId);
                  if (course.batchId) query.set("batchId", course.batchId);
                  if (course.semesterId) query.set("semesterId", course.semesterId);
                  const search = query.toString();
                  const linkTarget = search
                    ? `/teacher/course/${course._id}?${search}`
                    : `/teacher/course/${course._id}`;
                  const cardKey =
                    course.assignmentId ||
                    `${course._id}-${course.batchId || "na"}-${course.semesterId || "na"}-${idx}`;

                  const { grad, symbols, seed } = getUniqueBanner(course, idx);
                  return (
                  <Link key={cardKey} to={linkTarget}>
                    <div className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-200/60 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                      {/* ── Unique SVG Banner with Subject Symbols ── */}
                      <div className="relative h-36 overflow-hidden">
                        <CourseBannerSVG grad={grad} symbols={symbols} seed={seed} />
                        {/* Shimmer overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out" />
                        {/* Bottom fade for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        {/* Course title on banner */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                          <h3 className="text-white font-bold text-base leading-tight drop-shadow-lg line-clamp-2">
                            {course.title}
                          </h3>
                          <p className="text-white/80 text-xs mt-0.5 font-medium drop-shadow">
                            {course.cohortLabel || course.batchName || ""}
                          </p>
                        </div>
                        {/* Student count badge */}
                        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-semibold pl-2 pr-2.5 py-1 rounded-full border border-white/30 shadow-lg">
                          <Users className="w-3 h-3" />
                          {course?.studentCount ?? 0}
                        </div>
                      </div>

                      {/* ── Card Body ────────────────────────────── */}
                      <div className="p-4 space-y-3">
                        {/* Course code + description */}
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {(course.aboutCourse || "").length > 90
                            ? `${course.aboutCourse.substring(0, 90)}...`
                            : course.aboutCourse || "No description available"}
                        </p>

                        {/* Schedule */}
                        {course.schedule?.classDaysAndTimes?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {course.schedule.classDaysAndTimes.slice(0, 3).map(
                              (schedule, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium"
                                >
                                  <Calendar className="h-2.5 w-2.5 flex-shrink-0" />
                                  {schedule.day}
                                </span>
                              )
                            )}
                          </div>
                        )}

                        {/* Stats row */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <MonitorPlay className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="font-medium">{course.totalLectureCount || 0}</span>
                            <span>Lectures</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <ClipboardList className="h-3.5 w-3.5 text-blue-500" />
                            <span className="font-medium">{course.assignments?.length || 0}</span>
                            <span>Assignments</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  );
                })}
              </div>
            </div>
          )
        })
      )}
    </div>
  );
};

export default TeacherCourses;
