/**
 * Course Theme Resolver (backward-compatibility wrapper)
 *
 * All logic now lives in lmsAssetResolver.js.
 * This file re-exports the course-specific functions so that existing
 * imports like `import { resolveCourseTheme } from "../utils/courseThemeResolver"`
 * continue to work without changes.
 */
export {
  resolveCourseTheme,
  getCourseTheme,
  getCourseGradient,
  resolveModuleTheme,
  resolveContentTheme,
  fallbacks,
} from "./lmsAssetResolver";

export { default } from "./lmsAssetResolver";
