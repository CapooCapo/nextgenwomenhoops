/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import { RegistrationForm } from "./RegistrationForm";

// Mock React's useActionState
const mockUseActionState = jest.fn();
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useActionState: (...args: any[]) => mockUseActionState(...args),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("../../../../app/club-registration/actions", () => ({
  submitClubRegistrationAction: jest.fn(),
}));

describe("RegistrationForm", () => {
  it("renders form fields correctly in idle state", () => {
    mockUseActionState.mockReturnValue([
      { status: "idle" },
      jest.fn(),
      false, // isPending
    ]);

    render(<RegistrationForm />);
    expect(screen.getByLabelText(/clubRegistration\.form\.name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/clubRegistration\.form\.region/)).toBeInTheDocument();
    expect(screen.getByLabelText(/clubRegistration\.form\.representative/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "clubRegistration.form.submit" })).toBeInTheDocument();
  });

  it("renders success state", () => {
    mockUseActionState.mockReturnValue([
      { status: "success" },
      jest.fn(),
      false,
    ]);

    render(<RegistrationForm />);
    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("clubRegistration.form.success")).toBeInTheDocument();
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
  });

  it("renders field errors", () => {
    mockUseActionState.mockReturnValue([
      { 
        status: "error", 
        fieldErrors: { name: ["Name is required"] } 
      },
      jest.fn(),
      false,
    ]);

    render(<RegistrationForm />);
    expect(screen.getByText("Name is required")).toBeInTheDocument();
  });
});
