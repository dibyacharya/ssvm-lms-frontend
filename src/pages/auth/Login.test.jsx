import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import React from "react";

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...rest }) => <div {...rest}>{children}</div>,
  },
}));

jest.mock("lucide-react", () => {
  const Icon = (props) => <svg {...props} />;
  return {
    Mail: Icon,
    Lock: Icon,
    Eye: Icon,
    EyeOff: Icon,
  };
});

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    login: jest.fn(),
  }),
}));

jest.mock("../../services/api", () => ({
  authService: {
    login: jest.fn(),
  },
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

describe("Login copy", () => {
  test("shows User ID label and placeholder", () => {
    renderLogin();
    expect(
      screen.getByLabelText("User ID (Roll No / Enrolment No / Employee ID)")
    ).toBeTruthy();
    expect(screen.getByPlaceholderText("Enter User ID")).toBeTruthy();
  });

  test("does not render old helper text", () => {
    renderLogin();
    expect(
      screen.queryByText(
        "Use Roll No / Enrollment No / Employee ID (or email if applicable)"
      )
    ).toBeNull();
  });
});
