import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Profile from "./Profile";

const mockUseAuth = jest.fn();
const mockGetMyProfile = jest.fn();
const mockGetMyProgress = jest.fn();
const mockUpdateMyProfile = jest.fn();
const mockUploadMyProfilePhoto = jest.fn();
const mockDeleteMyProfilePhoto = jest.fn();

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("../../services/profile.service", () => ({
  __esModule: true,
  default: {
    getMyProfile: (...args) => mockGetMyProfile(...args),
    getMyProgress: (...args) => mockGetMyProgress(...args),
    updateMyProfile: (...args) => mockUpdateMyProfile(...args),
    uploadMyProfilePhoto: (...args) => mockUploadMyProfilePhoto(...args),
    deleteMyProfilePhoto: (...args) => mockDeleteMyProfilePhoto(...args),
  },
}));

jest.mock("lucide-react", () => {
  const Icon = (props) => <svg {...props} />;
  return {
    AlertTriangle: Icon,
    ArrowLeft: Icon,
    Edit3: Icon,
    Loader2: Icon,
    RefreshCw: Icon,
    Save: Icon,
    X: Icon,
    Camera: Icon,
    ChevronDown: Icon,
    ChevronRight: Icon,
    Trash2: Icon,
  };
});

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const renderProfile = () =>
  render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  );

describe("LMS Profile page", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { role: "student", userType: "student", _id: "student-1" },
      updateUser: jest.fn(),
    });
    mockGetMyProfile.mockResolvedValue({
      success: true,
      user: { _id: "student-1", role: "student", userType: "student", name: "Student One" },
      academicSummary: {
        rollNo: "RL-001",
        enrolmentNo: "EN-001",
        registrationNo: "REG-001",
        program: "MBA",
        stream: "Finance",
        batch: "2025",
        academicYear: "2025-26",
        session: "Autumn",
        currentStage: "Semester 1",
        currentSemester: 1,
      },
      personalDetails: {
        "Email id": "student.one@example.com",
        "Designation": "Intern",
      },
    });
    mockGetMyProgress.mockResolvedValue({
      success: true,
      semesters: [
        {
          semesterNo: 1,
          academicYear: "2025-26",
          season: "Autumn",
          status: "Backlog",
          totalCredits: 16,
          sgpa: 7.25,
          cgpa: 7.25,
          hasBacklog: true,
          courses: [
            {
              courseCode: "FIN101",
              courseName: "Finance Basics",
              credit: 4,
              grade: "F",
              isBacklog: true,
            },
          ],
        },
      ],
    });
    mockUpdateMyProfile.mockResolvedValue({
      success: true,
      message: "updated",
    });
    mockUploadMyProfilePhoto.mockResolvedValue({ success: true });
    mockDeleteMyProfilePhoto.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("student view renders progress, expands semester, and saves edits", async () => {
    renderProfile();

    await waitFor(() => {
      expect(screen.getByText("Student Profile")).toBeInTheDocument();
    });
    expect(screen.getByText("Program Progress")).toBeInTheDocument();

    await userEvent.click(screen.getByText("1st"));
    expect(await screen.findByText("Semester Course Progress")).toBeInTheDocument();
    expect(screen.getByText("FIN101")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^Edit$/i }));
    const emailInput = await screen.findByPlaceholderText("Enter Email id");
    expect(emailInput).toBeDisabled();

    const designationInput = screen.getByPlaceholderText("Enter Designation");
    await userEvent.clear(designationInput);
    await userEvent.type(designationInput, "Mentor");
    await userEvent.click(screen.getByRole("button", { name: /^Save$/i }));

    await waitFor(() => {
      expect(mockUpdateMyProfile).toHaveBeenCalled();
    });
    expect(mockUpdateMyProfile.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        personalDetails: expect.objectContaining({
          Designation: expect.stringContaining("Mentor"),
        }),
      })
    );
  });

  test("teacher view renders template and keeps protected identifiers read-only", async () => {
    mockUseAuth.mockReturnValue({
      user: { role: "teacher", userType: "teacher", _id: "teacher-1" },
      updateUser: jest.fn(),
    });
    mockGetMyProfile.mockResolvedValue({
      success: true,
      user: { _id: "teacher-1", role: "teacher", userType: "teacher", name: "Teacher One" },
      personalDetails: {
        Title: "Dr",
        First: "Asha",
        Last: "Patra",
        "Official Email ID": "asha@example.com",
        "Personal Email ID": "asha.personal@example.com",
      },
    });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByText("Teacher Profile")).toBeInTheDocument();
      expect(screen.getByText("Teacher Details")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /^Edit$/i }));
    const ssvmMailInput = await screen.findByPlaceholderText("Enter Official Email ID");
    expect(ssvmMailInput).toBeDisabled();
  });
});
