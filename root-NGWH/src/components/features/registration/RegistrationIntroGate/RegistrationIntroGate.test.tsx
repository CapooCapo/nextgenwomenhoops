import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { RegistrationIntroGate } from "./RegistrationIntroGate";

jest.mock("../RegistrationIntro/RegistrationIntro", () => ({
  RegistrationIntro: ({ onComplete }: { onComplete: () => void }) => (
    <div data-testid="intro" onClick={onComplete}>Intro</div>
  ),
}));

describe("RegistrationIntroGate", () => {
  it("renders children if hasSeenIntro is true", () => {
    render(
      <RegistrationIntroGate hasSeenIntro={true}>
        <div data-testid="child">Child</div>
      </RegistrationIntroGate>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.queryByTestId("intro")).not.toBeInTheDocument();
  });

  it("renders intro if hasSeenIntro is false, then children when complete", () => {
    render(
      <RegistrationIntroGate hasSeenIntro={false}>
        <div data-testid="child">Child</div>
      </RegistrationIntroGate>
    );
    expect(screen.getByTestId("intro")).toBeInTheDocument();
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    
    fireEvent.click(screen.getByTestId("intro")); // simulate onComplete
    
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.queryByTestId("intro")).not.toBeInTheDocument();
  });
});
