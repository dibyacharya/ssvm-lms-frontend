# AI Question Generation API Documentation

## Overview
This document specifies the API contract for the AI-powered question generation service that creates both subjective (long answer) and objective (MCQ) questions for assignments.

## Base URL
```
POST /api/generate-questions
```

## Request Format

### Content-Type
```
application/x-www-form-urlencoded
```
OR
```
application/json
```

### Request Parameters

#### For Single Question Generation (JSON Format - Recommended)
```json
{
  "course_id": "string (required)",
  "course_title": "string (optional)",
  "course_code": "string (optional)",
  "module_id": "string (optional)",
  "module_name": "string (optional)",
  "selected_cos": ["CO1", "CO2"],  // Array of Course Outcome codes (required)
  "selected_bloom": "string (required)",  // One of: "remember", "understand", "apply", "analyze", "evaluate", "create"
  "selected_type": "string (required)",  // "Long answer" for subjective, "MCQ" or "Multiple choice" for objective
  "extra_prompt": "string (optional)",  // Additional context or instructions
  "num_questions": 1  // Number of questions to generate (default: 1, max: 20)
}
```

#### For Multiple Questions Generation (Form-URL-Encoded Format)
```
selected_cos[]=CO1&selected_cos[]=CO2
selected_bloom[]=apply&selected_bloom[]=analyze
selected_types[]=Long answer&selected_types[]=MCQ
extra_prompt[]=Context 1&extra_prompt[]=Context 2
num_questions=5
course_id=68a42cbdefa0d4e7c4f41706
```

### Parameter Details

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `course_id` | string | Yes | Unique identifier for the course |
| `course_title` | string | No | Full title of the course (helps AI understand context) |
| `course_code` | string | No | Course code (e.g., "CS101") |
| `module_id` | string | No | Module identifier if question is module-specific |
| `module_name` | string | No | Module name/title |
| `selected_cos` | array[string] | Yes | Array of Course Outcome codes (e.g., ["CO1", "CO2"]) |
| `selected_bloom` | string | Yes | Bloom's taxonomy level: "remember", "understand", "apply", "analyze", "evaluate", or "create" |
| `selected_type` | string | Yes | Question type: "Long answer" (subjective) or "MCQ"/"Multiple choice" (objective) |
| `extra_prompt` | string | No | Additional context, specific topics, or instructions for question generation |
| `num_questions` | integer | No | Number of questions to generate (1-20, default: 1) |

### Course Context (Optional but Recommended)
For better question quality, the API can accept additional course context:
```json
{
  "course_syllabus": "string (optional)",  // Full course syllabus text
  "course_outcomes": [  // Array of course outcome objects
    {
      "code": "CO1",
      "description": "Understand fundamental concepts of..."
    }
  ],
  "course_modules": [  // Array of module information
    {
      "id": "module_id",
      "name": "Module Name",
      "content": "Module content description"
    }
  ]
}
```

## Response Format

### Success Response (200 OK)

#### For Subjective Questions
```json
{
  "success": true,
  "questions": [
    {
      "question": "Explain the concept of probability distributions and provide examples of discrete and continuous distributions.",
      "type": "subjective",
      "bloom_level": "understand",
      "co": "CO1",
      "output": "Explain the concept of probability distributions and provide examples of discrete and continuous distributions.",
      "estimated_points": 20,
      "difficulty": "medium"
    }
  ],
  "metadata": {
    "total_generated": 1,
    "generation_time": "2.3s"
  }
}
```

#### For Objective (MCQ) Questions
```json
{
  "success": true,
  "questions": [
    {
      "question": "What is the probability of rolling a 6 on a fair six-sided die?",
      "type": "objective",
      "bloom_level": "remember",
      "co": "CO1",
      "options": [
        "1/6",
        "1/3",
        "1/2",
        "1"
      ],
      "correct_answer": "1/6",
      "correct_answer_index": 0,
      "explanation": "A fair die has 6 equally likely outcomes, so the probability of any specific outcome is 1/6.",
      "estimated_points": 5,
      "difficulty": "easy"
    }
  ],
  "metadata": {
    "total_generated": 1,
    "generation_time": "3.1s"
  }
}
```

