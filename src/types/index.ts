export interface Provider {
  id: string;
  name: string;
  email: string;
  businessName: string;
  businessType: string;
  logo?: string;
  bookingSlug: string;
  timezone: string;
  currency: string;
  settings: ProviderSettings;
  createdAt: any; // Firestore Timestamp
  onboarded?: boolean;
  subscriptionStatus?: 'free' | 'active' | 'past_due';
  bookingCount?: number;
  maxFreeBookings?: number;
}

export interface ProviderSettings {
  minLeadTime: number; // hours
  maxLeadTime: number; // days
  cancellationWindow: number; // hours
  noShowFee?: number;
  depositPercent?: number;
  reminderTimes: number[]; // [1440, 120]
}

export interface Service {
  id: string;
  providerId: string;
  name: string;
  description?: string;
  duration: number; // minutes
  bufferBefore: number; // minutes
  bufferAfter: number; // minutes
  price: number;
  priceType: 'fixed' | 'from' | 'free' | 'on-request';
  capacity: number;
  category?: string;
  addons: ServiceAddon[];
  isActive: boolean;
  sortOrder: number;
}

export interface ServiceAddon {
  name: string;
  duration: number;
  price: number;
}

export interface Availability {
  id: string;
  providerId: string;
  staffId?: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  breaks: { start: string; end: string }[];
  isActive: boolean;
}

export interface Blocker {
  id: string;
  providerId: string;
  staffId?: string;
  startDate: any; // Firestore Timestamp
  endDate: any; // Firestore Timestamp
  reason?: string;
  isAllDay: boolean;
}

export interface Booking {
  id: string;
  providerId: string;
  serviceId: string;
  staffId?: string;
  customerId: string;
  date: string; // "2026-03-15"
  startTime: string; // "14:00"
  endTime: string; // "15:00"
  status: 'confirmed' | 'cancelled' | 'no-show' | 'completed' | 'rescheduled';
  addons: string[]; // names of addons
  totalPrice: number;
  depositPaid: number;
  notes?: string;
  cancelledAt?: any;
  cancelReason?: string;
  confirmationToken: string;
  createdAt: any;
}

export interface Customer {
  id: string;
  providerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  tags: string[];
  notes?: string;
  noShowCount: number;
  totalSpent: number;
  firstBookingAt: any;
  lastBookingAt: any;
}

export interface StaffMember {
  id: string;
  providerId: string;
  name: string;
  email: string;
  avatar?: string;
  specialties: string[];
  serviceIds: string[];
  isActive: boolean;
}

export interface Notification {
  id: string;
  providerId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: any; // Firestore Timestamp
}
