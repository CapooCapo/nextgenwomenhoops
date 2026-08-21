/**
 * @jest-environment node
 */
import { GET } from "./[...path]/route";
import { NextRequest } from "next/server";
import { Stats } from "fs";
import fsPromises from "fs/promises";
import * as clubMediaRepository from "@/server/repositories/clubMediaRepository";
import * as clubsRepository from "@/server/repositories/clubsRepository";
import * as userAuth from "@/server/auth/userAuth";
import * as adminAuth from "@/server/auth/adminAuth";

jest.mock("fs/promises");
jest.mock("@/server/repositories/clubMediaRepository");
jest.mock("@/server/repositories/clubsRepository");
jest.mock("@/server/auth/userAuth");
jest.mock("@/server/auth/adminAuth");

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

  describe("Range header parsing (legacy filesystem branch)", () => {
    const fakeVideoData = Buffer.from("0123456789abcdef"); // 16 bytes

    function mockFile() {
      (fsPromises.stat as jest.MockedFunction<typeof fsPromises.stat>).mockResolvedValueOnce({
        isDirectory: () => false,
        size: fakeVideoData.length,
      } as unknown as Stats);
      (fsPromises.readFile as jest.MockedFunction<typeof fsPromises.readFile>).mockResolvedValueOnce(
        fakeVideoData
      );
    }

    async function requestWithRange(range: string) {
      mockFile();
      const req = new NextRequest("http://localhost:3000/media/hero/test_video.mp4", {
        headers: { range },
      });
      const props = { params: Promise.resolve({ path: ["hero", "test_video.mp4"] }) };
      return GET(req, props);
    }

    it("bytes=500- style (open-ended): returns from start through end of file", async () => {
      const res = await requestWithRange("bytes=10-");
      expect(res.status).toBe(206);
      expect(res.headers.get("Content-Range")).toBe("bytes 10-15/16");
      expect(res.headers.get("Content-Length")).toBe("6");
      const body = await res.arrayBuffer();
      expect(Buffer.from(body).toString()).toBe("abcdef");
    });

    it("bytes=-N (suffix range): returns the final N bytes, not bytes 0-N", async () => {
      const res = await requestWithRange("bytes=-5");
      expect(res.status).toBe(206);
      expect(res.headers.get("Content-Range")).toBe("bytes 11-15/16");
      expect(res.headers.get("Content-Length")).toBe("5");
      const body = await res.arrayBuffer();
      expect(Buffer.from(body).toString()).toBe("bcdef");
    });

    it("bytes=-N where N exceeds the file size: returns the entire file", async () => {
      const res = await requestWithRange("bytes=-500");
      expect(res.status).toBe(206);
      expect(res.headers.get("Content-Range")).toBe("bytes 0-15/16");
      const body = await res.arrayBuffer();
      expect(Buffer.from(body).toString()).toBe(fakeVideoData.toString());
    });

    it("bytes=-0 (zero-length suffix): unsatisfiable, returns 416", async () => {
      mockFile();
      const req = new NextRequest("http://localhost:3000/media/hero/test_video.mp4", {
        headers: { range: "bytes=-0" },
      });
      const props = { params: Promise.resolve({ path: ["hero", "test_video.mp4"] }) };
      const res = await GET(req, props);
      expect(res.status).toBe(416);
    });

    it("malformed range (non-numeric): returns 416 instead of a corrupted slice", async () => {
      mockFile();
      const req = new NextRequest("http://localhost:3000/media/hero/test_video.mp4", {
        headers: { range: "bytes=abc-def" },
      });
      const props = { params: Promise.resolve({ path: ["hero", "test_video.mp4"] }) };
      const res = await GET(req, props);
      expect(res.status).toBe(416);
    });

    it("bytes=500-999 explicit range still works (regression check)", async () => {
      const res = await requestWithRange("bytes=0-4");
      expect(res.status).toBe(206);
      expect(res.headers.get("Content-Range")).toBe("bytes 0-4/16");
      const body = await res.arrayBuffer();
      expect(Buffer.from(body).toString()).toBe("01234");
    });
  });

  describe("Club media authorization (BYTEA branch)", () => {
    const mockGetClubMediaById = clubMediaRepository.getClubMediaById as jest.Mock;
    const mockFindClubById = clubsRepository.findClubById as jest.Mock;
    const mockGetUserSession = userAuth.getUserSession as jest.Mock;
    const mockGetAdminSession = adminAuth.getAdminSession as jest.Mock;

    const fakeMedia = {
      id: 3,
      club_id: 2,
      media_type: "logo",
      mime_type: "image/png",
      data: Buffer.from("fake logo bytes"),
    };

    function req() {
      const request = new NextRequest("http://localhost:3000/media/clubs/2/logo/3");
      const props = { params: Promise.resolve({ path: ["clubs", "2", "logo", "3"] }) };
      return GET(request, props);
    }

    beforeEach(() => {
      mockGetClubMediaById.mockResolvedValue(fakeMedia);
      mockGetUserSession.mockResolvedValue({ authenticated: false, user: null });
      mockGetAdminSession.mockResolvedValue({ authenticated: false, username: null, role: null });
    });

    it("approved club + unauthenticated request -> allowed", async () => {
      mockFindClubById.mockResolvedValue({ id: 2, user_id: 10, is_approved: true });
      const res = await req();
      expect(res.status).toBe(200);
    });

    it("pending club + owner -> allowed", async () => {
      mockFindClubById.mockResolvedValue({ id: 2, user_id: 10, is_approved: false });
      mockGetUserSession.mockResolvedValue({ authenticated: true, user: { id: 10, email: "a@b.com", role: "club_user" } });
      const res = await req();
      expect(res.status).toBe(200);
    });

    it("pending club + unrelated authenticated user -> denied", async () => {
      mockFindClubById.mockResolvedValue({ id: 2, user_id: 10, is_approved: false });
      mockGetUserSession.mockResolvedValue({ authenticated: true, user: { id: 99, email: "x@y.com", role: "club_user" } });
      const res = await req();
      expect(res.status).toBe(404);
    });

    it("pending club + unauthenticated request -> denied", async () => {
      mockFindClubById.mockResolvedValue({ id: 2, user_id: 10, is_approved: false });
      const res = await req();
      expect(res.status).toBe(404);
    });

    it("pending club + admin -> allowed", async () => {
      mockFindClubById.mockResolvedValue({ id: 2, user_id: 10, is_approved: false });
      mockGetAdminSession.mockResolvedValue({ authenticated: true, username: "admin", role: "admin" });
      const res = await req();
      expect(res.status).toBe(200);
    });

    it("pending club + subadmin -> allowed (matches existing admin-read policy)", async () => {
      mockFindClubById.mockResolvedValue({ id: 2, user_id: 10, is_approved: false });
      mockGetAdminSession.mockResolvedValue({ authenticated: true, username: "sub", role: "subadmin" });
      const res = await req();
      expect(res.status).toBe(200);
    });

    it("mediaId belonging to another club -> not found, without revealing it exists", async () => {
      mockGetClubMediaById.mockResolvedValue({ ...fakeMedia, club_id: 999 });
      const res = await req();
      expect(res.status).toBe(404);
      expect(mockFindClubById).not.toHaveBeenCalled();
    });

    it("mediaType mismatch -> not found", async () => {
      mockGetClubMediaById.mockResolvedValue({ ...fakeMedia, media_type: "capability_profile" });
      const res = await req();
      expect(res.status).toBe(404);
    });

    it("non-numeric clubId segment can no longer bypass the club-match check", async () => {
      const request = new NextRequest("http://localhost:3000/media/clubs/abc/logo/3");
      const props = { params: Promise.resolve({ path: ["clubs", "abc", "logo", "3"] }) };
      const res = await GET(request, props);
      expect(res.status).toBe(404);
      expect(mockGetClubMediaById).not.toHaveBeenCalled();
    });
  });
});
