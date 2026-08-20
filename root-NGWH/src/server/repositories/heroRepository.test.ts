import {
  ensureHeroTable,
  findAllHeroSlides,
  createHeroSlide,
  deleteHeroSlide,
} from "./heroRepository";
import { query } from "../db/client";

jest.mock("../db/client", () => ({
  query: jest.fn(),
  queryOne: jest.fn(),
}));

describe("heroRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ensureHeroTable creates table and seeds slides if empty", async () => {
    (query as jest.MockedFunction<typeof query>).mockResolvedValueOnce([]); // create table
    (query as jest.MockedFunction<typeof query>).mockResolvedValueOnce([{ count: "0" }]); // count check

    await ensureHeroTable();
    expect(query).toHaveBeenCalledWith(expect.stringContaining("CREATE TABLE IF NOT EXISTS hero_slides"));
    expect(query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO hero_slides"), expect.any(Array));
  });

  it("findAllHeroSlides returns ordered slides", async () => {
    const mockSlides = [{ id: 1, slide_id: "test", display_order: 1 }];
    (query as jest.MockedFunction<typeof query>).mockResolvedValueOnce([]); // create table
    (query as jest.MockedFunction<typeof query>).mockResolvedValueOnce([{ count: "1" }]); // count check
    (query as jest.MockedFunction<typeof query>).mockResolvedValueOnce(mockSlides); // find all

    const slides = await findAllHeroSlides();
    expect(slides).toEqual(mockSlides);
  });

  it("createHeroSlide inserts slide into database", async () => {
    const mockSlide = { id: 1, slide_id: "new-slide", video_src: "/video.mp4" };
    (query as jest.MockedFunction<typeof query>).mockResolvedValueOnce([]); // create table
    (query as jest.MockedFunction<typeof query>).mockResolvedValueOnce([{ count: "1" }]); // count check
    (query as jest.MockedFunction<typeof query>).mockResolvedValueOnce([mockSlide]); // insert

    const slide = await createHeroSlide({
      slide_id: "new-slide",
      video_src: "/video.mp4",
    });

    expect(slide).toEqual(mockSlide);
  });

  it("deleteHeroSlide executes delete query", async () => {
    (query as jest.MockedFunction<typeof query>).mockResolvedValueOnce([]); // create table
    (query as jest.MockedFunction<typeof query>).mockResolvedValueOnce([{ count: "1" }]); // count check
    (query as jest.MockedFunction<typeof query>).mockResolvedValueOnce([{ id: 1 }]); // delete

    const deleted = await deleteHeroSlide(1);
    expect(deleted).toBe(true);
  });
});
