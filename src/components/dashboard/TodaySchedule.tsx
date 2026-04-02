import React from 'react';
import { format, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { useBookings } from '../../hooks/useBookings';
import { useServices } from '../../hooks/useServices';
import { useCustomers } from '../../hooks/useCustomers';
import { Card, Badge } from '../ui/Primitives';
import { Clock, User, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

export const TodaySchedule = ({ providerId }: { providerId: string }) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { bookings } = useBookings(providerId, today);
  const { services } = useServices(providerId);
  const { customers } = useCustomers(providerId);

  const sortedBookings = [...bookings].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Heutige Termine</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {format(new Date(), 'EEEE, dd. MMMM', { locale: de })}
          </p>
        </div>
        <Badge className="bg-blue-600 text-white border-none px-3 py-1 shadow-lg shadow-blue-100">
          {sortedBookings.length}
        </Badge>
      </div>

      {sortedBookings.length === 0 ? (
        <Card className="bg-slate-50/50 border-dashed border-2 border-slate-200 py-16 text-center space-y-3">
          <div className="h-12 w-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Calendar size={24} />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Keine Termine</p>
        </Card>
      ) : (
        <div className="space-y-4 relative before:absolute before:left-[31px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          {sortedBookings.map((booking) => {
            const service = services.find(s => s.id === booking.serviceId);
            const customer = customers.find(c => c.id === booking.customerId);
            
            return (
              <div key={booking.id} className="flex gap-6 items-center group relative">
                <div className="w-16 text-right shrink-0">
                  <p className="text-sm font-black text-slate-900">{booking.startTime}</p>
                  <p className="text-[10px] font-bold text-slate-400">{booking.endTime}</p>
                </div>
                
                <div className="h-4 w-4 rounded-full border-4 border-white bg-blue-600 shadow-sm z-10 shrink-0" />

                <Card className="flex-1 p-4 flex items-center justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all border-none bg-white group-hover:scale-[1.01]">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 truncate text-sm">{service?.name}</h3>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-tight mt-1">
                      <User size={12} className="text-blue-500" />
                      <span className="truncate">{customer?.firstName} {customer?.lastName}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Clock size={16} />
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
