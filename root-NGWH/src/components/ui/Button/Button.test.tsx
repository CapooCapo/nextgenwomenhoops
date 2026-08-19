import React from "react";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders with default props", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
  });

  it("applies variant and size classes", () => {
    render(<Button variant="outline" size="sm">Small Outline</Button>);
    const button = screen.getByRole("button", { name: "Small Outline" });
    expect(button.className).toContain("outline");
    expect(button.className).toContain("sm");
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button", { name: "Disabled" });
    expect(button).toBeDisabled();
  });
});
