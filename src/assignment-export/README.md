# Assignment System - Export Package

This package contains a complete assignment management system with dummy data implementation. It includes all the necessary components, hooks, utilities, and documentation to integrate assignment functionality into your Learning Management System (LMS).

## 📦 Package Contents

```
assignment-export/
├── src/
│   └── pages/
│       └── Assignment/
│           ├── components/          # Reusable UI components
│           │   ├── AssignmentDetailsStep.jsx
│           │   ├── QuestionsStep.jsx
│           │   ├── ReviewStep.jsx
│           │   ├── StepIndicator.jsx
│           │   ├── MCQGenerator.jsx
│           │   └── AIApprovalModal.jsx
│           ├── hooks/              # Custom React hooks
│           │   └── useAssignmentStore.js  # Dummy data store
│           ├── utils/               # Utility functions
│           │   └── questionParser.js       # JSON/CSV parser
│           ├── teacher/             # Teacher components
│           │   ├── CreateAssignmentNew.jsx
│           │   └── TeacherAssignmentGrading.jsx
│           ├── student/             # Student components
│           │   └── ShowAssignment.jsx
│           ├── README.md            # Feature documentation
│           ├── INTEGRATION_GUIDE.md # Integration instructions
│           └── BACKEND_DOCUMENTATION.md # API documentation
└── README.md                        # This file
```

## 🚀 Quick Start

### 1. Copy Files to Your Project

Copy the entire `src/pages/Assignment` folder to your project's `src/pages/` directory:

```bash
# From your project root
cp -r assignment-export/src/pages/Assignment src/pages/
```

### 2. Install Dependencies

This package requires the following npm packages:

```bash
npm install lucide-react react-hot-toast
```

**Note:** If you're using React Router, make sure it's installed:
```bash
npm install react-router-dom
```

### 3. Required Context/Providers

