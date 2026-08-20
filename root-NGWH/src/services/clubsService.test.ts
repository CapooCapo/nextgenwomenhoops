import { getClubById, getClubs, registerClub } from "./clubsService";

describe("clubsService", () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
  });

  it("fetches the unfiltered club list endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await getClubs();

    const requestedUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(requestedUrl.pathname).toBe("/api/clubs");
    expect(requestedUrl.searchParams.has("province_region")).toBe(false);
    expect(mockFetch.mock.calls[0][1]).toEqual({ cache: "no-store" });
  });

  it("includes province_region as a query param when provided", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await getClubs({ provinceRegion: "Hanoi" });

    const requestedUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(requestedUrl.searchParams.get("province_region")).toBe("Hanoi");
  });

  it("returns the parsed JSON body on success", async () => {
    const responseData = {
      data: [{ id: 1, name: "Test Club" }],
      pagination: { page: 1, limit: 9, total: 1, totalPages: 1 },
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => responseData,
    });

    await expect(getClubs()).resolves.toEqual(responseData);
  });

  it("throws when the response is not ok", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(getClubs()).rejects.toThrow("Failed to fetch clubs: 500");
  });
});

describe("getClubById", () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
  });

  it("fetches the club detail endpoint by id", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 1 }),
    });

    await getClubById(1);

    const requestedUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(requestedUrl.pathname).toBe("/api/clubs/1");
    expect(mockFetch.mock.calls[0][1]).toEqual({ cache: "no-store" });
  });

  it("returns the parsed JSON body on success", async () => {
    const club = { id: 1, name: "Test Club" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => club,
    });

    await expect(getClubById(1)).resolves.toEqual(club);
  });

  it("returns null when the response is a 404 (not found or unapproved)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({}),
    });

    await expect(getClubById(999)).resolves.toBeNull();
  });

  it("throws on any other non-ok status", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(getClubById(1)).rejects.toThrow("Failed to fetch club 1: 500");
  });
});

describe("registerClub", () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
  });

  it("POSTs the given FormData, unmodified, to the club-list endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      status: 201,
      json: async () => ({ id: 1, name: "New Club" }),
    });
    const formData = new FormData();
    formData.set("name", "New Club");

    await registerClub(formData);

    const [requestedUrl, options] = mockFetch.mock.calls[0];
    expect(new URL(requestedUrl).pathname).toBe("/api/clubs");
    expect(options).toEqual({ method: "POST", body: formData });
  });

  it("returns ok:true with the echoed club on 201", async () => {
    const club = { id: 1, name: "New Club" };
    mockFetch.mockResolvedValueOnce({ status: 201, json: async () => club });

    await expect(registerClub(new FormData())).resolves.toEqual({ ok: true, club });
  });

  it("returns ok:false with DRF's field errors on 400", async () => {
    const fieldErrors = { name: ["This field is required."] };
    mockFetch.mockResolvedValueOnce({ status: 400, json: async () => fieldErrors });

    await expect(registerClub(new FormData())).resolves.toEqual({
      ok: false,
      fieldErrors,
    });
  });

  it("returns ok:false with HTTP status on an unexpected status", async () => {
    mockFetch.mockResolvedValueOnce({ status: 500, statusText: "Internal Server Error", json: async () => ({}) });

    await expect(registerClub(new FormData())).resolves.toEqual({
      ok: false,
      status: 500,
      message: "Internal Server Error",
    });
  });

  it("returns ok:false with networkError when fetch itself rejects", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network down"));

    await expect(registerClub(new FormData())).resolves.toEqual({
      ok: false,
      networkError: true,
    });
  });
});