### Response Field Details

#### Subjective Question Object
| Field | Type | Description |
|-------|------|-------------|
| `question` | string | The generated question text |
| `type` | string | Always "subjective" for long answer questions |
| `bloom_level` | string | Bloom's taxonomy level (lowercase) |
| `co` | string | Course Outcome code (e.g., "CO1") |
| `output` | string | Same as `question` (for backward compatibility) |
| `estimated_points` | integer | Suggested point value for the question |
| `difficulty` | string | Difficulty level: "easy", "medium", or "hard" |

#### Objective Question Object
| Field | Type | Description |
|-------|------|-------------|
| `question` | string | The generated question text |
| `type` | string | Always "objective" for MCQ questions |
| `bloom_level` | string | Bloom's taxonomy level (lowercase) |
| `co` | string | Course Outcome code (e.g., "CO1") |
| `options` | array[string] | Array of answer options (minimum 2, typically 4) |
| `correct_answer` | string | The correct answer text (must match one of the options) |
| `correct_answer_index` | integer | Index of the correct answer in the options array (0-based) |
| `explanation` | string | Explanation of why the answer is correct (optional but recommended) |
| `estimated_points` | integer | Suggested point value for the question |
| `difficulty` | string | Difficulty level: "easy", "medium", or "hard" |

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Missing required parameter: selected_cos",
  "details": {
    "field": "selected_cos",
    "issue": "required"
  }
}
```

### 422 Unprocessable Entity
```json
{
  "success": false,
  "error": "Invalid Parameter",
  "message": "Invalid Bloom's taxonomy level. Must be one of: remember, understand, apply, analyze, evaluate, create",
  "details": {
    "field": "selected_bloom",
    "value": "invalid_level",
    "allowed_values": ["remember", "understand", "apply", "analyze", "evaluate", "create"]
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Failed to generate questions. Please try again later."
}
```

### 503 Service Unavailable
```json
{
  "success": false,
  "error": "Service Unavailable",
  "message": "AI service is temporarily unavailable. Please try again in a few moments."
}
```

## Example Requests

### Example 1: Generate Single Subjective Question
```bash
curl -X POST https://api.example.com/api/generate-questions \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "68a42cbdefa0d4e7c4f41706",
    "course_title": "Fundamentals of Probability and Statistics",
    "course_code": "CS101",
    "selected_cos": ["CO1"],
    "selected_bloom": "understand",
    "selected_type": "Long answer",
    "extra_prompt": "Focus on practical applications in data analysis",
    "num_questions": 1
  }'
```

### Example 2: Generate Multiple Objective Questions
```bash
curl -X POST https://api.example.com/api/generate-questions \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "68a42cbdefa0d4e7c4f41706",
    "selected_cos": ["CO1", "CO2"],
    "selected_bloom": "apply",
    "selected_type": "MCQ",
    "num_questions": 5,
    "extra_prompt": "Include questions on probability distributions"
  }'
```

### Example 3: Form-URL-Encoded Request (Legacy Format)
```bash
curl -X POST https://api.example.com/api/generate-questions \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "selected_cos[]=CO1&selected_bloom[]=analyze&selected_types[]=Long answer&extra_prompt[]=Generate based on course content&num_questions=3"
```

## Frontend Integration

### Current Frontend Implementation
The frontend currently sends requests in form-url-encoded format for multiple questions:

```javascript
const requestBody = new URLSearchParams();
for (let i = 0; i < numQuestions; i++) {
  requestBody.append("selected_cos[]", courseOutcome);
  requestBody.append("selected_bloom[]", bloomLevel);
  requestBody.append("selected_types[]", "Long answer");
  requestBody.append("extra_prompt[]", additionalContext || "Generate based on course content");
}

const response = await fetch(apiEndpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: requestBody.toString(),
});
```

### Expected Response Processing
```javascript
const data = await response.json();

