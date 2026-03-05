/**
 * CoursePageBanner — Shared gradient banner for all course inner pages.
 *
 * Props:
 *  icon         — Lucide icon component (e.g. Home, BookOpen, Video)
 *  title        — Page title string
 *  subtitle     — Optional subtitle / description
 *  gradient     — Tailwind gradient classes (default: emerald → teal → cyan)
 *  rightContent — Optional ReactNode rendered on the right side (buttons, badges)
 */
const CoursePageBanner = ({
  icon: Icon,
  title,
  subtitle,
  gradient = "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500",
  rightContent,
}) => (
  <div
    className={`relative overflow-hidden rounded-xl mb-6 shadow-lg ${gradient}`}
  >
    {/* Decorative circles */}
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
    <div className="absolute -bottom-6 right-20 w-20 h-20 bg-white/5 rounded-full" />
    <div className="absolute top-2 right-[40%] w-10 h-10 bg-white/5 rounded-full" />

    <div className="relative z-10 px-8 py-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Icon className="w-7 h-7 text-white" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/80 text-sm mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      {rightContent && <div className="flex-shrink-0">{rightContent}</div>}
    </div>
  </div>
);

export default CoursePageBanner;