The components use the following context (you'll need to adapt these to your codebase):

- **CourseContext** (`src/context/CourseContext.js`) - Provides course data
  - Expected structure: `{ courseData: { id, title, courseCode, syllabus: { modules: [...] } } }`

**If you don't have CourseContext**, you can:
1. Create a simple context provider, or
2. Modify the components to accept course data as props

### 4. Update Import Paths

The components reference:
- `../../../context/CourseContext` - Update to match your context location
- `../../../utils/LoadingAnimation` - Update to match your loading component location

### 5. Add Routes (Optional)

If using React Router, add these routes to your `App.js`:

```jsx
import CreateAssignmentNew from './pages/Assignment/teacher/CreateAssignmentNew';
import TeacherAssignmentGrading from './pages/Assignment/teacher/TeacherAssignmentGrading';
import StudentAssignmentSection from './pages/Assignment/student/ShowAssignment';

// In your routes:
<Route path="/teacher/assignment/:assignmentId/grade" element={<TeacherAssignmentGrading />} />
<Route path="/student/assignment/:assignmentId/view" element={<StudentAssignmentSection />} />
```

## 📋 Features

### ✅ Teacher Features
- **3-Step Assignment Creation Wizard**
  - Step 1: Assignment details (title, description, due date, etc.)
  - Step 2: Question management with separate tabs for Subjective and Objective
  - Step 3: Review and publish
  
- **Question Management**
  - AI question generation (dummy implementation - ready for backend integration)
  - AI approval workflow (dummy)
  - MCQ generator tool
  - JSON/CSV file upload support
  
- **Grading Interface**
  - Separate tabs for Subjective and Objective questions
  - Student list with search and filter
  - Manual grading for subjective questions
  - Auto-calculated results for objective questions

### ✅ Student Features
- **Assignment View**
  - Separate tabs for Subjective and Objective questions
  - Text input or PDF upload for subjective answers
  - MCQ selection for objective questions
  - Auto-scoring for objective questions
  - View submission status and grades

## 🔧 Integration Steps

### Step 1: Replace Dummy Store with API Calls

The `useAssignmentStore.js` hook currently uses localStorage for dummy data. Replace it with actual API calls:

```javascript
// Example: Replace createAssignment function
const createAssignment = useCallback(async (assignmentData) => {
  const response = await fetch('/api/assignment/courses/:courseId/assignments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assignmentData)
  });
  const data = await response.json();
  return data.assignment;
}, []);
```

See `BACKEND_DOCUMENTATION.md` for complete API specifications.

### Step 2: Update Course Context Integration

If your CourseContext has a different structure, update the components:

```javascript
// In CreateAssignmentNew.jsx, update:
const { courseData: contextCourseData } = useCourse();
// Adapt to your context structure
```

### Step 3: File Upload Integration

Currently, PDF uploads use `URL.createObjectURL()`. Replace with actual file storage:

```javascript
// In ShowAssignment.jsx, replace:
submissionFile: selectedFile ? URL.createObjectURL(selectedFile) : null

// With:
const formData = new FormData();
formData.append('file', selectedFile);
const uploadResponse = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
const { fileUrl } = await uploadResponse.json();
submissionFile: fileUrl
```

### Step 4: Authentication Integration

Update `getCurrentStudentId()` in `useAssignmentStore.js`:

```javascript
// Replace with your auth context
import { useAuth } from '../context/AuthContext';

const getCurrentStudentId = useCallback(() => {
  const { user } = useAuth();
  return user?.id || user?._id;
}, []);
```

## 📝 Data Models

### Assignment Object
```javascript
{
  _id: String,
  title: String,
  description: String,
  instructions: String,
  course: String,        // Course ID
  module: String,        // Module ID
  totalPoints: Number,
  dueDate: Date,
  isActive: Boolean,
  questions: [Question],
  submissions: [Submission]
}
```

### Question Object
```javascript
{
  _id: String,
  question: String,
  type: 'subjective' | 'objective',
  points: Number,
  options: [String],        // For objective only
  correctAnswer: String,   // For objective only
  bloomLevel: String,     // Optional
  courseOutcome: String,  // Optional
  source: String,         // 'uploaded', 'generated', 'ai'
  status: String          // For AI: 'pending', 'approved', 'rejected'
}
```

### Submission Object
```javascript
{
  _id: String,
  student: String,        // Student ID
  assignment: String,     // Assignment ID
  submissionDate: Date,
  submissionFile: String,  // URL for PDF (subjective)
  answers: {
    subjective: { [questionId]: String },
    objective: { [questionId]: String }
  },
  objectiveScore: Number,  // Auto-calculated
  grade: Number,           // Teacher-assigned (subjective)
  feedback: String,
  status: 'submitted' | 'graded'
}
```

## 🎨 Styling

The components use **Tailwind CSS** for styling. Make sure Tailwind is configured in your project:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // ... rest of config
}
```

## 🔌 API Integration

See `BACKEND_DOCUMENTATION.md` for:
- Complete API endpoint specifications
- Request/response formats
- Data models
- Workflow diagrams
- Error handling

## 📚 Documentation Files

1. **README.md** (in Assignment folder) - Feature overview and usage
2. **INTEGRATION_GUIDE.md** - Detailed integration instructions
3. **BACKEND_DOCUMENTATION.md** - Complete backend API documentation

## 🧪 Testing with Dummy Data

The system works out-of-the-box with dummy data stored in localStorage:

- **Sample Assignment**: "Probability and Statistics Assignment 1"
- **Sample Students**: John Doe, Jane Smith, Bob Johnson
- **Sample Questions**: Mix of subjective and objective

To test:
1. Navigate to a course page
2. Click "New Assignment" (if integrated)
3. Create an assignment using the wizard
4. View as student and submit answers
5. Grade as teacher

## ⚠️ Important Notes

1. **Dummy Data**: All data is stored in localStorage and will reset on page refresh
2. **AI Generation**: Currently uses dummy data - replace with actual AI service
3. **File Storage**: PDF uploads use object URLs - replace with proper storage service
4. **Authentication**: Uses localStorage for student ID - replace with auth context
5. **Course Context**: Assumes specific structure - adapt to your context

## 🔄 Migration Checklist

- [ ] Copy all files to your project
- [ ] Install required dependencies
- [ ] Update import paths
- [ ] Create/adapt CourseContext
- [ ] Replace dummy store with API calls
- [ ] Integrate file upload service
- [ ] Connect authentication
- [ ] Add routes (if using React Router)
- [ ] Test assignment creation
- [ ] Test student submission
- [ ] Test teacher grading
- [ ] Customize styling (if needed)

## 🆘 Troubleshooting

**Q: Components not rendering?**
- Check import paths match your project structure
- Verify all dependencies are installed
- Check browser console for errors

**Q: Course data not loading?**
- Verify CourseContext is properly set up
- Check context provider wraps your components
- Adapt course data structure if different

**Q: Dummy data not persisting?**
- This is expected - localStorage resets on refresh
- Replace with API calls for persistence

**Q: Styling looks broken?**
- Ensure Tailwind CSS is configured
- Check Tailwind content paths include Assignment folder

## 📞 Support

For detailed API specifications, see `BACKEND_DOCUMENTATION.md`.

For integration help, see `INTEGRATION_GUIDE.md`.

## 📄 License

This code is provided as-is for integration into your LMS project.

---

**Ready to integrate?** Start with `INTEGRATION_GUIDE.md` for step-by-step instructions!

