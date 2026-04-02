import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  isToday
} from 'date-fns';
import { de } from 'date-fns/locale';
import { useCalendarStore } from '../../store/calendar-store';
import { useBookings } from '../../hooks/useBookings';
import { cn } from '../../lib/utils';

export const MonthView = ({ providerId }: { providerId: string }) => {
  const { currentDate } = useCalendarStore();
  const { bookings } = useBookings(providerId);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/50">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/30 backdrop-blur-sm">
        {weekDays.map((day) => (
          <div key={day} className="p-4 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {day}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 grid-rows-5 min-h-[600px]">
        {days.map((day, idx) => {
          const dayBookings = bookings.filter(b => b.date === format(day, 'yyyy-MM-dd'));
          const isCurrentMonth = isSameMonth(day, monthStart);
          
          return (
            <div 
              key={idx} 
              className={cn(
                "p-4 border-r border-b border-slate-100 last:border-r-0 min-h-[120px] transition-colors hover:bg-slate-50/50 cursor-pointer group",
                !isCurrentMonth && "bg-slate-50/30"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center text-sm font-black transition-all",
                  isToday(day) ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : 
                  isCurrentMonth ? "text-slate-900" : "text-slate-300"
                )}>
                  {format(day, 'd')}
                </span>
                {dayBookings.length > 0 && (
                  <span className="h-2 w-2 rounded-full bg-blue-500 shadow-sm shadow-blue-200" />
                )}
              </div>

              <div className="space-y-1">
                {dayBookings.slice(0, 3).map(booking => (
                  <div 
                    key={booking.id}
                    className="text-[10px] font-bold px-2 py-1 rounded-md bg-blue-50 text-blue-700 truncate border border-blue-100/50"
                  >
                    {booking.startTime} {booking.status === 'confirmed' ? '✓' : ''}
                  </div>
                ))}
                {dayBookings.length > 3 && (
                  <p className="text-[10px] font-black text-slate-400 pl-1">
                    + {dayBookings.length - 3} weitere
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
