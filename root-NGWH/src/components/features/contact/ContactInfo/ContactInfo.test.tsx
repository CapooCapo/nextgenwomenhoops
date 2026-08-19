import { render, screen } from "@testing-library/react";
import en from "../../../../../messages/en.json";
import { getContactInfo } from "@/services/contentService";
import { ContactInfo } from "./ContactInfo";

jest.mock("@/services/contentService", () => {
  const actual = jest.requireActual("@/services/contentService");
  return {
    __esModule: true,
    ...actual,
    getContactInfo: jest.fn(actual.getContactInfo),
  };
});

jest.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => {
    const value = key
      .split(".")
      .reduce<unknown>((obj, part) => (obj as Record<string, unknown>)?.[part], en);
    if (typeof value !== "string") {
      throw new Error(`Missing test translation for key: ${key}`);
    }
    return value;
  },
  getLocale: async () => "en",
}));

describe("ContactInfo", () => {
  afterEach(() => {
    jest.mocked(getContactInfo).mockClear();
  });

  it("renders the section heading", async () => {
    render(await ContactInfo());
    expect(
      screen.getByRole("heading", { name: en.contact.info.heading }),
    ).toBeInTheDocument();
  });

  it("renders placeholder contact information when fixture contains placeholders", async () => {
    render(await ContactInfo());
    expect(screen.getByText("[Office address will be updated]")).toBeInTheDocument();
    expect(screen.getByText("[Hotline will be updated]")).toBeInTheDocument();
    expect(
      screen.getByText("[Professional support email will be updated]"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("[Sponsorship email will be updated]"),
    ).toBeInTheDocument();
  });

  it("renders the empty state when no contact record exists", async () => {
    jest.mocked(getContactInfo).mockReturnValueOnce(null);
    render(await ContactInfo());
    expect(screen.getByText(en.contact.info.empty)).toBeInTheDocument();
  });

  it("renders the error state, not the empty state, when contentService throws", async () => {
    jest.mocked(getContactInfo).mockImplementationOnce(() => {
      throw new Error("simulated content service failure");
    });

    render(await ContactInfo());
    expect(screen.getByRole("alert")).toHaveTextContent(en.contact.info.error);
    expect(screen.queryByText(en.contact.info.empty)).not.toBeInTheDocument();
  });

  it("renders office address, hotline as a tel: link, and support emails as mailto: links when populated", async () => {
    jest.mocked(getContactInfo).mockReturnValueOnce({
      officeAddress: "123 Le Loi, District 1, Ho Chi Minh City",
      hotline: "+84123456789",
      supportEmails: [
        { label: { en: "Professional Support", vi: "Hỗ trợ chuyên môn" }, email: "support@example.com" },
        { label: { en: "Sponsorship", vi: "Tài trợ" }, email: "sponsor@example.com" },
      ],
    });

    render(await ContactInfo());

    expect(screen.getByText("123 Le Loi, District 1, Ho Chi Minh City")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+84123456789" })).toHaveAttribute(
      "href",
      "tel:+84123456789",
    );
    expect(screen.getByRole("link", { name: "support@example.com" })).toHaveAttribute(
      "href",
      "mailto:support@example.com",
    );
    expect(screen.getByText("Professional Support")).toBeInTheDocument();
    expect(screen.queryByText(en.contact.info.empty)).not.toBeInTheDocument();
  });
});
