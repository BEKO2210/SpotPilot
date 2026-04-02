import React, { useState } from 'react';
import { useBookingStore } from '../../store/booking-store';
import { useBookings } from '../../hooks/useBookings';
import { useCustomers } from '../../hooks/useCustomers';
import { Button, Card } from '../ui/Primitives';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Calendar, Clock, User, CreditCard, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatCurrency, generateToken } from '../../lib/utils';

import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/db';
import { Provider } from '../../types';

export const BookingSummary = ({ providerId, onNext }: { providerId: string; onNext: () => void }) => {
  const { 
    selectedService, 
    selectedDate, 
    selectedTime, 
    customerInfo,
    setBookingReference,
    reset 
  } = useBookingStore();
  
  const { createBooking } = useBookings(providerId);
  const { createCustomer, findCustomerByEmail } = useCustomers(providerId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [limitError, setLimitError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  if (!selectedService || !selectedDate || !selectedTime) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setLimitError(null);
    setBookingError(null);
    
    try {
      // 0. Check Provider Subscription & Limits
      const providerRef = doc(db, 'providers', providerId);
      const providerSnap = await getDoc(providerRef);
      if (!providerSnap.exists()) throw new Error("Provider not found");
      
      const providerData = providerSnap.data() as Provider;
      const currentCount = providerData.bookingCount || 0;
      const maxFree = providerData.maxFreeBookings || 50;
      
      if (providerData.subscriptionStatus === 'free' && currentCount >= maxFree) {
        setLimitError("Dieser Dienstleister hat das monatliche Buchungslimit erreicht. Bitte kontaktiere den Dienstleister direkt.");
        return;
      }

      // Generiere Buchungsreferenz FRÜH (für Anzeige)
      const bookingRef = `SP-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      setBookingReference(bookingRef);

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
        bookingReference: bookingRef, // NEU: Speichere Referenz auch in DB
        createdAt: new Date(),
      });

      // 3. Increment booking count
      await updateDoc(providerRef, {
        bookingCount: increment(1)
      });

      // 4. TODO: Hier E-Mail-Versand implementieren
      // await sendConfirmationEmail({
      //   to: customerInfo.email,
      //   reference: bookingRef,
      //   service: selectedService,
      //   date: selectedDate,
      //   time: selectedTime
      // });

      console.log('✅ Buchung erfolgreich:', {
        reference: bookingRef,
        email: customerInfo.email,
        service: selectedService.name
      });

      onNext();
    } catch (error: any) {
      console.error("❌ Booking error:", error);
      setBookingError(
        error.message || "Ein Fehler ist aufgetreten. Bitte versuche es erneut."
      );
      // Reset booking reference on error
      setBookingReference(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <CheckCircle2 className="text-blue-600" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Fast geschafft!</h2>
          <p className="text-sm text-slate-500">Überprüfe deine Angaben</p>
        </div>
      </div>
      
      {limitError && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <p className="text-red-700 text-sm">{limitError}</p>
          </div>
        </Card>
      )}

      {bookingError && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-700 text-sm font-medium">Buchung fehlgeschlagen</p>
              <p className="text-red-600 text-sm">{bookingError}</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="bg-slate-50 border-slate-200">
        <div className="p-5 space-y-4">
          <div className="flex gap-4 items-start pb-4 border-b border-slate-200">
            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-lg">{selectedService.name}</h3>
              <p className="text-slate-500">{selectedService.duration} Minuten</p>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center gap-3 text-slate-700">
              <Calendar size={18} className="text-blue-500" />
              <span className="font-medium">
                {format(selectedDate, 'EEEE, dd. MMMM yyyy', { locale: de })}
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <Clock size={18} className="text-blue-500" />
              <span className="font-medium">{selectedTime} Uhr</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <User size={18} className="text-blue-500" />
              <span className="font-medium">
                {customerInfo.firstName} {customerInfo.lastName}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
            <span className="text-slate-600 font-medium">Gesamtpreis</span>
            <span className="text-2xl font-black text-slate-900">
              {formatCurrency(selectedService.price)}
            </span>
          </div>
        </div>
      </Card>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Hinweis:</span> Nach der Buchung erhältst du eine 
          Bestätigungsseite mit deiner Buchungsnummer. Speichere diese ab!
        </p>
      </div>

      <div className="space-y-3 pt-4">
        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleConfirm}
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Wird gebucht...' : 'Jetzt verbindlich buchen'}
        </Button>
        
        <p className="text-center text-xs text-slate-400">
          Mit der Buchung akzeptierst du die AGB und Datenschutzbestimmungen.
        </p>
      </div>
    </div>
  );
};
