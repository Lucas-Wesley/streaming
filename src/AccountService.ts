import crypto from "crypto";
import { validateEmail, validatePassword, validateName } from "./validates/validateAccount";
import type { AccountDAO } from "./AccountDAO";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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

    account.account_id = crypto.randomUUID();
    account.stream_key = crypto.randomUUID();
    account.password = await bcrypt.hash(account.password, 10);

    await this.accountDAO.save(account);

    account.accessToken = jwt.sign({ accountId: account.account_id, email: account.email },
      process.env.JWT_SECRET as string);
    return account;
  }

  async signin(account: any) {
    if (!validateEmail(account.email)) {
      throw new Error("Invalid email");
    }
    if (!validatePassword(account.password)) {
      throw new Error("Invalid password");
    }
    const accountData = await this.accountDAO.getByEmail(account.email);
    if (!accountData) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(account.password, accountData.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const accessToken = jwt.sign(
      {
        accountId: accountData.account_id,
        email: accountData.email,
        name: accountData.name
      },
      process.env.JWT_SECRET as string
    );
    
    accountData.accessToken = accessToken;
    return accountData;
  }

  async deleteById(id: string) {
    await this.accountDAO.deleteById(id);
  }

  async getById(id: string) {
    const account = await this.accountDAO.getById(id);
    if (!account) {
      throw new Error("Account not found");
    }
    return account;
  }
}