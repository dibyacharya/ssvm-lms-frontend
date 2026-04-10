import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Target,
  Award,
  GraduationCap,
  Loader2,
  AlertCircle,
  Layers,
  FileText,
  Globe,
  Building,
  Hash,
  Users,
  BookMarked,
  Link as LinkIcon,
  PieChart,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useParams } from "react-router-dom";
import {
  getCourseDescription,
  getAssessmentPlan,
  getContinuousAssessmentPlan,
} from "../../../../services/course.service";
import { useCourse } from "../../../../context/CourseContext";
import { getEndExamLabel, getMidExamLabel } from "../../../../utils/periodLabel";

/* ================================================================
   Reusable sub-components
   ================================================================ */

/** Gradient section header used by every card */
const SectionHeader = ({ icon: Icon, title, gradient, count }) => (
  <div className={`relative overflow-hidden px-6 py-4 ${gradient}`}>
    <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
    <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
    <div className="relative z-10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-900" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
      </div>
      {count != null && (
        <span className="px-2.5 py-1 text-xs font-bold text-gray-900 bg-white/20 rounded-full backdrop-blur-sm">
          {count}
        </span>
      )}
    </div>
  </div>
);

/** Info card for right sidebar */
const InfoCard = ({ icon, label, value, accent = "bg-gray-50" }) => {
  if (!value) return null;
  return (
    <div className={`group flex items-center gap-3 p-3.5 ${accent} rounded-xl border border-transparent hover:border-primary/20 hover:shadow-sm transition-all duration-200 cursor-default`}>
      <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-tertiary/70 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-semibold text-primary mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
};

/** Progress bar for assessment plan */
const AssessmentBar = ({ label, value, color, bgColor, textColor }) => (
  <div className="group">
    <div className="flex justify-between items-center mb-1.5">
      <span className="text-sm font-medium text-primary">{label}</span>
      <span className={`text-sm font-bold ${textColor} tabular-nums`}>{value}%</span>
    </div>
    <div className={`h-3 rounded-full ${bgColor} overflow-hidden`}>
      <div
        className={`h-full rounded-full ${color} transition-all duration-700 ease-out group-hover:brightness-110`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

/* ================================================================
   Main component
   ================================================================ */
const CourseDescription = () => {
  const { courseID } = useParams();
  const { courseData } = useCourse();
  const periodType = courseData?.semester?.periodType || courseData?.periodType || "semester";
  const endExamLabel = getEndExamLabel(periodType);
  const midExamLabel = getMidExamLabel(periodType);
  const [description, setDescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessmentPlan, setAssessmentPlan] = useState(null);
  const [continuousCategories, setContinuousCategories] = useState([]);

  useEffect(() => {
    const fetchDescription = async () => {
      if (!courseID) return;
      try {
        setLoading(true);
        setError(null);
        const [descData, planData, capData] = await Promise.allSettled([
          getCourseDescription(courseID),
          getAssessmentPlan(courseID),
          getContinuousAssessmentPlan(courseID),
        ]);
        if (descData.status === "fulfilled") {
          setDescription(descData.value?.description || descData.value);
        }
        if (planData.status === "fulfilled" && planData.value) {
          setAssessmentPlan(planData.value);
        }
        if (capData.status === "fulfilled" && Array.isArray(capData.value)) {
          setContinuousCategories(capData.value);
        }
        if (descData.status === "rejected") {
          throw descData.reason;
        }
      } catch (err) {
        console.error("Error fetching course description:", err);
        setError("Failed to load course description.");
      } finally {
        setLoading(false);
      }
    };
    fetchDescription();
  }, [courseID]);

  /* ---------- loading / error / empty states ---------- */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200">
            <Loader2 className="w-7 h-7 text-gray-900 animate-spin" />
          </div>
        </div>
        <p className="text-tertiary font-medium">Loading course description...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="bg-gradient-to-br from-red-50 to-rose-50 p-8 rounded-2xl text-center max-w-md border border-red-100 shadow-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!description) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gray-100 flex items-center justify-center">
            <FileText className="w-9 h-9 text-tertiary/40" />
          </div>
          <h3 className="text-xl font-bold text-primary mb-2">No Course Description Available</h3>
          <p className="text-tertiary text-sm">The course description has not been set up by the admin yet.</p>
        </div>
      </div>
    );
  }

  const courseTitle = description?.courseTitle || description?.title || "";
  const courseCode = description?.courseCode || description?.ssvmxCourseCode || "";

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* ============ Hero Header ============ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 p-8 shadow-lg">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
              <BookOpen className="w-7 h-7 text-gray-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Course Description</h1>
              <p className="text-blue-100 mt-1 text-sm">
                {courseTitle
                  ? `${courseCode ? courseCode + " — " : ""}${courseTitle}`
                  : "Detailed course information and learning outcomes"}
              </p>
            </div>
          </div>
          {courseCode && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
              <Hash className="w-4 h-4 text-gray-900/80" />
              <span className="text-gray-900 font-semibold text-sm">{courseCode}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* ============ Left Column ============ */}
        <div className="col-span-12 lg:col-span-8 space-y-6">

          {/* ---------- About ---------- */}
          {description.introduction && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <SectionHeader icon={BookOpen} title="About The Course" gradient="bg-gradient-to-r from-blue-500 to-blue-700" />
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{description.introduction}</p>
              </div>
            </div>
          )}

          {/* ---------- Prerequisites ---------- */}
          {description.prerequisites && description.prerequisites.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <SectionHeader icon={BookMarked} title="Prerequisites" gradient="bg-gradient-to-r from-amber-500 to-blue-500" count={description.prerequisites.length} />
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {description.prerequisites.map((prereq, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gradient-to-r from-amber-50 to-blue-50 text-amber-700 rounded-full text-sm font-semibold border border-amber-200 hover:shadow-sm hover:scale-105 transition-all duration-200 cursor-default"
                    >
                      {prereq}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---------- Course Outcomes ---------- */}
          {description.courseOutcomes && description.courseOutcomes.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <SectionHeader icon={Target} title="Course Outcomes" gradient="bg-gradient-to-r from-blue-500 to-blue-600" count={description.courseOutcomes.length} />
              <div className="p-6">
                <div className="space-y-3">
                  {description.courseOutcomes.map((co, idx) => (
                    <div
                      key={idx}
                      className="group flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gradient-to-r from-white to-gray-50/50 hover:from-violet-50/40 hover:to-blue-50/30 hover:border-violet-200 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex-none w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm shadow-violet-200 group-hover:shadow-md group-hover:scale-105 transition-all">
                        <span className="text-xs font-bold text-gray-900">{co.code || `CO${idx + 1}`}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-medium leading-snug">{co.outcome}</p>
                        {(co.bloomLevel || co.ncrfLevel || co.weightage != null) && (
                          <div className="flex gap-2 mt-2.5 flex-wrap">
                            {co.bloomLevel && (
                              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold border border-blue-100">
                                Bloom: {co.bloomLevel}
                              </span>
                            )}
                            {co.ncrfLevel && (
                              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold border border-blue-100">
                                NCRF: {co.ncrfLevel}
                              </span>
                            )}
                            {co.weightage != null && (
                              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg font-semibold border border-amber-100">
                                Weight: {co.weightage}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 flex-shrink-0 mt-1 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---------- Module Outcomes ---------- */}
          {description.moduleOutcomes && description.moduleOutcomes.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <SectionHeader icon={Layers} title="Module Outcomes" gradient="bg-gradient-to-r from-blue-500 to-blue-600" count={description.moduleOutcomes.length} />
              <div className="p-6">
                <div className="space-y-3">
                  {description.moduleOutcomes.map((mo, idx) => (
                    <div
                      key={idx}
                      className="group flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gradient-to-r from-white to-gray-50/50 hover:from-blue-50/40 hover:to-blue-50/30 hover:border-blue-200 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex-none w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm shadow-blue-200 group-hover:shadow-md group-hover:scale-105 transition-all">
                        <span className="text-xs font-bold text-gray-900">{mo.code || `MO${idx + 1}`}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-medium leading-snug">{mo.text}</p>
                        {mo.coMappings && mo.coMappings.length > 0 && (
                          <div className="flex gap-1.5 mt-2.5 flex-wrap">
                            {mo.coMappings.map((co, i) => (
                              <span
                                key={i}
                                className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold border border-blue-100"
                              >
                                {co}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 flex-shrink-0 mt-1 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---------- Reference Books ---------- */}
          {description.referenceBooks && description.referenceBooks.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <SectionHeader icon={BookMarked} title="Reference Books" gradient="bg-gradient-to-r from-rose-500 to-pink-600" count={description.referenceBooks.length} />
              <div className="p-6 space-y-3">
                {description.referenceBooks.map((book, idx) => (
                  <div
                    key={idx}
                    className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-rose-200 hover:bg-gradient-to-r hover:from-rose-50/40 hover:to-pink-50/30 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex-none w-10 h-10 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center group-hover:from-rose-200 group-hover:to-pink-200 transition-colors">
                      <BookMarked className="w-5 h-5 text-rose-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-800 truncate">{book.title}</p>
                      <p className="text-sm text-tertiary mt-0.5 truncate">
                        {[book.author, book.publisher, book.yearEdition].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------- Resources ---------- */}
          {((description.onlineResources && description.onlineResources.length > 0) ||
            (description.moocs && description.moocs.length > 0) ||
            (description.journals && description.journals.length > 0)) && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <SectionHeader icon={LinkIcon} title="Resources" gradient="bg-gradient-to-r from-blue-500 to-blue-700" />
              <div className="p-6 space-y-5">
                {description.journals && description.journals.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-tertiary/70 uppercase tracking-widest mb-3">Journals</h3>
                    <div className="space-y-2">
                      {description.journals.map((j, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-cyan-50 border border-transparent hover:border-cyan-100 transition-all duration-200">
                          <FileText className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 font-medium">{j.name || j}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {description.onlineResources && description.onlineResources.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-tertiary/70 uppercase tracking-widest mb-3">Online Resources</h3>
                    <div className="space-y-2">
                      {description.onlineResources.map((r, idx) => (
                        <a
                          key={idx}
                          href={r.url || r}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all duration-200"
                        >
                          <ExternalLink className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="text-sm text-blue-600 font-medium truncate group-hover:underline">{r.url || r}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {description.moocs && description.moocs.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-tertiary/70 uppercase tracking-widest mb-3">MOOCs</h3>
                    <div className="space-y-2">
                      {description.moocs.map((m, idx) => (
                        <a
                          key={idx}
                          href={m.url || m}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-teal-50 border border-transparent hover:border-teal-100 transition-all duration-200"
                        >
                          <GraduationCap className="w-4 h-4 text-teal-500 flex-shrink-0" />
                          <span className="text-sm text-teal-600 font-medium truncate group-hover:underline">{m.url || m}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ============ Right Column ============ */}
        <div className="col-span-12 lg:col-span-4 space-y-6">

          {/* ---------- Course Info ---------- */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <SectionHeader icon={Award} title="Course Info" gradient="bg-gradient-to-r from-blue-500 to-blue-600" />
            <div className="p-5 space-y-2.5">
              <InfoCard icon={<Hash className="w-4 h-4 text-blue-500" />} label="Course Code" value={description.courseCode || description.ssvmxCourseCode} accent="bg-blue-50/60" />
              <InfoCard icon={<FileText className="w-4 h-4 text-blue-500" />} label="Course Type" value={description.courseType ? description.courseType.charAt(0).toUpperCase() + description.courseType.slice(1) : null} accent="bg-blue-50/60" />
              <InfoCard
                icon={<Award className="w-4 h-4 text-amber-500" />}
                label="Credits"
                value={
                  description.creditPoints
                    ? `${description.creditPoints.lecture}-${description.creditPoints.tutorial}-${description.creditPoints.practical}-${description.creditPoints.totalCredits}`
                    : description.courseCredits
                }
                accent="bg-amber-50/60"
              />
              <InfoCard icon={<GraduationCap className="w-4 h-4 text-blue-500" />} label="NCRF Level" value={description.ncrfLevel} accent="bg-blue-50/60" />
              {description.avgNcrfLevel != null && (
                <InfoCard icon={<Target className="w-4 h-4 text-teal-500" />} label="Average NCRF Level" value={typeof description.avgNcrfLevel === "number" ? parseFloat(description.avgNcrfLevel.toFixed(2)) : description.avgNcrfLevel} accent="bg-teal-50/60" />
              )}
              <InfoCard icon={<Globe className="w-4 h-4 text-cyan-500" />} label="Medium of Instruction" value={description.mediumOfInstruction} accent="bg-cyan-50/60" />
              <InfoCard icon={<Building className="w-4 h-4 text-rose-500" />} label="Offered By" value={description.offeredBySchool} accent="bg-rose-50/60" />
              <InfoCard icon={<Users className="w-4 h-4 text-blue-500" />} label="Developed For" value={description.developedFor} accent="bg-blue-50/60" />
              {description.coordinator && (
                <InfoCard icon={<Users className="w-4 h-4 text-sky-500" />} label="Coordinator" value={description.coordinator.name} accent="bg-sky-50/60" />
              )}
              {description.category && (
                <InfoCard icon={<Layers className="w-4 h-4 text-blue-500" />} label="Category" value={description.category.name} accent="bg-blue-50/60" />
              )}
            </div>
          </div>

          {/* ---------- Assessment Plan ---------- */}
          {assessmentPlan && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <SectionHeader icon={PieChart} title="Assessment Plan" gradient="bg-gradient-to-r from-fuchsia-500 to-pink-600" />
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <AssessmentBar label={endExamLabel} value={assessmentPlan.endTermExam} color="bg-blue-500" bgColor="bg-blue-100" textColor="text-blue-700" />
                  <AssessmentBar label={midExamLabel} value={assessmentPlan.midTermExam} color="bg-blue-500" bgColor="bg-blue-100" textColor="text-blue-700" />
                  <AssessmentBar label="Continuous Assessment" value={assessmentPlan.continuousAssessment} color="bg-amber-500" bgColor="bg-amber-100" textColor="text-amber-700" />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-semibold text-primary">Total</span>
                  <span className="text-sm font-bold text-primary tabular-nums">
                    {(assessmentPlan.endTermExam || 0) + (assessmentPlan.midTermExam || 0) + (assessmentPlan.continuousAssessment || 0)}%
                  </span>
                </div>

                {continuousCategories.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-xs font-bold text-tertiary/70 uppercase tracking-widest mb-3">
                      Continuous Assessment Breakdown
                    </h3>
                    <div className="space-y-2">
                      {continuousCategories.map((cat) => (
                        <div
                          key={cat._id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gradient-to-r from-gray-50 to-white hover:from-fuchsia-50/40 hover:to-pink-50/30 hover:border-fuchsia-200 transition-all duration-200"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-primary truncate">{cat.category}</p>
                            <p className="text-xs text-tertiary mt-0.5">
                              {cat.number} × {cat.eachMarks} marks
                              {cat.calculationMethod && ` · ${cat.calculationMethod}`}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-fuchsia-600 bg-fuchsia-50 px-2.5 py-1 rounded-lg flex-shrink-0 ml-2">
                            {cat.totalMarks}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDescription;
