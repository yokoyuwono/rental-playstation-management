
export enum ConsoleStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance'
}

export enum ConsoleType {
  PS3 = 'PS3',
  PS4 = 'PS4',
  PS5 = 'PS5'
}

export enum ProductCategory {
  FOOD = 'Food',
  DRINK = 'Drink',
  ADDON = 'Add-on'
}

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff'
}

export interface User {
  id: string;
  username: string;
  password?: string; // In real app, never store plain text
  role: UserRole;
  name: string;
}

export interface Console {
  id: string;
  name: string;
  type: ConsoleType;
  status: ConsoleStatus;
  imageUrl?: string;
}

export type PackageType = 'Bocil' | 'Juragan';

export interface MemberPackage {
  id: string; // unique ID for the specific subscription instance
  type: PackageType;
  remainingMinutes: number;
  initialMinutes: number;
  remainingDrinks: number;
  initialDrinks: number;
  expiryDate: string; // ISO Date
  validConsoleTypes: ConsoleType[]; // e.g. ['PS3'] or ['PS3', 'PS4', 'PS5']
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  activePackages: MemberPackage[];
  totalRentals: number;
  totalSpend?: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  stock: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  category: ProductCategory;
}

export interface RentalSession {
  id: string;
  consoleId: string;
  memberId?: string; // Optional, walk-ins
  customerName?: string; // Fallback if no member ID
  startTime: string; // ISO string
  endTime?: string; // ISO string
  isActive: boolean;
  items: CartItem[];

  // Membership specific
  isMembershipSession: boolean;

  // Financials
  subtotalRental: number;
  subtotalItems: number;
  discountAmount: number; // Used for generic discounts if needed
  totalPrice: number;

  // Payment Status
  // Payment Status
  isPaid?: boolean;

  // Duration
  plannedDuration?: number; // in minutes
}

export interface MembershipTransaction {
  id: string;
  memberId: string;
  memberName: string;
  packageType: PackageType;
  amount: number;
  timestamp: string; // ISO Date
  note?: string; // e.g. "PS4 Only"
}

export interface ExpenseRecord {
  id: string;
  note: string;
  amount: number;
  timestamp: string; // ISO Date
  staffId: string;
  staffName: string;
}

export type ViewState = 'dashboard' | 'consoles' | 'members' | 'history' | 'settings';

export interface PricingRule {
  day: number;
  night: number;
}

export type PricingRules = Record<ConsoleType, PricingRule>;
