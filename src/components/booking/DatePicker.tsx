import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isBefore, 
  startOfDay,
  addDays
} from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Primitives';
import { useBookingStore } from '../../store/booking-store';

export const DatePicker = ({ onNext }: { onNext: () => void }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { selectedDate, setSelectedDate } = useBookingStore();
  const today = startOfDay(new Date());

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Wähle ein Datum</h2>
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-900 capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: de })}
          </h3>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={prevMonth} disabled={isSameMonth(currentMonth, today)}>
              <ChevronLeft size={20} />
            </Button>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              <ChevronRight size={20} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
            <div key={day} className="text-xs font-medium text-slate-400 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, today);
            const isPast = isBefore(day, today);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <button
                key={idx}
                onClick={() => {
                  if (!isPast && isCurrentMonth) {
                    setSelectedDate(day);
                    onNext();
                  }
                }}
                disabled={isPast || !isCurrentMonth}
                className={cn(
                  "h-10 w-full rounded-lg text-sm font-medium transition-all flex items-center justify-center",
                  isSelected ? "bg-blue-600 text-white shadow-md" : 
                  isToday ? "text-blue-600 font-bold bg-blue-50" :
                  isPast || !isCurrentMonth ? "text-slate-200 cursor-not-allowed" : 
                  "text-slate-600 hover:bg-slate-50"
                )}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
