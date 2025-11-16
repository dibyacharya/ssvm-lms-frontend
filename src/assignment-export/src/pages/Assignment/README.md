# Assignment System

A comprehensive assignment creation and management system with support for both subjective and objective questions.

## Features

### Teacher Features
- ✅ Create assignments with separate Subjective and Objective question tabs
- ✅ AI question generation for subjective questions (dummy implementation)
- ✅ AI question approval system (dummy)
- ✅ MCQ generator tool for creating objective questions
- ✅ Upload questions via JSON or CSV files
- ✅ Grade subjective questions manually
- ✅ View auto-calculated results for objective questions
- ✅ Student submission management

### Student Features
- ✅ View assignments with separate Subjective and Objective tabs
- ✅ Answer subjective questions (text input or PDF upload)
- ✅ Answer objective questions (MCQ selection)
- ✅ View submission status and grades
- ✅ View feedback from teachers

## File Structure

```
src/pages/Assignment/
├── components/                    # Reusable components
│   ├── AssignmentDetailsStep.jsx # Step 1: Assignment details
│   ├── QuestionsStep.jsx         # Step 2: Question management
│   ├── ReviewStep.jsx            # Step 3: Review and publish
│   ├── StepIndicator.jsx         # Progress indicator
│   ├── MCQGenerator.jsx          # Interactive MCQ creator
│   └── AIApprovalModal.jsx       # AI question approval
├── hooks/
│   └── useAssignmentStore.js     # Dummy data store hook
├── utils/
│   └── questionParser.js         # JSON/CSV parser utilities
├── teacher/
│   ├── CreateAssignmentNew.jsx  # Main assignment creator
│   └── TeacherAssignmentGrading.jsx # Grading interface
├── student/
│   └── StudentAssignmentView.jsx # Student submission interface
├── BACKEND_DOCUMENTATION.md      # Backend API documentation
└── README.md                     # This file
```

## Usage

### For Teachers

#### Creating an Assignment

1. Import and use `CreateAssignmentNew` component:
```jsx
import CreateAssignmentNew from './pages/Assignment/teacher/CreateAssignmentNew';

<CreateAssignmentNew 
  onSave={(assignmentData) => {
    // Handle assignment creation
    console.log('Assignment created:', assignmentData);
  }}
  onCancel={() => {
    // Handle cancel
  }}
/>
```

2. The component provides a 3-step wizard:
   - **Step 1:** Assignment details (title, description, due date, etc.)
   - **Step 2:** Questions (separate tabs for Subjective and Objective)
   - **Step 3:** Review and publish

#### Grading Submissions

```jsx
import TeacherAssignmentGrading from './pages/Assignment/teacher/TeacherAssignmentGrading';

// Use with route: /teacher/assignment/:assignmentId/grade
<TeacherAssignmentGrading />
```

### For Students

#### Viewing and Submitting Assignments

```jsx
import StudentAssignmentView from './pages/Assignment/student/StudentAssignmentView';

// Use with route: /student/assignment/:assignmentId
<StudentAssignmentView />
```

## Question Types

### Subjective Questions
- Text-based answers
- Optional PDF file upload
- Manual grading by teacher
- AI generation support (dummy)
- AI approval workflow (dummy)

### Objective Questions
- Multiple choice questions (MCQ)
- Auto-calculated scoring
- JSON/CSV upload support
- Interactive MCQ generator
- Immediate feedback

## Data Structure

### Assignment Object
```javascript
{
  _id: String,
  title: String,
  description: String,
  instructions: String,
  course: String,
  module: String,
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
  student: String,
  assignment: String,
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

## Dummy Data

The system uses a dummy data store (`useAssignmentStore`) for development. This will be replaced with actual API calls when connecting to the backend.

### Sample Dummy Data
- 1 sample assignment
- 3 sample students
- Questions with both types

## File Upload Formats

### JSON Format
```json
[
  {
    "question": "What is statistics?",
    "type": "subjective",
    "points": 20,
    "bloomLevel": "understand",
    "courseOutcome": "CO1"
  },
  {
    "question": "Which is a measure of central tendency?",
    "type": "objective",
    "points": 10,
    "options": ["Mean", "Range", "Variance", "Mode"],
    "correctAnswer": "Mean"
  }
]
```

### CSV Format
```csv
question,type,option_a,option_b,option_c,option_d,correct_answer,points
What is statistics?,subjective,,,,,20
Which is a measure?,objective,Mean,Range,Variance,Mode,Mean,10
```

## Integration with Backend

See `BACKEND_DOCUMENTATION.md` for complete API documentation including:
- All endpoints
- Request/response formats
- Data models
- Workflow diagrams
- Error handling

## Current Implementation Status

✅ **Completed:**
- File structure and organization
- Assignment creation UI with tabs
- Subjective question management
- Objective question management
- MCQ generator
- AI approval modal (dummy)
- Student submission interface
- Teacher grading interface
- Objective auto-scoring
- JSON/CSV parsing
- Dummy data store
- Backend documentation

🔄 **To Do (Backend Integration):**
- Replace dummy store with API calls
- Implement file upload handling
- Connect AI generation (currently dummy)
- Add authentication/authorization
- Implement real-time updates
- Add error handling and validation

## Notes

1. **AI Generation:** Currently uses dummy data. Replace with actual AI service when available.
2. **File Storage:** PDF uploads currently use object URLs. Replace with proper file storage service.
3. **State Management:** Uses local state with dummy store. Will need to integrate with Redux/Context when connecting backend.
4. **Validation:** Basic validation in place. Add comprehensive validation when connecting backend.

## Development

All components are built with:
- React Hooks
- Tailwind CSS
- Lucide React Icons
- Dummy data for testing

The system is fully functional with dummy data and ready for backend integration.


