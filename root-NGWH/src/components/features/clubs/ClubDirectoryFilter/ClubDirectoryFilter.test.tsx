import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ClubDirectoryFilter } from "./ClubDirectoryFilter";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/clubs",
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("ClubDirectoryFilter", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders correctly with options", () => {
    render(<ClubDirectoryFilter regions={["North", "South"]} />);
    expect(screen.getByLabelText("filterLabel")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "allRegions" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "North" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "South" })).toBeInTheDocument();
  });

  it("calls push on change", () => {
    render(<ClubDirectoryFilter regions={["North", "South"]} />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "North" } });
    expect(mockPush).toHaveBeenCalledWith("/clubs?region=North&page=1");
  });
});
