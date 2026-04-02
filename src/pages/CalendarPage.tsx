import React, { useState } from 'react';
import { WeekView } from '../components/calendar/WeekView';
import { MonthView } from '../components/calendar/MonthView';
import { useCalendarStore } from '../store/calendar-store';
import { Button, Card } from '../components/ui/Primitives';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutGrid, List } from 'lucide-react';
import { format, addMonths, subMonths, addWeeks, subWeeks } from 'date-fns';
import { de } from 'date-fns/locale';

export const CalendarPage = ({ providerId }: { providerId: string }) => {
  const { currentDate, setCurrentDate, view, setView } = useCalendarStore();

  const handlePrevious = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kalender</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {format(currentDate, view === 'month' ? 'MMMM yyyy' : 'MMMM yyyy', { locale: de })}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl">
            <Button 
              variant={view === 'week' ? 'primary' : 'ghost'} 
              size="sm" 
              onClick={() => setView('week')}
              className="px-4 rounded-lg font-black text-[10px] uppercase tracking-widest"
            >
              Woche
            </Button>
            <Button 
              variant={view === 'month' ? 'primary' : 'ghost'} 
              size="sm" 
              onClick={() => setView('month')}
              className="px-4 rounded-lg font-black text-[10px] uppercase tracking-widest"
            >
              Monat
            </Button>
          </div>

          <div className="h-6 w-px bg-slate-200 mx-2" />

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePrevious} className="h-10 w-10 rounded-xl hover:bg-slate-50">
              <ChevronLeft size={20} className="text-slate-600" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNext} className="h-10 w-10 rounded-xl hover:bg-slate-50">
              <ChevronRight size={20} className="text-slate-600" />
            </Button>
          </div>
        </div>
      </div>

      <div className="relative">
        {view === 'week' ? (
          <WeekView providerId={providerId} />
        ) : (
          <MonthView providerId={providerId} />
        )}
      </div>
    </div>
  );
};
