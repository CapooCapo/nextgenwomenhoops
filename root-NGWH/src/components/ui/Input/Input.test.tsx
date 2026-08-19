import React from "react";
import { render, screen } from "@testing-library/react";
import { Input } from "./Input";

describe("Input", () => {
  it("renders correctly", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("applies error styling", () => {
    render(<Input error placeholder="Error input" />);
    expect(screen.getByPlaceholderText("Error input").className).toContain("hasError");
  });
});
