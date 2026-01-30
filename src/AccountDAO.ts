import pgPromise from "pg-promise";

export interface AccountDAO {
  save(account: any): Promise<any>;
  getById(id: string): Promise<any>;
}

export class AccountDAODatabase implements AccountDAO {

  private connection: any;

  constructor() {
    const pgp = pgPromise({});
    this.connection = pgp("postgres://postgres:postgres@db:5432/streaming");
  }

  async save(account: any) {
    await this.connection.query(
      "INSERT INTO streaming.account (account_id, name, email, document, password) VALUES ($1, $2, $3, $4, $5)",
      [account.account_id, account.name, account.email, account.document, account.password]
    );
  }

  async getById(id: string) { 
    const [result] = await this.connection.query("SELECT * FROM streaming.account WHERE account_id = $1", [id]);
    return result;
  }
}
