import type { Request, Response, NextFunction } from "express";

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (!error) {
    return;
  }

  const errorDetails = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    cause: (error as Error & { cause?: unknown }).cause,
  };

  console.error(
    "Error details:",
    JSON.stringify(
      errorDetails,
      (key, value) => {
        if (key === "stack" && typeof value === "string") {
          return value.split("\n").map((line) => line.trim());
        }
        return value;
      },
      2
    )
  );

  res.status(500).send({ message: "Internal server error" });
}
