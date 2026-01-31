import express, { type Request, type Response } from "express";
import AccountService from "./AccountService";
import { AccountDAODatabase } from "./AccountDAO";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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

app.post('/auth', (req, res) => {
  const streamKey = req.body.name;
  console.log(`Autorizado! ✅ [OBS Conectado] Tentando transmitir com a chave: ${streamKey}`);
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'front-end', 'index.html'));
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});