import React from 'react';
import { motion } from 'motion/react';
import { useBookingStore } from '../../store/booking-store';
import { useSlotCalculator } from '../../hooks/useSlotCalculator';
import { Button } from '../ui/Primitives';
import { format } from 'date-fns';
import { Provider } from '../../types';

export const TimeSlotGrid = ({ provider, onNext }: { provider: Provider; onNext: () => void }) => {
  const { selectedDate, selectedService, selectedTime, setSelectedTime } = useBookingStore();
  const { slots } = useSlotCalculator(
    provider.id, 
    selectedDate, 
    selectedService,
    [], // staffMembers
    provider.settings.minLeadTime,
    provider.settings.maxLeadTime
  );

  if (!selectedDate || !selectedService) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Wähle eine Uhrzeit</h2>
      <p className="text-sm text-slate-500">
        Verfügbare Termine am {format(selectedDate, 'dd.MM.yyyy')}
      </p>
      
      {slots.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-slate-400">Keine freien Termine an diesem Tag.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {slots.map((slot, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.02 }}
            >
              <button
                onClick={() => {
                  setSelectedTime(slot.time);
                  onNext();
                }}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  selectedTime === slot.time 
                    ? "bg-blue-600 border-blue-600 text-white shadow-md" 
                    : "bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                {slot.time}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
