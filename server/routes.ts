import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { updateCountSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/bars", async (_req, res) => {
    const bars = await storage.getAllBars();
    res.json(bars);
  });

  app.patch("/api/bars/:id/count", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const result = updateCountSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const barId = parseInt(req.params.id);
    const updatedBar = await storage.updateBarCount(barId, result.data.count);
    if (!updatedBar) {
      return res.status(404).send("Bar not found");
    }
    res.json(updatedBar);
  });

  const httpServer = createServer(app);
  return httpServer;
}