if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
  const generatedQuestions = data.questions.map((q_item, index) => {
    // For subjective questions
    if (q_item.type === 'subjective' || q_item.type === 'Long answer') {
      return {
        id: `ai_${Date.now()}_${index}`,
        question: q_item.question || q_item.output || '',
        type: 'subjective',
        bloomLevel: q_item.bloom_level || q_item.bloomLevel || bloomLevel.toLowerCase(),
        courseOutcome: q_item.co || courseOutcome,
        points: q_item.estimated_points || 20,
        source: 'ai',
        status: 'pending'
      };
    }
    
    // For objective questions
    if (q_item.type === 'objective' || q_item.type === 'MCQ') {
      return {
        id: `ai_${Date.now()}_${index}`,
        question: q_item.question || '',
        type: 'objective',
        options: q_item.options || [],
        correctAnswer: q_item.correct_answer || q_item.correctAnswer || '',
        bloomLevel: q_item.bloom_level || q_item.bloomLevel || bloomLevel.toLowerCase(),
        courseOutcome: q_item.co || courseOutcome,
        points: q_item.estimated_points || 5,
        source: 'ai',
        status: 'pending'
      };
    }
  });
}
```

## Validation Rules

### Required Fields
- `selected_cos`: Must be a non-empty array
- `selected_bloom`: Must be one of the valid Bloom's taxonomy levels
- `selected_type`: Must be "Long answer" (subjective) or "MCQ"/"Multiple choice" (objective)

### Bloom's Taxonomy Levels
- `remember`: Recall facts and basic concepts
- `understand`: Explain ideas or concepts
- `apply`: Use information in new situations
- `analyze`: Draw connections among ideas
- `evaluate`: Justify a stand or decision
- `create`: Produce new or original work

### Question Type Values
- Subjective: `"Long answer"`, `"long answer"`, `"subjective"`, `"essay"`
- Objective: `"MCQ"`, `"mcq"`, `"Multiple choice"`, `"multiple choice"`, `"objective"`

### Constraints
- `num_questions`: Must be between 1 and 20 (inclusive)
- For objective questions: Must generate at least 2 options, typically 4
- For objective questions: `correct_answer` must match one of the options exactly

## Best Practices

### For Better Question Quality
1. **Provide Course Context**: Include `course_title`, `course_code`, and `module_name` when available
2. **Specific Prompts**: Use `extra_prompt` to provide specific topics, difficulty requirements, or formatting instructions
3. **Course Outcomes**: Ensure `selected_cos` codes match actual course outcomes
4. **Batch Generation**: For multiple questions, consider generating them in batches of 5-10 for better performance

### For Objective Questions
1. **Option Count**: Generate 4 options when possible (standard MCQ format)
2. **Distractor Quality**: Ensure incorrect options are plausible distractors
3. **Explanation**: Always include an explanation for the correct answer
4. **Answer Format**: Ensure `correct_answer` exactly matches one of the options (case-sensitive)

### For Subjective Questions
1. **Clarity**: Questions should be clear and unambiguous
2. **Scope**: Questions should be answerable within the expected response length
3. **Alignment**: Questions should align with the specified Bloom's level and course outcome

## Rate Limiting
- Recommended: 10 requests per minute per user
- Burst: Allow up to 20 requests in a short burst
- Return `429 Too Many Requests` if limit exceeded

## Notes for Backend Implementation

1. **Question Uniqueness**: Ensure generated questions are unique and not duplicates
2. **Content Quality**: Validate that questions are grammatically correct and coherent
3. **Alignment**: Verify questions align with the specified Bloom's taxonomy level
4. **Course Outcome Mapping**: Ensure questions properly map to the specified course outcomes
5. **Error Handling**: Provide clear, actionable error messages
6. **Response Time**: Target response time under 5 seconds for single question, under 15 seconds for batch (5 questions)
7. **Caching**: Consider caching course context to improve response times

## Testing Checklist

- [ ] Generate single subjective question
- [ ] Generate single objective question
- [ ] Generate multiple questions (batch)
- [ ] Validate all required parameters
- [ ] Test invalid Bloom's taxonomy levels
- [ ] Test invalid question types
- [ ] Test missing course outcomes
- [ ] Test with course context (course_title, module_name)
- [ ] Test with extra_prompt
- [ ] Verify objective questions have correct_answer matching options
- [ ] Verify objective questions have at least 2 options
- [ ] Test error responses (400, 422, 500, 503)
- [ ] Test rate limiting (429)
- [ ] Verify response format matches specification

