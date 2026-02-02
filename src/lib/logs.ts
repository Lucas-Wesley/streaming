import type { Request, Response, NextFunction } from "express";

export function logRequest(req: Request, res: Response, next: NextFunction) {
  const timestamp = new Date().toISOString().split(".")[0];
  console.log(`request - [${timestamp}] ${req.method} ${req.url}`);
  next();
}

export function logResponse(req: Request, res: Response, next: NextFunction) {
  res.on("finish", () => {
    const timestamp = new Date().toISOString().split(".")[0];
    console.log(
      `response - [${timestamp}] ${req.method} ${req.url} ${res.statusCode} ${res.statusMessage}
      --------------------------------`
    );
  });
  next();
}
