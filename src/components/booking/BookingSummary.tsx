import React, { useState } from 'react';
import { useBookingStore } from '../../store/booking-store';
import { useBookings } from '../../hooks/useBookings';
import { useCustomers } from '../../hooks/useCustomers';
import { Button, Card } from '../ui/Primitives';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Calendar, Clock, User, CreditCard, CheckCircle2 } from 'lucide-react';
import { formatCurrency, generateToken } from '../../lib/utils';

import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/db';
import { Provider } from '../../types';

export const BookingSummary = ({ providerId, onNext }: { providerId: string; onNext: () => void }) => {
  const { selectedService, selectedDate, selectedTime, customerInfo, reset } = useBookingStore();
  const { createBooking } = useBookings(providerId);
  const { createCustomer, findCustomerByEmail } = useCustomers(providerId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [limitError, setLimitError] = useState<string | null>(null);

  if (!selectedService || !selectedDate || !selectedTime) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setLimitError(null);
    try {
      // 0. Check Provider Subscription & Limits
      const providerRef = doc(db, 'providers', providerId);
      const providerSnap = await getDoc(providerRef);
      if (!providerSnap.exists()) throw new Error("Provider not found");
      
      const providerData = providerSnap.data() as Provider;
      const currentCount = providerData.bookingCount || 0;
      const maxFree = providerData.maxFreeBookings || 50;
      
      if (providerData.subscriptionStatus === 'free' && currentCount >= maxFree) {
        setLimitError("Dieser Dienstleister hat sein monatliches Buchungslimit erreicht. Bitte kontaktiere den Dienstleister direkt.");
        return;
      }

      // 1. Find or create customer
      let customerId = '';
      const existingCustomer = await findCustomerByEmail(customerInfo.email!);
      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const newCustomer = await createCustomer.mutateAsync({
          providerId,
          firstName: customerInfo.firstName!,
          lastName: customerInfo.lastName!,
          email: customerInfo.email!,
          phone: customerInfo.phone,
          tags: ['Neukunde'],
          noShowCount: 0,
          totalSpent: 0,
          firstBookingAt: new Date(),
          lastBookingAt: new Date(),
        });
        customerId = newCustomer.id;
      }

      // 2. Create booking
      const endTime = format(
        new Date(new Date(selectedDate).setHours(
          parseInt(selectedTime.split(':')[0]), 
          parseInt(selectedTime.split(':')[1]) + selectedService.duration
        )), 
        'HH:mm'
      );

      await createBooking.mutateAsync({
        providerId,
        serviceId: selectedService.id,
        customerId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedTime,
        endTime,
        status: 'confirmed',
        addons: [],
        totalPrice: selectedService.price,
        depositPaid: 0,
        notes: customerInfo.notes,
        confirmationToken: generateToken(),
        createdAt: new Date(),
      });

      // 3. Increment booking count
      await updateDoc(providerRef, {
        bookingCount: increment(1)
      });

      onNext();
    } catch (error) {
      console.error("Booking error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Zusammenfassung</h2>
      
      {limitError && (
        <Card className="p-4 bg-red-50 border-red-100 text-red-600 text-sm">
          {limitError}
        </Card>
      )}

      <div className="space-y-4">
        <Card className="bg-slate-50 border-none">
          <div className="flex gap-4 items-start">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900">{selectedService.name}</h3>
              <p className="text-sm text-slate-500">{selectedService.duration} Minuten</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-3">
          <div className="flex items-center gap-3 text-slate-600">
            <Calendar size={18} className="text-slate-400" />
            <span className="text-sm font-medium">
              {format(selectedDate, 'EEEE, dd. MMMM yyyy', { locale: de })}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <Clock size={18} className="text-slate-400" />
            <span className="text-sm font-medium">{selectedTime} Uhr</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <User size={18} className="text-slate-400" />
            <span className="text-sm font-medium">
              {customerInfo.firstName} {customerInfo.lastName}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <span className="text-slate-500 font-medium">Gesamtpreis</span>
          <span className="text-2xl font-bold text-slate-900">
            {formatCurrency(selectedService.price)}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleConfirm}
          isLoading={isSubmitting}
        >
          Jetzt verbindlich buchen
        </Button>
        <p className="text-center text-xs text-slate-400">
          Mit der Buchung akzeptierst du unsere AGB und Datenschutzbestimmungen.
        </p>
      </div>
    </div>
  );
};
