# Quick-Start Guideline: Component Mapping & Workflow Diagram

## Audience: Dev & QA Leads
### Outcome: Clean mapping sheet + self-explanatory workflow diagram.

---

## 1. 5-Step Process

### Step 1: List Core Actions
Brainstorm every high-level user action for Student, Teacher, Admin. Examples include:
- Log in
- View dashboard
- Upload lecture
- Take quiz
- Grade assignment
- View reports

### Step 2: Use the Mapping Template
Fill one row per action using the provided mapping template.

### Step 3: Verify Ownership
Ensure that each component has a clear owning squad or microservice.

### Step 4: Draft the Workflow Diagram
Sequence the actions in a Mermaid diagram (or your favorite tool) to visualize request flow & agent hops.

### Step 5: QC Gate
Ensure every mapped service has at least one automated test and an alert metric.

---

## 2. Mapping Template

Copy this table to a Google Sheet:

| #  | User Action           | UI Component      | API / Service | Data Store                     | AI / Worker | QC Check                          |
|----|-----------------------|-------------------|---------------|---------------------------------|--------------|-----------------------------------|
| 1  | Log in                | LoginPage         | auth-svc      | users table (PostgreSQL)       | none         | auth unit test, login alert rule  |
| 2  | View dashboard        | DashboardLayout    | dashboard-svc | user_dashboard table (PostgreSQL) | none         | dashboard E2E test, dashboard alert |
| 3  | Upload lecture        | UploadLecturePage  | content-svc   | lectures bucket (MinIO)        | none         | upload unit test, upload alert rule |
| 4  | Take quiz             | QuizView          | quiz-svc      | quizzes table (PostgreSQL)     | none         | quiz E2E test, quiz alert rule    |
| 5  | Grade assignment      | GradeAssignmentPage| grading-svc   | assignments table (PostgreSQL) | none         | grading unit test, grading alert rule |
| 6  | View reports          | ReportsPage       | reports-svc   | reports table (PostgreSQL)     | none         | reports E2E test, reports alert rule |

(Add rows as needed)

---

## Quick Reference for Column Values

- **UI Component**: React component or page (e.g., LoginPage, DashboardLayout, QuizView).
- **API / Service**: FastAPI micro-service (e.g., auth-svc, course-svc).
- **Data Store**: PostgreSQL table, MinIO bucket, Redis key, etc.
- **AI / Worker**: Retrieval agent, LLM generator, cron retrainer, etc.
- **QC Check**: Unit test name, E2E test id, alert rule, lint.

---

## 3. Example Row (for reference)

| #  | User Action           | UI Component      | API / Service | Data Store                     | AI / Worker | QC Check                          |
|----|-----------------------|-------------------|---------------|---------------------------------|--------------|-----------------------------------|
| 7  | Play lecture video    | VideoPlayer       | content-svc   | lectures bucket (MinIO)        | none         | DRM token test, CDN latency <400 ms |

---

## 4. Building the Workflow Diagram

1. Collect the rows from the sheet.
2. Group by service call order (Auth → Course → Content, etc.).
3. Use Mermaid syntax like:

```mermaid
sequenceDiagram
    participant UI
    participant AUTH
    participant DASHBOARD
    participant CONTENT
    participant QUIZ
    participant GRADING
    participant REPORTS

    UI->>AUTH: login()
    AUTH-->>UI: JWT
    UI->>DASHBOARD: fetchDashboard()
    DASHBOARD-->>UI: dashboard data
    UI->>CONTENT: uploadLecture()
    CONTENT-->>UI: upload success
    UI->>QUIZ: takeQuiz()
    QUIZ-->>UI: quiz data
    UI->>GRADING: gradeAssignment()
    GRADING-->>UI: grading success
    UI->>REPORTS: fetchReports()
    REPORTS-->>UI: reports data
```

Keep each hop label under 40 chars. Target total latency budget (P95): < 1 s.

---

## 5. Deliverables Checklist

- [ ] Mapping sheet complete & peer-reviewed
- [ ] Mermaid diagram committed to /docs/flows/ folder (or PNG in Confluence)