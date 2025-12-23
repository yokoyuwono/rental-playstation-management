
import { Console, ConsoleStatus, ConsoleType, Member, Product, ProductCategory, RentalSession, User, UserRole, PackageType, MembershipTransaction, ExpenseRecord } from "./types";

export const MOCK_USERS: User[] = [
  { id: 'u1', username: 'admin', password: 'admin123', role: UserRole.ADMIN, name: 'Super Admin' },
  { id: 'u2', username: 'staff', password: 'staff123', role: UserRole.STAFF, name: 'John Staff' }
];

export const MOCK_CONSOLES: Console[] = [
  { id: '1', name: 'Station Alpha', type: ConsoleType.PS5, status: ConsoleStatus.AVAILABLE },
  { id: '2', name: 'Station Bravo', type: ConsoleType.PS5, status: ConsoleStatus.IN_USE },
  { id: '3', name: 'Station Charlie', type: ConsoleType.PS5, status: ConsoleStatus.MAINTENANCE },
  { id: '4', name: 'Station Delta', type: ConsoleType.PS3, status: ConsoleStatus.AVAILABLE },
  { id: '5', name: 'Station Echo', type: ConsoleType.PS4, status: ConsoleStatus.AVAILABLE },
  { id: '6', name: 'Station Foxtrot', type: ConsoleType.PS3, status: ConsoleStatus.IN_USE },
];

// Calculate expiry dates for mocks
const nextMonth = new Date();
nextMonth.setDate(nextMonth.getDate() + 25);
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 5);

export const MOCK_MEMBERS: Member[] = [
  { 
    id: 'm1', 
    name: 'Yoko Dev', 
    phone: '555-0101', 
    totalRentals: 45,
    activePackages: [{
      id: 'pkg_1',
      type: 'Juragan',
      initialMinutes: 840,
      remainingMinutes: 120, // Low balance
      initialDrinks: 7,
      remainingDrinks: 2,
      expiryDate: nextWeek.toISOString(),
      validConsoleTypes: [ConsoleType.PS4, ConsoleType.PS5] // PS4 Only Tier (includes PS5)
    }]
  },
  { 
    id: 'm2', 
    name: 'John Doe', 
    phone: '555-0102', 
    totalRentals: 2,
    activePackages: []
  },
  { 
    id: 'm3', 
    name: 'Jane Smith', 
    phone: '555-0103', 
    totalRentals: 12,
    activePackages: [{
      id: 'pkg_2',
      type: 'Bocil',
      initialMinutes: 600,
      remainingMinutes: 550,
      initialDrinks: 3,
      remainingDrinks: 3,
      expiryDate: nextMonth.toISOString(),
      validConsoleTypes: [ConsoleType.PS3] // PS3 Only
    }]
  },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Coca Cola', price: 5000, category: ProductCategory.DRINK, stock: 50 },
  { id: 'p2', name: 'Instant Noodles', price: 8000, category: ProductCategory.FOOD, stock: 20 },
  { id: 'p3', name: 'Potato Chips', price: 5000, category: ProductCategory.FOOD, stock: 30 },
  { id: 'p4', name: 'Energy Drink', price: 10000, category: ProductCategory.DRINK, stock: 40 },
  { id: 'p5', name: 'Extra Controller', price: 15000, category: ProductCategory.ADDON, stock: 10 },
];

export const MOCK_RENTALS: RentalSession[] = [
    {
        id: 'r_hist_1',
        consoleId: '2',
        customerName: 'Walk-in',
        startTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        isActive: true,
        items: [],
        isMembershipSession: false,
        subtotalRental: 0,
        subtotalItems: 0,
        discountAmount: 0,
        totalPrice: 0
    }
];

export const MOCK_MEMBERSHIP_LOGS: MembershipTransaction[] = [
    {
        id: 'mt_1',
        memberId: 'm1',
        memberName: 'Yoko Dev',
        packageType: 'Juragan',
        amount: 65000,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        note: 'PS4/PS5'
    }
];

export const MOCK_EXPENSES: ExpenseRecord[] = [
    {
        id: 'ex_1',
        note: 'Restock Coca Cola (1 crate)',
        amount: 150000,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
        staffId: 'u1',
        staffName: 'Super Admin'
    }
];

export const APP_SETTINGS = {
  currency: 'Rp '
};

export const PRICING_RULES = {
  [ConsoleType.PS3]: { day: 5000, night: 4000 },
  [ConsoleType.PS4]: { day: 7000, night: 6000 },
  [ConsoleType.PS5]: { day: 10000, night: 8000 }
};

// Package Definitions
export const PACKAGE_DEFINITIONS = {
  'Bocil': {
    minutes: 600, // 10 hours
    drinks: 3,
    validityDays: 30,
    pricePS3: 30000,
    pricePS4: 50000 // Covers PS4/PS5
  },
  'Juragan': {
    minutes: 840, // 14 hours
    drinks: 7,
    validityDays: 7,
    pricePS3: 39000,
    pricePS4: 65000 // Covers PS4/PS5
  }
};
