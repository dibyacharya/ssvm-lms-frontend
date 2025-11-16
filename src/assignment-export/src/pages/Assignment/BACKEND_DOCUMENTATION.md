# Assignment System - Backend Documentation

## Overview
This document provides comprehensive information about the Assignment System structure, API endpoints, data models, and workflow for the backend development team.

## Table of Contents
1. [Data Models](#data-models)
2. [API Endpoints](#api-endpoints)
3. [Workflow](#workflow)
4. [File Structure](#file-structure)
5. [Sample Data](#sample-data)

---

## Data Models

### Assignment Model

```javascript
{
  _id: ObjectId,
  title: String,                    // Required
  description: String,              // Required
  instructions: String,             // Optional
  course: ObjectId,                 // Reference to Course
  module: ObjectId,                 // Reference to Module
  totalPoints: Number,              // Default: 100
  dueDate: Date,                    // ISO date string
  isActive: Boolean,                // Default: true
  questions: [Question],             // Array of question objects
  submissions: [Submission],         // Array of submission objects
  createdAt: Date,
  updatedAt: Date
}
```

### Question Model

```javascript
{
  _id: ObjectId,
  question: String,                 // Required
  type: String,                    // 'subjective' or 'objective'
  points: Number,                  // Points for this question
  options: [String],               // For objective questions only
  correctAnswer: String,           // For objective questions only
  bloomLevel: String,              // Optional: 'remember', 'understand', etc.
  courseOutcome: String,           // Optional: 'CO1', 'CO2', etc.
  source: String,                  // 'uploaded', 'generated', 'ai'
  status: String,                  // For AI questions: 'pending', 'approved', 'rejected'
  order: Number                    // Question order in assignment
}
```

### Submission Model

```javascript
{
  _id: ObjectId,
  student: ObjectId,               // Reference to Student
  assignment: ObjectId,             // Reference to Assignment
  submissionDate: Date,            // ISO date string
  submissionFile: String,          // URL/path to uploaded PDF (for subjective)
  answers: {
    subjective: {
      [questionId]: String         // Text answers for subjective questions
    },
    objective: {
      [questionId]: String         // Selected option for objective questions
    }
  },
  objectiveScore: Number,          // Auto-calculated score for objective questions
  grade: Number,                   // Teacher-assigned grade (for subjective)
  feedback: String,                 // Teacher feedback
  status: String,                  // 'submitted', 'graded', 'returned'
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### Assignment Management

#### 1. Create Assignment
```
POST /api/assignment/courses/:courseId/assignments
Content-Type: application/json

Request Body:
{
  title: String,
  description: String,
  instructions: String,
  module: ObjectId,
  totalPoints: Number,
  dueDate: Date,
  isActive: Boolean,
  questions: [Question]
}

Response:
{
  success: Boolean,
  assignment: Assignment,
  message: String
}
```

#### 2. Get All Assignments for a Course
```
GET /api/assignment/courses/:courseId/assignments

Response:
{
  success: Boolean,
  assignments: [Assignment]
}
```

#### 3. Get Assignment by ID
```
GET /api/assignment/assignments/:assignmentId

Response:
{
  success: Boolean,
  assignment: Assignment
}
```

#### 4. Update Assignment
```
PUT /api/assignment/assignments/:assignmentId
Content-Type: application/json

Request Body:
{
  title: String,
  description: String,
  // ... other fields
}

Response:
{
  success: Boolean,
  assignment: Assignment
}
```

#### 5. Delete Assignment
```
DELETE /api/assignment/assignments/:assignmentId

Response:
{
  success: Boolean,
  message: String
}
```

### Submission Management

#### 6. Submit Assignment
```
POST /api/assignment/assignments/:assignmentId/submit
Content-Type: multipart/form-data

Form Data:
- submissionFile: File (optional, for subjective questions)
- answers: JSON string
  {
    subjective: { [questionId]: String },
    objective: { [questionId]: String }
  }

Response:
{
  success: Boolean,
  submission: Submission,
  objectiveScore: Number,  // Auto-calculated
  message: String
}
```

**Note:** For objective questions, the backend should:
1. Validate answers against correct answers
2. Calculate objective score automatically
3. Store the score in `objectiveScore` field

#### 7. Get Student Submission
```
GET /api/assignment/assignments/:assignmentId/submissions/:studentId

Response:
{
  success: Boolean,
  submission: Submission
}
```

#### 8. Get All Submissions for Assignment
```
GET /api/assignment/assignments/:assignmentId/submissions

Query Parameters:
- sortBy: String (optional: 'submitted', 'graded', 'ungraded')
- search: String (optional: search by student name/rollNo)

Response:
{
  success: Boolean,
  submissions: [Submission],
  stats: {
    total: Number,
    submitted: Number,
    graded: Number,
    ungraded: Number
  }
}
```

### Grading Management

#### 9. Grade Submission
```
POST /api/assignment/assignments/:assignmentId/submissions/:submissionId/grade
Content-Type: application/json

Request Body:
{
  grade: Number,           // Total grade for subjective questions
  feedback: String,        // Optional feedback
  questionGrades: {       // Optional: per-question grades
    [questionId]: Number
  }
}

Response:
{
  success: Boolean,
  submission: Submission,
  message: String
}
```

#### 10. Bulk Grade Submissions
```
POST /api/assignment/assignments/:assignmentId/bulk-grade
Content-Type: application/json

Request Body:
{
  grades: [
    {
      submissionId: ObjectId,
      grade: Number,
      feedback: String
    }
  ]
}

Response:
{
  success: Boolean,
  updated: Number,
  message: String
}
```

### AI Question Generation (Dummy for Now)

#### 11. Generate AI Questions
```
POST /api/assignment/generate-questions
Content-Type: application/json

Request Body:
{
  type: String,              // 'subjective' or 'objective'
  numQuestions: Number,
  bloomLevel: String,       // Optional
  module: ObjectId,         // Optional
  courseOutcome: String,    // Optional
  additionalContext: String // Optional
}

Response:
{
  success: Boolean,
  questions: [Question],     // All with status: 'pending'
  message: String
}
```

#### 12. Approve/Reject AI Questions
```
POST /api/assignment/questions/approve
Content-Type: application/json

Request Body:
{
  questionIds: [ObjectId],
  action: String  // 'approve' or 'reject'
}

Response:
{
  success: Boolean,
  updated: Number,
  message: String
}
```

---

## Workflow

### Assignment Creation Flow

1. **Teacher creates assignment:**
   - Fills assignment details (title, description, due date, etc.)
   - Adds questions:
     - **Subjective:** Can use AI generator (requires approval) or manual entry
     - **Objective:** Can upload JSON/CSV, use MCQ generator, or manual entry
   - Reviews and publishes

2. **AI Question Generation (Subjective only):**
   - Teacher requests AI generation
   - Backend generates questions with `status: 'pending'`
   - Teacher reviews in approval modal
   - Teacher approves/rejects questions
   - Approved questions are added to assignment

3. **Question Upload:**
   - Teacher uploads JSON or CSV file
   - Backend parses and validates format
   - Questions are added to assignment

### Student Submission Flow

1. **Student views assignment:**
   - Sees separate tabs for Subjective and Objective questions
   - For Subjective: Can type answers or upload PDF
   - For Objective: Selects options for each MCQ

2. **Student submits:**
   - Submits answers for both types
   - Optional PDF file for subjective questions
   - Backend:
     - Validates submission
     - Calculates objective score automatically
     - Stores submission with `status: 'submitted'`

### Grading Flow

1. **Objective Questions:**
   - Auto-graded on submission
   - Score stored in `submission.objectiveScore`
   - Teacher can view results but cannot modify

2. **Subjective Questions:**
   - Teacher views student submissions
   - Can view uploaded PDF files
   - Assigns grade and feedback
   - Updates `submission.grade` and `submission.feedback`
   - Sets `submission.status: 'graded'`

---

## File Structure

```
src/pages/Assignment/
├── components/
│   ├── AssignmentDetailsStep.jsx    # Step 1: Assignment details form
│   ├── QuestionsStep.jsx             # Step 2: Question management (tabs)
│   ├── ReviewStep.jsx                 # Step 3: Review and publish
│   ├── StepIndicator.jsx              # Progress indicator
│   ├── MCQGenerator.jsx               # Interactive MCQ creator
│   └── AIApprovalModal.jsx            # AI question approval modal
├── hooks/
│   └── useAssignmentStore.js          # Dummy data store hook
├── utils/
│   └── questionParser.js              # JSON/CSV parser utilities
├── teacher/
│   ├── CreateAssignmentNew.jsx       # Main assignment creator
│   └── TeacherAssignmentGrading.jsx  # Grading interface
├── student/
│   └── StudentAssignmentView.jsx      # Student submission interface
└── BACKEND_DOCUMENTATION.md           # This file
```

---

## Sample Data

### Sample JSON Question Format

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
    "correctAnswer": "Mean",
    "bloomLevel": "remember",
    "courseOutcome": "CO1"
  }
]
```

### Sample CSV Question Format

```csv
question,type,option_a,option_b,option_c,option_d,correct_answer,points,bloom_level,course_outcome
What is statistics?,subjective,,,,,20,understand,CO1
Which is a measure of central tendency?,objective,Mean,Range,Variance,Mode,Mean,10,remember,CO1
```

### Sample Assignment Object

```javascript
{
  _id: "assign_123",
  title: "Probability and Statistics Assignment 1",
  description: "Complete the following questions on probability theory",
  instructions: "Show all your work and submit as PDF",
  course: "course_123",
  module: "module_456",
  totalPoints: 100,
  dueDate: "2024-12-31T23:59:00Z",
  isActive: true,
  questions: [
    {
      _id: "q1",
      question: "What is the difference between population and sample?",
      type: "subjective",
      points: 20,
      bloomLevel: "understand",
      courseOutcome: "CO1",
      order: 1
    },
    {
      _id: "q2",
      question: "Which is a measure of central tendency?",
      type: "objective",
      points: 10,
      options: ["Mean", "Range", "Variance", "Mode"],
      correctAnswer: "Mean",
      bloomLevel: "remember",
      courseOutcome: "CO1",
      order: 2
    }
  ],
  submissions: [],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}
```

### Sample Submission Object

```javascript
{
  _id: "sub_123",
  student: "student_456",
  assignment: "assign_123",
  submissionDate: "2024-01-15T10:30:00Z",
  submissionFile: "https://storage.example.com/files/submission_123.pdf",
  answers: {
    subjective: {
      "q1": "A population is the entire group...",
      "q2": "The mean is calculated by..."
    },
    objective: {
      "q3": "Mean",
      "q4": "0"
    }
  },
  objectiveScore: 20,  // Auto-calculated: 2 correct answers × 10 points
  grade: 85,           // Teacher-assigned for subjective (65) + objective (20)
  feedback: "Good work! Show more detailed calculations next time.",
  status: "graded",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-16T14:20:00Z"
}
```

---

## Important Notes

1. **Objective Questions:**
   - Must have `options` array (minimum 2 options)
   - Must have `correctAnswer` matching one of the options
   - Score is calculated automatically on submission
   - Teacher cannot modify objective scores

2. **Subjective Questions:**
   - No `options` or `correctAnswer` fields
   - Students can submit text answers or PDF files
   - Requires manual grading by teacher
   - Teacher can assign per-question grades or total grade

3. **AI Question Generation:**
   - Currently dummy implementation
   - Only generates subjective questions
   - All generated questions have `status: 'pending'`
   - Requires teacher approval before adding to assignment

4. **File Uploads:**
   - Only for subjective question submissions
   - Accepts PDF format
   - Store file URL/path in `submission.submissionFile`

5. **Validation:**
   - Ensure question types match their structure
   - Validate objective answers against correct answers
   - Check due dates before allowing submissions
   - Verify student enrollment in course

---

## Error Handling

All endpoints should return consistent error responses:

```javascript
{
  success: false,
  error: String,
  message: String,
  code: Number  // HTTP status code
}
```

Common error codes:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Security Considerations

1. **Authentication:** All endpoints require valid JWT token
2. **Authorization:**
   - Teachers can create/edit/delete assignments
   - Students can only submit assignments
   - Teachers can grade submissions
   - Students can only view their own submissions
3. **File Upload:** Validate file types and sizes
4. **Data Validation:** Sanitize all user inputs
5. **Rate Limiting:** Implement rate limiting for submission endpoints

---

## Future Enhancements

1. Real AI question generation integration
2. Plagiarism detection for subjective answers
3. Rubric-based grading
4. Peer review functionality
5. Assignment templates
6. Scheduled publishing
7. Late submission handling with penalties
8. Question banks and reuse

---

## Contact

For questions or clarifications, please contact the frontend development team.


