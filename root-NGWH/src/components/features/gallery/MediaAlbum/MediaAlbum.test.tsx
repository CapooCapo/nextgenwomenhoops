/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import { MediaAlbum } from "./MediaAlbum";
import * as contentService from "../../../../services/contentService";

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => key),
}));

jest.mock("../PhotoThumbnail/PhotoThumbnail", () => ({
  PhotoThumbnail: ({ photo }: { photo: any }) => <div data-testid="photo">{photo.src}</div>,
}));

jest.mock("../../../../services/contentService");

describe("MediaAlbum", () => {
  it("renders empty state", async () => {
    (contentService.getChampionshipPhotos as jest.Mock).mockReturnValue([]);
    const ui = await MediaAlbum();
    render(ui);
    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("renders photos grid", async () => {
    (contentService.getChampionshipPhotos as jest.Mock).mockReturnValue([
      { src: "/1.jpg" },
      { src: "/2.jpg" },
    ]);
    const ui = await MediaAlbum();
    render(ui);
    expect(screen.getAllByTestId("photo")).toHaveLength(2);
  });

  it("renders error state", async () => {
    (contentService.getChampionshipPhotos as jest.Mock).mockImplementation(() => {
      throw new Error("Failed");
    });
    const ui = await MediaAlbum();
    render(ui);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("error")).toBeInTheDocument();
  });
});
