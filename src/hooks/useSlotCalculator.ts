import { useMemo } from 'react';
import { getAvailableSlots, Slot } from '../lib/slot-engine';
import { useBookings } from './useBookings';
import { useAvailability } from './useAvailability';
import { Service, StaffMember } from '../types';
import { format } from 'date-fns';

interface UseSlotCalculatorReturn {
  slots: Slot[];
  isLoading: boolean;
  error: Error | null;
}

export function useSlotCalculator(
  providerId: string,
  date: Date | null,
  service: Service | null,
  staffMembers: StaffMember[] = [],
  minLeadTimeHours: number = 2,
  maxLeadTimeDays: number = 30
): UseSlotCalculatorReturn {
  const dateStr = date ? format(date, 'yyyy-MM-dd') : undefined;
  const { bookings } = useBookings(providerId, dateStr);
  const { availability, blockers } = useAvailability(providerId);

  const slots = useMemo(() => {
    if (!date || !service || !providerId) return [];

    try {
      return getAvailableSlots(
        date,
        service,
        availability,
        bookings,
        blockers,
        staffMembers,
        minLeadTimeHours,
        maxLeadTimeDays
      );
    } catch (error) {
      console.error('Fehler bei Slot-Berechnung:', error);
      return [];
    }
  }, [date, service, availability, bookings, blockers, staffMembers, minLeadTimeHours, maxLeadTimeDays, providerId]);

  const isLoading = !availability || !bookings;
  const error = null;

  return { slots, isLoading, error };
}
