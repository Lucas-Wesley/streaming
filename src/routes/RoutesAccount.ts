import { Router, type Request, type Response } from "express";
import type AccountService from "../services/AccountService";

export function createAccountRoutes(accountService: AccountService) {
  const router = Router();

  router.post("/signup", async (req: Request, res: Response) => {
    const account = req.body as any;
    try {
      const accountCreated = await accountService.signup(account);
      res.status(201).json(accountCreated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.post("/signin", async (req: Request, res: Response) => {
    const account = req.body as any;
    try {
      const accountSignedIn = await accountService.signin(account);
      res.status(200).json(accountSignedIn);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get("/accounts/:accountId", async (req: Request, res: Response) => {
    const { accountId } = req.params as { accountId: string };
    try {
      const account = await accountService.getById(accountId);
      res.status(200).json(account);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  router.delete("/accounts/:accountId", async (req: Request, res: Response) => {
    const { accountId } = req.params as { accountId: string };
    try {
      await accountService.deleteById(accountId);
      res.status(200).json({ message: "Account deleted successfully" });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  return router;
}
