import { create } from 'zustand';
import { Booking, Service, Customer, StaffMember } from '../types';

interface BookingState {
  selectedService: Service | null;
  selectedStaff: StaffMember | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  customerInfo: Partial<Customer>;
  
  setSelectedService: (service: Service | null) => void;
  setSelectedStaff: (staff: StaffMember | null) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTime: (time: string | null) => void;
  setCustomerInfo: (info: Partial<Customer>) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedService: null,
  selectedStaff: null,
  selectedDate: null,
  selectedTime: null,
  customerInfo: {},
  
  setSelectedService: (service) => set({ selectedService: service }),
  setSelectedStaff: (staff) => set({ selectedStaff: staff }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTime: (time) => set({ selectedTime: time }),
  setCustomerInfo: (info) => set((state) => ({ customerInfo: { ...state.customerInfo, ...info } })),
  reset: () => set({
    selectedService: null,
    selectedStaff: null,
    selectedDate: null,
    selectedTime: null,
    customerInfo: {}
  })
}));
