import { Router, type Request, type Response } from "express";
import type { StreamService } from "../services/StreamService";


export function createStreamRoutes(streamService: StreamService) {
  const router = Router();

  router.post("/stream", async (req: Request, res: Response) => {
    const stream = req.body as any;
    try {
      const streamCreated = await streamService.create(stream);
      res.status(201).json(streamCreated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get("/stream/id/:streamId", async (req: Request, res: Response) => {
    const streamId = req.params.streamId as string;
    try {
      const stream = await streamService.getById(streamId);
      res.status(200).json(stream);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  router.get("/stream/account/:accountId", async (req: Request, res: Response) => {
    const accountId = req.params.accountId as string;
    try {
      const streams = await streamService.listByAccountId(accountId);
      res.status(200).json(streams);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.put("/stream/:streamId/end", async (req: Request, res: Response) => {
    const streamId = req.params.streamId as string;
    try {
      const stream = await streamService.endStream(streamId);
      res.status(200).json(stream);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  router.get("/stream/:streamKey", async (req: Request, res: Response) => {
    const streamKey = req.params.streamKey as string;
    try {
      const stream = await streamService.getByStreamKey(streamKey);
      res.status(200).json(stream);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}