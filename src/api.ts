import express, { type Request, type Response, type NextFunction } from "express";
import AccountService from "./services/AccountService";
import { AccountDAODatabase } from "./DAO/AccountDAO";
import { createAccountRoutes } from "./routes/RoutesAccount";
import path from "path";
import { fileURLToPath } from "url";
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { logRequest, logResponse } from "./lib/logs";
import { errorHandler } from "./lib/errorHandler";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS: permite requisições do front-end (Nuxt em outra origem)
const allowedOrigin = '*';
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

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
  if (!isProtectedRoute) return next();
  const accessToken = req.headers.authorization?.replace('Bearer ', '');
  if (!accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    jwt.verify(accessToken, process.env.JWT_SECRET as string);
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

app.use(createAccountRoutes(accountService));
app.post('/authStream', (req, res) => {
  const streamKey = req.body as { streamKey: string };
  console.log(`Autorizado! ✅ [OBS Conectado] Tentando transmitir com a chave: ${streamKey}`);
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
    const streamKey = process.env.KEY_STREAM || 'default';
    const htmlPath = path.join(__dirname, '..', 'front-end', 'index.html');
    
    // Lê o HTML e substitui a chave
    const fs = require('fs');
    let html = fs.readFileSync(htmlPath, 'utf8');
    res.send(html);
});

app.get("/api/channels/following", (req, res) => {
  res.status(200).json({ channels: [] });
});

app.get("/api/channels/live", (req, res) => {
  res.status(200).json({ channels: [] });
});

// Tratamento de erros global
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (!error) {
    return next();
  }
  errorHandler(error, req, res, next);
});

app.listen(4444, () => {
  console.log("Server is running on port 4444");
});

