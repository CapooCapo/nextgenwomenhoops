import React from "react";
import { render, screen } from "@testing-library/react";
import { PagePlaceholder } from "./PagePlaceholder";

describe("PagePlaceholder", () => {
  it("renders correctly with title", () => {
    render(<PagePlaceholder title="Test Title" />);
    expect(screen.getByRole("heading", { name: "Test Title" })).toBeInTheDocument();
    expect(screen.getByText("This page is currently under construction.")).toBeInTheDocument();
  });
});
