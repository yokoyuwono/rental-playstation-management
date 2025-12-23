
import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { 
  LayoutDashboard, 
  Gamepad2, 
  Users, 
  History, 
  Settings, 
  Plus, 
  Play, 
  StopCircle, 
  Coffee, 
  ShoppingCart,
  Trash2,
  Search,
  X,
  CheckCircle,
  Menu,
  ChevronRight,
  Moon,
  Sun,
  BarChart3,
  Edit,
  Save,
  Package,
  LogOut,
  Shield,
  Lock,
  User as UserIcon,
  Crown,
  Timer,
  AlertTriangle,
  TrendingDown,
  CalendarClock,
  FileSpreadsheet,
  Receipt,
  CreditCard,
  Wallet,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

import { 
  Console, 
  ConsoleStatus, 
  ConsoleType, 
  Member, 
  RentalSession, 
  ViewState, 
  Product, 
  CartItem, 
  ProductCategory, 
  PricingRules, 
  User, 
  UserRole, 
  PackageType,
  MembershipTransaction,
  MemberPackage,
  ExpenseRecord
} from './types';
import { 
  MOCK_CONSOLES, 
  MOCK_RENTALS, 
  MOCK_MEMBERS, 
  MOCK_PRODUCTS, 
  APP_SETTINGS, 
  PRICING_RULES, 
  MOCK_USERS, 
  PACKAGE_DEFINITIONS,
  MOCK_MEMBERSHIP_LOGS,
  MOCK_EXPENSES
} from './constants';
import { supabase, isSupabaseConfigured } from './services/supabase';

// --- COMPONENTS ---

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-slate-800 rounded-xl border border-slate-700 p-4 shadow-lg ${className}`}>
    {children}
  </div>
);

const StatusBadge = ({ status }: { status: ConsoleStatus }) => {
  const colors = {
    [ConsoleStatus.AVAILABLE]: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    [ConsoleStatus.IN_USE]: 'bg-rose-500/20 text-rose-400 border-rose-500/50',
    [ConsoleStatus.MAINTENANCE]: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  };
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${colors[status]} uppercase tracking-wider`}>
      {status.replace('_', ' ')}
    </span>
  );
};

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
  disabled?: boolean;
  // Fix: Added optional type prop to support submit/reset buttons
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false,
  // Fix: Default type to 'button'
  type = 'button'
}) => {
  const baseStyle = "px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:active:scale-100";
  const variants = {
    primary: "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/50",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-200",
    danger: "bg-rose-600 hover:bg-rose-500 text-white",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white"
  };
  
  return (
    <button onClick={onClick} disabled={disabled} type={type} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

// Safe UUID generator that works in all environments and matches Postgres UUID type
const generateUUID = () => {
  // Use crypto.randomUUID if available (secure context)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older browsers or non-secure contexts
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const getErrorMessage = (e: any): string => {
  if (!e) return 'Unknown error';
  if (typeof e === 'string') return e;
  if (e instanceof Error) return e.message;
  
  // Handle Supabase/Postgrest error objects specifically if they have these fields
  if (e.message) return String(e.message);
  if (e.error_description) return String(e.error_description);
  if (e.details) return String(e.details);
  
  // Last resort: try to stringify the object to avoid [object Object]
  try {
    return JSON.stringify(e);
  } catch {
    return 'An error occurred (unserializable)';
  }
};


// --- LOGIN SCREEN ---
const LoginScreen = ({ onLogin, loading }: { onLogin: (u: User) => void, loading: boolean }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    if (isSupabaseConfigured) {
        try {
            const { data, error } = await supabase
                .from('staff')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single();
            
            if (error || !data) {
                setError('Invalid username or password');
            } else {
                onLogin(data as User);
            }
        } catch (e) {
             setError('Login failed: ' + getErrorMessage(e));
        }
    } else {
        // Fallback to MOCK
        const user = MOCK_USERS.find(u => u.username === username && u.password === password);
        if (user) {
          onLogin(user);
        } else {
          setError('Invalid username or password (Mock)');
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-slate-200">
      <div className="w-full max-w-sm">
         <div className="flex justify-center mb-8">
           <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-500/30">
             <Gamepad2 size={32} className="text-white" />
           </div>
         </div>
         <Card className="bg-slate-900 border-slate-800">
           <h2 className="text-2xl font-bold text-white text-center mb-6">System Access</h2>
           <form onSubmit={handleLogin} className="space-y-4">
              {error && <div className="text-rose-500 text-sm text-center bg-rose-500/10 py-2 rounded">{error}</div>}
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 block">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-violet-500 outline-none transition-colors"
                  placeholder="admin or staff"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 block">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-violet-500 outline-none transition-colors"
                  placeholder="••••••"
                />
              </div>
              <Button className="w-full py-3 mt-4" disabled={loading} type="submit">{loading ? 'Connecting...' : 'Login'}</Button>
           </form>
           <div className="mt-6 text-center">
             <p className="text-xs text-slate-500">
                {isSupabaseConfigured ? 'Connected to Supabase' : 'Running in Offline Mode (Mock Data)'}
             </p>
           </div>
         </Card>
      </div>
    </div>
  );
};

// --- HELPER FUNCTIONS ---

const calculateDynamicCost = (
  type: ConsoleType, 
  startIso: string, 
  endIso: string, 
  pricingRules: PricingRules
) => {
  const start = new Date(startIso);
  const end = new Date(endIso);
  let totalCost = 0;
  
  // Clone start to iterate
  let current = new Date(start.getTime());
  
  // Iterate minute by minute
  while (current < end) {
    const hour = current.getHours();
    // Day: 06:00 to 16:59 (6am - 5pm)
    // Night: 17:00 to 05:59 (5pm - 6am)
    const isDay = hour >= 6 && hour < 17;
    
    const rules = pricingRules[type] || pricingRules[ConsoleType.PS5]; // Fallback to PS5
    const hourlyRate = isDay ? rules.day : rules.night;
    
    // Add cost for 1 minute
    totalCost += hourlyRate / 60;
    
    // Advance 1 minute
    current.setMinutes(current.getMinutes() + 1);
  }
  
  return totalCost;
};

// --- MAIN APP COMPONENT ---

export default function App() {
  // --- STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('dashboard');
  
  // Initial state is empty, populated via useEffect
  const [consoles, setConsoles] = useState<Console[]>([]);
  const [rentals, setRentals] = useState<RentalSession[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [products, setProducts] = useState<Product[]>([]); 
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [membershipLogs, setMembershipLogs] = useState<MembershipTransaction[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  
  const [pricingRules, setPricingRules] = useState<PricingRules>(PRICING_RULES);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [useSupabase, setUseSupabase] = useState(false);

  const [selectedConsoleId, setSelectedConsoleId] = useState<string | null>(null);
  
  // Modals & Overlays
  const [showStartRentalModal, setShowStartRentalModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [showEndRentalSummary, setShowEndRentalSummary] = useState(false);
  
  // CRUD Modals State
  const [showConsoleModal, setShowConsoleModal] = useState(false);
  const [editingConsole, setEditingConsole] = useState<Console | null>(null);
  
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);

  // Member Management Modals
  const [showMemberActionModal, setShowMemberActionModal] = useState(false);
  const [selectedMemberForAction, setSelectedMemberForAction] = useState<Member | null>(null);
  const [showNewMemberModal, setShowNewMemberModal] = useState(false);

  // Expense Modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // History Filter State
  const [historyFilter, setHistoryFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Settings View State
  const [settingsTab, setSettingsTab] = useState<'pricing' | 'consoles' | 'items' | 'staff'>('pricing');

  // Temporary state for rental forms
  const [tempMemberId, setTempMemberId] = useState<string>('');
  const [tempCustomerName, setTempCustomerName] = useState<string>('');

  // --- DATA FETCHING ---
  
  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured) {
        // Fallback to Mocks
        setConsoles(MOCK_CONSOLES);
        setMembers(MOCK_MEMBERS);
        setProducts(MOCK_PRODUCTS);
        setRentals(MOCK_RENTALS);
        setStaffUsers(MOCK_USERS);
        setMembershipLogs(MOCK_MEMBERSHIP_LOGS);
        setExpenses(MOCK_EXPENSES);
        setUseSupabase(false);
        setLoading(false);
        return;
    }

    setUseSupabase(true);
    setLoading(true);

    try {
        const [cRes, mRes, pRes, rRes, sRes, mlRes, exRes] = await Promise.all([
            supabase.from('consoles').select('*'),
            supabase.from('members').select('*'),
            supabase.from('products').select('*'),
            supabase.from('rentals').select('*'),
            supabase.from('staff').select('*'),
            supabase.from('membership_logs').select('*'),
            supabase.from('expenses').select('*')
        ]);

        if (cRes.data) setConsoles(cRes.data);
        if (mRes.data) setMembers(mRes.data.map((m: any) => ({
            id: m.id,
            name: m.name,
            phone: m.phone,
            totalRentals: m.total_rentals,
            totalSpend: m.total_spend,
            // Ensure compatibility with DB jsonb which might be array or single object
            activePackages: Array.isArray(m.active_package) 
              ? m.active_package 
              : (m.active_package ? [m.active_package] : [])
        })));
        if (pRes.data) setProducts(pRes.data);
        if (rRes.data) setRentals(rRes.data.map((r: any) => ({
            id: r.id,
            consoleId: r.console_id,
            customerName: r.customer_name,
            memberId: r.member_id,
            startTime: r.start_time,
            endTime: r.end_time,
            isActive: r.is_active,
            items: r.items || [],
            isMembershipSession: r.is_membership_session,
            subtotalRental: r.subtotal_rental,
            subtotalItems: r.subtotal_items,
            discountAmount: r.discount_amount,
            totalPrice: r.total_price
        })));
        if (sRes.data) setStaffUsers(sRes.data);
        if (mlRes.data) setMembershipLogs(mlRes.data.map((l: any) => ({
            id: l.id,
            memberId: l.member_id,
            memberName: l.member_name,
            packageType: l.package_type,
            amount: l.amount,
            timestamp: l.timestamp,
            note: l.note
        })));
        if (exRes.data) setExpenses(exRes.data.map((e: any) => ({
            id: e.id,
            note: e.note,
            amount: e.amount,
            timestamp: e.timestamp,
            staffId: e.staff_id,
            staffName: e.staff_name
        })));
        
    } catch (error) {
        console.error("Failed to fetch from Supabase:", error);
        alert("Database connection failed. " + getErrorMessage(error));
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HELPERS ---

  const getActiveRental = useCallback((consoleId: string) => {
    return rentals.find(r => r.consoleId === consoleId && r.isActive);
  }, [rentals]);

  const updateRentalTimer = useCallback(() => {
    setRentals(prevRentals => {
      const now = new Date().toISOString();
      return prevRentals.map(rental => {
        if (!rental.isActive) return rental;

        const consoleItem = consoles.find(c => c.id === rental.consoleId);
        const consoleType = consoleItem ? consoleItem.type : ConsoleType.PS5;

        // --- DYNAMIC COST LOGIC ---
        const rentalCost = rental.isMembershipSession 
            ? 0 
            : calculateDynamicCost(consoleType, rental.startTime, now, pricingRules);
        
        const itemsCost = rental.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        return {
          ...rental,
          subtotalRental: rentalCost,
          subtotalItems: itemsCost,
          discountAmount: 0,
          totalPrice: rentalCost + itemsCost
        };
      });
    });
  }, [consoles, members, pricingRules]);

  // Global Timer Effect
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(updateRentalTimer, 1000); 
    return () => clearInterval(interval);
  }, [updateRentalTimer, user]);

  // --- ACTIONS: AUTH ---

  const handleLogout = () => {
    setUser(null);
    setView('dashboard');
  };

  // --- ACTIONS: RENTAL ---

  const handleStartRental = async () => {
    if (!selectedConsoleId) return;

    let isMembershipSession = false;
    let customerName = tempCustomerName || 'Walk-in';

    if (tempMemberId) {
      const member = members.find(m => m.id === tempMemberId);
      const consoleItem = consoles.find(c => c.id === selectedConsoleId);
      
      if (member && member.activePackages.length > 0 && consoleItem) {
        // Find if any package is valid
        const validPkg = member.activePackages.find(p => 
          p.validConsoleTypes.includes(consoleItem.type) &&
          new Date(p.expiryDate) > new Date() &&
          p.remainingMinutes > 0
        );

        if (validPkg) {
          isMembershipSession = true;
          customerName = member.name;
        } else {
             // Optional: warn if no suitable package found even if member
             // For now we just fall back to regular billing if member has no valid package
             // But let's check if they have expired ones to give better alert
             if(member.activePackages.length > 0) {
                 const expired = member.activePackages.some(p => p.validConsoleTypes.includes(consoleItem.type) && new Date(p.expiryDate) <= new Date());
                 if(expired) alert("Membership expired.");
                 else alert("No valid minutes left or wrong console type package.");
             }
             customerName = member.name; // Still use their name
        }
      } else if (member) {
          customerName = member.name;
      }
    }

    const newRental: RentalSession = {
      id: generateUUID(),
      consoleId: selectedConsoleId,
      customerName: customerName,
      memberId: tempMemberId || undefined,
      startTime: new Date().toISOString(),
      isActive: true,
      items: [],
      isMembershipSession,
      subtotalRental: 0,
      subtotalItems: 0,
      discountAmount: 0,
      totalPrice: 0
    };

    if (useSupabase) {
        const { error } = await supabase.from('rentals').insert({
            id: newRental.id,
            console_id: newRental.consoleId,
            customer_name: newRental.customerName,
            member_id: newRental.memberId || null,
            start_time: newRental.startTime,
            is_active: true,
            items: [],
            is_membership_session: newRental.isMembershipSession,
            subtotal_rental: 0,
            subtotal_items: 0,
            discount_amount: 0,
            total_price: 0
        });
        if (error) { alert('DB Error: ' + getErrorMessage(error)); return; }

        await supabase.from('consoles').update({ status: 'in_use' }).eq('id', selectedConsoleId);
    }

    setRentals(prev => [...prev, newRental]);
    setConsoles(prev => prev.map(c => c.id === selectedConsoleId ? { ...c, status: ConsoleStatus.IN_USE } : c));
    
    setTempMemberId('');
    setTempCustomerName('');
    setShowStartRentalModal(false);
    setView('consoles');
  };

  const handleEndRental = async (rentalId: string) => {
    const rental = rentals.find(r => r.id === rentalId);
    if (!rental) return;

    const endTime = new Date().toISOString();
    const durationMs = new Date(endTime).getTime() - new Date(rental.startTime).getTime();
    const durationMinutes = Math.ceil(durationMs / 60000);

    let updatedMember = null;

    // 2. Process Membership Deduction
    if (rental.memberId && rental.isMembershipSession) {
        const member = members.find(m => m.id === rental.memberId);
        const consoleItem = consoles.find(c => c.id === rental.consoleId);
        
        if (member && member.activePackages.length > 0 && consoleItem) {
           // Find the first valid package to deduct from
           // Logic: Prioritize packages that support the console type, are not expired
           // In complex scenario we might want to ask user which package, but for now take first valid.
           const pkgIndex = member.activePackages.findIndex(p => 
               p.validConsoleTypes.includes(consoleItem.type) && 
               new Date(p.expiryDate) > new Date()
               // We don't filter by minutes > 0 here because we want to deduct even if it goes to 0 or was 0 (edge case)
               // Ideally we stopped session before, but let's handle it.
           );

           if (pkgIndex >= 0) {
               const pkg = member.activePackages[pkgIndex];
               const drinksCount = rental.items
                    .filter(i => i.category === ProductCategory.DRINK)
                    .reduce((sum, i) => sum + i.quantity, 0);
               
               const newMinutes = Math.max(0, pkg.remainingMinutes - durationMinutes);
               const newDrinks = Math.max(0, pkg.remainingDrinks - drinksCount);
               
               const updatedPackages = [...member.activePackages];
               updatedPackages[pkgIndex] = {
                   ...pkg,
                   remainingMinutes: newMinutes,
                   remainingDrinks: newDrinks
               };

               updatedMember = {
                   ...member,
                   totalRentals: member.totalRentals + 1,
                   activePackages: updatedPackages
               };
           }
        }
    } 
    
    // If not membership deduction occurred (or member just didn't have package but was logged in)
    if (!updatedMember && rental.memberId) {
        const member = members.find(m => m.id === rental.memberId);
        if (member) {
            updatedMember = { 
                ...member, 
                totalRentals: member.totalRentals + 1, 
                totalSpend: (member.totalSpend || 0) + rental.totalPrice 
            };
        }
    }

    if (updatedMember) {
        setMembers(prev => prev.map(m => m.id === updatedMember!.id ? updatedMember! : m));
        if (useSupabase) {
            // Note: DB column is active_package (singular name), storing array now
            await supabase.from('members').update({
                total_rentals: updatedMember.totalRentals,
                total_spend: updatedMember.totalSpend,
                active_package: updatedMember.activePackages
            }).eq('id', updatedMember.id);
        }
    }

    // 3. Close Session
    const endedRental: RentalSession = {
      ...rental,
      isActive: false,
      endTime: endTime
    };

    if (useSupabase) {
        await supabase.from('rentals').update({
            is_active: false,
            end_time: endTime,
            total_price: rental.totalPrice,
            subtotal_rental: rental.subtotalRental,
            subtotal_items: rental.subtotalItems
        }).eq('id', rentalId);

        await supabase.from('consoles').update({ status: 'available' }).eq('id', rental.consoleId);
    }

    setRentals(prev => prev.map(r => r.id === rentalId ? endedRental : r));
    setConsoles(prev => prev.map(c => c.id === rental.consoleId ? { ...c, status: ConsoleStatus.AVAILABLE } : c));
    
    setShowEndRentalSummary(false);
    setSelectedConsoleId(null);
  };

  const addItemToRental = async (productId: string) => {
    if (!selectedConsoleId) return;
    const activeRental = getActiveRental(selectedConsoleId);
    if (!activeRental) return;

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const updatedRentalItems = [...activeRental.items];
    const existingItemIndex = updatedRentalItems.findIndex(i => i.productId === productId);

    if (existingItemIndex >= 0) {
      updatedRentalItems[existingItemIndex].quantity += 1;
    } else {
      updatedRentalItems.push({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        category: product.category
      });
    }

    const newRentalState = { ...activeRental, items: updatedRentalItems };

    if (useSupabase) {
        await supabase.from('rentals').update({ items: updatedRentalItems }).eq('id', activeRental.id);
    }
    setRentals(prev => prev.map(r => r.id === activeRental.id ? newRentalState : r));
  };

  // --- ACTIONS: MEMBERSHIP BUYING ---
  
  const handleBuyPackage = async (memberId: string, pkgType: PackageType, isForPs4: boolean) => {
    if (actionLoading) return;
    setActionLoading(true);

    try {
        const member = members.find(m => m.id === memberId);
        if (!member) throw new Error("Member not found");

        const def = PACKAGE_DEFINITIONS[pkgType];
        const validTypes = isForPs4 ? [ConsoleType.PS4, ConsoleType.PS5] : [ConsoleType.PS3];
        const price = isForPs4 ? def.pricePS4 : def.pricePS3;
        const validityMs = def.validityDays * 24 * 60 * 60 * 1000;
        
        let newRemainingMinutes = def.minutes;
        let newRemainingDrinks = def.drinks;
        let newExpiry = new Date(Date.now() + validityMs);
        
        // Use spread to copy array, or init empty if undefined
        const currentPackages = member.activePackages ? [...member.activePackages] : [];
        let isAccumulating = false;

        // Check compatibility for accumulation (Top Up)
        // Find matching package: same console types
        const matchingPkgIndex = currentPackages.findIndex(p => 
            JSON.stringify(p.validConsoleTypes.sort()) === JSON.stringify(validTypes.sort())
        );

        if (matchingPkgIndex >= 0) {
             const oldPkg = currentPackages[matchingPkgIndex];
             const oldExpiryDate = new Date(oldPkg.expiryDate);
             isAccumulating = true;
             
             newRemainingMinutes += oldPkg.remainingMinutes;
             newRemainingDrinks += oldPkg.remainingDrinks;
             
             // Extend expiry
             const baseTime = oldExpiryDate > new Date() ? oldExpiryDate.getTime() : Date.now();
             newExpiry = new Date(baseTime + validityMs);

             // Update the existing package in the list
             currentPackages[matchingPkgIndex] = {
                 ...oldPkg,
                 remainingMinutes: newRemainingMinutes,
                 initialMinutes: newRemainingMinutes, // Reset baseline for visual bar
                 remainingDrinks: newRemainingDrinks,
                 initialDrinks: newRemainingDrinks, // Reset baseline
                 expiryDate: newExpiry.toISOString(),
                 // Type and ConsoleTypes remain same
             };
        } else {
             // New Package
             const newPkg: MemberPackage = {
                id: generateUUID(),
                type: pkgType,
                remainingMinutes: newRemainingMinutes,
                initialMinutes: newRemainingMinutes, 
                remainingDrinks: newRemainingDrinks,
                initialDrinks: newRemainingDrinks,
                expiryDate: newExpiry.toISOString(),
                validConsoleTypes: validTypes
            };
            currentPackages.push(newPkg);
        }

        const newLog: MembershipTransaction = {
            id: generateUUID(),
            memberId: memberId,
            memberName: member.name,
            packageType: pkgType,
            amount: price,
            timestamp: new Date().toISOString(),
            note: (isForPs4 ? 'PS4/PS5' : 'PS3 Only') + (isAccumulating ? ' (Extend/Top Up)' : ' (New)')
        };

        if (useSupabase) {
            // Use JSONB update for Supabase
            // We store the whole array in active_package column
            const { error: memberError } = await supabase.from('members').update({ 
                active_package: currentPackages 
            }).eq('id', memberId);
            
            if (memberError) throw memberError;

            const { error: logError } = await supabase.from('membership_logs').insert({
                id: newLog.id,
                member_id: newLog.memberId,
                member_name: newLog.memberName,
                package_type: newLog.packageType,
                amount: newLog.amount,
                timestamp: newLog.timestamp,
                note: newLog.note
            });
            if (logError) throw logError;
        }

        setMembers(prev => prev.map(m => {
            if (m.id === memberId) {
                return {
                    ...m,
                    activePackages: currentPackages
                }
            }
            return m;
        }));
        setMembershipLogs(prev => [...prev, newLog]);
        setShowMemberActionModal(false);
    } catch (e) {
        alert("Transaction failed. " + getErrorMessage(e));
        console.error(e);
    } finally {
        setActionLoading(false);
    }
  };

  // --- ACTIONS: EXPENSES ---

  const handleSaveExpense = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!user) return;
      
      const formData = new FormData(e.currentTarget);
      const note = formData.get('note') as string;
      const amount = Number(formData.get('amount'));

      if (!note || !amount) return;

      const newExpense: ExpenseRecord = {
          id: generateUUID(),
          note,
          amount,
          timestamp: new Date().toISOString(),
          staffId: user.id,
          staffName: user.name
      };

      try {
          if (useSupabase) {
              const { error } = await supabase.from('expenses').insert({
                  id: newExpense.id,
                  note: newExpense.note,
                  amount: newExpense.amount,
                  timestamp: newExpense.timestamp,
                  staff_id: newExpense.staffId,
                  staff_name: newExpense.staffName
              });
              if (error) throw error;
          }
          setExpenses(prev => [...prev, newExpense]);
          setShowExpenseModal(false);
      } catch (err) {
          alert("Failed to save expense: " + getErrorMessage(err));
      }
  };

  // --- ACTIONS: EXPORT EXCEL ---

  const handleExportExcel = () => {
    // Determine filter range based on historyFilter
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    
    let filterDate: Date;
    let title = "History Report";
    
    if (historyFilter === 'daily') {
        filterDate = startOfDay;
        title = `Daily_Report_${now.toISOString().split('T')[0]}`;
    } else if (historyFilter === 'weekly') {
        filterDate = startOfWeek;
        title = `Weekly_Report_${now.toISOString().split('T')[0]}`;
    } else {
        filterDate = startOfMonth;
        title = `Monthly_Report_${now.toISOString().split('T')[0]}`;
    }

    const filteredRentals = rentals.filter(r => {
      if (r.isActive) return false;
      return new Date(r.startTime) >= filterDate;
    });

    const filteredMemberships = membershipLogs.filter(l => {
        return new Date(l.timestamp) >= filterDate;
    });

    const filteredExpenses = expenses.filter(e => {
        return new Date(e.timestamp) >= filterDate;
    });

    if (filteredRentals.length === 0 && filteredMemberships.length === 0 && filteredExpenses.length === 0) {
      alert("No history found for the selected period.");
      return;
    }

    // 2. Format Rental Data
    const rentalRows = filteredRentals.map(r => {
      const consoleName = consoles.find(c => c.id === r.consoleId)?.name || 'Unknown Console';
      const dateObj = new Date(r.startTime);
      const itemsDesc = r.items.map(i => `${i.productName} (x${i.quantity})`).join(', ');

      return {
        "Date": dateObj.toLocaleDateString(),
        "Time": dateObj.toLocaleTimeString(),
        "Customer/Staff": r.customerName,
        "Type": r.isMembershipSession ? "Rental (Member)" : "Rental (Regular)",
        "Details": consoleName,
        "Note": itemsDesc,
        "Amount": r.totalPrice
      };
    });

    // 3. Format Membership Data
    const membershipRows = filteredMemberships.map(l => {
        const dateObj = new Date(l.timestamp);
        return {
            "Date": dateObj.toLocaleDateString(),
            "Time": dateObj.toLocaleTimeString(),
            "Customer/Staff": l.memberName,
            "Type": "Membership Purchase",
            "Details": `${l.packageType} Package`,
            "Note": l.note,
            "Amount": l.amount
        };
    });

    // 4. Format Expense Data
    const expenseRows = filteredExpenses.map(e => {
        const dateObj = new Date(e.timestamp);
        return {
             "Date": dateObj.toLocaleDateString(),
             "Time": dateObj.toLocaleTimeString(),
             "Customer/Staff": e.staffName,
             "Type": "EXPENSE",
             "Details": "Operational Cost",
             "Note": e.note,
             "Amount": -e.amount // Negative for clear accounting
        };
    });

    const allRows = [...rentalRows, ...membershipRows, ...expenseRows].sort((a,b) => {
        // Sort by date (assuming date string is sortable enough for basic export, or reconstruct)
        return new Date(a.Date + " " + a.Time).getTime() - new Date(b.Date + " " + b.Time).getTime();
    });

    // 5. Calculate Total Income
    const totalIncome = rentalRows.reduce((sum, r) => sum + r.Amount, 0) + membershipRows.reduce((sum, m) => sum + m.Amount, 0);
    const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalIncome - totalExpense;

    // 6. Add Summary Rows
    allRows.push({} as any); // Empty row
    allRows.push({
      "Date": "SUMMARY",
      "Time": "",
      "Customer/Staff": "",
      "Type": "",
      "Details": "Total Income",
      "Note": "",
      "Amount": totalIncome
    } as any);
    allRows.push({
        "Date": "",
        "Time": "",
        "Customer/Staff": "",
        "Type": "",
        "Details": "Total Expenses",
        "Note": "",
        "Amount": -totalExpense
      } as any);
    allRows.push({
        "Date": "",
        "Time": "",
        "Customer/Staff": "",
        "Type": "",
        "Details": "NET PROFIT",
        "Note": "",
        "Amount": netProfit
      } as any);

    // 7. Generate Worksheet & Workbook
    const worksheet = XLSX.utils.json_to_sheet(allRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);

    // 8. Download
    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  // --- ACTIONS: CRUD ---
  
  const handleSaveConsole = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (user?.role !== UserRole.ADMIN) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const type = formData.get('type') as ConsoleType;
    const status = formData.get('status') as ConsoleStatus;

    if (editingConsole) {
      if (useSupabase) await supabase.from('consoles').update({ name, type, status }).eq('id', editingConsole.id);
      setConsoles(prev => prev.map(c => c.id === editingConsole.id ? { ...c, name, type, status } : c));
    } else {
      const id = generateUUID();
      if (useSupabase) await supabase.from('consoles').insert({ id, name, type, status: status || ConsoleStatus.AVAILABLE });
      setConsoles(prev => [...prev, { id, name, type, status: status || ConsoleStatus.AVAILABLE }]);
    }
    setShowConsoleModal(false);
    setEditingConsole(null);
  };

  const handleDeleteConsole = async (id: string) => {
    if (user?.role !== UserRole.ADMIN) return;
    if (confirm("Delete console?")) {
        if (useSupabase) await supabase.from('consoles').delete().eq('id', id);
        setConsoles(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Allow ADMIN or STAFF to save products (update stock/price/name)
    if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.STAFF) return;
    
    const formData = new FormData(e.currentTarget);
    const newProd = {
        name: formData.get('name') as string, 
        price: Number(formData.get('price')), 
        category: formData.get('category') as ProductCategory, 
        stock: Number(formData.get('stock')) 
    };

    if (editingProduct) {
        if (useSupabase) await supabase.from('products').update(newProd).eq('id', editingProduct.id);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...newProd } : p));
    } else {
        const id = generateUUID();
        if (useSupabase) await supabase.from('products').insert({ id, ...newProd });
        setProducts(prev => [...prev, { id, ...newProd }]);
    }
    setShowProductModal(false);
    setEditingProduct(null);
  };
  
  const handleDeleteProduct = async (id: string) => {
      // Deleting products remains an ADMIN only action for safety
      if (user?.role !== UserRole.ADMIN) return;
      if(confirm("Delete product?")) {
          if (useSupabase) await supabase.from('products').delete().eq('id', id);
          setProducts(prev => prev.filter(p => p.id !== id));
      }
  }

  const handleSaveStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (user?.role !== UserRole.ADMIN) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as UserRole;

    if (editingStaff) {
        const updates: any = { name, username, role };
        if (password && password.trim() !== '') updates.password = password;
        
        if (useSupabase) await supabase.from('staff').update(updates).eq('id', editingStaff.id);
        
        setStaffUsers(prev => prev.map(u => {
            if (u.id === editingStaff.id) {
                return { ...u, ...updates, password: updates.password || u.password };
            }
            return u;
        }));
    } else {
        const id = generateUUID();
        if (useSupabase) await supabase.from('staff').insert({ id, name, username, password, role });
        setStaffUsers(prev => [...prev, { id, name, username, password, role }]);
    }
    setShowStaffModal(false);
    setEditingStaff(null);
  };
  
  const handleDeleteStaff = async (id: string) => {
      if (user?.role !== UserRole.ADMIN) return;
      if(id === user?.id) return;
      if(confirm("Delete staff?")) {
          if (useSupabase) await supabase.from('staff').delete().eq('id', id);
          setStaffUsers(prev => prev.filter(u => u.id !== id));
      }
  }

  const handleCreateMember = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const phone = formData.get('phone') as string;
      const id = generateUUID();
      
      const newMember = { id, name, phone, totalRentals: 0, activePackages: [] };
      
      try {
        if (useSupabase) {
            const { error } = await supabase.from('members').insert({
                id, name, phone, total_rentals: 0, total_spend: 0, active_package: []
            });
            if (error) throw error;
        }
        setMembers(prev => [...prev, newMember]);
        setShowNewMemberModal(false);
      } catch (err) {
        alert("Failed to create member: " + getErrorMessage(err));
      }
  }

  const handleUpdatePrice = (type: ConsoleType, time: 'day' | 'night', value: string) => {
    if (user?.role !== UserRole.ADMIN) return;
    setPricingRules(prev => ({
      ...prev,
      [type]: { ...prev[type], [time]: parseInt(value) || 0 }
    }));
  };

  // --- VIEWS ---

  if (!user) {
    return <LoginScreen onLogin={(u) => setUser(u)} loading={loading} />;
  }

  const renderDashboard = () => {
    const activeCount = rentals.filter(r => r.isActive).length;
    const availableCount = consoles.filter(c => c.status === ConsoleStatus.AVAILABLE).length;
    
    // Revenue Data Calculation
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Rental Revenue
    const todaysFinishedRentals = rentals.filter(r => !r.isActive && r.startTime.startsWith(today));
    const activeRentalsRevenue = rentals.filter(r => r.isActive).reduce((sum, r) => sum + r.totalPrice, 0);
    const finishedRentalsRevenue = todaysFinishedRentals.reduce((sum, r) => sum + r.totalPrice, 0);
    
    // 2. Membership Revenue
    const todaysMembershipLogs = membershipLogs.filter(l => l.timestamp.startsWith(today));
    const membershipRevenue = todaysMembershipLogs.reduce((sum, l) => sum + l.amount, 0);

    const totalRevenueToday = finishedRentalsRevenue + activeRentalsRevenue + membershipRevenue;

    // Generate Dynamic 7 Day Chart Data
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

        // Rentals for that day
        const dayRentals = rentals.filter(r => !r.isActive && r.startTime.startsWith(dateStr));
        const dayRentalRev = dayRentals.reduce((sum, r) => sum + r.totalPrice, 0);

        // Membership sales for that day
        const dayMems = membershipLogs.filter(l => l.timestamp.startsWith(dateStr));
        const dayMemRev = dayMems.reduce((sum, l) => sum + l.amount, 0);

        chartData.push({
            name: dayName,
            revenue: dayRentalRev + dayMemRev
        });
    }

    const lowStockProducts = products.filter(p => p.stock < 10);
    const maintenanceConsoles = consoles.filter(c => c.status === ConsoleStatus.MAINTENANCE);
    const expiringMembers = members.filter(m => {
        if(m.activePackages.length === 0) return false;
        // Check if ANY package is expiring soon
        return m.activePackages.some(pkg => {
             const expiry = new Date(pkg.expiryDate);
             const now = new Date();
             const diffTime = expiry.getTime() - now.getTime();
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
             return diffDays <= 3 && diffDays >= 0; 
        });
    });

    return (
      <div className="space-y-6 pb-24 animate-fade-in">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400">Welcome, {user.name} <span className="text-xs px-2 py-0.5 rounded bg-slate-800 uppercase ml-1">{user.role}</span></p>
          </div>
          
          <div className="flex gap-2">
              <button 
                onClick={() => setView('settings')}
                className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <Settings size={20} />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 bg-slate-800 rounded-full text-rose-400 hover:text-rose-300 transition-colors"
              >
                <LogOut size={20} />
              </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-violet-900/50 to-slate-900 border-violet-500/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-violet-500/20 rounded-lg text-violet-400">
                <Gamepad2 size={20} />
              </div>
              <span className="text-sm text-slate-400">Active</span>
            </div>
            <p className="text-3xl font-bold text-white">{activeCount}</p>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-900/50 to-slate-900 border-emerald-500/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                <CheckCircle size={20} />
              </div>
              <span className="text-sm text-slate-400">Available</span>
            </div>
            <p className="text-3xl font-bold text-white">{availableCount}</p>
          </Card>
        </div>

        {/* Operational Alerts Widget */}
        <Card className="border-l-4 border-amber-500 bg-slate-800">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                <AlertTriangle size={20} className="text-amber-500" />
                <h3 className="font-bold text-white">Shop Attention Needed</h3>
            </div>
            <div className="space-y-3">
                {/* Low Stock Section */}
                {lowStockProducts.length > 0 && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-rose-400 text-sm font-bold flex items-center gap-2">
                                <TrendingDown size={14}/> Low Stock ({lowStockProducts.length})
                            </span>
                            {/* Allow Staff or Admin to see Manage button */}
                            {(user.role === UserRole.ADMIN || user.role === UserRole.STAFF) && (
                                <Button variant="ghost" className="h-auto p-0 text-xs text-rose-400 underline" onClick={() => { setView('settings'); setSettingsTab('items'); }}>
                                    Manage
                                </Button>
                            )}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                            {lowStockProducts.slice(0, 3).map(p => `${p.name} (${p.stock})`).join(', ')} 
                            {lowStockProducts.length > 3 && '...'}
                        </div>
                    </div>
                )}
                
                {/* Expiring Members Section */}
                {expiringMembers.length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-amber-400 text-sm font-bold flex items-center gap-2">
                                <CalendarClock size={14}/> Expiring Memberships ({expiringMembers.length})
                            </span>
                             <Button variant="ghost" className="h-auto p-0 text-xs text-amber-400 underline" onClick={() => setView('members')}>
                                View
                            </Button>
                        </div>
                         <div className="text-xs text-slate-400 truncate">
                            {expiringMembers.slice(0, 3).map(m => m.name).join(', ')} 
                            {expiringMembers.length > 3 && '...'}
                        </div>
                    </div>
                )}
                
                {/* Maintenance Section */}
                {maintenanceConsoles.length > 0 && (
                     <div className="bg-slate-700/50 rounded-lg p-3 flex justify-between items-center">
                         <span className="text-slate-300 text-sm font-semibold">
                            {maintenanceConsoles.length} Consoles in Maintenance
                         </span>
                         <Button variant="ghost" className="h-auto p-0 text-xs text-slate-400 underline" onClick={() => setView('consoles')}>Check</Button>
                    </div>
                )}

                {/* Empty State */}
                {lowStockProducts.length === 0 && expiringMembers.length === 0 && maintenanceConsoles.length === 0 && (
                    <div className="text-center py-4 text-slate-500 text-sm">
                        <CheckCircle className="mx-auto mb-2 opacity-50" size={24} />
                        All systems running smoothly. No alerts.
                    </div>
                )}
            </div>
        </Card>

        {/* Total Revenue & Quick Actions - UPDATED SECTION */}
        <div className="space-y-4">
             <Card className="flex items-center justify-between p-5 relative overflow-hidden border-slate-700 bg-slate-800">
                <div className="relative z-10">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Today's Revenue</p>
                    <h2 className="text-3xl font-bold text-emerald-400">
                    {APP_SETTINGS.currency}{totalRevenueToday.toLocaleString()}
                    </h2>
                </div>
                
                <button 
                    onClick={() => setShowExpenseModal(true)}
                    className="relative z-10 flex items-center gap-3 bg-rose-600 hover:bg-rose-500 text-white pl-3 pr-5 py-3 rounded-xl shadow-lg shadow-rose-900/40 transition-all active:scale-95 group border border-rose-400/20"
                >
                    <div className="bg-rose-800/50 p-2 rounded-lg group-hover:bg-rose-800 transition-colors">
                        <TrendingDown size={20} className="text-rose-100" />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] text-rose-200 uppercase font-bold leading-none mb-0.5 opacity-90">Record</span>
                        <span className="text-base font-bold leading-none text-white">Expense</span>
                    </div>
                </button>

                {/* Ambient Glow */}
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-rose-500/10 to-transparent pointer-events-none" />
            </Card>

             <Card>
                <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                        cursor={{ fill: 'transparent' }}
                        formatter={(value: number) => [`${APP_SETTINGS.currency}${value.toLocaleString()}`, 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#10b981' : '#8b5cf6'} />
                        ))}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
      </div>
    );
  };

  const renderConsoles = () => (
    <div className="space-y-6 pb-24 animate-fade-in">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Consoles</h1>
        {user.role === UserRole.ADMIN && (
          <Button variant="secondary" className="px-3" onClick={() => { setView('settings'); setSettingsTab('consoles'); }}>
            <Settings size={18} />
          </Button>
        )}
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {consoles.map(console => {
          const activeRental = getActiveRental(console.id);
          
          return (
            <Card 
              key={console.id} 
              onClick={() => {
                setSelectedConsoleId(console.id);
                if (console.status === ConsoleStatus.AVAILABLE) {
                   setShowStartRentalModal(true);
                }
              }}
              className={`cursor-pointer transition-all hover:border-violet-500/50 group relative overflow-hidden ${
                console.status === ConsoleStatus.IN_USE ? 'border-rose-500/30' : ''
              }`}
            >
              {/* Background Glow */}
              <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20 ${
                console.status === ConsoleStatus.AVAILABLE ? 'bg-emerald-500' : 
                console.status === ConsoleStatus.IN_USE ? 'bg-rose-500' : 'bg-amber-500'
              }`} />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${console.type === ConsoleType.PS5 ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Gamepad2 size={24} />
                  </div>
                  <StatusBadge status={console.status} />
                </div>
                
                <h3 className="font-bold text-lg text-white mb-1">{console.name}</h3>
                <p className="text-xs text-slate-400 mb-4">{console.type}</p>

                {activeRental ? (
                   <div className="bg-slate-950/50 rounded-lg p-2 backdrop-blur-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-400">Current Bill</span>
                        <span className="text-xs font-mono text-emerald-400">
                           {activeRental.isMembershipSession 
                             ? <span className="text-amber-400 font-bold flex items-center gap-1"><Crown size={10}/> MEMBER</span> 
                             : `${APP_SETTINGS.currency}${activeRental.totalPrice.toLocaleString()}`
                           }
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-rose-400">
                         <History size={12} />
                         <span className="text-xs font-mono">
                           {Math.floor((new Date().getTime() - new Date(activeRental.startTime).getTime()) / 60000)}m
                         </span>
                      </div>
                   </div>
                ) : (
                  <div className="mt-4 flex items-center text-emerald-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Tap to Start <ChevronRight size={16} />
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderActiveRentalDetail = () => {
    if (!selectedConsoleId) return null;
    const activeRental = getActiveRental(selectedConsoleId);
    if (!activeRental) return null;
    const consoleData = consoles.find(c => c.id === selectedConsoleId);

    const elapsedMs = new Date().getTime() - new Date(activeRental.startTime).getTime();
    const elapsedHrs = Math.floor(elapsedMs / 3600000);
    const elapsedMins = Math.floor((elapsedMs % 3600000) / 60000);

    const rules = consoleData ? (pricingRules[consoleData.type] || pricingRules[ConsoleType.PS5]) : pricingRules[ConsoleType.PS5];
    const currentHour = new Date().getHours();
    const isDay = currentHour >= 6 && currentHour < 17;

    return (
      <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <Button variant="ghost" onClick={() => setSelectedConsoleId(null)}>
            <X />
          </Button>
          <h2 className="font-bold text-white">{consoleData?.name} - Session</h2>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Timer Big Display */}
          <div className="flex flex-col items-center justify-center py-8">
             <div className="text-6xl font-mono font-bold text-white tracking-tighter tabular-nums">
               {elapsedHrs.toString().padStart(2, '0')}:{elapsedMins.toString().padStart(2, '0')}
             </div>
             <p className="text-slate-400 mt-2">Duration</p>
          </div>

          {/* Pricing Info Chip */}
          <div className="flex justify-center mb-2">
            {activeRental.isMembershipSession ? (
               <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-amber-500/20 text-amber-400 border border-amber-500/50">
                   <Crown size={14} />
                   <span>MEMBERSHIP SESSION ACTIVE</span>
               </div>
            ) : (
               <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${isDay ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                 {isDay ? <Sun size={12} /> : <Moon size={12} />}
                 <span>Rate: {APP_SETTINGS.currency}{(isDay ? rules.day : rules.night).toLocaleString()}/hr</span>
               </div>
            )}
          </div>

          {/* Customer Info */}
          <Card className="flex justify-between items-center">
             <div className="flex items-center gap-3">
               <div className="bg-violet-500/20 p-2 rounded-full text-violet-400">
                 <Users size={20} />
               </div>
               <div>
                 <p className="text-sm text-slate-400">Customer</p>
                 <p className="font-semibold text-white">{activeRental.customerName}</p>
                 {activeRental.isMembershipSession && <span className="text-xs text-emerald-400">Prepaid Package</span>}
               </div>
             </div>
          </Card>

          {/* Items List */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-slate-300 font-semibold">Items & Drinks</h3>
              <Button variant="secondary" className="py-1 px-3 text-sm" onClick={() => setShowItemsModal(true)}>
                <Plus size={14} /> Add
              </Button>
            </div>
            {activeRental.items.length === 0 ? (
              <div className="text-center p-4 border border-dashed border-slate-700 rounded-lg text-slate-500 text-sm">
                No items added yet.
              </div>
            ) : (
              <div className="space-y-2">
                {activeRental.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-700 px-2 py-0.5 rounded text-xs text-white">x{item.quantity}</span>
                      <span className="text-slate-200">{item.productName}</span>
                    </div>
                    <span className="text-slate-300 font-mono">
                      {APP_SETTINGS.currency}{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financial Breakdown */}
          <Card className="bg-slate-800/50">
             <div className="space-y-2 text-sm">
               {!activeRental.isMembershipSession && (
                 <div className="flex justify-between text-slate-400">
                   <span>Rental Fee (Dynamic)</span>
                   <span>{APP_SETTINGS.currency}{activeRental.subtotalRental.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                 </div>
               )}
               <div className="flex justify-between text-slate-400">
                 <span>Items Subtotal</span>
                 <span>{APP_SETTINGS.currency}{activeRental.subtotalItems.toLocaleString()}</span>
               </div>
               
               <div className="border-t border-slate-700 pt-2 flex justify-between items-center mt-2">
                 <span className="font-bold text-white text-lg">Total Bill</span>
                 <span className="font-bold text-emerald-400 text-xl font-mono">
                    {APP_SETTINGS.currency}{activeRental.totalPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                 </span>
               </div>
               {activeRental.isMembershipSession && (
                 <p className="text-xs text-center text-slate-500 mt-2">
                   *Time and eligible drinks will be deducted from membership package on finish.
                 </p>
               )}
             </div>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <Button 
            variant="danger" 
            className="w-full py-4 text-lg" 
            onClick={() => setShowEndRentalSummary(true)}
          >
            <StopCircle className="mr-2" /> End Rental & Pay
          </Button>
        </div>
      </div>
    );
  };

  // --- RENDER MODALS ---

  const renderStartRentalModal = () => {
    if (!showStartRentalModal) return null;
    const consoleItem = consoles.find(c => c.id === selectedConsoleId);
    
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-xl w-full max-w-md border border-slate-700 shadow-2xl overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-lg text-white">Start Session ({consoleItem?.name})</h3>
            <button onClick={() => setShowStartRentalModal(false)} className="text-slate-400"><X /></button>
          </div>
          <div className="p-6 space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Customer Name (Walk-in)</label>
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-violet-500 outline-none"
                  placeholder="e.g. Guest 1"
                  value={tempCustomerName}
                  onChange={(e) => {
                      setTempCustomerName(e.target.value);
                      setTempMemberId(''); // Clear member if typing manually
                  }}
                />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-500">Or select Member</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {members.map(m => {
                 // Check if ANY package matches console
                 const validPackage = m.activePackages.find(p => 
                    p.validConsoleTypes.includes(consoleItem!.type) && 
                    new Date(p.expiryDate) > new Date() &&
                    p.remainingMinutes > 0
                 );

                 return (
                 <button 
                  key={m.id}
                  onClick={() => {
                    setTempMemberId(m.id);
                    setTempCustomerName(m.name);
                  }}
                  className={`p-3 rounded-lg border text-left transition-all relative ${
                    tempMemberId === m.id 
                    ? 'bg-violet-600/20 border-violet-500 text-white' 
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                 >
                   <div className="font-medium text-sm">{m.name}</div>
                   {validPackage && (
                       <div className="text-xs text-amber-400 flex items-center gap-1 mt-1">
                           <Crown size={10} /> {validPackage.type} ({validPackage.remainingMinutes}m)
                       </div>
                   )}
                 </button>
              )})}
            </div>

            <Button className="w-full py-3" onClick={handleStartRental}>
              <Play size={18} /> Start Timer
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderMemberActionModal = () => {
      if (!showMemberActionModal || !selectedMemberForAction) return null;
      
      const formatPriceK = (val: number) => `${APP_SETTINGS.currency}${(val/1000)}k`;

      return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-xl w-full max-w-md border border-slate-700 shadow-2xl overflow-hidden p-6 animate-fade-in">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-xl text-white">Top Up / Buy Membership</h3>
                    <button onClick={() => setShowMemberActionModal(false)} className="text-slate-400 hover:text-white"><X /></button>
                </div>
                <p className="text-slate-400 mb-6 text-sm">Select a package for <span className="text-white font-bold">{selectedMemberForAction.name}</span></p>

                <div className="space-y-4">
                    {/* Bocil Package */}
                    <div className="border border-slate-700 rounded-xl p-4 bg-slate-800/50">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <span className="font-bold text-emerald-400 text-lg block">BOCIL Package</span>
                                <span className="text-xs text-slate-500">10 Hours Playtime • 3 Free Drinks</span>
                            </div>
                            <span className="text-xs font-bold bg-slate-700 text-slate-300 px-2 py-1 rounded">30 Days</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                disabled={actionLoading}
                                onClick={() => handleBuyPackage(selectedMemberForAction.id, 'Bocil', false)}
                                className="h-14 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 active:scale-95 transition-all flex flex-col items-center justify-center disabled:opacity-50"
                            >
                                <span className="text-xs font-bold text-slate-400">PS3 Only</span>
                                <span className="text-sm font-bold text-white">{formatPriceK(30000)}</span>
                            </button>
                            <button 
                                disabled={actionLoading}
                                onClick={() => handleBuyPackage(selectedMemberForAction.id, 'Bocil', true)}
                                className="h-14 rounded-lg bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 shadow-lg shadow-emerald-900/20 active:scale-95 transition-all flex flex-col items-center justify-center disabled:opacity-50"
                            >
                                <span className="text-xs font-bold text-emerald-100">PS4 Only</span>
                                <span className="text-sm font-bold text-white">{formatPriceK(50000)}</span>
                            </button>
                        </div>
                    </div>

                    {/* Juragan Package */}
                    <div className="border border-amber-500/30 rounded-xl p-4 bg-slate-800/50">
                         <div className="flex justify-between items-center mb-4">
                            <div>
                                <span className="font-bold text-amber-400 text-lg block">JURAGAN Package</span>
                                <span className="text-xs text-slate-500">14 Hours Playtime • 7 Free Drinks</span>
                            </div>
                            <span className="text-xs font-bold bg-slate-700 text-slate-300 px-2 py-1 rounded">7 Days</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                disabled={actionLoading}
                                onClick={() => handleBuyPackage(selectedMemberForAction.id, 'Juragan', false)}
                                className="h-14 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 active:scale-95 transition-all flex flex-col items-center justify-center disabled:opacity-50"
                            >
                                <span className="text-xs font-bold text-slate-400">PS3 Only</span>
                                <span className="text-sm font-bold text-white">{formatPriceK(39000)}</span>
                            </button>
                            <button 
                                disabled={actionLoading}
                                onClick={() => handleBuyPackage(selectedMemberForAction.id, 'Juragan', true)}
                                className="h-14 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 border border-orange-500 shadow-lg shadow-orange-900/20 active:scale-95 transition-all flex flex-col items-center justify-center disabled:opacity-50"
                            >
                                <span className="text-xs font-bold text-orange-100">PS4 Only</span>
                                <span className="text-sm font-bold text-white">{formatPriceK(65000)}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  const renderExpenseModal = () => {
    if (!showExpenseModal) return null;
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-xl w-full max-w-sm border border-slate-700 p-6 shadow-2xl animate-fade-in border-t-4 border-t-rose-500">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-xl text-white flex items-center gap-2">
                 <div className="bg-rose-500/20 p-1.5 rounded-lg text-rose-500">
                     <TrendingDown size={20}/>
                 </div>
                 Record Expense
             </h3>
             <button onClick={() => setShowExpenseModal(false)} className="text-slate-400"><X /></button>
          </div>
          
          <form onSubmit={handleSaveExpense} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Notes / Description</label>
              <textarea 
                name="note" 
                required 
                className="w-full bg-slate-800 rounded p-3 text-white border border-slate-700 focus:border-rose-500 outline-none resize-none h-24"
                placeholder="e.g. Restock Coca Cola, Electricity Bill, Internet"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Cost ({APP_SETTINGS.currency})</label>
              <input 
                type="number" 
                name="amount" 
                required 
                className="w-full bg-slate-800 rounded p-3 text-white border border-slate-700 focus:border-rose-500 outline-none font-mono text-lg"
                placeholder="0"
                min="0"
              />
            </div>

            <div className="pt-2">
                 <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-900/40">
                     Save Record
                 </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const renderMembers = () => (
    <div className="space-y-6 pb-24 animate-fade-in">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Members</h1>
        <Button variant="secondary" className="px-3" onClick={() => setShowNewMemberModal(true)}>
            <Plus size={18} />
        </Button>
      </header>
      <div className="grid gap-4">
        {members.map(m => {
            const hasPackages = m.activePackages.length > 0;
            
            return (
              <Card key={m.id} className="relative overflow-hidden">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-slate-900 text-lg bg-slate-600 text-slate-300">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{m.name}</h4>
                      <p className="text-xs text-slate-400">{m.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                     {hasPackages ? (
                         <div className="flex flex-col items-end gap-1">
                             <span className="text-xs text-emerald-400 font-bold">{m.activePackages.length} Active Pkg</span>
                         </div>
                     ) : (
                         <span className="text-xs text-slate-500">No Active Package</span>
                     )}
                  </div>
                </div>

                {hasPackages ? (
                    <div className="space-y-3 relative z-10">
                        {m.activePackages.map((pkg, idx) => (
                             <div key={idx} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                                <div className="flex justify-between items-center mb-2">
                                     <div className="flex items-center gap-2">
                                         <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border ${
                                            pkg.validConsoleTypes.includes(ConsoleType.PS4) 
                                            ? 'bg-violet-500/10 text-violet-400 border-violet-500/50' 
                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/50'
                                        }`}>
                                            {pkg.validConsoleTypes.includes(ConsoleType.PS4) ? 'PS4/5' : 'PS3'}
                                        </span>
                                        <span className="text-xs font-bold text-white">{pkg.type}</span>
                                     </div>
                                     <span className="text-[10px] text-slate-400">Exp: {new Date(pkg.expiryDate).toLocaleDateString()}</span>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">Playtime</span>
                                        <span className="text-white font-mono">{Math.floor(pkg.remainingMinutes / 60)}h {pkg.remainingMinutes % 60}m</span>
                                    </div>
                                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-violet-500 h-full rounded-full" style={{ width: `${Math.min(100, (pkg.remainingMinutes / pkg.initialMinutes) * 100)}%` }}></div>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">Free Drinks</span>
                                        <span className="text-white font-mono">{pkg.remainingDrinks} left</span>
                                    </div>
                                    <div className="flex gap-1">
                                        {Array.from({length: Math.min(pkg.initialDrinks, 10)}).map((_, i) => (
                                            <div key={i} className={`h-1.5 w-1.5 rounded-full ${i < pkg.remainingDrinks ? 'bg-emerald-400' : 'bg-slate-700'}`}></div>
                                        ))}
                                    </div>
                                </div>
                             </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-4">
                        <Button className="w-full text-sm py-2" onClick={() => {
                            setSelectedMemberForAction(m);
                            setShowMemberActionModal(true);
                        }}>
                            Buy Package
                        </Button>
                    </div>
                )}
                
                {/* Renew/Add Button always visible */}
                <div className="mt-4 flex justify-end">
                    <button 
                        onClick={() => {
                            setSelectedMemberForAction(m);
                            setShowMemberActionModal(true);
                        }}
                        className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
                    >
                        {hasPackages ? 'Top Up / Add New' : ''}
                    </button>
                </div>
              </Card>
            )
        })}
      </div>
    </div>
  );

  const renderHistory = () => {
    // 1. Determine Filter Date Range
    const now = new Date();
    let filterDate = new Date();
    
    if (historyFilter === 'daily') {
        filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
    } else if (historyFilter === 'weekly') {
        filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
        filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // 2. Filter Data
    const filteredRentals = rentals.filter(r => !r.isActive && new Date(r.startTime) >= filterDate);
    const filteredMemberships = membershipLogs.filter(l => new Date(l.timestamp) >= filterDate);
    const filteredExpenses = expenses.filter(e => new Date(e.timestamp) >= filterDate);

    // 3. Calculate Stats
    const rentalIncome = filteredRentals.reduce((sum, r) => sum + r.totalPrice, 0);
    const membershipIncome = filteredMemberships.reduce((sum, m) => sum + m.amount, 0);
    const totalIncome = rentalIncome + membershipIncome;
    const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalIncome - totalExpense;

    // 4. Merge & Sort for List
    const combinedHistory = [
      ...filteredRentals.map(r => ({ ...r, entryType: 'rental' as const, dateStr: r.startTime })),
      ...filteredMemberships.map(l => ({ ...l, entryType: 'membership' as const, dateStr: l.timestamp })),
      ...filteredExpenses.map(e => ({ ...e, entryType: 'expense' as const, dateStr: e.timestamp }))
    ].sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime());

    // 5. Group by Date
    const groupedHistory: Record<string, typeof combinedHistory> = {};
    combinedHistory.forEach(item => {
        const dateKey = new Date(item.dateStr).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
        if (!groupedHistory[dateKey]) groupedHistory[dateKey] = [];
        groupedHistory[dateKey].push(item);
    });

    return (
      <div className="space-y-6 pb-24 animate-fade-in">
        {/* Header & Export */}
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">History</h1>
          <Button variant="secondary" onClick={handleExportExcel} className="text-xs px-3">
             <FileSpreadsheet size={16} /> Export Report
          </Button>
        </header>

        {/* Filter Tabs */}
        <div className="bg-slate-800 p-1 rounded-xl flex">
            {(['daily', 'weekly', 'monthly'] as const).map(f => (
                <button
                    key={f}
                    onClick={() => setHistoryFilter(f)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg capitalize transition-all ${
                        historyFilter === f 
                        ? 'bg-slate-700 text-white shadow-lg' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    {f}
                </button>
            ))}
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
             <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                 <div className="flex items-center gap-1.5 mb-1 text-emerald-400">
                     <ArrowDownLeft size={14} />
                     <span className="text-[10px] uppercase font-bold tracking-wider">Income</span>
                 </div>
                 <div className="text-sm md:text-lg font-bold text-white truncate">
                    {APP_SETTINGS.currency}{(totalIncome/1000).toFixed(0)}k
                 </div>
             </div>
             <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
                 <div className="flex items-center gap-1.5 mb-1 text-rose-400">
                     <ArrowUpRight size={14} />
                     <span className="text-[10px] uppercase font-bold tracking-wider">Expense</span>
                 </div>
                 <div className="text-sm md:text-lg font-bold text-white truncate">
                    {APP_SETTINGS.currency}{(totalExpense/1000).toFixed(0)}k
                 </div>
             </div>
             <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
                 <div className="flex items-center gap-1.5 mb-1 text-indigo-400">
                     <Wallet size={14} />
                     <span className="text-[10px] uppercase font-bold tracking-wider">Profit</span>
                 </div>
                 <div className={`text-sm md:text-lg font-bold truncate ${netProfit >= 0 ? 'text-indigo-200' : 'text-rose-300'}`}>
                    {APP_SETTINGS.currency}{(netProfit/1000).toFixed(0)}k
                 </div>
             </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-6">
          {Object.keys(groupedHistory).length === 0 ? (
              <div className="text-center text-slate-500 py-10 flex flex-col items-center">
                  <History size={48} className="opacity-20 mb-4"/>
                  <p>No records found for this period.</p>
              </div>
          ) : (
              Object.entries(groupedHistory).map(([date, items]) => (
                  <div key={date}>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1 sticky top-0 bg-slate-900/90 backdrop-blur py-2 z-10 w-fit px-2 rounded">
                        {date}
                      </h3>
                      <div className="space-y-3">
                        {items.map((item, idx) => {
                            const dateObj = new Date(item.dateStr);
                            const timeStr = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

                            if (item.entryType === 'rental') {
                                const r = item as RentalSession & { entryType: 'rental' };
                                const consoleName = consoles.find(c => c.id === r.consoleId)?.name || 'Unknown';
                                return (
                                    <div key={idx} className="bg-slate-800 rounded-lg p-3 border border-slate-700 border-l-4 border-l-slate-500 flex justify-between items-center shadow-md">
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-white truncate flex items-center gap-1.5">
                                                    {consoleName}
                                                </span>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="font-mono text-emerald-400 font-bold text-sm">
                                                        +{APP_SETTINGS.currency}{r.totalPrice.toLocaleString()}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500">{r.endTime ? Math.ceil((new Date(r.endTime).getTime() - new Date(r.startTime).getTime())/60000) : 0} mins</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-slate-400 mb-0.5 truncate flex items-center gap-1">
                                                {r.customerName} {r.isMembershipSession && <Crown size={10} className="text-amber-400" />}
                                            </div>
                                            <div className="text-[10px] text-slate-600">
                                                {dateObj.toLocaleDateString()} • {timeStr}
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else if (item.entryType === 'membership') {
                                const m = item as MembershipTransaction & { entryType: 'membership' };
                                return (
                                    <div key={idx} className="bg-slate-800 rounded-lg p-3 border border-slate-700 border-l-4 border-l-amber-500 flex justify-between items-center shadow-md">
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-amber-400 truncate flex items-center gap-1.5">
                                                    <CreditCard size={14}/> Membership
                                                </span>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="font-mono text-amber-400 font-bold text-sm">
                                                        +{APP_SETTINGS.currency}{m.amount.toLocaleString()}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500">Prepaid</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-white mb-0.5 truncate font-medium">
                                                {m.memberName}
                                            </div>
                                            <div className="text-[10px] text-slate-500 truncate">
                                                {m.packageType} • {m.note || 'New'}
                                            </div>
                                             <div className="text-[10px] text-slate-600 mt-0.5">
                                                {dateObj.toLocaleDateString()} • {timeStr}
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else {
                                const e = item as ExpenseRecord & { entryType: 'expense' };
                                return (
                                    <div key={idx} className="bg-slate-800 rounded-lg p-3 border border-slate-700 border-l-4 border-l-rose-500 flex justify-between items-center shadow-md">
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-rose-400 truncate flex items-center gap-1.5">
                                                    <TrendingDown size={14}/> Expense
                                                </span>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="font-mono text-rose-400 font-bold text-sm">
                                                        -{APP_SETTINGS.currency}{e.amount.toLocaleString()}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500">Cost</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-white mb-0.5 truncate font-medium">
                                                {e.note}
                                            </div>
                                            <div className="text-[10px] text-slate-500 truncate">
                                                By {e.staffName}
                                            </div>
                                             <div className="text-[10px] text-slate-600 mt-0.5">
                                                {dateObj.toLocaleDateString()} • {timeStr}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                      </div>
                  </div>
              ))
          )}
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    //  Access Control Logic: 
    //  Admin: Access everything
    //  Staff: Access only 'items' (product management)
    
    // Check if user is allowed to see settings at all (Staff or Admin)
    if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.STAFF) {
         return <div className="p-4 text-center text-rose-500">Access Denied</div>;
    }

    // Define available tabs based on role
    const availableTabs = user?.role === UserRole.ADMIN 
        ? ['pricing', 'consoles', 'items', 'staff']
        : ['items'];
    
    // If current tab is not allowed for this user, switch to the first available tab
    // (e.g. if Staff tries to view 'pricing')
    if (!availableTabs.includes(settingsTab as any)) {
         // Use setTimeout to avoid render-loop warning, or just force render correct tab next time. 
         // Since we are inside render, we shouldn't set state directly unless we return early or handle it.
         // A cleaner way is to just render the content of the default tab without setting state, 
         // OR ensure state is correct before rendering.
         // For simplicity here, we'll just guard the renders below.
    }

     return (
       <div className="space-y-6 pb-24 animate-fade-in">
         <header>
           <h1 className="text-2xl font-bold text-white mb-4">Settings</h1>
           <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
              {availableTabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setSettingsTab(tab as any)}
                    className={`px-4 py-2 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-colors ${
                        settingsTab === tab 
                        ? 'bg-violet-600 text-white' 
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                      {tab}
                  </button>
              ))}
           </div>
         </header>

         {settingsTab === 'pricing' && availableTabs.includes('pricing') && (
             <div className="space-y-4">
                 {[ConsoleType.PS3, ConsoleType.PS4, ConsoleType.PS5].map(type => (
                     <Card key={type}>
                         <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                             <Gamepad2 size={18}/> {type} Pricing
                         </h3>
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="text-xs text-slate-500 uppercase font-bold">Day Rate / Hr</label>
                                 <div className="flex items-center gap-2 mt-1 bg-slate-900 rounded p-2 border border-slate-700">
                                     <span className="text-slate-500 text-sm">Rp</span>
                                     <input 
                                        type="number"
                                        className="bg-transparent text-white w-full outline-none"
                                        value={pricingRules[type].day}
                                        onChange={(e) => handleUpdatePrice(type, 'day', e.target.value)}
                                     />
                                 </div>
                             </div>
                             <div>
                                 <label className="text-xs text-slate-500 uppercase font-bold">Night Rate / Hr</label>
                                 <div className="flex items-center gap-2 mt-1 bg-slate-900 rounded p-2 border border-slate-700">
                                     <span className="text-slate-500 text-sm">Rp</span>
                                     <input 
                                        type="number"
                                        className="bg-transparent text-white w-full outline-none"
                                        value={pricingRules[type].night}
                                        onChange={(e) => handleUpdatePrice(type, 'night', e.target.value)}
                                     />
                                 </div>
                             </div>
                         </div>
                     </Card>
                 ))}
             </div>
         )}

         {settingsTab === 'consoles' && availableTabs.includes('consoles') && (
             <div className="space-y-4">
                 <Button className="w-full" onClick={() => { setEditingConsole(null); setShowConsoleModal(true); }}>
                     <Plus size={18}/> Add New Console
                 </Button>
                 {consoles.map(c => (
                     <Card key={c.id} className="flex justify-between items-center">
                         <div>
                             <div className="font-bold text-white">{c.name}</div>
                             <div className="text-xs text-slate-500">{c.type} • {c.status}</div>
                         </div>
                         <div className="flex gap-2">
                             <Button variant="secondary" className="px-2 py-1" onClick={() => { setEditingConsole(c); setShowConsoleModal(true); }}>
                                 <Edit size={14}/>
                             </Button>
                             <Button variant="danger" className="px-2 py-1" onClick={() => handleDeleteConsole(c.id)}>
                                 <Trash2 size={14}/>
                             </Button>
                         </div>
                     </Card>
                 ))}
             </div>
         )}

         {(settingsTab === 'items' || (user?.role === UserRole.STAFF)) && availableTabs.includes('items') && (
             <div className="space-y-4">
                 <Button className="w-full" onClick={() => { setEditingProduct(null); setShowProductModal(true); }}>
                     <Plus size={18}/> Add New Product
                 </Button>
                 {products.map(p => (
                     <Card key={p.id} className="flex justify-between items-center">
                         <div>
                             <div className="font-bold text-white">{p.name}</div>
                             <div className="text-xs text-slate-500">{p.category} • Stock: {p.stock}</div>
                         </div>
                         <div className="flex items-center gap-3">
                             <span className="font-mono text-emerald-400">{APP_SETTINGS.currency}{p.price.toLocaleString()}</span>
                             <div className="flex gap-2">
                                <Button variant="secondary" className="px-2 py-1" onClick={() => { setEditingProduct(p); setShowProductModal(true); }}>
                                    <Edit size={14}/>
                                </Button>
                                {user?.role === UserRole.ADMIN && (
                                    <Button variant="danger" className="px-2 py-1" onClick={() => handleDeleteProduct(p.id)}>
                                        <Trash2 size={14}/>
                                    </Button>
                                )}
                             </div>
                         </div>
                     </Card>
                 ))}
             </div>
         )}

         {settingsTab === 'staff' && availableTabs.includes('staff') && (
             <div className="space-y-4">
                 <Button className="w-full" onClick={() => { setEditingStaff(null); setShowStaffModal(true); }}>
                     <Plus size={18}/> Add Staff Account
                 </Button>
                 {staffUsers.map(u => (
                     <Card key={u.id} className="flex justify-between items-center">
                         <div>
                             <div className="font-bold text-white">{u.name}</div>
                             <div className="text-xs text-slate-500">@{u.username} • {u.role}</div>
                         </div>
                         {u.id !== user.id && (
                             <div className="flex gap-2">
                                <Button variant="secondary" className="px-2 py-1" onClick={() => { setEditingStaff(u); setShowStaffModal(true); }}>
                                    <Edit size={14}/>
                                </Button>
                                <Button variant="danger" className="px-2 py-1" onClick={() => handleDeleteStaff(u.id)}>
                                    <Trash2 size={14}/>
                                </Button>
                             </div>
                         )}
                     </Card>
                 ))}
             </div>
         )}
       </div>
     );
  };

  const renderItemsModal = () => {
    if (!showItemsModal) return null;
    
    // Group items by category
    const drinks = products.filter(p => p.category === ProductCategory.DRINK);
    const foods = products.filter(p => p.category === ProductCategory.FOOD);
    const addons = products.filter(p => p.category === ProductCategory.ADDON);

    const renderProductGrid = (items: Product[]) => (
        <div className="grid grid-cols-2 gap-3">
            {items.map(p => (
                <button 
                    key={p.id}
                    onClick={() => addItemToRental(p.id)}
                    className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-left hover:border-violet-500 active:scale-95 transition-all"
                >
                    <div className="font-bold text-white text-sm">{p.name}</div>
                    <div className="flex justify-between items-center mt-1">
                        <span className="text-emerald-400 text-xs font-mono">{APP_SETTINGS.currency}{p.price.toLocaleString()}</span>
                        <span className="text-slate-500 text-[10px]">Qty: {p.stock}</span>
                    </div>
                </button>
            ))}
        </div>
    );

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl w-full max-w-md border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-fade-in">
             <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-lg text-white">Add Items</h3>
                <button onClick={() => setShowItemsModal(false)} className="text-slate-400 hover:text-white"><X /></button>
             </div>
             <div className="p-4 overflow-y-auto space-y-6">
                 {drinks.length > 0 && (
                     <div>
                         <h4 className="text-slate-400 text-xs font-bold uppercase mb-2 flex items-center gap-2"><Coffee size={12}/> Drinks</h4>
                         {renderProductGrid(drinks)}
                     </div>
                 )}
                 {foods.length > 0 && (
                     <div>
                         <h4 className="text-slate-400 text-xs font-bold uppercase mb-2 flex items-center gap-2"><ShoppingCart size={12}/> Food & Snacks</h4>
                         {renderProductGrid(foods)}
                     </div>
                 )}
                 {addons.length > 0 && (
                     <div>
                         <h4 className="text-slate-400 text-xs font-bold uppercase mb-2">Add-ons</h4>
                         {renderProductGrid(addons)}
                     </div>
                 )}
             </div>
          </div>
      </div>
    );
  };

  const renderEndRentalSummary = () => {
      if (!showEndRentalSummary || !selectedConsoleId) return null;
      const rental = getActiveRental(selectedConsoleId);
      if (!rental) return null;

      return (
        <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-6">
             <div className="bg-slate-900 rounded-2xl w-full max-w-sm border border-slate-700 p-6 animate-scale-up">
                 <div className="text-center mb-6">
                     <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                         <Receipt size={32} />
                     </div>
                     <h2 className="text-2xl font-bold text-white">Payment Summary</h2>
                     <p className="text-slate-400">{rental.customerName}</p>
                 </div>

                 <div className="space-y-3 mb-8 border-t border-b border-slate-800 py-4">
                     <div className="flex justify-between text-slate-300">
                         <span>Rental Fee</span>
                         <span>{APP_SETTINGS.currency}{rental.subtotalRental.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                     </div>
                     <div className="flex justify-between text-slate-300">
                         <span>Items ({rental.items.reduce((a,b)=>a+b.quantity,0)})</span>
                         <span>{APP_SETTINGS.currency}{rental.subtotalItems.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-800">
                         <span className="font-bold text-white">Total To Pay</span>
                         <span className="font-bold text-2xl text-emerald-400 font-mono">
                             {APP_SETTINGS.currency}{rental.totalPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                         </span>
                     </div>
                 </div>

                 <div className="space-y-3">
                     <Button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50" onClick={() => handleEndRental(rental.id)}>
                         Confirm Payment
                     </Button>
                     <Button variant="ghost" className="w-full" onClick={() => setShowEndRentalSummary(false)}>
                         Cancel
                     </Button>
                 </div>
             </div>
        </div>
      );
  }

  const renderConsoleModal = () => {
    if (!showConsoleModal) return null;
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
         <div className="bg-slate-900 rounded-xl w-full max-w-sm border border-slate-700 p-6">
             <h3 className="font-bold text-xl text-white mb-4">{editingConsole ? 'Edit Console' : 'New Console'}</h3>
             <form onSubmit={handleSaveConsole} className="space-y-4">
                 <div>
                     <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Name</label>
                     <input name="name" defaultValue={editingConsole?.name} required className="w-full bg-slate-800 rounded p-2 text-white border border-slate-700 focus:border-violet-500 outline-none" placeholder="e.g. Station 1"/>
                 </div>
                 <div>
                     <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Type</label>
                     <select name="type" defaultValue={editingConsole?.type || ConsoleType.PS5} className="w-full bg-slate-800 rounded p-2 text-white border border-slate-700 outline-none">
                         {Object.values(ConsoleType).map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                 </div>
                 <div>
                     <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Status</label>
                     <select name="status" defaultValue={editingConsole?.status || ConsoleStatus.AVAILABLE} className="w-full bg-slate-800 rounded p-2 text-white border border-slate-700 outline-none">
                         {Object.values(ConsoleStatus).map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                 </div>
                 <div className="flex gap-3 mt-6">
                     <Button className="flex-1" type="submit"><Save size={16}/> Save</Button>
                     <Button variant="ghost" type="button" onClick={() => setShowConsoleModal(false)}>Cancel</Button>
                 </div>
             </form>
         </div>
      </div>
    );
  }

  const renderProductModal = () => {
      if (!showProductModal) return null;
      return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
           <div className="bg-slate-900 rounded-xl w-full max-w-sm border border-slate-700 p-6">
               <h3 className="font-bold text-xl text-white mb-4">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
               <form onSubmit={handleSaveProduct} className="space-y-4">
                   <div>
                       <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Name</label>
                       <input name="name" defaultValue={editingProduct?.name} required className="w-full bg-slate-800 rounded p-2 text-white border border-slate-700 focus:border-violet-500 outline-none"/>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                       <div>
                           <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Price</label>
                           <input type="number" name="price" defaultValue={editingProduct?.price} required className="w-full bg-slate-800 rounded p-2 text-white border border-slate-700 focus:border-violet-500 outline-none"/>
                       </div>
                       <div>
                           <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Stock</label>
                           <input type="number" name="stock" defaultValue={editingProduct?.stock} required className="w-full bg-slate-800 rounded p-2 text-white border border-slate-700 focus:border-violet-500 outline-none"/>
                       </div>
                   </div>
                   <div>
                       <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Category</label>
                       <select name="category" defaultValue={editingProduct?.category || ProductCategory.DRINK} className="w-full bg-slate-800 rounded p-2 text-white border border-slate-700 outline-none">
                           {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                   </div>
                   <div className="flex gap-3 mt-6">
                       <Button className="flex-1" type="submit"><Save size={16}/> Save</Button>
                       <Button variant="ghost" type="button" onClick={() => setShowProductModal(false)}>Cancel</Button>
                   </div>
               </form>
           </div>
        </div>
      );
    }
  
    const renderStaffModal = () => {
      if (!showStaffModal) return null;
      return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
           <div className="bg-slate-900 rounded-xl w-full max-w-sm border border-slate-700 p-6">
               <h3 className="font-bold text-xl text-white mb-4">{editingStaff ? 'Edit Staff' : 'New Staff'}</h3>
               <form onSubmit={handleSaveStaff} className="space-y-4">
                   <div>
                       <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Name</label>
                       <input name="name" defaultValue={editingStaff?.name} required className="w-full bg-slate-800 rounded p-2 text-white border border-slate-700 focus:border-violet-500 outline-none"/>
                   </div>
                   <div>
                       <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Username</label>
                       <input name="username" defaultValue={editingStaff?.username} required className="w-full bg-slate-800 rounded p-2 text-white border border-slate-700 focus:border-violet-500 outline-none"/>
                   </div>
                   <div>
                       <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Password {editingStaff && '(Leave blank to keep)'}</label>
                       <input name="password" type="password" className="w-full bg-slate-800 rounded p-2 text-white border border-slate-700 focus:border-violet-500 outline-none"/>
                   </div>
                   <div>
                       <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Role</label>
                       <select name="role" defaultValue={editingStaff?.role || UserRole.STAFF} className="w-full bg-slate-800 rounded p-2 text-white border border-slate-700 outline-none">
                           {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                       </select>
                   </div>
                   <div className="flex gap-3 mt-6">
                       <Button className="flex-1" type="submit"><Save size={16}/> Save</Button>
                       <Button variant="ghost" type="button" onClick={() => setShowStaffModal(false)}>Cancel</Button>
                   </div>
               </form>
           </div>
        </div>
      );
    }

    const renderNewMemberModal = () => {
        if (!showNewMemberModal) return null;
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
                <div className="bg-slate-900 rounded-xl w-full max-w-sm border border-slate-700 p-6">
                    <h3 className="font-bold text-xl text-white mb-4">Register Member</h3>
                    <form onSubmit={handleCreateMember} className="space-y-4">
                        <div>
                            <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Full Name</label>
                            <input name="name" required className="w-full bg-slate-800 rounded p-2 text-white border border-slate-700 focus:border-violet-500 outline-none" placeholder="e.g. John Doe"/>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Phone Number</label>
                            <input name="phone" required className="w-full bg-slate-800 rounded p-2 text-white border border-slate-700 focus:border-violet-500 outline-none" placeholder="e.g. 0812..."/>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button className="flex-1" type="submit"><Save size={16}/> Register</Button>
                            <Button variant="ghost" type="button" onClick={() => setShowNewMemberModal(false)}>Cancel</Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-violet-500/30">
      
      {/* Main Content Area */}
      <main className="max-w-md mx-auto min-h-screen relative shadow-2xl bg-slate-900 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 scrollbar-hide">
          {view === 'dashboard' && renderDashboard()}
          {view === 'consoles' && renderConsoles()}
          {view === 'history' && renderHistory()}
          {view === 'members' && renderMembers()}
          {view === 'settings' && renderSettings()}
        </div>

        {/* Sticky Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 p-2 flex justify-around items-center z-40 pb-6 pt-3">
          <button 
            onClick={() => setView('dashboard')} 
            className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-colors ${view === 'dashboard' ? 'text-violet-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          
          <button 
            onClick={() => setView('consoles')} 
            className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-colors ${view === 'consoles' ? 'text-violet-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Gamepad2 size={24} />
            <span className="text-[10px] font-medium">Consoles</span>
          </button>

          <button 
            className="p-3 -mt-6 bg-violet-600 rounded-full text-white shadow-lg shadow-violet-600/40 hover:scale-105 transition-transform"
            onClick={() => setView('consoles')}
          >
            <Plus size={28} />
          </button>

          <button 
            onClick={() => setView('members')} 
            className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-colors ${view === 'members' ? 'text-violet-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Users size={24} />
            <span className="text-[10px] font-medium">Members</span>
          </button>

          <button 
            onClick={() => setView('history')} 
            className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-colors ${view === 'history' ? 'text-violet-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <History size={24} />
            <span className="text-[10px] font-medium">History</span>
          </button>
        </nav>

        {/* Overlays */}
        {selectedConsoleId && consoles.find(c => c.id === selectedConsoleId)?.status === ConsoleStatus.IN_USE && renderActiveRentalDetail()}
        {renderStartRentalModal()}
        {renderItemsModal()}
        {renderEndRentalSummary()}
        {renderConsoleModal()}
        {renderProductModal()}
        {renderStaffModal()}
        {renderMemberActionModal()}
        {renderNewMemberModal()}
        {renderExpenseModal()}

      </main>
    </div>
  );
}
