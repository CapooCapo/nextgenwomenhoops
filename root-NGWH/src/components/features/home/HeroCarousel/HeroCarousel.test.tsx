import { render, screen, fireEvent, act } from "@testing-library/react";
import type { StaticImageData } from "next/image";
import { HeroCarousel } from "./HeroCarousel";
import type { HeroVideoSlide } from "@/config/heroSlides";

function mockMatchMedia(prefersReducedMotion: boolean) {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: query === "(prefers-reduced-motion: reduce)" && prefersReducedMotion,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
}

const posterSrc: StaticImageData = { src: "/test-poster.jpg", height: 100, width: 100 };

const slides: HeroVideoSlide[] = [
  { id: "slide-one", videoSrc: "/videos/hero/one.mp4" },
  { id: "slide-two", videoSrc: "/videos/hero/two.mp4" },
  { id: "slide-three", videoSrc: "/videos/hero/three.mp4" },
];

const baseProps = {
  slides,
  posterSrc,
  posterAlt: "Tournament action photo",
  eyebrow: "NG Women Hoops",
  tagline: "Where Tomorrow's Legends Rise",
  description: "Supporting mission copy.",
  ctaLabel: "Explore Tournaments",
  previousLabel: "Previous slide",
  nextLabel: "Next slide",
  goToSlideLabels: ["Go to slide 1", "Go to slide 2", "Go to slide 3"],
};

describe("HeroCarousel", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
    HTMLMediaElement.prototype.pause = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("renders the tagline as the page heading, plus eyebrow, description, and CTA", () => {
    mockMatchMedia(false);
    render(<HeroCarousel {...baseProps} />);

    expect(screen.getByRole("heading", { name: baseProps.tagline })).toBeInTheDocument();
    expect(screen.getByText(baseProps.eyebrow)).toBeInTheDocument();
    expect(screen.getByText(baseProps.description)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: baseProps.ctaLabel })).toHaveAttribute(
      "href",
      "/tournaments",
    );
  });

  it("renders one accessible indicator per slide, plus labeled previous/next controls", () => {
    mockMatchMedia(false);
    render(<HeroCarousel {...baseProps} />);

    expect(screen.getAllByRole("tab")).toHaveLength(slides.length);
    expect(screen.getByRole("tab", { name: "Go to slide 1" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Go to slide 2" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(screen.getByRole("button", { name: "Previous slide" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next slide" })).toBeInTheDocument();
  });

  it("advances to the next slide when the Next control is clicked", () => {
    mockMatchMedia(false);
    render(<HeroCarousel {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Next slide" }));

    expect(screen.getByRole("tab", { name: "Go to slide 2" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("wraps to the last slide when Previous is clicked on the first slide", () => {
    mockMatchMedia(false);
    render(<HeroCarousel {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Previous slide" }));

    expect(screen.getByRole("tab", { name: "Go to slide 3" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("jumps directly to a slide when its indicator is clicked", () => {
    mockMatchMedia(false);
    render(<HeroCarousel {...baseProps} />);

    fireEvent.click(screen.getByRole("tab", { name: "Go to slide 3" }));

    expect(screen.getByRole("tab", { name: "Go to slide 3" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("auto-advances to the next slide after the slide duration", () => {
    mockMatchMedia(false);
    render(<HeroCarousel {...baseProps} />);

    expect(screen.getByRole("tab", { name: "Go to slide 1" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    act(() => {
      jest.advanceTimersByTime(7000);
    });

    expect(screen.getByRole("tab", { name: "Go to slide 2" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("does not auto-advance when prefers-reduced-motion is set, but manual controls still work", () => {
    mockMatchMedia(true);
    render(<HeroCarousel {...baseProps} />);

    act(() => {
      jest.advanceTimersByTime(20000);
    });
    expect(screen.getByRole("tab", { name: "Go to slide 1" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    fireEvent.click(screen.getByRole("button", { name: "Next slide" }));
    expect(screen.getByRole("tab", { name: "Go to slide 2" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("falls back to the poster image with real alt text when the active slide's video errors", () => {
    mockMatchMedia(false);
    const { container } = render(<HeroCarousel {...baseProps} />);

    const activeVideo = container.querySelector("video");
    expect(activeVideo).not.toBeNull();

    fireEvent.error(activeVideo as HTMLVideoElement);

    expect(screen.getByAltText(baseProps.posterAlt)).toBeInTheDocument();
  });
});
