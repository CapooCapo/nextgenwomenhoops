import React from "react";
import { render, screen } from "@testing-library/react";
import { FormField } from "./FormField";

describe("FormField", () => {
  it("renders children correctly", () => {
    render(
      <FormField>
        <label>Username</label>
        <input type="text" />
      </FormField>
    );
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders error message when provided", () => {
    render(
      <FormField error="This field is required">
        <input type="text" />
      </FormField>
    );
    expect(screen.getByRole("alert")).toHaveTextContent("This field is required");
  });
});
