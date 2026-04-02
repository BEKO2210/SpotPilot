import React, { useState, useMemo } from 'react';
import { useBookings } from '../../hooks/useBookings';
import { useServices } from '../../hooks/useServices';
import { useCustomers } from '../../hooks/useCustomers';
import { Card } from '../ui/Primitives';
import { TrendingUp, Users, Calendar, CreditCard, ArrowUpRight, ArrowDownRight, ExternalLink, Check, Copy } from 'lucide-react';
import { formatCurrency, copyToClipboard, cn } from '../../lib/utils';
import { Provider } from '../../types';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export const BookingDashboard = ({ providerId, provider }: { providerId: string; provider: Provider }) => {
  const { bookings } = useBookings(providerId);
  const { customers } = useCustomers(providerId);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();
    const last7DaysStart = subDays(now, 7);
    const prev7DaysStart = subDays(now, 14);

    const currentBookings = bookings.filter(b => parseISO(b.date) >= last7DaysStart);
    const previousBookings = bookings.filter(b => {
      const d = parseISO(b.date);
      return d >= prev7DaysStart && d < last7DaysStart;
    });

    const currentRevenue = currentBookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((acc, b) => acc + (b.totalPrice || 0), 0);
    const previousRevenue = previousBookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((acc, b) => acc + (b.totalPrice || 0), 0);

    const calculateTrend = (current: number, previous: number) => {
      if (isNaN(current) || isNaN(previous)) return 0;
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // Simple occupancy estimate: bookings per week vs a nominal capacity of 40 slots
    const occupancy = bookings.length > 0 
      ? Math.min(Math.round((bookings.filter(b => parseISO(b.date) >= subDays(now, 7)).length / 35) * 100), 100)
      : 0;

    return {
      revenueTrend: calculateTrend(currentRevenue, previousRevenue),
      bookingsTrend: calculateTrend(currentBookings.length, previousBookings.length),
      customersTrend: calculateTrend(
        new Set(currentBookings.map(b => b.customerId)).size,
        new Set(previousBookings.map(b => b.customerId)).size
      ),
      occupancy
    };
  }, [bookings]);

  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((acc, b) => acc + (b.totalPrice || 0), 0);

  const bookingLink = `${window.location.origin}/book/${provider.bookingSlug}`;

  const handleCopy = async () => {
    const success = await copyToClipboard(bookingLink);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    
    return last7Days.map(day => {
      const dayBookings = bookings.filter(b => {
        const bDate = parseISO(b.date);
        return isSameDay(bDate, day);
      });

      return {
        name: format(day, 'EEEEEE', { locale: de }),
        bookings: dayBookings.length,
        revenue: dayBookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0)
      };
    });
  }, [bookings]);

  return (
    <div className="grid gap-6 md:grid-cols-4 md:grid-rows-2">
      {/* Main Revenue Card - Bento Large */}
      <Card className="md:col-span-2 md:row-span-2 p-8 flex flex-col justify-between bg-white border-none shadow-2xl shadow-slate-200/50 hover:shadow-blue-100/50 transition-all duration-500">
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Gesamtumsatz</p>
              <h2 className="text-4xl font-black text-slate-900">{formatCurrency(totalRevenue)}</h2>
            </div>
            <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <CreditCard size={24} />
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="revenue" fill="url(#colorRev)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold bg-emerald-50 w-fit px-3 py-1 rounded-full">
          {stats.revenueTrend >= 0 ? <TrendingUp size={16} /> : <ArrowDownRight size={16} className="text-red-500" />}
          <span className={stats.revenueTrend < 0 ? "text-red-500" : ""}>
            {stats.revenueTrend > 0 ? '+' : ''}{stats.revenueTrend.toFixed(1)}% vs. letzte Woche
          </span>
        </div>
      </Card>

      {/* Bookings Count - Bento Small */}
      <Card className="p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-none bg-white">
        <div className="flex justify-between items-start">
          <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Calendar size={20} />
          </div>
          <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full",
            stats.bookingsTrend >= 0 ? "text-blue-500 bg-blue-50" : "text-red-500 bg-red-50"
          )}>
            {stats.bookingsTrend > 0 ? '+' : ''}{stats.bookingsTrend.toFixed(1)}%
          </span>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Buchungen</p>
          <h3 className="text-2xl font-black text-slate-900">{bookings.length}</h3>
        </div>
      </Card>

      {/* Customers Count - Bento Small */}
      <Card className="p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-none bg-white">
        <div className="flex justify-between items-start">
          <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Users size={20} />
          </div>
          <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full",
            stats.customersTrend >= 0 ? "text-purple-500 bg-purple-50" : "text-red-500 bg-red-50"
          )}>
            {stats.customersTrend > 0 ? '+' : ''}{stats.customersTrend.toFixed(1)}%
          </span>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kunden</p>
          <h3 className="text-2xl font-black text-slate-900">{customers.length}</h3>
        </div>
      </Card>

      {/* Occupancy Chart - Bento Wide */}
      <Card className="md:col-span-2 p-6 flex flex-col justify-between border-none shadow-xl shadow-slate-100 hover:shadow-2xl transition-all duration-500 bg-white">
        <div className="flex justify-between items-center mb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Auslastung</p>
          <div className="flex gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            <div className="h-1.5 w-1.5 rounded-full bg-blue-200" />
          </div>
        </div>
        <div className="h-[100px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="bookings" 
                stroke="#2563eb" 
                strokeWidth={4} 
                dot={false}
                activeDot={{ r: 6, fill: '#2563eb', strokeWidth: 0 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-between items-end">
          <div className="space-y-1">
            <h4 className="text-xl font-black text-slate-900">{stats.occupancy}%</h4>
            <p className="text-[10px] text-slate-400 font-medium">Durchschnittliche Auslastung</p>
          </div>
          {stats.occupancy > 0 ? <ArrowUpRight size={20} className="text-blue-600" /> : <ArrowDownRight size={20} className="text-slate-300" />}
        </div>
      </Card>

      {/* Booking Link - Bento Small */}
      <Card className="p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-emerald-50/30 border-none">
        <div className="flex justify-between items-start">
          <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
            <ExternalLink size={20} />
          </div>
          <button 
            onClick={handleCopy}
            className={cn(
              "p-2 rounded-lg transition-all",
              copied ? "bg-emerald-500 text-white" : "bg-white text-slate-400 hover:text-slate-600 shadow-sm"
            )}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Buchungslink</p>
          <h3 className="text-sm font-bold text-slate-900 truncate mt-1">{provider.bookingSlug}</h3>
        </div>
      </Card>
    </div>
  );
};
