import { format, addMinutes, parse, isWithinInterval, startOfDay, isSameDay } from 'date-fns';
import { Availability, Blocker, Booking, Service } from '../types';

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  staffId?: string;
  staffName?: string;
}

interface CalculateSlotsParams {
  date: Date;
  service: Service;
  availabilities: Availability[];
  bookings: Booking[];
  blockers: Blocker[];
  staffMembers: { id: string; name: string }[];
  staffId?: string;
}

/**
 * Berechnet verfügbare Zeit-Slots für einen bestimmten Tag
 */
export function calculateAvailableSlots({
  date,
  service,
  availabilities,
  bookings,
  blockers,
  staffMembers,
  staffId
}: CalculateSlotsParams): TimeSlot[] {
  const dayOfWeek = date.getDay();
  const dateStr = format(date, 'yyyy-MM-dd');
  const slotDuration = service.duration + service.bufferBefore + service.bufferAfter;
  
  // Filtere Verfügbarkeiten für den Tag
  const dayAvailability = availabilities.filter(a => 
    a.dayOfWeek === dayOfWeek && 
    a.isActive &&
    (staffId ? a.staffId === staffId : true)
  );

  if (dayAvailability.length === 0) {
    console.log(`Keine Verfügbarkeit für Tag ${dayOfWeek} gefunden`);
    return [];
  }

  const slots: TimeSlot[] = [];

  // Für jede Verfügbarkeits-Periode
  dayAvailability.forEach(availability => {
    const staffName = staffMembers.find(s => s.id === availability.staffId)?.name || 'Mitarbeiter';
    
    try {
      const start = parse(availability.startTime, 'HH:mm', date);
      const end = parse(availability.endTime, 'HH:mm', date);
      
      let currentSlot = start;

      while (addMinutes(currentSlot, slotDuration) <= end) {
        const slotStartStr = format(currentSlot, 'HH:mm');
        const slotEndDate = addMinutes(currentSlot, service.duration);
        const slotEndStr = format(slotEndDate, 'HH:mm');
        
        // Prüfe auf Pausen
        const isInBreak = availability.breaks.some(breakTime => {
          const breakStart = parse(breakTime.start, 'HH:mm', date);
          const breakEnd = parse(breakTime.end, 'HH:mm', date);
          return isWithinInterval(currentSlot, { start: breakStart, end: breakEnd }) ||
                 isWithinInterval(slotEndDate, { start: breakStart, end: breakEnd });
        });

        // Prüfe auf Blocker (Urlaub/Krank)
        const isBlocked = blockers.some(blocker => {
          if (staffId && blocker.staffId !== staffId) return false;
          if (availability.staffId && blocker.staffId !== availability.staffId) return false;
          
          const blockerStart = blocker.startDate.toDate ? blocker.startDate.toDate() : new Date(blocker.startDate);
          const blockerEnd = blocker.endDate.toDate ? blocker.endDate.toDate() : new Date(blocker.endDate);
          
          return isSameDay(date, blockerStart) || 
                 isSameDay(date, blockerEnd) ||
                 (date > blockerStart && date < blockerEnd);
        });

        // Prüfe auf bestehende Buchungen
        const isBooked = bookings.some(booking => {
          if (booking.date !== dateStr) return false;
          
          // Prüfe Staff-Zuordnung
          const bookingStaffId = booking.staffId;
          const slotStaffId = availability.staffId;
          
          if (staffId) {
            // Spezifischer Staff gewünscht
            if (bookingStaffId !== staffId) return false;
          } else if (slotStaffId) {
            // Kein Staff gewünscht, aber Slot gehört zu Staff
            if (bookingStaffId !== slotStaffId) return false;
          }
          
          const bookingStart = parse(booking.startTime, 'HH:mm', date);
          const bookingEnd = parse(booking.endTime, 'HH:mm', date);
          
          // Überlappung prüfen
          const slotOverlaps = isWithinInterval(currentSlot, { start: bookingStart, end: bookingEnd }) ||
                              isWithinInterval(slotEndDate, { start: bookingStart, end: bookingEnd }) ||
                              isWithinInterval(bookingStart, { start: currentSlot, end: slotEndDate });
          
          return slotOverlaps;
        });

        const isAvailable = !isInBreak && !isBlocked && !isBooked;

        slots.push({
          startTime: slotStartStr,
          endTime: slotEndStr,
          available: isAvailable,
          staffId: availability.staffId,
          staffName: isAvailable ? staffName : undefined
        });

        // Nächster Slot (30-Minuten-Raster)
        currentSlot = addMinutes(currentSlot, 30);
      }
    } catch (error) {
      console.error('Fehler bei Slot-Berechnung:', error);
    }
  });

  // Sortiere nach Uhrzeit und verfügbarkeit
  return slots.sort((a, b) => {
    if (a.startTime === b.startTime) {
      return a.available === b.available ? 0 : a.available ? -1 : 1;
    }
    return a.startTime.localeCompare(b.startTime);
  });
}

/**
 * Prüft ob ein bestimmter Slot noch verfügbar ist
 * (Double-Booking-Prevention)
 */
export function isSlotStillAvailable(
  date: Date,
  startTime: string,
  service: Service,
  bookings: Booking[],
  staffId?: string
): boolean {
  const dateStr = format(date, 'yyyy-MM-dd');
  const slotStart = parse(startTime, 'HH:mm', date);
  const slotEnd = addMinutes(slotStart, service.duration);
  
  return !bookings.some(booking => {
    if (booking.date !== dateStr) return false;
    if (staffId && booking.staffId !== staffId) return false;
    
    const bookingStart = parse(booking.startTime, 'HH:mm', date);
    const bookingEnd = parse(booking.endTime, 'HH:mm', date);
    
    return isWithinInterval(slotStart, { start: bookingStart, end: bookingEnd }) ||
           isWithinInterval(slotEnd, { start: bookingStart, end: bookingEnd });
  });
}
