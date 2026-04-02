import { create } from 'zustand';

interface CalendarState {
  view: 'day' | 'week' | 'month';
  currentDate: Date;
  selectedStaffId: string | 'all';
  
  setView: (view: 'day' | 'week' | 'month') => void;
  setCurrentDate: (date: Date) => void;
  setSelectedStaffId: (id: string | 'all') => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  view: 'week',
  currentDate: new Date(),
  selectedStaffId: 'all',
  
  setView: (view) => set({ view }),
  setCurrentDate: (date) => set({ currentDate: date }),
  setSelectedStaffId: (id) => set({ selectedStaffId: id })
}));
