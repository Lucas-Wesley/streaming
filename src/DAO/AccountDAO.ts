import pgPromise from "pg-promise";
export interface AccountDAO {
  save(account: any): Promise<any>;
  getById(id: string): Promise<any>;
  getByEmail(email: string): Promise<any>;
  deleteById(id: string): Promise<any>;
}

export class AccountDAODatabase implements AccountDAO {

  private connection: any;

  constructor() {
    const pgp = pgPromise({});
    this.connection = pgp("postgres://postgres:postgres@db:5432/streaming");
  }

  async save(account: any) {
    await this.connection.query(
      "INSERT INTO streaming.accounts (account_id, name, email, password, stream_key) VALUES ($1, $2, $3, $4, $5)",
      [account.account_id, account.name, account.email, account.password, account.stream_key]
    );
  }

  async getByEmail(email: string) {
    const [result] = await this.connection.query("SELECT * FROM streaming.accounts WHERE email = $1 LIMIT 1", [email]);
    return result;
  }

  async getById(id: string) { 
    const [result] = await this.connection.query("SELECT * FROM streaming.accounts WHERE account_id = $1", [id]);
    return result;
  }

  async deleteById(id: string) {
    await this.connection.query("DELETE FROM streaming.accounts WHERE account_id = $1", [id]);
  }
}
