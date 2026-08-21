/**
 * @jest-environment node
 */
import { GET } from "./[...path]/route";
import { NextRequest } from "next/server";
import { Stats } from "fs";
import fsPromises from "fs/promises";

jest.mock("fs/promises");

describe("Media Route Security, MEDIA_ROOT Resolution, and Range Requests", () => {
  const originalMediaRoot = process.env.MEDIA_ROOT;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (originalMediaRoot !== undefined) {
      process.env.MEDIA_ROOT = originalMediaRoot;
    } else {
      delete process.env.MEDIA_ROOT;
    }
  });

  it("1. MEDIA_ROOT resolution: should use process.env.MEDIA_ROOT if set", async () => {
    process.env.MEDIA_ROOT = "/var/data/media";
    const fakeData = Buffer.from("test media root content");

    (fsPromises.stat as jest.MockedFunction<typeof fsPromises.stat>).mockResolvedValueOnce({
      isDirectory: () => false,
      size: fakeData.length,
    } as unknown as Stats);
    (fsPromises.readFile as jest.MockedFunction<typeof fsPromises.readFile>).mockResolvedValueOnce(fakeData);

    const req = new NextRequest("http://localhost:3000/media/test.png");
    const props = { params: Promise.resolve({ path: ["test.png"] }) };

    const res = await GET(req, props);
    expect(res.status).toBe(200);
    expect(fsPromises.stat).toHaveBeenCalledWith(
      expect.stringContaining("/var/data/media")
    );
  });

  it("2. Media path traversal protection: should reject directory traversal attempts with 403 Forbidden", async () => {
    const req = new NextRequest("http://localhost:3000/media/../../etc/passwd");
    const props = { params: Promise.resolve({ path: ["..", "..", "etc", "passwd"] }) };

    const res = await GET(req, props);
    expect(res.status).toBe(403);
    expect(await res.text()).toBe("Forbidden");
  });

  it("3. Hero media URL: should serve hero media under /media/hero/<uuid>/<filename>", async () => {
    const fakeHeroVideo = Buffer.from("fake hero video binary content");
    (fsPromises.stat as jest.MockedFunction<typeof fsPromises.stat>).mockResolvedValueOnce({
      isDirectory: () => false,
      size: fakeHeroVideo.length,
    } as unknown as Stats);
    (fsPromises.readFile as jest.MockedFunction<typeof fsPromises.readFile>).mockResolvedValueOnce(fakeHeroVideo);

    const heroPathSegments = ["hero", "uuid-1234", "hero_bg.mp4"];
    const req = new NextRequest("http://localhost:3000/media/hero/uuid-1234/hero_bg.mp4");
    const props = { params: Promise.resolve({ path: heroPathSegments }) };

    const res = await GET(req, props);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("video/mp4");
    expect(fsPromises.stat).toHaveBeenCalledWith(
      expect.stringContaining("hero/uuid-1234/hero_bg.mp4")
    );
  });

  it("4. Club media URL: should format and serve club logo/doc URLs under /media/clubs/registrations/...", async () => {
    const formattedUrl = "/media/clubs/registrations/club-uuid-5678/logo.png";

    const fakeLogo = Buffer.from("fake logo image");
    (fsPromises.stat as jest.MockedFunction<typeof fsPromises.stat>).mockResolvedValueOnce({
      isDirectory: () => false,
      size: fakeLogo.length,
    } as unknown as Stats);
    (fsPromises.readFile as jest.MockedFunction<typeof fsPromises.readFile>).mockResolvedValueOnce(fakeLogo);

    const req = new NextRequest(`http://localhost:3000${formattedUrl}`);
    const props = { params: Promise.resolve({ path: ["clubs", "registrations", "club-uuid-5678", "logo.png"] }) };

    const res = await GET(req, props);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/png");
  });

  it("5. Media route: should serve existing file within media directory with correct headers", async () => {
    const fakeData = Buffer.from("fake image data");
    (fsPromises.stat as jest.MockedFunction<typeof fsPromises.stat>).mockResolvedValueOnce({
      isDirectory: () => false,
      size: fakeData.length,
    } as unknown as Stats);
    (fsPromises.readFile as jest.MockedFunction<typeof fsPromises.readFile>).mockResolvedValueOnce(fakeData);

    const req = new NextRequest("http://localhost:3000/media/sample.jpg");
    const props = { params: Promise.resolve({ path: ["sample.jpg"] }) };

    const res = await GET(req, props);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/jpeg");
    expect(res.headers.get("Accept-Ranges")).toBe("bytes");
  });

  it("6. Video range request: should support Range header and return 206 Partial Content", async () => {
    const fakeVideoData = Buffer.from("0123456789abcdef");
    (fsPromises.stat as jest.MockedFunction<typeof fsPromises.stat>).mockResolvedValueOnce({
      isDirectory: () => false,
      size: fakeVideoData.length,
    } as unknown as Stats);
    (fsPromises.readFile as jest.MockedFunction<typeof fsPromises.readFile>).mockResolvedValueOnce(fakeVideoData);

    const req = new NextRequest("http://localhost:3000/media/hero/test_video.mp4", {
      headers: { range: "bytes=0-4" },
    });
    const props = { params: Promise.resolve({ path: ["hero", "test_video.mp4"] }) };

    const res = await GET(req, props);
    expect(res.status).toBe(206);
    expect(res.headers.get("Content-Type")).toBe("video/mp4");
    expect(res.headers.get("Accept-Ranges")).toBe("bytes");
    expect(res.headers.get("Content-Range")).toBe("bytes 0-4/16");
    expect(res.headers.get("Content-Length")).toBe("5");
    const body = await res.arrayBuffer();
    expect(Buffer.from(body).toString()).toBe("01234");
  });

  it("should return 416 Range Not Satisfiable for invalid range request", async () => {
    const fakeData = Buffer.from("short");
    (fsPromises.stat as jest.MockedFunction<typeof fsPromises.stat>).mockResolvedValueOnce({
      isDirectory: () => false,
      size: fakeData.length,
    } as unknown as Stats);

    const req = new NextRequest("http://localhost:3000/media/video.mp4", {
      headers: { range: "bytes=100-200" },
    });
    const props = { params: Promise.resolve({ path: ["video.mp4"] }) };

    const res = await GET(req, props);
    expect(res.status).toBe(416);
    expect(res.headers.get("Content-Range")).toBe("bytes */5");
  });

  it("should return 404 Not Found if file does not exist", async () => {
    (fsPromises.stat as jest.MockedFunction<typeof fsPromises.stat>).mockRejectedValueOnce(
      new Error("ENOENT")
    );

    const req = new NextRequest("http://localhost:3000/media/missing.png");
    const props = { params: Promise.resolve({ path: ["missing.png"] }) };

    const res = await GET(req, props);
    expect(res.status).toBe(404);
  });
});
