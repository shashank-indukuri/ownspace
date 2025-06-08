import {
  users,
  weddings,
  guests,
  guestCategories,
  communicationLogs,
  type User,
  type UpsertUser,
  type Wedding,
  type InsertWedding,
  type Guest,
  type InsertGuest,
  type GuestCategory,
  type InsertGuestCategory,
  type CommunicationLog,
  type InsertCommunicationLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Wedding operations
  createWedding(wedding: InsertWedding): Promise<Wedding>;
  getWeddingsByUserId(userId: string): Promise<Wedding[]>;
  getWeddingById(id: number): Promise<Wedding | undefined>;
  getWeddingByRsvpCode(rsvpCode: string): Promise<Wedding | undefined>;
  updateWedding(id: number, wedding: Partial<InsertWedding>): Promise<Wedding>;
  
  // Guest operations
  createGuest(guest: InsertGuest): Promise<Guest>;
  getGuestsByWeddingId(weddingId: number): Promise<Guest[]>;
  getGuestById(id: number): Promise<Guest | undefined>;
  updateGuest(id: number, guest: Partial<InsertGuest>): Promise<Guest>;
  deleteGuest(id: number): Promise<void>;
  createManyGuests(guests: InsertGuest[]): Promise<Guest[]>;
  
  // Guest category operations
  createGuestCategory(category: InsertGuestCategory): Promise<GuestCategory>;
  getGuestCategoriesByWeddingId(weddingId: number): Promise<GuestCategory[]>;
  updateGuestCategory(id: number, category: Partial<InsertGuestCategory>): Promise<GuestCategory>;
  deleteGuestCategory(id: number): Promise<void>;
  
  // Communication log operations
  createCommunicationLog(log: InsertCommunicationLog): Promise<CommunicationLog>;
  getCommunicationLogsByWeddingId(weddingId: number): Promise<CommunicationLog[]>;
  
  // Analytics operations
  getWeddingStats(weddingId: number): Promise<{
    totalGuests: number;
    confirmed: number;
    pending: number;
    declined: number;
    responseRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Wedding operations
  async createWedding(wedding: InsertWedding): Promise<Wedding> {
    // Generate unique RSVP code
    const rsvpCode = `${wedding.brideName.toLowerCase().replace(/\s+/g, '')}-${wedding.groomName.toLowerCase().replace(/\s+/g, '')}-${new Date().getFullYear()}`;
    
    const [newWedding] = await db
      .insert(weddings)
      .values({ ...wedding, rsvpCode })
      .returning();

    // Create default guest categories
    const defaultCategories = [
      { name: "Wedding Party", color: "#9333EA", weddingId: newWedding.id },
      { name: "Family", color: "#DC2626", weddingId: newWedding.id },
      { name: "Friends", color: "#2563EB", weddingId: newWedding.id },
      { name: "Colleagues", color: "#059669", weddingId: newWedding.id },
    ];

    await db.insert(guestCategories).values(defaultCategories);

    return newWedding;
  }

  async getWeddingsByUserId(userId: string): Promise<Wedding[]> {
    return await db.select().from(weddings).where(eq(weddings.userId, userId)).orderBy(desc(weddings.createdAt));
  }

  async getWeddingById(id: number): Promise<Wedding | undefined> {
    const [wedding] = await db.select().from(weddings).where(eq(weddings.id, id));
    return wedding;
  }

  async getWeddingByRsvpCode(rsvpCode: string): Promise<Wedding | undefined> {
    const [wedding] = await db.select().from(weddings).where(eq(weddings.rsvpCode, rsvpCode));
    return wedding;
  }

  async updateWedding(id: number, wedding: Partial<InsertWedding>): Promise<Wedding> {
    const [updatedWedding] = await db
      .update(weddings)
      .set({ ...wedding, updatedAt: new Date() })
      .where(eq(weddings.id, id))
      .returning();
    return updatedWedding;
  }

  // Guest operations
  async createGuest(guest: InsertGuest): Promise<Guest> {
    const [newGuest] = await db.insert(guests).values(guest).returning();
    return newGuest;
  }

  async getGuestsByWeddingId(weddingId: number): Promise<Guest[]> {
    return await db.select().from(guests).where(eq(guests.weddingId, weddingId)).orderBy(guests.firstName, guests.lastName);
  }

  async getGuestById(id: number): Promise<Guest | undefined> {
    const [guest] = await db.select().from(guests).where(eq(guests.id, id));
    return guest;
  }

  async updateGuest(id: number, guest: Partial<InsertGuest>): Promise<Guest> {
    const [updatedGuest] = await db
      .update(guests)
      .set({ ...guest, updatedAt: new Date() })
      .where(eq(guests.id, id))
      .returning();
    return updatedGuest;
  }

  async deleteGuest(id: number): Promise<void> {
    await db.delete(guests).where(eq(guests.id, id));
  }

  async createManyGuests(guestsList: InsertGuest[]): Promise<Guest[]> {
    if (guestsList.length === 0) return [];
    return await db.insert(guests).values(guestsList).returning();
  }

  // Guest category operations
  async createGuestCategory(category: InsertGuestCategory): Promise<GuestCategory> {
    const [newCategory] = await db.insert(guestCategories).values(category).returning();
    return newCategory;
  }

  async getGuestCategoriesByWeddingId(weddingId: number): Promise<GuestCategory[]> {
    return await db.select().from(guestCategories).where(eq(guestCategories.weddingId, weddingId));
  }

  async updateGuestCategory(id: number, category: Partial<InsertGuestCategory>): Promise<GuestCategory> {
    const [updatedCategory] = await db
      .update(guestCategories)
      .set(category)
      .where(eq(guestCategories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteGuestCategory(id: number): Promise<void> {
    await db.delete(guestCategories).where(eq(guestCategories.id, id));
  }

  // Communication log operations
  async createCommunicationLog(log: InsertCommunicationLog): Promise<CommunicationLog> {
    const [newLog] = await db.insert(communicationLogs).values(log).returning();
    return newLog;
  }

  async getCommunicationLogsByWeddingId(weddingId: number): Promise<CommunicationLog[]> {
    return await db.select().from(communicationLogs).where(eq(communicationLogs.weddingId, weddingId)).orderBy(desc(communicationLogs.sentAt));
  }

  // Analytics operations
  async getWeddingStats(weddingId: number): Promise<{
    totalGuests: number;
    confirmed: number;
    pending: number;
    declined: number;
    responseRate: number;
  }> {
    const [totalResult] = await db
      .select({ count: count() })
      .from(guests)
      .where(eq(guests.weddingId, weddingId));

    const [confirmedResult] = await db
      .select({ count: count() })
      .from(guests)
      .where(and(eq(guests.weddingId, weddingId), eq(guests.rsvpStatus, "confirmed")));

    const [pendingResult] = await db
      .select({ count: count() })
      .from(guests)
      .where(and(eq(guests.weddingId, weddingId), eq(guests.rsvpStatus, "pending")));

    const [declinedResult] = await db
      .select({ count: count() })
      .from(guests)
      .where(and(eq(guests.weddingId, weddingId), eq(guests.rsvpStatus, "declined")));

    const totalGuests = totalResult?.count || 0;
    const confirmed = confirmedResult?.count || 0;
    const pending = pendingResult?.count || 0;
    const declined = declinedResult?.count || 0;
    const responded = confirmed + declined;
    const responseRate = totalGuests > 0 ? Math.round((responded / totalGuests) * 100) : 0;

    return {
      totalGuests,
      confirmed,
      pending,
      declined,
      responseRate,
    };
  }
}

export const storage = new DatabaseStorage();
