import express, { type Request, type Response } from "express";
import AccountService from "./AccountService";
import { AccountDAODatabase } from "./AccountDAO";

const app = express();
app.use(express.json());

const accountDAO = new AccountDAODatabase();
const accountService = new AccountService(accountDAO);

app.post("/signup", async (req: Request, res: Response) => {
  const account = req.body as any;
  try {
    const accountCreated = await accountService.signup(account);
    res.status(201).json(accountCreated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/accounts/:accountId", async (req: Request, res: Response) => {
  const { accountId } = req.params as { accountId: string };
  try {
    const account = await accountService.getById(accountId);
    res.status(200).json(account);
  } catch(error: any) {
    res.status(404).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});