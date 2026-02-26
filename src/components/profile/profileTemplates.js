export const STUDENT_PROFILE_SECTIONS = [
  {
    title: "Core Identity",
    fields: [
      "Email id",
      "Alternate Email Id",
      "Mobile Number",
      "Applicant Full Name (As mentioned on AADHAR Card)",
      "Gender",
      "Date Of Birth",
      "Blood Group",
      "Nationality",
      "Mother Tongue",
      "Age as on 31 July 2024",
    ],
  },
  {
    title: "Address",
    fields: [
      "Address",
      "Address Line 1",
      "City",
      "District",
      "State",
      "Country / Countries",
      "PinCode / Pincode",
    ],
  },
  {
    title: "Parents",
    fields: [
      "Fathers Name",
      "Fathers Mobile",
      "Fathers Email",
      "Mothers Name",
      "Mothers Mobile",
      "Mothers Email",
    ],
  },
  {
    title: "Govt IDs",
    fields: [
      "Aadhar Number",
      "Aadhaar Card/Passport (URL)",
      "PAN Number",
      "Upload PAN Card Copy",
      "Upload Aadhar Card Copy",
    ],
  },
  {
    title: "Application/Admission",
    fields: [
      "Application Form Number",
      "Level",
      "Program - Specialization",
      "Category",
      "Status",
      "Sub-Status",
    ],
  },
  {
    title: "Professional Details",
    fields: [
      "Work Experience (Years)",
      "Current Organisation",
      "Designation",
      "Office Address",
      "Office PIN Code",
      "Office Phone Number with Area Code",
      "Whatsapp Number",
      "Employment Type",
    ],
  },
  {
    title: "Education",
    fields: [
      "10th Admit card (URL)",
      "10th Marksheet (URL)",
      "10th Certificate",
      "Board",
      "Year of Completion / Year of Passing",
      "Percentage",
      "Marking Scheme",
      "Grade",
      "CGPA out of 7",
      "What have you done after 10th?",
      "Diploma Institute Name",
      "Board/University Name",
      "University",
      "Diploma result stage/status",
      "Graduation pursuing/done",
    ],
  },
];

export const STUDENT_CANONICAL_FIELDS = STUDENT_PROFILE_SECTIONS.flatMap(
  (section) => section.fields
);

export const TEACHER_PROFILE_PHOTO_FIELD = "Profile Photo";

export const TEACHER_PROFILE_SECTIONS = [
  {
    title: "Personal Details",
    fields: [
      "Title",
      "First",
      "Middle",
      "Last",
      "Date of Birth",
      "Gender",
      "Nationality",
      "Language",
      "Religion",
      "Native District",
      "Native State",
      "Native Country",
      "About Faculty",
      "Personal Number",
      "Designation",
      "Administrative Responsibility",
    ],
  },
  {
    title: "Contact Details",
    fields: [
      "School Associated",
      "KIIT mail ID",
      "Personal Email ID",
      "Mobile Number",
      "WhatsApp Number",
    ],
  },
  {
    title: "Educational Details",
    fields: [
      "PhD Degree Name",
      "PhD University",
      "PhD Year",
      "PG Degree Name",
      "PG University",
      "PG Year",
      "UG Degree Name",
      "UG University",
      "UG Year",
      "Any other Degree Name",
      "Any other University",
      "Any other Year",
    ],
  },
  {
    title: "Research",
    fields: [
      "Google Scholar",
      "Scopus ID",
      "ORCID ID",
      "Research Area",
      "Course Expertise in Teaching",
      "About Research Work",
      "Professional Membership",
    ],
  },
  {
    title: "Social Media",
    fields: [
      "Your Webpage (if Any)",
      "Facebook ID",
      "Insta ID",
      "Youtube ID",
      "LinkedIN ID",
    ],
  },
];

export const TEACHER_CANONICAL_FIELDS = [
  TEACHER_PROFILE_PHOTO_FIELD,
  ...TEACHER_PROFILE_SECTIONS.flatMap((section) => section.fields),
];

