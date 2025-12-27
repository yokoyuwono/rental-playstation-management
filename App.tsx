
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false,
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

// Safe UUID generator
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
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
  if (e.message) return String(e.message);
  if (e.error_description) return String(e.error_description);
  if (e.details) return String(e.details);
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
  
  // Iterate in 6-minute blocks (billing for every started 6-minute interval)
  while (current < end) {
    const hour = current.getHours();
    // Day: 06:00 to 17:59 (6am - 6pm)
    // Night: 18:00 to 05:59 (6pm - 6am)
    const isDay = hour >= 6 && hour < 18;
    
    const rules = pricingRules[type] || pricingRules[ConsoleType.PS5]; // Fallback to PS5
    const hourlyRate = isDay ? rules.day : rules.night;
    
    // Add cost for 6 minutes (1/10th of an hour)
    totalCost += hourlyRate / 10;
    
    // Advance 6 minutes
    current.setMinutes(current.getMinutes() + 6);
  }
  
  return Math.round(totalCost);
};

// --- MAIN APP COMPONENT ---

export default function App() {
  // --- STATE ---
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('PS_RENTAL_USER_SESSION');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [view, setView] = useState<ViewState>('dashboard');
  
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

  const [showMemberActionModal, setShowMemberActionModal] = useState(false);
  const [selectedMemberForAction, setSelectedMemberForAction] = useState<Member | null>(null);
  const [showNewMemberModal, setShowNewMemberModal] = useState(false);

  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const [historyFilter, setHistoryFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [settingsTab, setSettingsTab] = useState<'pricing' | 'consoles' | 'items' | 'staff'>('pricing');

  const [tempMemberId, setTempMemberId] = useState<string>('');
  const [tempCustomerName, setTempCustomerName] = useState<string>('');
  
  // State for editable summary cost
  const [summaryRentalCost, setSummaryRentalCost] = useState<number>(0);

  // --- DATA FETCHING ---
  
  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured) {
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

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(updateRentalTimer, 1000); 
    return () => clearInterval(interval);
  }, [updateRentalTimer, user]);

  // --- BACK BUTTON HANDLER ---
  const stateRef = useRef({
    view,
    showStartRentalModal,
    showItemsModal,
    showEndRentalSummary,
    showConsoleModal,
    showProductModal,
    showStaffModal,
    showMemberActionModal,
    showNewMemberModal,
    showExpenseModal,
    selectedConsoleId,
    consoles
  });

  useEffect(() => {
    stateRef.current = {
      view,
      showStartRentalModal,
      showItemsModal,
      showEndRentalSummary,
      showConsoleModal,
      showProductModal,
      showStaffModal,
      showMemberActionModal,
      showNewMemberModal,
      showExpenseModal,
      selectedConsoleId,
      consoles
    };
  }, [view, showStartRentalModal, showItemsModal, showEndRentalSummary, showConsoleModal, showProductModal, showStaffModal, showMemberActionModal, showNewMemberModal, showExpenseModal, selectedConsoleId, consoles]);

  useEffect(() => {
    if (!user) return;

    // Trap the back button
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (e: PopStateEvent) => {
        const s = stateRef.current;
        let handled = false;

        // Modal Priority
        if (s.showStartRentalModal) { setShowStartRentalModal(false); handled = true; }
        else if (s.showItemsModal) { setShowItemsModal(false); handled = true; }
        else if (s.showEndRentalSummary) { setShowEndRentalSummary(false); handled = true; }
        else if (s.showConsoleModal) { setShowConsoleModal(false); handled = true; }
        else if (s.showProductModal) { setShowProductModal(false); handled = true; }
        else if (s.showStaffModal) { setShowStaffModal(false); handled = true; }
        else if (s.showMemberActionModal) { setShowMemberActionModal(false); handled = true; }
        else if (s.showNewMemberModal) { setShowNewMemberModal(false); handled = true; }
        else if (s.showExpenseModal) { setShowExpenseModal(false); handled = true; }
        else if (s.selectedConsoleId) { 
             // Active Rental Detail Overlay Check
             const activeConsole = s.consoles.find(c => c.id === s.selectedConsoleId);
             if (activeConsole && activeConsole.status === ConsoleStatus.IN_USE) {
                 setSelectedConsoleId(null); 
                 handled = true; 
             }
        }
        
        // Navigation Fallback
        if (!handled && s.view !== 'dashboard') {
            setView('dashboard');
            handled = true;
        }

        if (handled) {
            // Restore trap
            window.history.pushState(null, '', window.location.href);
        } else {
            // Let the back action happen (potentially exit app)
        }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('PS_RENTAL_USER_SESSION');
    setUser(null);
    setView('dashboard');
  };

  // --- ACTIONS: RENTAL ---

  const handleStartRental = async () => {
    if (!selectedConsoleId || actionLoading) return;

    // Fix: Prevent duplicates by checking if session is already active
    if (rentals.some(r => r.consoleId === selectedConsoleId && r.isActive)) {
        alert("A session is already active on this console.");
        setShowStartRentalModal(false);
        return;
    }

    setActionLoading(true);

    try {
        let isMembershipSession = false;
        let customerName = tempCustomerName || 'Walk-in';

        if (tempMemberId) {
          const member = members.find(m => m.id === tempMemberId);
          const consoleItem = consoles.find(c => c.id === selectedConsoleId);
          
          if (member && member.activePackages.length > 0 && consoleItem) {
            const validPkg = member.activePackages.find(p => 
              p.validConsoleTypes.includes(consoleItem.type) &&
              new Date(p.expiryDate) > new Date() &&
              p.remainingMinutes > 0
            );

            if (validPkg) {
              isMembershipSession = true;
              customerName = member.name;
            } else {
                 if(member.activePackages.length > 0) {
                     const expired = member.activePackages.some(p => p.validConsoleTypes.includes(consoleItem.type) && new Date(p.expiryDate) <= new Date());
                     if(expired) alert("Membership expired.");
                     else alert("No valid minutes left or wrong console type package.");
                 }
                 customerName = member.name;
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
            if (error) throw error;

            const { error: consoleError } = await supabase.from('consoles').update({ status: 'in_use' }).eq('id', selectedConsoleId);
            if (consoleError) throw consoleError;
        }

        setRentals(prev => [...prev, newRental]);
        setConsoles(prev => prev.map(c => c.id === selectedConsoleId ? { ...c, status: ConsoleStatus.IN_USE } : c));
        
        setTempMemberId('');
        setTempCustomerName('');
        setShowStartRentalModal(false);
        setView('consoles');
    } catch (e) {
        alert("Failed to start rental: " + getErrorMessage(e));
    } finally {
        setActionLoading(false);
    }
  };

  const handleEndRental = async (rentalId: string, overrideRentalCost?: number) => {
    if (actionLoading) return;
    setActionLoading(true);

    try {
        const rental = rentals.find(r => r.id === rentalId);
        if (!rental) throw new Error("Rental session not found");

        const endTime = new Date().toISOString();
        const durationMs = new Date(endTime).getTime() - new Date(rental.startTime).getTime();
        const durationMinutes = Math.ceil(durationMs / 60000);

        // Determine Base Rental Cost (User Override or Calculated)
        const usedRentalCost = overrideRentalCost !== undefined ? overrideRentalCost : rental.subtotalRental;

        let updatedMember = null;
        let finalDiscount = 0;
        
        // Calculate Base Total before membership logic (Rental + Items)
        let calculatedTotal = usedRentalCost + rental.subtotalItems;

        // 2. Process Membership Deduction
        if (rental.memberId && rental.isMembershipSession) {
            const member = members.find(m => m.id === rental.memberId);
            const consoleItem = consoles.find(c => c.id === rental.consoleId);
            
            if (member && member.activePackages.length > 0 && consoleItem) {
               const pkgIndex = member.activePackages.findIndex(p => 
                   p.validConsoleTypes.includes(consoleItem.type) && 
                   new Date(p.expiryDate) > new Date()
               );

               if (pkgIndex >= 0) {
                   const pkg = member.activePackages[pkgIndex];
                   
                   // --- FREE DRINK LOGIC: Only "Es Teh" ---
                   const esTehItems = rental.items.filter(i => i.productName === 'Es Teh');
                   const esTehCount = esTehItems.reduce((sum, i) => sum + i.quantity, 0);
                   
                   const freeDrinksUsed = Math.min(pkg.remainingDrinks, esTehCount);
                   
                   // Calculate Discount
                   let discount = 0;
                   let remainingFree = freeDrinksUsed;
                   for (const item of esTehItems) {
                       if (remainingFree <= 0) break;
                       const deduct = Math.min(remainingFree, item.quantity);
                       discount += deduct * item.price;
                       remainingFree -= deduct;
                   }
                   
                   finalDiscount = discount;

                   const newMinutes = Math.max(0, pkg.remainingMinutes - durationMinutes);
                   const newDrinks = Math.max(0, pkg.remainingDrinks - freeDrinksUsed);
                   
                   const updatedPackages = [...member.activePackages];
                   updatedPackages[pkgIndex] = {
                       ...pkg,
                       remainingMinutes: newMinutes,
                       remainingDrinks: newDrinks
                   };

                   updatedMember = {
                       ...member,
                       activePackages: updatedPackages
                   };
               }
            }
        } 
        
        // Final Price Calculation
        const finalTotalPrice = Math.max(0, calculatedTotal - finalDiscount);

        // Update Member Stats
        if (rental.memberId) {
             const memberToUpdate = updatedMember || members.find(m => m.id === rental.memberId);
             if (memberToUpdate) {
                 updatedMember = {
                     ...memberToUpdate,
                     totalRentals: memberToUpdate.totalRentals + 1,
                     totalSpend: (memberToUpdate.totalSpend || 0) + finalTotalPrice
                 };
             }
        }

        if (updatedMember) {
            setMembers(prev => prev.map(m => m.id === updatedMember!.id ? updatedMember! : m));
            if (useSupabase) {
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
          endTime: endTime,
          totalPrice: finalTotalPrice,
          subtotalRental: usedRentalCost,
          discountAmount: finalDiscount
        };

        if (useSupabase) {
            const { error: rentalError } = await supabase.from('rentals').update({
                is_active: false,
                end_time: endTime,
                total_price: endedRental.totalPrice,
                subtotal_rental: endedRental.subtotalRental,
                subtotal_items: rental.subtotalItems,
                discount_amount: endedRental.discountAmount
            }).eq('id', rentalId);
            if (rentalError) throw rentalError;

            const { error: consoleError } = await supabase.from('consoles').update({ status: 'available' }).eq('id', rental.consoleId);
            if (consoleError) throw consoleError;
        }

        setRentals(prev => prev.map(r => r.id === rentalId ? endedRental : r));
        setConsoles(prev => prev.map(c => c.id === rental.consoleId ? { ...c, status: ConsoleStatus.AVAILABLE } : c));
        
        setShowEndRentalSummary(false);
        setSelectedConsoleId(null);

    } catch (e) {
        alert("Failed to end rental: " + getErrorMessage(e));
    } finally {
        setActionLoading(false);
    }
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
        
        const currentPackages = member.activePackages ? [...member.activePackages] : [];
        let isAccumulating = false;

        const matchingPkgIndex = currentPackages.findIndex(p => 
            JSON.stringify(p.validConsoleTypes.sort()) === JSON.stringify(validTypes.sort())
        );

        if (matchingPkgIndex >= 0) {
             const oldPkg = currentPackages[matchingPkgIndex];
             const oldExpiryDate = new Date(oldPkg.expiryDate);
             isAccumulating = true;
             
             newRemainingMinutes += oldPkg.remainingMinutes;
             newRemainingDrinks += oldPkg.remainingDrinks;
             
             const baseTime = oldExpiryDate > new Date() ? oldExpiryDate.getTime() : Date.now();
             newExpiry = new Date(baseTime + validityMs);

             currentPackages[matchingPkgIndex] = {
                 ...oldPkg,
                 remainingMinutes: newRemainingMinutes,
                 initialMinutes: newRemainingMinutes, 
                 remainingDrinks: newRemainingDrinks,
                 initialDrinks: newRemainingDrinks, 
                 expiryDate: newExpiry.toISOString(),
             };
        } else {
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
    // ... logic remains same ...
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

    const expenseRows = filteredExpenses.map(e => {
        const dateObj = new Date(e.timestamp);
        return {
             "Date": dateObj.toLocaleDateString(),
             "Time": dateObj.toLocaleTimeString(),
             "Customer/Staff": e.staffName,
             "Type": "EXPENSE",
             "Details": "Operational Cost",
             "Note": e.note,
             "Amount": -e.amount 
        };
    });

    const allRows = [...rentalRows, ...membershipRows, ...expenseRows].sort((a,b) => {
        return new Date(a.Date + " " + a.Time).getTime() - new Date(b.Date + " " + b.Time).getTime();
    });

    const totalIncome = rentalRows.reduce((sum, r) => sum + r.Amount, 0) + membershipRows.reduce((sum, m) => sum + m.Amount, 0);
    const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalIncome - totalExpense;

    allRows.push({} as any); 
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

    const worksheet = XLSX.utils.json_to_sheet(allRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);

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
    return <LoginScreen onLogin={(u) => {
        localStorage.setItem('PS_RENTAL_USER_SESSION', JSON.stringify(u));
        setUser(u);
    }} loading={loading} />;
  }

  // ... (dashboard and other render functions remain same)

  const renderDashboard = () => {
    const activeCount = rentals.filter(r => r.isActive).length;
    const availableCount = consoles.filter(c => c.status === ConsoleStatus.AVAILABLE).length;
    
    // Revenue Data Calculation
    const today = new Date().toISOString().split('T')[0];
    const todaysFinishedRentals = rentals.filter(r => !r.isActive && r.startTime.startsWith(today));
    const activeRentalsRevenue = rentals.filter(r => r.isActive).reduce((sum, r) => sum + r.totalPrice, 0);
    const finishedRentalsRevenue = todaysFinishedRentals.reduce((sum, r) => sum + r.totalPrice, 0);
    const todaysMembershipLogs = membershipLogs.filter(l => l.timestamp.startsWith(today));
    const membershipRevenue = todaysMembershipLogs.reduce((sum, l) => sum + l.amount, 0);
    const totalRevenueToday = finishedRentalsRevenue + activeRentalsRevenue + membershipRevenue;

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dayRentals = rentals.filter(r => !r.isActive && r.startTime.startsWith(dateStr));
        const dayRentalRev = dayRentals.reduce((sum, r) => sum + r.totalPrice, 0);
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

        <Card className="border-l-4 border-amber-500 bg-slate-800">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                <AlertTriangle size={20} className="text-amber-500" />
                <h3 className="font-bold text-white">Shop Attention Needed</h3>
            </div>
            <div className="space-y-3">
                {lowStockProducts.length > 0 && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-rose-400 text-sm font-bold flex items-center gap-2">
                                <TrendingDown size={14}/> Low Stock ({lowStockProducts.length})
                            </span>
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
                
                {maintenanceConsoles.length > 0 && (
                     <div className="bg-slate-700/50 rounded-lg p-3 flex justify-between items-center">
                         <span className="text-slate-300 text-sm font-semibold">
                            {maintenanceConsoles.length} Consoles in Maintenance
                         </span>
                         <Button variant="ghost" className="h-auto p-0 text-xs text-slate-400 underline" onClick={() => setView('consoles')}>Check</Button>
                    </div>
                )}

                {lowStockProducts.length === 0 && expiringMembers.length === 0 && maintenanceConsoles.length === 0 && (
                    <div className="text-center py-4 text-slate-500 text-sm">
                        <CheckCircle className="mx-auto mb-2 opacity-50" size={24} />
                        All systems running smoothly. No alerts.
                    </div>
                )}
            </div>
        </Card>

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
    const isDay = currentHour >= 6 && currentHour < 18;

    return (
      <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col animate-slide-up">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <Button variant="ghost" onClick={() => setSelectedConsoleId(null)}>
            <X />
          </Button>
          <h2 className="font-bold text-white">{consoleData?.name} - Session</h2>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="flex flex-col items-center justify-center py-8">
             <div className="text-6xl font-mono font-bold text-white tracking-tighter tabular-nums">
               {elapsedHrs.toString().padStart(2, '0')}:{elapsedMins.toString().padStart(2, '0')}
             </div>
             <p className="text-slate-400 mt-2">Duration</p>
          </div>

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

        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <Button 
            variant="danger" 
            className="w-full py-4 text-lg" 
            onClick={() => {
              setSummaryRentalCost(activeRental.subtotalRental);
              setShowEndRentalSummary(true);
            }}
          >
            <StopCircle className="mr-2" /> End Rental & Pay
          </Button>
        </div>
      </div>
    );
  };

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
                      setTempMemberId(''); 
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

            <Button className="w-full py-3" onClick={handleStartRental} disabled={actionLoading}>
              <Play size={18} /> {actionLoading ? 'Starting...' : 'Start Timer'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderMemberActionModal = () => {
    // ... logic remains same ...
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

  // ... (rest of modals render functions) ...

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

  const renderEndRentalSummary = () => {
      if (!showEndRentalSummary || !selectedConsoleId) return null;
      const rental = getActiveRental(selectedConsoleId);
      if (!rental) return null;

      const projectedTotal = summaryRentalCost + rental.subtotalItems;

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
                     <div className="flex justify-between items-center text-slate-300">
                         <span>Rental Fee</span>
                         <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">{APP_SETTINGS.currency}</span>
                            <input 
                                type="number" 
                                value={summaryRentalCost}
                                onChange={(e) => setSummaryRentalCost(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-24 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-right text-white font-mono focus:border-violet-500 outline-none"
                            />
                         </div>
                     </div>
                     <div className="flex justify-between text-slate-300">
                         <span>Items ({rental.items.reduce((a,b)=>a+b.quantity,0)})</span>
                         <span>{APP_SETTINGS.currency}{rental.subtotalItems.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-800">
                         <span className="font-bold text-white">Total To Pay</span>
                         <span className="font-bold text-2xl text-emerald-400 font-mono">
                             {APP_SETTINGS.currency}{projectedTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                         </span>
                     </div>
                 </div>

                 <div className="space-y-3">
                     <Button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50" onClick={() => handleEndRental(rental.id, summaryRentalCost)} disabled={actionLoading}>
                         {actionLoading ? 'Processing...' : 'Confirm Payment'}
                     </Button>
                     <Button variant="ghost" className="w-full" onClick={() => setShowEndRentalSummary(false)} disabled={actionLoading}>
                         Cancel
                     </Button>
                 </div>
             </div>
        </div>
      );
  }

  const renderHistory = () => {
    // Combine data
    const allHistory = [
      ...rentals.filter(r => !r.isActive).map(r => ({ ...r, type: 'rental' as const, date: new Date(r.startTime) })),
      ...membershipLogs.map(l => ({ ...l, type: 'membership' as const, date: new Date(l.timestamp) })),
      ...expenses.map(e => ({ ...e, type: 'expense' as const, date: new Date(e.timestamp) }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    // Filter
    const now = new Date();
    const filteredHistory = allHistory.filter(item => {
      const itemDate = item.date;
      if (historyFilter === 'daily') {
        return itemDate.toDateString() === now.toDateString();
      } else if (historyFilter === 'weekly') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= oneWeekAgo;
      } else {
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return itemDate >= oneMonthAgo;
      }
    });

    return (
      <div className="space-y-6 pb-24 animate-fade-in">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">History</h1>
          <Button variant="secondary" onClick={handleExportExcel} className="text-sm px-3">
            <FileSpreadsheet size={16} /> Export
          </Button>
        </header>

        <div className="flex bg-slate-800 p-1 rounded-lg">
          {(['daily', 'weekly', 'monthly'] as const).map(f => (
            <button
              key={f}
              onClick={() => setHistoryFilter(f)}
              className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                historyFilter === f ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <History size={48} className="mx-auto mb-4 opacity-20" />
              <p>No history records for this period.</p>
            </div>
          ) : (
            filteredHistory.map((item: any, idx) => {
              if (item.type === 'rental') {
                 return (
                  <Card key={`h_${idx}`} className="flex justify-between items-center border-l-4 border-l-violet-500">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-violet-400 uppercase">Rental</span>
                        <span className="text-xs text-slate-500">{item.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="font-bold text-white">{item.customerName}</p>
                      <p className="text-xs text-slate-400">
                        {consoles.find((c: any) => c.id === item.consoleId)?.name || 'Unknown Console'} • {item.items.length} Items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-400 font-mono">+{APP_SETTINGS.currency}{item.totalPrice.toLocaleString()}</p>
                    </div>
                  </Card>
                 );
              } else if (item.type === 'membership') {
                return (
                  <Card key={`h_${idx}`} className="flex justify-between items-center border-l-4 border-l-amber-500">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-amber-400 uppercase">Membership</span>
                        <span className="text-xs text-slate-500">{item.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="font-bold text-white">{item.memberName}</p>
                      <p className="text-xs text-slate-400">{item.note}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-400 font-mono">+{APP_SETTINGS.currency}{item.amount.toLocaleString()}</p>
                    </div>
                  </Card>
                );
              } else {
                 return (
                  <Card key={`h_${idx}`} className="flex justify-between items-center border-l-4 border-l-rose-500">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-rose-400 uppercase">Expense</span>
                        <span className="text-xs text-slate-500">{item.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="font-bold text-white">{item.note}</p>
                      <p className="text-xs text-slate-400">By {item.staffName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-rose-400 font-mono">-{APP_SETTINGS.currency}{item.amount.toLocaleString()}</p>
                    </div>
                  </Card>
                );
              }
            })
          )}
        </div>
      </div>
    );
  };

  const renderMembers = () => (
    <div className="space-y-6 pb-24 animate-fade-in">
       <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Members</h1>
        <Button onClick={() => setShowNewMemberModal(true)} className="px-3">
          <Plus size={18} /> New
        </Button>
      </header>

      <div className="space-y-3">
        {members.map(member => {
           const activePkg = member.activePackages.find(p => new Date(p.expiryDate) > new Date() && p.remainingMinutes > 0);
           
           // Calculate expiry days for urgency color
           let expiryDays = 0;
           if (activePkg) {
               const diff = new Date(activePkg.expiryDate).getTime() - new Date().getTime();
               expiryDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
           }

           return (
             <Card 
               key={member.id} 
               onClick={() => {
                   setSelectedMemberForAction(member);
                   setShowMemberActionModal(true);
               }}
               className="cursor-pointer hover:border-violet-500/50 transition-all group relative overflow-hidden"
             >
               {/* Decorative background for members with active package */}
               {activePkg && <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />}

               <div className="relative z-10">
                   {/* Top Section: Profile & Status */}
                   <div className="flex justify-between items-start mb-5">
                     <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-inner ring-1 ring-white/10 ${
                            activePkg 
                            ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-violet-500/20' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                            {member.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg leading-tight flex items-center gap-2">
                                {member.name}
                                {activePkg && activePkg.type === 'Juragan' && <Crown size={14} className="text-amber-400 fill-amber-400/20" />}
                            </h3>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{member.phone}</p>
                        </div>
                     </div>
                     
                     {activePkg ? (
                         <div className="text-right">
                             <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border shadow-sm ${
                                 activePkg.type === 'Juragan' 
                                 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                                 : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                             }`}>
                                 {activePkg.type}
                             </span>
                             <div className={`text-[10px] font-medium mt-1.5 flex items-center justify-end gap-1 ${expiryDays <= 3 ? 'text-rose-400' : 'text-slate-500'}`}>
                                 <CalendarClock size={10} />
                                 {expiryDays <= 0 ? 'Expires Today' : `${expiryDays} days left`}
                             </div>
                         </div>
                     ) : (
                         <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                             GUEST
                         </span>
                     )}
                   </div>

                   {/* Middle Section: Quick Stats */}
                   <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-950/30 rounded-lg p-2.5 flex items-center gap-3 border border-slate-800/50">
                             <div className="p-1.5 rounded bg-slate-800/80 text-slate-400">
                                <Gamepad2 size={14} />
                             </div>
                             <div>
                                 <p className="text-[10px] text-slate-500 uppercase font-bold leading-none mb-1">History</p>
                                 <p className="text-xs font-bold text-slate-200">{member.totalRentals} Sessions</p>
                             </div>
                        </div>
                        <div className="bg-slate-950/30 rounded-lg p-2.5 flex items-center gap-3 border border-slate-800/50">
                             <div className="p-1.5 rounded bg-slate-800/80 text-slate-400">
                                <Wallet size={14} />
                             </div>
                             <div>
                                 <p className="text-[10px] text-slate-500 uppercase font-bold leading-none mb-1">Total Spent</p>
                                 <p className="text-xs font-bold text-emerald-400">{APP_SETTINGS.currency}{(member.totalSpend || 0).toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1 })}</p>
                             </div>
                        </div>
                   </div>

                   {/* Bottom Section: Package Progress */}
                   {activePkg && (
                       <div className="space-y-3 pt-3 border-t border-slate-800/60">
                            {/* Time Progress */}
                            <div>
                                <div className="flex justify-between items-end mb-1.5">
                                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                                        <Timer size={12} className="text-violet-400"/> Remaining Time
                                    </span>
                                    <span className="text-[11px] font-mono text-slate-300">
                                        <strong className="text-white text-xs">{Math.floor(activePkg.remainingMinutes / 60)}h {activePkg.remainingMinutes % 60}m</strong> 
                                        <span className="text-slate-600"> / {Math.floor(activePkg.initialMinutes / 60)}h</span>
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            (activePkg.remainingMinutes / activePkg.initialMinutes) < 0.2 ? 'bg-rose-500' : 'bg-violet-500'
                                        }`}
                                        style={{ width: `${Math.min(100, (activePkg.remainingMinutes / activePkg.initialMinutes) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Drinks Progress */}
                            {activePkg.initialDrinks > 0 && (
                                <div>
                                     <div className="flex justify-between items-end mb-1.5">
                                        <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                                            <Coffee size={12} className="text-amber-400"/> Free Drinks
                                        </span>
                                        <span className="text-[11px] font-mono text-slate-300">
                                            <strong className="text-white text-xs">{activePkg.remainingDrinks}</strong> 
                                            <span className="text-slate-600"> / {activePkg.initialDrinks}</span>
                                        </span>
                                    </div>
                                    <div className="flex gap-1.5">
                                        {Array.from({ length: activePkg.initialDrinks }).map((_, i) => (
                                            <div 
                                                key={i}
                                                className={`h-1.5 flex-1 rounded-full transition-colors ${
                                                    i < activePkg.remainingDrinks ? 'bg-amber-500' : 'bg-slate-800'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                       </div>
                   )}
               </div>
               
               {/* Hover Hint */}
               <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <div className="bg-slate-700/50 backdrop-blur text-white p-1.5 rounded-lg">
                        <Edit size={12} />
                    </div>
               </div>
             </Card>
           );
        })}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 pb-24 animate-fade-in">
        <header className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Settings</h1>
        </header>

        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
            {(['pricing', 'consoles', 'items', 'staff'] as const).map(tab => (
                <button
                    key={tab}
                    onClick={() => setSettingsTab(tab)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm capitalize whitespace-nowrap transition-colors ${
                        settingsTab === tab 
                        ? 'bg-violet-600 text-white' 
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {settingsTab === 'pricing' && (
            <div className="space-y-4">
                <Card>
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Wallet size={18} className="text-violet-400"/> Hourly Rates
                    </h3>
                    <div className="space-y-4">
                        {[ConsoleType.PS3, ConsoleType.PS4, ConsoleType.PS5].map(type => (
                            <div key={type} className="bg-slate-900/50 p-3 rounded-lg">
                                <span className="font-bold text-slate-300 block mb-2">{type}</span>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">Day (06:00 - 18:00)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-500 text-sm">{APP_SETTINGS.currency}</span>
                                            <input 
                                                type="number"
                                                className="w-full bg-slate-800 border border-slate-700 rounded p-2 pl-10 text-white text-sm"
                                                value={pricingRules[type]?.day || 0}
                                                onChange={(e) => handleUpdatePrice(type, 'day', e.target.value)}
                                                disabled={user?.role !== UserRole.ADMIN}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">Night (18:01 - 05:59)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-500 text-sm">{APP_SETTINGS.currency}</span>
                                            <input 
                                                type="number"
                                                className="w-full bg-slate-800 border border-slate-700 rounded p-2 pl-10 text-white text-sm"
                                                value={pricingRules[type]?.night || 0}
                                                onChange={(e) => handleUpdatePrice(type, 'night', e.target.value)}
                                                disabled={user?.role !== UserRole.ADMIN}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        )}

        {settingsTab === 'consoles' && (
            <div className="space-y-4">
                <Button onClick={() => { setEditingConsole(null); setShowConsoleModal(true); }} className="w-full">
                    <Plus size={18} /> Add New Console
                </Button>
                {consoles.map(c => (
                    <Card key={c.id} className="flex justify-between items-center">
                        <div>
                            <p className="font-bold text-white">{c.name}</p>
                            <p className="text-xs text-slate-400">{c.type} • {c.status}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setEditingConsole(c); setShowConsoleModal(true); }} className="p-2 bg-slate-700 rounded text-slate-300 hover:text-white">
                                <Edit size={16} />
                            </button>
                            <button onClick={() => handleDeleteConsole(c.id)} className="p-2 bg-rose-900/50 rounded text-rose-400 hover:text-rose-300">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
        )}

        {settingsTab === 'items' && (
             <div className="space-y-4">
                <Button onClick={() => { setEditingProduct(null); setShowProductModal(true); }} className="w-full">
                    <Plus size={18} /> Add New Product
                </Button>
                {products.map(p => (
                    <Card key={p.id} className="flex justify-between items-center">
                        <div>
                            <p className="font-bold text-white">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.category} • Stock: {p.stock}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-emerald-400">{APP_SETTINGS.currency}{p.price.toLocaleString()}</span>
                            <div className="flex gap-2">
                                <button onClick={() => { setEditingProduct(p); setShowProductModal(true); }} className="p-2 bg-slate-700 rounded text-slate-300 hover:text-white">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-rose-900/50 rounded text-rose-400 hover:text-rose-300">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        )}

        {settingsTab === 'staff' && (
             <div className="space-y-4">
                <Button onClick={() => { setEditingStaff(null); setShowStaffModal(true); }} className="w-full">
                    <Plus size={18} /> Add New Staff
                </Button>
                {staffUsers.map(u => (
                    <Card key={u.id} className="flex justify-between items-center">
                        <div>
                            <p className="font-bold text-white">{u.name}</p>
                            <p className="text-xs text-slate-400">@{u.username} • {u.role}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setEditingStaff(u); setShowStaffModal(true); }} className="p-2 bg-slate-700 rounded text-slate-300 hover:text-white">
                                <Edit size={16} />
                            </button>
                            {u.id !== user?.id && (
                                <button onClick={() => handleDeleteStaff(u.id)} className="p-2 bg-rose-900/50 rounded text-rose-400 hover:text-rose-300">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        )}
    </div>
  );

  const renderItemsModal = () => {
    if (!showItemsModal) return null;
    
    // Group products
    const categories = Object.values(ProductCategory);

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-xl w-full max-w-md border border-slate-700 flex flex-col max-h-[80vh] animate-fade-in shadow-2xl">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-xl z-10">
            <h3 className="font-bold text-lg text-white">Add Items</h3>
            <button onClick={() => setShowItemsModal(false)} className="text-slate-400"><X /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
             {categories.map(cat => {
                 const catProducts = products.filter(p => p.category === cat);
                 if (catProducts.length === 0) return null;

                 return (
                     <div key={cat}>
                         <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 sticky top-0 bg-slate-900 py-1">{cat}</h4>
                         <div className="grid grid-cols-2 gap-3">
                             {catProducts.map(product => (
                                 <button
                                    key={product.id}
                                    onClick={() => addItemToRental(product.id)}
                                    className="bg-slate-800 p-3 rounded-lg border border-slate-700 hover:border-violet-500 active:scale-95 transition-all text-left group"
                                 >
                                     <div className="flex justify-between items-start mb-2">
                                         <div className={`p-1.5 rounded-md ${
                                             cat === ProductCategory.DRINK ? 'bg-blue-500/20 text-blue-400' :
                                             cat === ProductCategory.FOOD ? 'bg-orange-500/20 text-orange-400' :
                                             'bg-purple-500/20 text-purple-400'
                                         }`}>
                                            {cat === ProductCategory.DRINK ? <Coffee size={14}/> : <Package size={14}/>}
                                         </div>
                                         <span className="text-xs font-bold bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded">
                                             {APP_SETTINGS.currency}{product.price/1000}k
                                         </span>
                                     </div>
                                     <p className="font-semibold text-sm text-white mb-1 truncate">{product.name}</p>
                                     <p className="text-[10px] text-slate-500">Stock: {product.stock}</p>
                                 </button>
                             ))}
                         </div>
                     </div>
                 )
             })}
          </div>
        </div>
      </div>
    );
  };

  const renderConsoleModal = () => {
    if (!showConsoleModal) return null;
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-xl w-full max-w-sm border border-slate-700 p-6 shadow-2xl animate-fade-in">
           <h3 className="font-bold text-lg text-white mb-4">{editingConsole ? 'Edit Console' : 'New Console'}</h3>
           <form onSubmit={handleSaveConsole} className="space-y-4">
              <div>
                  <label className="block text-xs text-slate-400 mb-1">Name</label>
                  <input name="name" defaultValue={editingConsole?.name} required className="w-full bg-slate-800 border-slate-700 rounded p-2 text-white outline-none focus:border-violet-500" />
              </div>
              <div>
                  <label className="block text-xs text-slate-400 mb-1">Type</label>
                  <select name="type" defaultValue={editingConsole?.type || ConsoleType.PS5} className="w-full bg-slate-800 border-slate-700 rounded p-2 text-white outline-none">
                      {Object.values(ConsoleType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
              </div>
              <div>
                  <label className="block text-xs text-slate-400 mb-1">Status</label>
                  <select name="status" defaultValue={editingConsole?.status || ConsoleStatus.AVAILABLE} className="w-full bg-slate-800 border-slate-700 rounded p-2 text-white outline-none">
                      {Object.values(ConsoleStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
              </div>
              <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1">Save</Button>
                  <Button type="button" variant="ghost" onClick={() => setShowConsoleModal(false)}>Cancel</Button>
              </div>
           </form>
        </div>
      </div>
    );
  };

  const renderProductModal = () => {
      if (!showProductModal) return null;
      return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl w-full max-w-sm border border-slate-700 p-6 shadow-2xl animate-fade-in">
             <h3 className="font-bold text-lg text-white mb-4">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
             <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Name</label>
                    <input name="name" defaultValue={editingProduct?.name} required className="w-full bg-slate-800 border-slate-700 rounded p-2 text-white outline-none focus:border-violet-500" />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Price</label>
                    <input name="price" type="number" defaultValue={editingProduct?.price} required className="w-full bg-slate-800 border-slate-700 rounded p-2 text-white outline-none focus:border-violet-500" />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Stock</label>
                    <input name="stock" type="number" defaultValue={editingProduct?.stock} required className="w-full bg-slate-800 border-slate-700 rounded p-2 text-white outline-none focus:border-violet-500" />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Category</label>
                    <select name="category" defaultValue={editingProduct?.category || ProductCategory.FOOD} className="w-full bg-slate-800 border-slate-700 rounded p-2 text-white outline-none">
                        {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="flex gap-2 pt-2">
                    <Button type="submit" className="flex-1">Save</Button>
                    <Button type="button" variant="ghost" onClick={() => setShowProductModal(false)}>Cancel</Button>
                </div>
             </form>
          </div>
        </div>
      );
  };

  const renderStaffModal = () => {
      if (!showStaffModal) return null;
      return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl w-full max-w-sm border border-slate-700 p-6 shadow-2xl animate-fade-in">
             <h3 className="font-bold text-lg text-white mb-4">{editingStaff ? 'Edit Staff' : 'New Staff'}</h3>
             <form onSubmit={handleSaveStaff} className="space-y-4">
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Name</label>
                    <input name="name" defaultValue={editingStaff?.name} required className="w-full bg-slate-800 border-slate-700 rounded p-2 text-white outline-none focus:border-violet-500" />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Username</label>
                    <input name="username" defaultValue={editingStaff?.username} required className="w-full bg-slate-800 border-slate-700 rounded p-2 text-white outline-none focus:border-violet-500" />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Password {editingStaff && '(Leave empty to keep)'}</label>
                    <input name="password" type="password" className="w-full bg-slate-800 border-slate-700 rounded p-2 text-white outline-none focus:border-violet-500" />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Role</label>
                    <select name="role" defaultValue={editingStaff?.role || UserRole.STAFF} className="w-full bg-slate-800 border-slate-700 rounded p-2 text-white outline-none">
                        {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <div className="flex gap-2 pt-2">
                    <Button type="submit" className="flex-1">Save</Button>
                    <Button type="button" variant="ghost" onClick={() => setShowStaffModal(false)}>Cancel</Button>
                </div>
             </form>
          </div>
        </div>
      );
  };

  const renderNewMemberModal = () => {
      if (!showNewMemberModal) return null;
      return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl w-full max-w-sm border border-slate-700 p-6 shadow-2xl animate-fade-in">
             <h3 className="font-bold text-lg text-white mb-4">New Member</h3>
             <form onSubmit={handleCreateMember} className="space-y-4">
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                    <input name="name" required className="w-full bg-slate-800 border-slate-700 rounded p-2 text-white outline-none focus:border-violet-500" placeholder="e.g. John Doe" />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Phone / WhatsApp</label>
                    <input name="phone" required className="w-full bg-slate-800 border-slate-700 rounded p-2 text-white outline-none focus:border-violet-500" placeholder="e.g. 0812..." />
                </div>
                <div className="flex gap-2 pt-2">
                    <Button type="submit" className="flex-1">Create</Button>
                    <Button type="button" variant="ghost" onClick={() => setShowNewMemberModal(false)}>Cancel</Button>
                </div>
             </form>
          </div>
        </div>
      );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-violet-500/30">
      
      {/* Main Content Area */}
      <main className="max-w-md mx-auto min-h-screen relative shadow-2xl bg-slate-900 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 scrollbar-hide overscroll-y-none">
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
