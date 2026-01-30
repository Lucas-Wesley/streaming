import express, { type Request, type Response } from "express";
import crypto from "crypto";
import pgPromise from "pg-promise";
import { validateEmail, validatePassword, validateName } from "./validates/validateAccount";

const app = express();
app.use(express.json());

const pgp = pgPromise({});
const db = pgp("postgres://postgres:postgres@db:5432/streaming");

app.post("/signup", async (req: Request, res: Response) => {
  const { name, email, document, password } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Email inválido" });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({ error: "Senha inválida" });
  }
  if (!validateName(name)) {
    return res.status(400).json({ error: "Nome inválido" });
  }

  const accountId = crypto.randomUUID();
  const account = {
    account_id: accountId,
    name,
    email,
    document,
    password,
  };

  const result = await db.query("INSERT INTO streaming.account (account_id, name, email, document, password) VALUES ($1, $2, $3, $4, $5)",
    [account.account_id, account.name, account.email, account.document, account.password]);

  res.status(201).json(account);
});

app.get("/accounts/:accountId", async (req: Request, res: Response) => {
  const { accountId } = req.params as { accountId: string };
  const rows = await db.query("SELECT * FROM streaming.account WHERE account_id = $1", [accountId]);
  const account = rows[0];
  if (!account) {
    return res.status(404).json({ error: "Conta não encontrada" });
  }
  res.status(200).json(account);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});