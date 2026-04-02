import { 
  addMinutes, 
  format, 
  isAfter, 
  isBefore, 
  parse, 
  startOfDay, 
  endOfDay, 
  eachMinuteOfInterval, 
  isWithinInterval, 
  differenceInMinutes,
  isSameDay,
  addHours
} from 'date-fns';
import { Availability, Booking, Blocker, Service, StaffMember } from '../types';

export interface Slot {
  time: string; // "14:00"
  staffId?: string;
  spotsLeft: number;
}

export function getAvailableSlots(
  date: Date,
  service: Service,
  availabilities: Availability[],
  bookings: Booking[],
  blockers: Blocker[],
  staffMembers: StaffMember[],
  minLeadTimeHours: number,
  maxLeadTimeDays: number
): Slot[] {
  const dayOfWeek = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const dayAvailability = availabilities.filter(a => a.dayOfWeek === dayOfWeek && a.isActive);
  
  if (dayAvailability.length === 0) return [];

  // Check lead times
  const now = new Date();
  const minLeadTimeDate = addHours(now, minLeadTimeHours);
  const maxLeadTimeDate = addHours(startOfDay(now), maxLeadTimeDays * 24);

  if (isBefore(date, startOfDay(now)) || isAfter(date, maxLeadTimeDate)) {
    return [];
  }

  const slots: Slot[] = [];
  const interval = 30; // 30min raster

  dayAvailability.forEach(avail => {
    const start = parse(avail.startTime, 'HH:mm', date);
    const end = parse(avail.endTime, 'HH:mm', date);
    
    let current = start;
    while (!isAfter(addMinutes(current, service.duration), end)) {
      const slotStart = current;
      const slotEnd = addMinutes(current, service.duration);
      
      // Check min lead time
      if (isSameDay(date, now) && isBefore(slotStart, minLeadTimeDate)) {
        current = addMinutes(current, interval);
        continue;
      }

      // Check breaks
      const isInBreak = avail.breaks.some(b => {
        const bStart = parse(b.start, 'HH:mm', date);
        const bEnd = parse(b.end, 'HH:mm', date);
        // Overlap if: slotStart < bEnd AND slotEnd > bStart
        return isBefore(slotStart, bEnd) && isAfter(slotEnd, bStart);
      });

      if (isInBreak) {
        current = addMinutes(current, interval);
        continue;
      }

      // Check blockers
      const isBlocked = blockers.some(b => {
        const bStart = b.startDate.toDate();
        const bEnd = b.endDate.toDate();
        // Overlap if: slotStart < bEnd AND slotEnd > bStart
        return isBefore(slotStart, bEnd) && isAfter(slotEnd, bStart);
      });

      if (isBlocked) {
        current = addMinutes(current, interval);
        continue;
      }

      // Check bookings and capacity
      const overlappingBookings = bookings.filter(b => {
        if (b.status === 'cancelled') return false;
        const bStart = parse(b.startTime, 'HH:mm', date);
        const bEnd = parse(b.endTime, 'HH:mm', date);
        
        // Add buffers
        const bStartWithBuffer = addMinutes(bStart, -service.bufferBefore);
        const bEndWithBuffer = addMinutes(bEnd, service.bufferAfter);
        
        // Overlap if: slotStart < bEndWithBuffer AND slotEnd > bStartWithBuffer
        return isBefore(slotStart, bEndWithBuffer) && isAfter(slotEnd, bStartWithBuffer);
      });

      if (overlappingBookings.length < service.capacity) {
        slots.push({
          time: format(slotStart, 'HH:mm'),
          spotsLeft: service.capacity - overlappingBookings.length
        });
      }

      current = addMinutes(current, interval);
    }
  });

  return slots;
}
