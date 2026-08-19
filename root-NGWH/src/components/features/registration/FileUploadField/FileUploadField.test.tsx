import React from "react";
import { render, screen } from "@testing-library/react";
import { FileUploadField } from "./FileUploadField";

describe("FileUploadField", () => {
  it("renders with label and hint", () => {
    render(
      <FileUploadField 
        id="test-file" 
        label="Test Label" 
        hint="Max 5MB" 
      />
    );
    
    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("Max 5MB")).toBeInTheDocument();
  });

  it("renders error", () => {
    render(
      <FileUploadField 
        id="test-file" 
        label="Test Label" 
        error="File too large" 
      />
    );
    
    expect(screen.getByText("File too large")).toBeInTheDocument();
    const input = screen.getByLabelText("Test Label");
    expect(input).toHaveAttribute("aria-describedby", "test-file-error");
  });
});
