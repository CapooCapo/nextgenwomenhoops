import React from "react";
import { render, screen } from "@testing-library/react";
import { MediaSlot } from "./MediaSlot";

describe("MediaSlot", () => {
  it("renders an image correctly", () => {
    render(<MediaSlot src="/test.jpg" alt="Test Image" />);
    const img = screen.getByRole("img", { name: "Test Image" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/test.jpg");
  });

  it("renders a video correctly", () => {
    render(<MediaSlot src="/test.mp4" alt="Test Video" type="video" />);
    const video = screen.getByTitle("Test Video");
    expect(video).toBeInTheDocument();
    expect(video.tagName).toBe("VIDEO");
    expect(video).toHaveAttribute("src", "/test.mp4");
  });
});
