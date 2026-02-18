import pgPromise from "pg-promise";

export interface ChannelDAO {
  listFollowing(accountId: string): Promise<any[]>;
  listLive(): Promise<any[]>;
}

export class ChannelDAODatabase implements ChannelDAO {

  private connection: any;

  constructor() {
    const pgp = pgPromise({});
    this.connection = pgp("postgres://postgres:postgres@db:5432/streaming");
  }

  async listFollowing(accountId: string): Promise<any[]> {
    return [];
  }

  async listLive(): Promise<any[]> {
    const result = await this.connection.query(
      "SELECT * FROM streaming.streams WHERE is_online = $1",
      [true]
    );
    return result;
  }

}