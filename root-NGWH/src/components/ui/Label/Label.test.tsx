import React from "react";
import { render, screen } from "@testing-library/react";
import { Label } from "./Label";

describe("Label", () => {
  it("renders correctly", () => {
    render(<Label htmlFor="test">Test Label</Label>);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("renders required asterisk", () => {
    render(<Label required>Required Label</Label>);
    expect(screen.getByText("*")).toBeInTheDocument();
  });
});
