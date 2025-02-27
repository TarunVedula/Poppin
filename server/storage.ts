import { Bar, InsertBar, User, InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllBars(): Promise<Bar[]>;
  getBar(id: number): Promise<Bar | undefined>;
  updateBarCount(id: number, count: number): Promise<Bar | undefined>;
  sessionStore: session.Store;
}

const MADISON_BARS: InsertBar[] = [
  {
    name: "State Street Brats",
    currentCount: 0,
    capacity: 200,
    address: "603 State St, Madison, WI 53703",
    latitude: "43.0751",
    longitude: "-89.3953"
  },
  {
    name: "Whiskey Jacks",
    currentCount: 0,
    capacity: 150,
    address: "552 State St, Madison, WI 53703",
    latitude: "43.0748",
    longitude: "-89.3947"
  },
  {
    name: "The KK",
    currentCount: 0,
    capacity: 180,
    address: "124 W Gorham St, Madison, WI 53703",
    latitude: "43.0753",
    longitude: "-89.3882"
  },
  {
    name: "Chasers",
    currentCount: 0,
    capacity: 120,
    address: "319 W Gorham St, Madison, WI 53703",
    latitude: "43.0757",
    longitude: "-89.3908"
  }
];

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bars: Map<number, Bar>;
  currentUserId: number;
  currentBarId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.bars = new Map();
    this.currentUserId = 1;
    this.currentBarId = 1;

    // Seed bars
    MADISON_BARS.forEach(bar => {
      const id = this.currentBarId++;
      this.bars.set(id, { ...bar, id });
    });

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user = { ...insertUser, id, isBouncer: true };
    this.users.set(id, user);
    return user;
  }

  async getAllBars(): Promise<Bar[]> {
    return Array.from(this.bars.values());
  }

  async getBar(id: number): Promise<Bar | undefined> {
    return this.bars.get(id);
  }

  async updateBarCount(id: number, count: number): Promise<Bar | undefined> {
    const bar = await this.getBar(id);
    if (!bar) return undefined;
    
    const updatedBar = { ...bar, currentCount: count };
    this.bars.set(id, updatedBar);
    return updatedBar;
  }
}

export const storage = new MemStorage();