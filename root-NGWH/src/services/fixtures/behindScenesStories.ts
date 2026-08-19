import type { BehindScenesStory } from "@/types/content";

// No behind-the-scenes story is confirmed anywhere in the requirements
// workbook. Unlike News' generic editorial placeholders, a "behind the
// scenes" story inherently depicts specific real moments — inventing one
// would fabricate business data (RULES.md R006). BehindScenesSection
// renders its designed empty state instead (.ai/lld/gallery.md §9).
export const BEHIND_SCENES_STORIES_FIXTURE: BehindScenesStory[] = [];