export const STUDENT_EDITABLE_FIELDS = new Set([
  "Alternate Email Id",
  "Mobile Number",
  "Address",
  "Address Line 1",
  "City",
  "District",
  "State",
  "Country / Countries",
  "PinCode / Pincode",
  "Fathers Name",
  "Fathers Mobile",
  "Fathers Email",
  "Mothers Name",
  "Mothers Mobile",
  "Mothers Email",
  "Blood Group",
  "Mother Tongue",
  "Work Experience (Years)",
  "Current Organisation",
  "Designation",
  "Office Address",
  "Office PIN Code",
  "Office Phone Number with Area Code",
  "Whatsapp Number",
  "Employment Type",
]);

export const TEACHER_EDITABLE_FIELDS = new Set([
  "Title",
  "First",
  "Middle",
  "Last",
  "Date of Birth",
  "Gender",
  "Nationality",
  "Language",
  "Religion",
  "Native District",
  "Native State",
  "Native Country",
  "About Faculty",
  "Personal Number",
  "Designation",
  "Administrative Responsibility",
  "School Associated",
  "Personal Email ID",
  "Mobile Number",
  "WhatsApp Number",
  "PhD Degree Name",
  "PhD University",
  "PhD Year",
  "PG Degree Name",
  "PG University",
  "PG Year",
  "UG Degree Name",
  "UG University",
  "UG Year",
  "Any other Degree Name",
  "Any other University",
  "Any other Year",
  "Google Scholar",
  "Scopus ID",
  "ORCID ID",
  "Research Area",
  "Course Expertise in Teaching",
  "About Research Work",
  "Professional Membership",
  "Your Webpage (if Any)",
  "Facebook ID",
  "Insta ID",
  "Youtube ID",
  "LinkedIN ID",
]);

export const normalizeKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9]/g, "");

export const STUDENT_ALIASES = {
  email: "Email id",
  emailid: "Email id",
  phone: "Mobile Number",
  mobile: "Mobile Number",
  mobilenumber: "Mobile Number",
  fullname: "Applicant Full Name (As mentioned on AADHAR Card)",
  dob: "Date Of Birth",
  bloodgroup: "Blood Group",
  mothertongue: "Mother Tongue",
  pincode: "PinCode / Pincode",
  pin: "PinCode / Pincode",
  whatsapp: "Whatsapp Number",
  whatsappnumber: "Whatsapp Number",
  workexperience: "Work Experience (Years)",
  company: "Current Organisation",
  organization: "Current Organisation",
  role: "Designation",
};

export const TEACHER_ALIASES = {
  profilephoto: TEACHER_PROFILE_PHOTO_FIELD,
  photo: TEACHER_PROFILE_PHOTO_FIELD,
  firstname: "First",
  middlename: "Middle",
  lastname: "Last",
  dob: "Date of Birth",
  schoolassociated: "School Associated",
  kiitmailid: "KIIT mail ID",
  personalemailid: "Personal Email ID",
  mobile: "Mobile Number",
  whatsapp: "WhatsApp Number",
  whatsappnumber: "WhatsApp Number",
  orchid: "ORCID ID",
  orchidid: "ORCID ID",
  orcid: "ORCID ID",
  orcidid: "ORCID ID",
  administrativeresponsibity: "Administrative Responsibility",
  googlescholar: "Google Scholar",
  linkedinid: "LinkedIN ID",
};

export const createEmptyFromFields = (fields = []) =>
  fields.reduce((acc, key) => {
    acc[key] = "";
    return acc;
  }, {});

export const normalizeTemplateValues = (input, canonicalFields, aliases = {}) => {
  const normalized = createEmptyFromFields(canonicalFields);
  const source =
    input && typeof input === "object" && !Array.isArray(input) ? input : {};

  Object.entries(source).forEach(([key, rawValue]) => {
    const normalizedInputKey = normalizeKey(key);
    const directMatch = canonicalFields.find(
      (field) => normalizeKey(field) === normalizedInputKey
    );
    const aliasMatch = aliases[key] || aliases[normalizedInputKey] || "";
    const target = directMatch || aliasMatch;
    if (!target) return;
    const value =
      rawValue === undefined || rawValue === null ? "" : String(rawValue).trim();
    if (value || !normalized[target]) {
      normalized[target] = value;
    }
  });

  return normalized;
};

