// Centralized brand image assets — same rationale as brand.ts for text
// values: every component needing these images imports from here rather
// than re-referencing the source files directly, so there is exactly one
// place that knows where the canonical files live.
//
// Source files live in ../../assets/img/ (outside `public/` and outside
// any framework-required path) and are consumed via static import so
// next/image can read their real intrinsic width/height automatically —
// no manual dimensions, no duplicate copies of the asset for ordinary
// component use. `herosection.png` is genuine JPEG data despite its
// extension (confirmed via `file`); `next/image`/webpack read the actual
// bytes, not the extension, so this doesn't cause a decoding problem.
//
// The App Router file-convention icons (src/app/icon.png,
// apple-icon.png, opengraph-image.jpg) are physical copies of these same
// two files — Next.js requires a real file at those exact paths, there
// is no way to "import" a shared reference for them. That is the one
// deliberate exception to "no duplicate copies."
import heroImage from "../../assets/img/herosection.png";
import logoImage from "../../assets/img/image-removebg-preview.png";

export const BRAND_ASSETS = {
  hero: heroImage,
  logo: logoImage,
} as const;
