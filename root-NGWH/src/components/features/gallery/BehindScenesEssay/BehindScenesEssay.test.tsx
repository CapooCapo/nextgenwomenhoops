/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import { BehindScenesEssay } from "./BehindScenesEssay";

jest.mock("next-intl", () => ({
  useLocale: () => "en",
}));

jest.mock("../PhotoThumbnail/PhotoThumbnail", () => ({
  PhotoThumbnail: () => <div data-testid="photo">Photo</div>,
}));

describe("BehindScenesEssay", () => {
  it("renders correctly with photo", () => {
    const story = {
      title: { en: "Story 1" },
      body: { en: "Body 1" },
      photo: { src: "/photo.jpg", alt: { en: "Alt" } }
    };
    render(<BehindScenesEssay story={story as any} />);
    
    expect(screen.getByText("Story 1")).toBeInTheDocument();
    expect(screen.getByText("Body 1")).toBeInTheDocument();
    expect(screen.getByTestId("photo")).toBeInTheDocument();
  });

  it("renders correctly without photo", () => {
    const story = {
      title: { en: "Story 2" },
      body: { en: "Body 2" },
    };
    render(<BehindScenesEssay story={story as any} />);
    
    expect(screen.getByText("Story 2")).toBeInTheDocument();
    expect(screen.getByText("Body 2")).toBeInTheDocument();
    expect(screen.queryByTestId("photo")).not.toBeInTheDocument();
  });
});
