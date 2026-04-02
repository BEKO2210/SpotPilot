import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Service } from '../types';

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
}

interface BookingState {
  selectedService: Service | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  selectedStaffId: string | null;
  customerInfo: Partial<CustomerInfo>;
  bookingReference: string | null;
  setSelectedService: (service: Service | null) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTime: (time: string | null) => void;
  setSelectedStaffId: (staffId: string | null) => void;
  setCustomerInfo: (info: Partial<CustomerInfo>) => void;
  setBookingReference: (ref: string | null) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      selectedService: null,
      selectedDate: null,
      selectedTime: null,
      selectedStaffId: null,
      customerInfo: {},
      bookingReference: null,
      setSelectedService: (service) => set({ selectedService: service }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setSelectedTime: (time) => set({ selectedTime: time }),
      setSelectedStaffId: (staffId) => set({ selectedStaffId: staffId }),
      setCustomerInfo: (info) => set((state) => ({ 
        customerInfo: { ...state.customerInfo, ...info } 
      })),
      setBookingReference: (ref) => set({ bookingReference: ref }),
      reset: () => set({ 
        selectedService: null, 
        selectedDate: null, 
        selectedTime: null, 
        selectedStaffId: null,
        customerInfo: {},
        bookingReference: null 
      }),
    }),
    {
      name: 'booking-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
