import { ensureDatabaseSchema } from "./schemaInit";
import { getDbPool } from "./client";

jest.mock("./client", () => {
  const mockQuery = jest.fn();
  return {
    getDbPool: jest.fn(() => ({
      query: mockQuery,
    })),
  };
});

describe("ensureDatabaseSchema - Admin Bootstrap", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.ADMIN_BOOTSTRAP;
    delete process.env.ADMIN_BOOTSTRAP_PASSWORD;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should skip bootstrap when environment variables are not set", async () => {
    const mockPool = getDbPool();
    (mockPool.query as jest.Mock).mockResolvedValue({ rowCount: 0, rows: [] });

    await ensureDatabaseSchema();

    // Verify no insert into admin_users was called
    const queryCalls = (mockPool.query as jest.Mock).mock.calls;
    const insertCalls = queryCalls.filter((call) =>
      typeof call[0] === "string" && call[0].includes("INSERT INTO admin_users")
    );
    expect(insertCalls.length).toBe(0);
  });
});
