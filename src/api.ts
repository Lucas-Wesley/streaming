import express, { type Request, type Response } from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

app.post("/signup", async (req: Request, res: Response) => {
  const { name, email, document, password } = req.body;

  

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