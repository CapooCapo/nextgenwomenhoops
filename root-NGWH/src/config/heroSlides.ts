export interface HeroVideoSlide {
  id: string;
  videoSrc: string;
}

// UX enhancement confirmed against OQ-003 ("Home hero: banner, video, or
// both") by direct stakeholder direction in this session — REQ-HOME-001's
// video slice, previously left unbuilt specifically because OQ-003 was
// unresolved, is now in scope.
//
// No video file exists at any of these paths yet, and this environment
// has no way to download or fabricate one (no outbound binary-fetch
// capability, and stock-footage licensing can't be verified unsupervised)
// — see the Hero carousel implementation report for the full account.
// Each `videoSrc` documents exactly which real, licensed clip belongs at
// that path; HeroCarousel's own onError handling falls back to the
// existing hero photo (BRAND_ASSETS.hero) per slide until a real file is
// added, so the Hero is never broken or blank in the meantime. Adding a
// real .mp4 at any of these paths activates that slide automatically —
// no code change required.
export const HERO_VIDEO_SLIDES: HeroVideoSlide[] = [
  // Female basketball team + coach on an indoor court
  { id: "team-huddle", videoSrc: "/videos/hero/team-huddle.mp4" },
  // Female basketball players training / running a drill
  { id: "training-drill", videoSrc: "/videos/hero/training-drill.mp4" },
  // Female player dribbling the ball
  { id: "dribbling", videoSrc: "/videos/hero/dribbling.mp4" },
  // Female athletes celebrating on court
  { id: "celebration", videoSrc: "/videos/hero/celebration.mp4" },
];
