# Backend Changes Required for Ungraded Assignment Feature

## Overview
This document outlines the backend changes required to support the "Ungraded Assignment" feature that has been implemented in the frontend.

## Frontend Changes Summary
The frontend has been updated to include:
- An "Ungraded Assignment" toggle in the Scheduling section of the assignment creation form
- When the toggle is enabled, the "Total Points" field is disabled/greyed out
- The form sends `isUngraded` boolean field and sets `totalPoints` to 0 when ungraded

## Backend API Changes Required

### 1. Assignment Creation Endpoint
**Endpoint:** `POST /api/assignments/:courseID`

**Required Changes:**
- Accept a new field `isUngraded` (boolean) in the request body
- When `isUngraded` is `true`:
  - Set `totalPoints` to 0 (or handle as ungraded)
  - Store the `isUngraded` flag in the assignment document
- Validate that if `isUngraded` is `true`, `totalPoints` should be 0 or ignored

**Request Body Example:**
```json
{
  "title": "Assignment Title",
  "description": "Assignment Description",
  "instructions": "Assignment Instructions",
  "totalPoints": 0,
  "isUngraded": true,
  "isActive": true,
  "allowLateSubmissions": true,
  "module": "module_id",
  "dueDate": "2024-12-31T23:59:00",
  "questions": [...]
}
```

### 2. Assignment Update Endpoint
**Endpoint:** `PUT /api/assignments/:assignmentID`

**Required Changes:**
- Accept `isUngraded` field in the request body
- Update the assignment document with the `isUngraded` flag
- When `isUngraded` is `true`, ensure `totalPoints` is set to 0

### 3. Assignment Model/Schema Changes
**Database Schema Updates:**
- Add `isUngraded` field (Boolean, default: `false`) to the Assignment model/schema
- Ensure the field is properly indexed if needed for queries

**Example Schema Addition:**
```javascript
{
  // ... existing fields
  isUngraded: {
    type: Boolean,
    default: false
  }
}
```

### 4. Assignment Retrieval Endpoints
**Endpoints:** 
- `GET /api/assignments/:courseID`
- `GET /api/assignments/:assignmentID`

**Required Changes:**
- Include `isUngraded` field in the response
- Ensure the field is returned in all assignment list and detail responses

### 5. Grading/Scoring Logic Updates
**Areas to Update:**
- Grading calculation logic should skip assignments where `isUngraded` is `true`
- Gradebook/analytics should handle ungraded assignments appropriately
- Student submission views should indicate when an assignment is ungraded
- Teacher grading interfaces should not show scoring options for ungraded assignments

### 6. Validation Rules
**Business Logic:**
- If `isUngraded` is `true`, `totalPoints` must be 0 (or should be ignored)
- If `isUngraded` is `false`, `totalPoints` should be a valid positive number
- Questions in ungraded assignments may still have points, but they should not contribute to overall scoring

### 7. Migration Script (if applicable)
If existing assignments need to be migrated:
- Set `isUngraded: false` for all existing assignments
- This ensures backward compatibility

## Testing Checklist
- [ ] Create assignment with `isUngraded: true`
- [ ] Create assignment with `isUngraded: false`
- [ ] Update assignment to toggle `isUngraded` status
- [ ] Verify ungraded assignments don't affect grade calculations
- [ ] Verify student views show ungraded status appropriately
- [ ] Verify teacher views handle ungraded assignments correctly
- [ ] Test edge cases (switching between graded/ungraded)

