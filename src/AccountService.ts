import crypto from "crypto";
import { validateEmail, validatePassword, validateName } from "./validates/validateAccount";
import type { AccountDAO } from "./AccountDAO";


export default class AccountService {
  constructor(private accountDAO: AccountDAO) {}

  async signup(account: any) {

    if (!validateEmail(account.email)) {
      throw new Error("Invalid email");
    }
    if (!validatePassword(account.password)) {
      throw new Error("Invalid password");
    }
    if (!validateName(account.name)) {
      throw new Error("Invalid name");
    }

    const accountId = crypto.randomUUID();
    account.account_id = accountId;

    await this.accountDAO.save(account);
    return account;
  }

  async getById(id: string) {
    const account = await this.accountDAO.getById(id);
    if (!account) {
      throw new Error("Account not found");
    }
    return account;
  }
}