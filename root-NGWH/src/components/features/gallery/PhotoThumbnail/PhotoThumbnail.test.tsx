import React from "react";
import { render, screen } from "@testing-library/react";
import { PhotoThumbnail } from "./PhotoThumbnail";

jest.mock("next-intl", () => ({
  useLocale: () => "en",
}));

describe("PhotoThumbnail", () => {
  it("renders correctly", () => {
    const photo = { src: "/photo.jpg", alt: { en: "Test alt", vi: "Test alt vi" } };
    render(<PhotoThumbnail photo={photo} />);
    expect(screen.getByRole("img", { name: "Test alt" })).toBeInTheDocument();
  });
});
