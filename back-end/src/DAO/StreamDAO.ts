import pgPromise from "pg-promise";

export interface StreamDAO {
  create(stream: any): Promise<any>;
  getByStreamKey(streamKey: string): Promise<any>;
  getById(streamId: string): Promise<any>;
  listByAccountId(accountId: string): Promise<any[]>;
  getOnlineByAccountId(accountId: string): Promise<any>;
  updateOnlineStatus(streamId: string, isOnline: boolean): Promise<void>;
}

export class StreamDAODatabase implements StreamDAO {
  private connection: any;

  constructor() {
    const pgp = pgPromise({});
    this.connection = pgp("postgres://postgres:postgres@db:5432/streaming");
  }

  async create(stream: any) {
    await this.connection.query("INSERT INTO streaming.streams (stream_id, account_id, title, stream_key, is_online) VALUES ($1, $2, $3, $4, $5)",
      [stream.stream_id, stream.account_id, stream.title, stream.stream_key, stream.is_online]);
  }


  async getByStreamKey(streamKey: string) {
    const rows = await this.connection.query("SELECT * FROM streaming.streams WHERE stream_key = $1", [streamKey]);
    return rows[0] ?? null;
  }

  async getById(streamId: string) {
    const rows = await this.connection.query("SELECT * FROM streaming.streams WHERE stream_id = $1", [streamId]);
    return rows[0] ?? null;
  }

  async listByAccountId(accountId: string) {
    const rows = await this.connection.query(
      "SELECT * FROM streaming.streams WHERE account_id = $1 ORDER BY created_at DESC",
      [accountId]
    );
    return rows ?? [];
  }

  async getOnlineByAccountId(accountId: string) {
    const rows = await this.connection.query(
      "SELECT * FROM streaming.streams WHERE account_id = $1 AND is_online = true",
      [accountId]
    );
    return rows[0] ?? null;
  }

  async updateOnlineStatus(streamId: string, isOnline: boolean) {
    await this.connection.query(
      "UPDATE streaming.streams SET is_online = $1 WHERE stream_id = $2",
      [isOnline, streamId]
    );
  }
}