import React from "react";
import { render, screen } from "@testing-library/react";
import { ErrorMessage } from "./ErrorMessage";

describe("ErrorMessage", () => {
  it("renders default messages", () => {
    render(<ErrorMessage />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
  });

  it("renders custom messages", () => {
    render(<ErrorMessage title="Oops" message="Data failed to load." />);
    expect(screen.getByText("Oops")).toBeInTheDocument();
    expect(screen.getByText("Data failed to load.")).toBeInTheDocument();
  });
});
