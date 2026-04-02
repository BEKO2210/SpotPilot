import React, { useState } from 'react';
import { useBookingStore } from '../../store/booking-store';
import { Button } from '../ui/Primitives';
import { User, Mail, Phone, MessageSquare } from 'lucide-react';

export const BookingForm = ({ onNext }: { onNext: () => void }) => {
  const { customerInfo, setCustomerInfo } = useBookingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!customerInfo.firstName) newErrors.firstName = "Vorname ist erforderlich";
    if (!customerInfo.lastName) newErrors.lastName = "Nachname ist erforderlich";
    if (!customerInfo.email) newErrors.email = "E-Mail ist erforderlich";
    else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) newErrors.email = "Ungültige E-Mail";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Deine Kontaktdaten</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Vorname</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={customerInfo.firstName || ''}
                onChange={(e) => setCustomerInfo({ firstName: e.target.value })}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${errors.firstName ? 'border-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                placeholder="Max"
              />
            </div>
            {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Nachname</label>
            <input
              type="text"
              value={customerInfo.lastName || ''}
              onChange={(e) => setCustomerInfo({ lastName: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${errors.lastName ? 'border-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
              placeholder="Mustermann"
            />
            {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">E-Mail Adresse</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="email"
              value={customerInfo.email || ''}
              onChange={(e) => setCustomerInfo({ email: e.target.value })}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${errors.email ? 'border-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
              placeholder="max@beispiel.de"
            />
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Telefonnummer (optional)</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="tel"
              value={customerInfo.phone || ''}
              onChange={(e) => setCustomerInfo({ phone: e.target.value })}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="+49 123 4567890"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Notizen (optional)</label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 text-slate-400" size={18} />
            <textarea
              value={customerInfo.notes || ''}
              onChange={(e) => setCustomerInfo({ notes: e.target.value })}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px]"
              placeholder="Besondere Wünsche oder Anmerkungen..."
            />
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg">
          Weiter zur Übersicht
        </Button>
      </form>
    </div>
  );
};