## Notes
- The frontend sends `isUngraded` as a string in FormData, so backend should parse it as boolean
- When `isUngraded` is true, the frontend sets `totalPoints` to 0, but backend should validate this
- Consider adding validation to prevent setting `isUngraded: false` with `totalPoints: 0` (unless that's a valid use case)

## Related Files
- Frontend: `src/pages/Assignment/components/AssignmentDetailsStep.jsx`
- Frontend: `src/pages/Assignment/teacher/CreateAssignmentNew.jsx`
- Frontend: `src/pages/Assignment/components/ReviewStep.jsx`

---

# Backend Changes Required for Assignment Attachments Feature

## Overview
This document outlines the backend changes required to support assignment-level attachments functionality that has been implemented in the frontend.

## Frontend Changes Summary
The frontend has been updated to include:
- Assignment-level attachment upload functionality in the Questions step
- Support for multiple file attachments (PDF, DOC, DOCX, Images, etc.)
- Auto-generation of subjective questions when attachments are added
- Attachments are sent as multipart/form-data files in the request

## Backend API Changes Required

### 1. Assignment Creation Endpoint - Attachments Support
**Endpoint:** `POST /api/assignment/courses/:courseID/assignments`

**Current Issue:**
- Backend is giving error for attachments instead of the actual files
- Files are being sent via FormData with field name `attachments` (multiple files with same field name)

**Required Changes:**
- Accept multiple file attachments via `multipart/form-data`
- Field name: `attachments` (can be sent multiple times, one per file)
- Parse and store attachment files properly
- Return attachment URLs or IDs in the response

**Request Format:**
```
Content-Type: multipart/form-data

FormData fields:
- title: string
- description: string
- instructions: string
- totalPoints: number (as string)
- totalScore: number (as string, optional - sum of all question scores, calculated by frontend)
- isUngraded: boolean (as string)
- isActive: boolean (as string)
- allowLateSubmissions: boolean (as string)
- module: string (module ID)
- dueDate: string (ISO format)
- questions: string (JSON stringified array)
  - Each subjective question can have a "score" field (individual score for that question)
  - Frontend will calculate totalScore as sum of all question scores
- attachments: File (can be multiple, same field name)
```

**Questions Array Example:**
```json
[
  {
    "question": "Question 1 text",
    "type": "subjective",
    "points": 20,
    "score": 20  // Individual score (optional, for subjective questions)
  },
  {
    "question": "Question 2 text",
    "type": "subjective",
    "points": 30,
    "score": 30  // Individual score (optional, for subjective questions)
  }
]
// totalScore would be 50 (sum of all scores, sent separately in FormData)
```

**Expected Behavior:**
- Backend should accept multiple files with the same field name `attachments`
- Store files in a file storage system (local filesystem, S3, Azure Blob, etc.)
- Save file metadata (name, size, type, URL/path) in the assignment document
- Return attachment information in the assignment response

**Response Format:**
```json
{
  "assignment": {
    "_id": "assignment_id",
    "title": "Assignment Title",
    "attachments": [
      {
        "_id": "attachment_id",
        "name": "assignment.pdf",
        "size": 102400,
        "type": "application/pdf",
        "url": "https://storage.example.com/assignments/attachment_id.pdf",
        "uploadedAt": "2024-01-01T00:00:00Z"
      }
    ],
    // ... other assignment fields
  }
}
```

### 2. Assignment Update Endpoint - Attachments Support
**Endpoint:** `PUT /api/assignment/assignments/:assignmentID`

**Required Changes:**
- Accept new file attachments via FormData
- Handle existing attachments (preserve or replace)
- Support for removing attachments (if IDs are sent as JSON array)
- Update attachment list in assignment document

**Request Format:**
- New files: `attachments` field with File objects
- Existing attachments to keep: `attachments` field with JSON stringified array of attachment IDs
- Backend should merge new files with existing attachment IDs

### 3. Assignment Model/Schema Changes
**Database Schema Updates:**
- Add `attachments` field (Array of Objects) to the Assignment model/schema

**Example Schema Addition:**
```javascript
{
  // ... existing fields
  attachments: [{
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new Types.ObjectId()
    },
    name: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    path: {
      type: String, // Internal storage path
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}
```

### 4. File Storage Requirements
**Storage Options:**
- Local filesystem storage (for development)
- Cloud storage (AWS S3, Azure Blob Storage, Google Cloud Storage) for production
- Files should be stored in a dedicated directory/folder for assignments
- Generate unique filenames to avoid conflicts

**File Naming Convention:**
- Recommended: `{assignmentId}_{timestamp}_{originalFilename}` or `{attachmentId}_{originalFilename}`
- Sanitize filenames to prevent security issues

### 5. Assignment Retrieval Endpoints - Include Attachments
**Endpoints:** 
- `GET /api/assignment/courses/:courseID/assignments`
- `GET /api/assignment/assignments/:assignmentID`

**Required Changes:**
- Include `attachments` array in all assignment responses
- Ensure attachment URLs are accessible and properly formatted
- Include file metadata (name, size, type) in responses

### 6. Auto-Generated Question from Attachments
**Special Case:**
- When attachments are added to a subjective assignment, the frontend automatically creates a question:
  - Question text: "Solve the given assignment questions in the attached sheet(s)."
  - Type: "subjective"
  - Points: Uses total assignment points (not per-question grading)
  - Source: "attachment-auto"
- Backend should accept and store this auto-generated question like any other question
- The question will have `source: "attachment-auto"` in the question object

### 7. Per-Question Scoring for Subjective Questions
**Feature Requirement:**
- Each subjective question should have its own individual score/points
- Frontend will calculate and send `totalScore` as the sum of all individual question scores
- Backend should accept individual question scores and the totalScore from frontend
- Backend should validate that totalScore matches the sum of individual question scores (optional validation)

**Request Format:**
```json
{
  "questions": [
    {
      "question": "Question 1 text",
      "type": "subjective",
      "points": 20,
      "score": 20  // Individual score for this question
    },
    {
      "question": "Question 2 text",
      "type": "subjective",
      "points": 30,
      "score": 30  // Individual score for this question
    }
  ],
  "totalScore": 50  // Sum of all question scores (calculated by frontend)
}
```

**Database Schema Updates:**
- Add `score` field to question objects in the questions array (optional, for subjective questions)
- Add `totalScore` field to assignment document (optional, can be calculated from questions if not provided)

**Example Schema Addition:**
```javascript
{
  // ... existing fields
  questions: [{
    question: String,
    type: String,
    points: Number,
    score: Number,  // Individual score for this question (optional, for subjective)
    // ... other question fields
  }],
  totalScore: {
    type: Number,
    default: function() {
      // Can be calculated from sum of question scores if not provided
      return this.questions.reduce((sum, q) => sum + (q.score || 0), 0);
    }
  }
}
```

**Backend Behavior:**
- Accept `score` field for each subjective question in the questions array
- Accept `totalScore` field in the assignment document
- Frontend will calculate and send totalScore, backend should accept it as-is
- Backend can optionally validate that totalScore equals sum of question scores (for data integrity)
- If totalScore is not provided, backend can calculate it from question scores
- When grading submissions, use individual question scores for detailed feedback

**Note:** Frontend implementation will be done later. Backend should be prepared to accept these fields.

### 8. Validation Rules
**Business Logic:**
- Validate file types (allow: PDF, DOC, DOCX, Images, etc.)
- Validate file sizes (recommended max: 10-50MB per file)
- Validate total number of attachments (recommended max: 10-20 files)
- Ensure attachment URLs are valid and accessible
- When assignment is deleted, delete associated attachment files from storage

### 9. Error Handling
**Required Error Responses:**
- File too large: `400 Bad Request` with message "File size exceeds maximum allowed size"
- Invalid file type: `400 Bad Request` with message "File type not allowed"
- Storage error: `500 Internal Server Error` with message "Failed to store attachment"
- Missing file: `400 Bad Request` with message "Attachment file is required"

## Testing Checklist
- [ ] Create assignment with single attachment
- [ ] Create assignment with multiple attachments
- [ ] Create assignment with attachments and auto-generated question
- [ ] Update assignment to add new attachments
- [ ] Update assignment to remove attachments
- [ ] Retrieve assignment and verify attachments are included
- [ ] Verify attachment URLs are accessible
- [ ] Test file size limits
- [ ] Test invalid file types
- [ ] Test with no attachments (should work normally)
- [ ] Verify attachments are deleted when assignment is deleted
- [ ] Create assignment with subjective questions having individual scores
- [ ] Verify totalScore is accepted when sent from frontend
- [ ] Verify totalScore validation (optional - should match sum of question scores)
- [ ] Test assignment creation with score field for each subjective question
- [ ] Test assignment update with score field modifications

## Implementation Notes
- **Content-Type Header**: Frontend sends FormData with `multipart/form-data`. Backend should NOT require explicit Content-Type header as browser sets it automatically with boundary.
- **Multiple Files**: When multiple files are sent with the same field name `attachments`, backend should parse all of them (not just the first one).
- **File Parsing**: Use appropriate middleware (e.g., `multer` for Express.js, `multipart` for other frameworks) to parse FormData and extract files.
- **Security**: 
  - Validate file types server-side (don't trust client-side validation)
  - Scan files for viruses/malware if possible
  - Sanitize filenames to prevent path traversal attacks
  - Set appropriate file permissions

## Current Frontend Implementation
- Files are sent via FormData with field name `attachments`
- Multiple files can be appended with the same field name
- Files are filtered to ensure only File objects are sent
- Logging is included for debugging attachment uploads

## Related Files
- Frontend: `src/pages/Assignment/teacher/CreateAssignmentNew.jsx`
- Frontend: `src/pages/Assignment/components/QuestionsStep.jsx`
- Frontend: `src/pages/Assignment/components/ReviewStep.jsx`
- Frontend: `src/services/assignment.service.js`



