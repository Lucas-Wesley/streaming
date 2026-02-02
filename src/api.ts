import express, { type Request, type Response, type NextFunction } from "express";
import AccountService from "./AccountService";
import { AccountDAODatabase } from "./AccountDAO";
import path from "path";
import { fileURLToPath } from "url";
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { logRequest, logResponse } from "./lib/logs";
import { errorHandler } from "./lib/errorHandler";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(logRequest);
app.use(logResponse);

const accountDAO = new AccountDAODatabase();
const accountService = new AccountService(accountDAO);

const protectedRoutes = ['/accounts', '/streams'];

app.use((req: Request, res: Response, next: NextFunction) => {
  
  const isProtectedRoute = protectedRoutes.some(route => req.url.startsWith(route));

  if (!isProtectedRoute) {
    return next();
  }

  const accessToken = req.headers.authorization?.replace('Bearer ', '');

  if (!accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET as string);
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

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

app.delete("/accounts/:accountId", async (req: Request, res: Response) => {
  const { accountId } = req.params as { accountId: string };
  try {
    await accountService.deleteById(accountId);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch(error: any) {
    res.status(404).json({ error: error.message });
  }
});

app.post("/signin", async (req: Request, res: Response) => {
  const account = req.body as any;
  try {
    const accountSignedIn = await accountService.signin(account);
    res.status(200).json(accountSignedIn);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/authStream', (req, res) => {
  const streamKey = req.body as { streamKey: string };
  console.log(`Autorizado! ✅ [OBS Conectado] Tentando transmitir com a chave: ${streamKey}`);
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
    const streamKey = process.env.KEY_STREAM || 'default';
    const htmlPath = path.join(__dirname, 'front-end', 'index.html');
    
    // Lê o HTML e substitui a chave
    const fs = require('fs');
    let html = fs.readFileSync(htmlPath, 'utf8');
    html = html.replace("const streamKey = 'lcuas';", `const streamKey = '${streamKey}';`);
    
    res.send(html);
});

// Tratamento de erros global
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (!error) {
    return next();
  }
  errorHandler(error, req, res, next);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

