# LMS Banner + Thumbnail Asset Pack

This pack is designed for frontend-only automatic visual assignment.

## Folders
- `banners/` wide course header banners
- `thumbnails/` course card thumbnails
- `module_thumbnails/` module card covers
- `content_thumbnails/` content item thumbnails for PDF, video, PPT, transcript, recording, etc.
- `manifest.json` source of truth for asset paths and fallbacks

## Recommended usage
1. Put this folder under:
   `KIIT_LMS_FRONTEND/KIIT_LMS_FRONTEND/public/lms_banner_pack`
2. Build a frontend resolver that:
   - prefers explicit course-provided theme/banner if available
   - otherwise maps by course title / course code / program keywords
   - otherwise falls back to generic assets from `manifest.json`
3. Never let UI break on missing image; always use CSS fallback as last resort.

## Suggested theme keyword mapping
- mathematics: math, algebra, calculus, statistics
- biology: biology, botany, zoology, life science
- law: law, legal, jurisprudence
- history: history, ancient, medieval, modern history
- physics: physics, mechanics
- chemistry: chemistry, organic, inorganic
- computer_science: computer, programming, cs, ai, ml, data structure
- economics: economics, microeconomics, macroeconomics
- literature: literature, english, language
- geography: geography, environment, earth
- medicine: medicine, anatomy, physiology
- engineering: engineering, electronics, civil, mechanical
- upsc: upsc, polity, gs, civics, governance
- business: business, management, finance
- education: education, pedagogy, teaching
- fallback: general

## Content type mapping
- pdf -> pdfThumbnail
- video -> videoThumbnail
- presentation / ppt -> presentationThumbnail
- doc / notes -> documentThumbnail
- recording -> recordingThumbnail
- transcript -> transcriptThumbnail
- audio -> audioThumbnail
- mixed/unknown -> mixedThumbnail
