import React from "react";
import { render, screen, act } from "@testing-library/react";
import { RegistrationIntro } from "./RegistrationIntro";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/app/(public)/club-registration/introActions", () => ({
  markRegistrationIntroSeenAction: jest.fn().mockResolvedValue(undefined),
}));

describe("RegistrationIntro", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders correctly and calls onComplete after timeout", () => {
    const onComplete = jest.fn();
    render(<RegistrationIntro onComplete={onComplete} />);
    
    expect(screen.getByText("title")).toBeInTheDocument();
    
    act(() => {
      jest.advanceTimersByTime(2200);
    });
    
    expect(onComplete).toHaveBeenCalled();
  });
});
