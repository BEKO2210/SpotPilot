import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Calendar, Mail, Share2, Download } from 'lucide-react';
import { Button, Card } from '../ui/Primitives';
import { useBookingStore } from '../../store/booking-store';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const BookingConfirmation = () => {
  const { selectedService, selectedDate, selectedTime, reset } = useBookingStore();

  return (
    <div className="text-center space-y-8 py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto"
      >
        <CheckCircle2 size={40} />
      </motion.div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Termin bestätigt!</h1>
        <p className="text-slate-500">
          Wir haben dir eine Bestätigung an deine E-Mail Adresse gesendet.
        </p>
      </div>

      <Card className="max-w-sm mx-auto bg-slate-50 border-none p-6 space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Dein Termin</p>
          <p className="text-lg font-bold text-slate-900">{selectedService?.name}</p>
        </div>
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <p className="text-xs text-slate-400">Datum</p>
            <p className="font-semibold text-slate-700">
              {selectedDate && format(selectedDate, 'dd.MM.yyyy')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400">Uhrzeit</p>
            <p className="font-semibold text-slate-700">{selectedTime} Uhr</p>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-3 max-w-sm mx-auto">
        <Button variant="outline" icon={Download}>
          In Kalender eintragen
        </Button>
        <Button variant="ghost" icon={Share2}>
          Termin teilen
        </Button>
        <Button className="mt-4" onClick={reset}>
          Neue Buchung
        </Button>
      </div>
    </div>
  );
};
