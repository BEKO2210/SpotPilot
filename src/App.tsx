import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from './lib/db';
import { doc, getDoc, setDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { useSettingsStore } from './store/settings-store';
import { Provider } from './types';
import { BookingFlow } from './components/booking/BookingFlow';
import { BookingDashboard } from './components/dashboard/BookingDashboard';
import { TodaySchedule } from './components/dashboard/TodaySchedule';
import { WeekView } from './components/calendar/WeekView';
import { ServiceManager } from './components/services/ServiceManager';
import { CustomersPage } from './components/customers/CustomerList';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Users, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X,
  Plus,
  ExternalLink,
  Bell,
  Trash2,
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
  Briefcase
} from 'lucide-react';
import { Button, Card, Badge, Modal } from './components/ui/Primitives';
import { cn, formatTimeAgo } from './lib/utils';
import { useNotifications } from './hooks/useNotifications';

import { PublicBookingPage } from './pages/PublicBookingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { CalendarPage } from './pages/CalendarPage';
import { Settings } from './components/dashboard/Settings';
import { StaffManager } from './components/staff/StaffManager';

const queryClient = new QueryClient();

const DashboardLayout = ({ children, provider }: { children: React.ReactNode; provider: Provider | null }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications(provider?.id || '');

  if (!provider) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
      case 'error': return <XCircle size={16} className="text-red-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: CalendarIcon, label: 'Kalender', path: '/calendar' },
    { icon: Briefcase, label: 'Team', path: '/staff' },
    { icon: Users, label: 'Kunden', path: '/customers' },
    { icon: Plus, label: 'Services', path: '/services' },
    { icon: SettingsIcon, label: 'Einstellungen', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-6 overflow-y-auto scrollbar-hide">
          <div className="flex items-center justify-between px-2 mb-12 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <CalendarIcon size={24} />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">SlotPilot</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden h-8 w-8 rounded-lg"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={20} className="text-slate-400" />
            </Button>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all group border-none",
                  location.pathname === item.path 
                    ? "bg-blue-50 text-blue-600 shadow-xl shadow-blue-100/50 scale-[1.02]" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:scale-[1.01]"
                )}
              >
                <item.icon size={20} className={cn(
                  "transition-colors",
                  location.pathname === item.path ? "text-blue-600" : "text-slate-400 group-hover:text-slate-900"
                )} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-6">
            <Card className="p-5 bg-slate-900 border-none shadow-2xl shadow-slate-900/20">
              <div className="flex justify-between items-start mb-4">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <CalendarIcon size={16} />
                </div>
                <Badge className="bg-blue-600 text-white border-none text-[10px] uppercase tracking-widest px-2 py-0.5">
                  {provider.subscriptionStatus}
                </Badge>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Free Bookings</p>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-black text-white">{provider.bookingCount || 0}</span>
                <span className="text-xs font-bold text-slate-500">/ {provider.maxFreeBookings || 50}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-blue-600 transition-all duration-1000" 
                  style={{ width: `${Math.min(((provider.bookingCount || 0) / (provider.maxFreeBookings || 50)) * 100, 100)}%` }}
                />
              </div>
              <Button 
                className="w-full bg-white text-slate-900 hover:bg-slate-100 border-none text-xs font-black uppercase tracking-widest py-2"
                onClick={() => setIsUpgradeModalOpen(true)}
              >
                Upgrade Pro
              </Button>
            </Card>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Dein Buchungslink</p>
                <ExternalLink size={12} className="text-blue-400" />
              </div>
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-blue-100">
                <span className="text-[10px] font-bold text-slate-400 truncate flex-1">slotpilot.app/book/{provider.bookingSlug}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-md hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/book/${provider.bookingSlug}`);
                  }}
                >
                  <Plus size={12} className="rotate-45" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2">
              <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-black">
                {provider.businessName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 truncate">{provider.businessName}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase truncate tracking-tight">{provider.businessType}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => signOut(auth)} className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors">
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 lg:px-12 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden h-10 w-10 rounded-xl"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={24} />
            </Button>
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Online</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-xl hover:bg-slate-50 relative"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell size={20} className="text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </Button>
              
              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[2px] lg:bg-transparent lg:backdrop-blur-none"
                      onClick={() => setIsNotificationsOpen(false)}
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={cn(
                        "fixed inset-x-4 top-20 bottom-4 z-50 bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden",
                        "lg:absolute lg:inset-auto lg:right-0 lg:top-full lg:mt-2 lg:w-96 lg:h-auto lg:max-h-[600px]"
                      )}
                    >
                      <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-xs uppercase tracking-widest text-slate-900">Benachrichtigungen</h4>
                          {unreadCount > 0 && (
                            <Badge className="bg-blue-600 text-white border-none">{unreadCount}</Badge>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 rounded-lg lg:hidden"
                          onClick={() => setIsNotificationsOpen(false)}
                        >
                          <X size={18} className="text-slate-400" />
                        </Button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
                        {notifications.length === 0 ? (
                          <div className="py-12 text-center space-y-3">
                            <div className="h-12 w-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
                              <Bell size={24} />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Keine Benachrichtigungen</p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              className={cn(
                                "p-4 rounded-2xl transition-all group relative border border-transparent",
                                !n.isRead ? "bg-blue-50/50 border-blue-50" : "hover:bg-slate-50"
                              )}
                              onClick={() => !n.isRead && markAsRead.mutate(n.id)}
                            >
                              <div className="flex gap-3">
                                <div className="mt-1 shrink-0">
                                  {getNotificationIcon(n.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start gap-2">
                                    <p className={cn(
                                      "text-sm tracking-tight",
                                      !n.isRead ? "font-black text-slate-900" : "font-bold text-slate-600"
                                    )}>
                                      {n.title}
                                    </p>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification.mutate(n.id);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 hover:text-red-500 rounded-md transition-all text-slate-300"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                                  <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tight">
                                    {formatTimeAgo(n.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div className="p-3 border-t border-slate-50 bg-slate-50/30 shrink-0">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full text-[10px] font-black uppercase tracking-widest hover:bg-white"
                            onClick={() => markAllAsRead.mutate()}
                            disabled={unreadCount === 0}
                          >
                            Alle als gelesen markieren
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <div className="h-10 w-px bg-slate-200 mx-2" />
            <Button 
              className="hidden sm:flex items-center gap-2 rounded-2xl px-6 py-2.5 font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100"
              onClick={() => setIsNewBookingModalOpen(true)}
            >
              <Plus size={16} />
              Neuer Termin
            </Button>
          </div>
        </header>

        <div className="p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
          {children}
        </div>

        <Modal 
          isOpen={isNewBookingModalOpen} 
          onClose={() => setIsNewBookingModalOpen(false)}
          title="Neuer Termin"
        >
          <div className="text-center space-y-4 py-4">
            <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Plus size={32} />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold">Manuelle Buchung</h4>
              <p className="text-slate-500 text-sm">
                Die Funktion zum manuellen Eintragen von Terminen wird gerade entwickelt. 
                In Kürze kannst du hier Termine direkt für deine Kunden anlegen.
              </p>
            </div>
            <Button className="w-full" onClick={() => setIsNewBookingModalOpen(false)}>Verstanden</Button>
          </div>
        </Modal>

        <Modal 
          isOpen={isUpgradeModalOpen} 
          onClose={() => setIsUpgradeModalOpen(false)}
          title="Upgrade auf Pro"
        >
          <div className="space-y-6">
            <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
              <Bell size={40} className="animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h4 className="text-lg font-bold">Hol dir das volle SlotPilot Erlebnis</h4>
              <p className="text-slate-500 text-sm">
                Die Zahlungsfunktion wird gerade implementiert. In Kürze kannst du hier dein Abo abschließen und unbegrenzt Buchungen empfangen.
              </p>
            </div>
            <Button className="w-full" onClick={() => setIsUpgradeModalOpen(false)}>Verstanden</Button>
          </div>
        </Modal>
      </main>
    </div>
  );
};

const LoginPage = () => {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
          <CalendarIcon size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Willkommen bei SlotPilot</h1>
          <p className="text-slate-500">Verwalte deine Termine professionell und einfach.</p>
        </div>
        <Button className="w-full" size="lg" onClick={handleLogin}>
          Mit Google anmelden
        </Button>
        <p className="text-xs text-slate-400">
          Durch die Anmeldung akzeptierst du unsere Nutzungsbedingungen.
        </p>
      </Card>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { provider, setProvider } = useSettingsStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      try {
        setUser(user);
        if (user) {
          const docRef = doc(db, 'providers', user.uid);
          
          // Use onSnapshot for real-time provider data sync
          const unsubProvider = onSnapshot(docRef, async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setProvider({ id: docSnap.id, ...data } as Provider);
            } else {
              // Create initial provider profile if it doesn't exist
              const newProvider: Omit<Provider, 'id'> = {
                name: user.displayName || 'Dienstleister',
                email: user.email || '',
                businessName: '',
                businessType: '',
                bookingSlug: user.uid.substring(0, 8),
                timezone: 'Europe/Berlin',
                currency: 'EUR',
                settings: {
                  minLeadTime: 2,
                  maxLeadTime: 30,
                  cancellationWindow: 24,
                  reminderTimes: [1440, 120]
                },
                createdAt: Timestamp.now(),
                onboarded: false,
                subscriptionStatus: 'free',
                bookingCount: 0,
                maxFreeBookings: 50
              };
              await setDoc(docRef, newProvider);
              // onSnapshot will trigger again after setDoc
            }
            setLoading(false);
          }, (error) => {
            console.error('Error in provider snapshot:', error);
            setLoading(false);
          });

          return () => unsubProvider();
        } else {
          setProvider(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setProvider]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Booking Route */}
          <Route path="/book/:slug" element={<PublicBookingPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />

          {/* Protected Provider Routes */}
          <Route path="/" element={
            !user ? <Navigate to="/login" /> : 
            !provider?.onboarded ? <Navigate to="/onboarding" /> :
            <DashboardLayout provider={provider}>
              <div className="grid gap-12 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <BookingDashboard providerId={user.uid} provider={provider} />
                </div>
                <div>
                  <TodaySchedule providerId={user.uid} />
                </div>
              </div>
            </DashboardLayout>
          } />

          <Route path="/calendar" element={
            !user ? <Navigate to="/login" /> : 
            !provider?.onboarded ? <Navigate to="/onboarding" /> :
            <DashboardLayout provider={provider}>
              <CalendarPage providerId={user.uid} />
            </DashboardLayout>
          } />

          <Route path="/onboarding" element={
            !user ? <Navigate to="/login" /> : 
            provider?.onboarded ? <Navigate to="/" /> : 
            <OnboardingPage providerId={user.uid} />
          } />

          <Route path="/services" element={
            !user ? <Navigate to="/login" /> : 
            !provider?.onboarded ? <Navigate to="/onboarding" /> :
            <DashboardLayout provider={provider}>
              <ServiceManager providerId={user.uid} />
            </DashboardLayout>
          } />

          <Route path="/staff" element={
            !user ? <Navigate to="/login" /> : 
            !provider?.onboarded ? <Navigate to="/onboarding" /> :
            <DashboardLayout provider={provider}>
              <StaffManager providerId={user.uid} />
            </DashboardLayout>
          } />

          <Route path="/customers" element={
            !user ? <Navigate to="/login" /> : 
            !provider?.onboarded ? <Navigate to="/onboarding" /> :
            <DashboardLayout provider={provider}>
              <CustomersPage providerId={user.uid} />
            </DashboardLayout>
          } />

          <Route path="/settings" element={
            !user ? <Navigate to="/login" /> : 
            !provider?.onboarded ? <Navigate to="/onboarding" /> :
            <DashboardLayout provider={provider}>
              <Settings provider={provider} />
            </DashboardLayout>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
