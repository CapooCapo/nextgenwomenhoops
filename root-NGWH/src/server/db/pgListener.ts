import { Client } from "pg";
import { EventEmitter } from "events";

class MatchListenerManager {
  private static instance: MatchListenerManager;
  private emitter: EventEmitter = new EventEmitter();
  private client: Client | null = null;
  private isConnecting: boolean = false;
  private isConnected: boolean = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.emitter.setMaxListeners(500);
  }

  public static getInstance(): MatchListenerManager {
    if (!MatchListenerManager.instance) {
      MatchListenerManager.instance = new MatchListenerManager();
    }
    return MatchListenerManager.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected || this.isConnecting) return;
    this.isConnecting = true;

    try {
      const connectionString = process.env.DATABASE_URL;
      const useSsl =
        process.env.POSTGRES_SSL === "true" ||
        (Boolean(connectionString) &&
          !connectionString?.includes("localhost") &&
          !connectionString?.includes("127.0.0.1"));

      const config = connectionString
        ? {
            connectionString,
            ssl: useSsl ? { rejectUnauthorized: false } : false,
          }
        : {
            host: process.env.POSTGRES_HOST || "postgres",
            port: Number(process.env.POSTGRES_PORT || 5432),
            database: process.env.POSTGRES_DB || "nextgen_women_hoops",
            user: process.env.POSTGRES_USER || "postgres",
            password: process.env.POSTGRES_PASSWORD || "postgres",
            ssl: useSsl ? { rejectUnauthorized: false } : false,
          };

      this.client = new Client(config);

      this.client.on("error", (err) => {
        if (process.env.NODE_ENV !== "test") {
          console.error("[PgListener] Client connection error:", err.message);
        }
        this.handleDisconnect();
      });

      this.client.on("end", () => {
        this.handleDisconnect();
      });

      this.client.on("notification", (msg) => {
        if (msg.channel === "match_updates" && msg.payload) {
          this.emitter.emit("match_update", msg.payload);
        }
      });

      await this.client.connect();
      await this.client.query("LISTEN match_updates");
      this.isConnected = true;
      this.isConnecting = false;

      if (process.env.NODE_ENV !== "test") {
        console.log("[PgListener] Successfully connected and listening on 'match_updates'");
      }
    } catch (err) {
      this.isConnecting = false;
      if (process.env.NODE_ENV !== "test") {
        console.error("[PgListener] Failed to connect PostgreSQL listener:", err);
      }
      this.scheduleReconnect();
    }
  }

  private handleDisconnect(): void {
    this.isConnected = false;
    this.isConnecting = false;
    if (this.client) {
      try {
        this.client.removeAllListeners();
        this.client.end().catch(() => {});
      } catch {
        // Ignore cleanup errors
      }
      this.client = null;
    }
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }

  public subscribe(callback: (payload: string) => void): () => void {
    this.connect();
    this.emitter.on("match_update", callback);
    return () => {
      this.emitter.off("match_update", callback);
    };
  }

  public emitMockUpdate(payload: string): void {
    this.emitter.emit("match_update", payload);
  }
}

export const matchListener = MatchListenerManager.getInstance();

export function subscribeMatchUpdates(callback: (payload: string) => void): () => void {
  return matchListener.subscribe(callback);
}
