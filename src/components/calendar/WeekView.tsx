import React from 'react';
import { 
  format, 
  addDays, 
  startOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  parse, 
  addMinutes, 
  isWithinInterval 
} from 'date-fns';
import { de } from 'date-fns/locale';
import { useCalendarStore } from '../../store/calendar-store';
import { useBookings } from '../../hooks/useBookings';
import { useServices } from '../../hooks/useServices';
import { useCustomers } from '../../hooks/useCustomers';
import { Clock, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Primitives';

export const WeekView = ({ providerId }: { providerId: string }) => {
  const { currentDate } = useCalendarStore();
  const { bookings } = useBookings(providerId);
  const { services } = useServices(providerId);
  const { customers } = useCustomers(providerId);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6),
  });

  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 to 21:00

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/50">
      <div className="grid grid-cols-8 border-b border-slate-100 bg-slate-50/30 backdrop-blur-sm">
        <div className="p-6 border-r border-slate-100 flex items-center justify-center">
          <Clock size={16} className="text-slate-300" />
        </div>
        {weekDays.map((day, idx) => (
          <div key={idx} className={cn(
            "p-6 text-center border-r border-slate-100 last:border-r-0 transition-colors",
            isSameDay(day, new Date()) && "bg-blue-50/50"
          )}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
              {format(day, 'EEE', { locale: de })}
            </p>
            <div className={cn(
              "h-10 w-10 mx-auto rounded-xl flex items-center justify-center text-lg font-black transition-all",
              isSameDay(day, new Date()) ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110" : "text-slate-900"
            )}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      <div className="relative h-[800px] overflow-y-auto scrollbar-hide">
        <div className="grid grid-cols-8 min-h-full bg-slate-50/10">
          <div className="border-r border-slate-100 bg-white/50 sticky left-0 z-20">
            {hours.map(hour => (
              <div key={hour} className="h-24 border-b border-slate-50 p-4 text-right relative">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest sticky top-4">{hour}:00</span>
              </div>
            ))}
          </div>

          {weekDays.map((day, dayIdx) => (
            <div key={dayIdx} className="relative border-r border-slate-100 last:border-r-0 group">
              {hours.map(hour => (
                <div key={hour} className="h-24 border-b border-slate-50 group-hover:bg-slate-50/30 transition-colors" />
              ))}

              {bookings
                .filter(b => b.date === format(day, 'yyyy-MM-dd'))
                .map(booking => {
                  const service = services.find(s => s.id === booking.serviceId);
                  const customer = customers.find(c => c.id === booking.customerId);
                  
                  const [startHour, startMin] = booking.startTime.split(':').map(Number);
                  const top = (startHour - 8) * 96 + (startMin / 60) * 96;
                  const height = (service?.duration || 30) / 60 * 96;

                  return (
                    <div
                      key={booking.id}
                      className="absolute left-1.5 right-1.5 rounded-2xl p-3 text-xs overflow-hidden shadow-2xl shadow-blue-200/30 bg-white hover:scale-[1.02] transition-all cursor-pointer z-10 group/item border-none"
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                      <div className="flex flex-col h-full justify-between pl-2">
                        <div className="space-y-1">
                          <p className="font-black text-slate-900 truncate tracking-tight">{service?.name}</p>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase truncate">
                            <User size={10} className="text-blue-500" />
                            {customer?.firstName} {customer?.lastName}
                          </div>
                        </div>
                        <p className="text-[9px] font-black text-blue-600 bg-blue-50 w-fit px-2 py-0.5 rounded-full mt-auto">
                          {booking.startTime} - {booking.endTime}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
