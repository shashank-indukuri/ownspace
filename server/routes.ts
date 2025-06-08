import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { supabaseConfig } from "./supabase";
import { insertWeddingSchema, insertGuestSchema, insertGuestCategorySchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Supabase configuration endpoint
  app.get('/api/supabase-config', (req, res) => {
    res.json(supabaseConfig);
  });

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Wedding routes
  app.post('/api/weddings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log("Creating wedding for user:", userId);
      console.log("Request body:", req.body);
      
      const weddingData = insertWeddingSchema.parse({ ...req.body, userId });
      console.log("Parsed wedding data:", weddingData);
      
      const wedding = await storage.createWedding(weddingData);
      console.log("Created wedding:", wedding);
      
      res.status(201).json(wedding);
    } catch (error) {
      console.error("Error creating wedding:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      res.status(400).json({ 
        message: "Failed to create wedding",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get('/api/weddings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const weddings = await storage.getWeddingsByUserId(userId);
      res.json(weddings);
    } catch (error) {
      console.error("Error fetching weddings:", error);
      res.status(500).json({ message: "Failed to fetch weddings" });
    }
  });

  app.get('/api/weddings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const weddingId = parseInt(req.params.id);
      const wedding = await storage.getWeddingById(weddingId);
      
      if (!wedding || wedding.userId !== userId) {
        return res.status(404).json({ message: "Wedding not found" });
      }
      
      res.json(wedding);
    } catch (error) {
      console.error("Error fetching wedding:", error);
      res.status(500).json({ message: "Failed to fetch wedding" });
    }
  });

  app.patch('/api/weddings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const weddingId = parseInt(req.params.id);
      const wedding = await storage.getWeddingById(weddingId);
      
      if (!wedding || wedding.userId !== userId) {
        return res.status(404).json({ message: "Wedding not found" });
      }
      
      const updateData = insertWeddingSchema.partial().parse(req.body);
      const updatedWedding = await storage.updateWedding(weddingId, updateData);
      res.json(updatedWedding);
    } catch (error) {
      console.error("Error updating wedding:", error);
      res.status(400).json({ message: "Failed to update wedding" });
    }
  });

  // Guest routes
  app.get('/api/weddings/:weddingId/guests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const weddingId = parseInt(req.params.weddingId);
      const wedding = await storage.getWeddingById(weddingId);
      
      if (!wedding || wedding.userId !== userId) {
        return res.status(404).json({ message: "Wedding not found" });
      }
      
      const guests = await storage.getGuestsByWeddingId(weddingId);
      res.json(guests);
    } catch (error) {
      console.error("Error fetching guests:", error);
      res.status(500).json({ message: "Failed to fetch guests" });
    }
  });

  app.post('/api/weddings/:weddingId/guests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const weddingId = parseInt(req.params.weddingId);
      const wedding = await storage.getWeddingById(weddingId);
      
      if (!wedding || wedding.userId !== userId) {
        return res.status(404).json({ message: "Wedding not found" });
      }
      
      const guestData = insertGuestSchema.parse({ ...req.body, weddingId });
      const guest = await storage.createGuest(guestData);
      res.status(201).json(guest);
    } catch (error) {
      console.error("Error creating guest:", error);
      res.status(400).json({ message: "Failed to create guest" });
    }
  });

  app.patch('/api/guests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const guestId = parseInt(req.params.id);
      const guest = await storage.getGuestById(guestId);
      
      if (!guest) {
        return res.status(404).json({ message: "Guest not found" });
      }
      
      const wedding = await storage.getWeddingById(guest.weddingId);
      if (!wedding || wedding.userId !== userId) {
        return res.status(404).json({ message: "Wedding not found" });
      }
      
      const updateData = insertGuestSchema.partial().parse(req.body);
      const updatedGuest = await storage.updateGuest(guestId, updateData);
      res.json(updatedGuest);
    } catch (error) {
      console.error("Error updating guest:", error);
      res.status(400).json({ message: "Failed to update guest" });
    }
  });

  app.delete('/api/guests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const guestId = parseInt(req.params.id);
      const guest = await storage.getGuestById(guestId);
      
      if (!guest) {
        return res.status(404).json({ message: "Guest not found" });
      }
      
      const wedding = await storage.getWeddingById(guest.weddingId);
      if (!wedding || wedding.userId !== userId) {
        return res.status(404).json({ message: "Wedding not found" });
      }
      
      await storage.deleteGuest(guestId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting guest:", error);
      res.status(500).json({ message: "Failed to delete guest" });
    }
  });

  // CSV upload route
  app.post('/api/weddings/:weddingId/guests/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const weddingId = parseInt(req.params.weddingId);
      const wedding = await storage.getWeddingById(weddingId);
      
      if (!wedding || wedding.userId !== userId) {
        return res.status(404).json({ message: "Wedding not found" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const guests: any[] = [];
      const stream = Readable.from(req.file.buffer.toString());
      
      await new Promise((resolve, reject) => {
        stream
          .pipe(csv())
          .on('data', (data: any) => guests.push(data))
          .on('end', resolve)
          .on('error', reject);
      });
      
      // Validate and transform guest data
      const validGuests = guests.map(guest => {
        try {
          return insertGuestSchema.parse({
            weddingId,
            firstName: guest.firstName || guest['First Name'] || '',
            lastName: guest.lastName || guest['Last Name'] || '',
            email: guest.email || guest['Email'] || '',
            phone: guest.phone || guest['Phone'] || '',
            address: guest.address || guest['Address'] || '',
            notes: guest.notes || guest['Notes'] || '',
          });
        } catch (error) {
          throw new Error(`Invalid guest data: ${JSON.stringify(guest)}`);
        }
      });
      
      const createdGuests = await storage.createManyGuests(validGuests);
      res.status(201).json({ 
        message: `Successfully imported ${createdGuests.length} guests`,
        guests: createdGuests 
      });
    } catch (error) {
      console.error("Error uploading guests:", error);
      res.status(400).json({ message: "Failed to upload guests" });
    }
  });

  // Guest categories routes
  app.get('/api/weddings/:weddingId/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const weddingId = parseInt(req.params.weddingId);
      const wedding = await storage.getWeddingById(weddingId);
      
      if (!wedding || wedding.userId !== userId) {
        return res.status(404).json({ message: "Wedding not found" });
      }
      
      const categories = await storage.getGuestCategoriesByWeddingId(weddingId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/weddings/:weddingId/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const weddingId = parseInt(req.params.weddingId);
      const wedding = await storage.getWeddingById(weddingId);
      
      if (!wedding || wedding.userId !== userId) {
        return res.status(404).json({ message: "Wedding not found" });
      }
      
      const categoryData = insertGuestCategorySchema.parse({ ...req.body, weddingId });
      const category = await storage.createGuestCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({ message: "Failed to create category" });
    }
  });

  // Wedding stats route
  app.get('/api/weddings/:weddingId/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const weddingId = parseInt(req.params.weddingId);
      const wedding = await storage.getWeddingById(weddingId);
      
      if (!wedding || wedding.userId !== userId) {
        return res.status(404).json({ message: "Wedding not found" });
      }
      
      const stats = await storage.getWeddingStats(weddingId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Public RSVP routes (no authentication required)
  app.get('/api/rsvp/:rsvpCode', async (req, res) => {
    try {
      const { rsvpCode } = req.params;
      const wedding = await storage.getWeddingByRsvpCode(rsvpCode);
      
      if (!wedding) {
        return res.status(404).json({ message: "Wedding not found" });
      }
      
      res.json({
        id: wedding.id,
        brideName: wedding.brideName,
        groomName: wedding.groomName,
        weddingDate: wedding.weddingDate,
        venue: wedding.venue,
        venueAddress: wedding.venueAddress,
        description: wedding.description,
      });
    } catch (error) {
      console.error("Error fetching RSVP wedding:", error);
      res.status(500).json({ message: "Failed to fetch wedding" });
    }
  });

  app.post('/api/rsvp/:rsvpCode/submit', async (req, res) => {
    try {
      const { rsvpCode } = req.params;
      const wedding = await storage.getWeddingByRsvpCode(rsvpCode);
      
      if (!wedding) {
        return res.status(404).json({ message: "Wedding not found" });
      }
      
      const { guestId, rsvpStatus, guestCount, dietaryRestrictions } = req.body;
      
      const guest = await storage.getGuestById(guestId);
      if (!guest || guest.weddingId !== wedding.id) {
        return res.status(404).json({ message: "Guest not found" });
      }
      
      const updatedGuest = await storage.updateGuest(guestId, {
        rsvpStatus,
        guestCount: guestCount || 1,
        dietaryRestrictions,
        rsvpSubmittedAt: new Date(),
      });
      
      res.json(updatedGuest);
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      res.status(400).json({ message: "Failed to submit RSVP" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
