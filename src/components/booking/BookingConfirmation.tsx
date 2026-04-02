import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Share2, 
  Download,
  Copy,
  AlertCircle,
  Printer
} from 'lucide-react';
import { Button, Card } from '../ui/Primitives';
import { useBookingStore } from '../../store/booking-store';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const BookingConfirmation = () => {
  const { 
    selectedService, 
    selectedDate, 
    selectedTime, 
    customerInfo,
    bookingReference,
    reset 
  } = useBookingStore();
  
  const [copied, setCopied] = useState(false);
  const [showEmailNotice, setShowEmailNotice] = useState(true);

  // Generiere Referenz wenn nicht vorhanden
  const reference = bookingReference || 
    `SP-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  useEffect(() => {
    if (!bookingReference) {
      // Fallback: Sollte nicht passieren da Referenz in BookingSummary gesetzt wird
      console.warn('Keine Buchungsreferenz gefunden');
    }
    
    // Email-Notice nach 5 Sekunden ausblenden
    const timer = setTimeout(() => setShowEmailNotice(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyReference = () => {
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddToCalendar = () => {
    if (!selectedService || !selectedDate || !selectedTime) return;
    
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const startDate = new Date(selectedDate);
    startDate.setHours(hours, minutes);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + selectedService.duration);
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(selectedService.name)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(`Buchungsreferenz: ${reference}\nGebucht bei: SpotPilot`)}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  if (!selectedService || !selectedDate || !selectedTime) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Keine Buchungsdaten gefunden</h2>
        <Button onClick={reset} className="mt-4">Neue Buchung starten</Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Erfolgs-Animation */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12, duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="h-24 w-24 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-200">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle2 size={48} strokeWidth={3} />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center space-y-2 mb-8"
      >
        <h1 className="text-3xl font-black text-slate-900">Termin bestätigt! ✅</h1>
        <p className="text-slate-600 text-lg">
          {customerInfo.firstName}, dein Termin ist sicher gebucht.
        </p>
      </motion.div>

      {/* Wichtig: Buchungsreferenz */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 p-6">
          <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2 text-center">
            Deine Buchungsnummer
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-black text-blue-900 tracking-wider">{reference}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyReference}
              className="h-10 w-10 rounded-full hover:bg-blue-100"
            >
              {copied ? <CheckCircle2 size={18} className="text-green-600" /> : <Copy size={18} />}
            </Button>
          </div>
          <p className="text-xs text-blue-600 text-center mt-2">
            Bitte speichere diese Nummer ab
          </p>
        </Card>
      </motion.div>

      {/* Termin-Details */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-white border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-lg">{selectedService.name}</p>
              <p className="text-slate-500">{selectedService.duration} Minuten</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-500" size={20} />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Datum</p>
                <p className="font-semibold text-slate-900">
                  {format(selectedDate, 'EEEE, dd. MMMM yyyy', { locale: de })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="text-blue-500" size={20} />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Uhrzeit</p>
                <p className="font-semibold text-slate-900">{selectedTime} Uhr</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="text-blue-500" size={20} />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Name</p>
                <p className="font-semibold text-slate-900">
                  {customerInfo.firstName} {customerInfo.lastName}
                </p>
              </div>
            </div>

            {customerInfo.email && (
              <div className="flex items-center gap-3">
                <Mail className="text-blue-500" size={20} />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">E-Mail</p>
                  <p className="font-semibold text-slate-900">{customerInfo.email}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* E-Mail Hinweis */}
      <AnimatePresence>
        {showEmailNotice && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6"
          >
            <Card className="bg-amber-50 border-amber-200 p-4 flex items-start gap-3">
              <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-amber-900">E-Mail-Benachrichtigung</p>
                <p className="text-sm text-amber-700">
                  Eine Bestätigung wird an {customerInfo.email} gesendet.
                  <br />
                  <span className="font-medium">Bitte prüfe auch deinen Spam-Ordner.</span>
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Aktionen */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 space-y-3"
      >
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleAddToCalendar}
        >
          <Calendar className="mr-2" size={18} />
          Zu Google Kalender hinzufügen
        </Button>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handlePrint}
          >
            <Printer className="mr-2" size={18} />
            Drucken
          </Button>
          
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Mein Termin',
                  text: `Ich habe einen Termin gebucht: ${selectedService.name} am ${format(selectedDate, 'dd.MM.yyyy')} um ${selectedTime}`,
                });
              }
            }}
          >
            <Share2 className="mr-2" size={18} />
            Teilen
          </Button>
        </div>

        <Button 
          className="w-full mt-6" 
          variant="ghost"
          onClick={reset}
        >
          Neue Buchung starten
        </Button>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-xs text-slate-400 mt-8"
      >
        Bei Fragen zu deiner Buchung, nenne bitte deine Buchungsnummer:
        <br />
        <span className="font-mono font-bold text-slate-600">{reference}</span>
      </motion.p>
    </div>
  );
};
