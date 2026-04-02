import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useBookingStore } from '../../store/booking-store';
import { useSlotCalculator } from '../../hooks/useSlotCalculator';
import { useStaff } from '../../hooks/useStaff';
import { Button, Card } from '../ui/Primitives';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Provider } from '../../types';
import { Clock, Users, ChevronRight, AlertCircle } from 'lucide-react';

export const TimeSlotGrid = ({ provider, onNext }: { provider: Provider; onNext: () => void }) => {
  const { selectedDate, selectedService, selectedTime, selectedStaffId, setSelectedTime, setSelectedStaffId } = useBookingStore();
  const { staff } = useStaff(provider.id);
  const [showAllSlots, setShowAllSlots] = useState(false);

  const { slots, isLoading, error } = useSlotCalculator(
    provider.id, 
    selectedDate, 
    selectedService,
    staff,
    provider.settings.minLeadTime,
    provider.settings.maxLeadTime
  );

  // Filtere Slots nach ausgewähltem Mitarbeiter (falls einer gewählt)
  const filteredSlots = selectedStaffId 
    ? slots.filter(slot => slot.staffId === selectedStaffId || !slot.staffId)
    : slots;

  // Gruppiere Slots nach Mitarbeiter
  const slotsByStaff = filteredSlots.reduce((acc, slot) => {
    const staffId = slot.staffId || 'unassigned';
    if (!acc[staffId]) acc[staffId] = [];
    acc[staffId].push(slot);
    return acc;
  }, {} as Record<string, typeof slots>);

  // Zeige nur die ersten 12 Slots initial
  const displayedSlots = showAllSlots ? filteredSlots : filteredSlots.slice(0, 12);

  if (!selectedDate || !selectedService) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">Bitte wähle zuerst einen Service und ein Datum.</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-red-200 bg-red-50">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-700">Fehler beim Laden der Termine.</p>
        <p className="text-red-600 text-sm mt-2">{error.message}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="text-blue-500" size={20} />
            <h2 className="text-xl font-bold text-slate-900">Wähle eine Uhrzeit</h2>
          </div>
          <p className="text-slate-500">
            {format(selectedDate, 'EEEE, dd. MMMM yyyy', { locale: de })}
            <span className="text-slate-400 mx-2">•</span>
            <span className="text-blue-600 font-medium">
              {filteredSlots.length} Termine verfügbar
            </span>
          </p>
        </div>

        {/* Mitarbeiter-Filter */}
        {staff.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStaffId(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                !selectedStaffId
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Alle
            </button>
            {staff.filter(s => s.isActive).map(member => (
              <button
                key={member.id}
                onClick={() => setSelectedStaffId(member.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedStaffId === member.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {member.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredSlots.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-slate-300">
          <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="text-slate-400" size={32} />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Keine freien Termine</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            An diesem Tag sind leider keine Termine mehr verfügbar. 
            Bitte wähle ein anderes Datum.
          </p>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => window.history.back()}
          >
            Anderes Datum wählen
          </Button>
        </Card>
      ) : (
        <>
          {/* Slots Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {displayedSlots.map((slot, idx) => {
              const staffMember = staff.find(s => s.id === slot.staffId);
              const isSelected = selectedTime === slot.time && 
                (!selectedStaffId || selectedStaffId === slot.staffId);

              return (
                <motion.button
                  key={`${slot.time}-${slot.staffId || 'none'}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => {
                    setSelectedTime(slot.time);
                    if (slot.staffId) setSelectedStaffId(slot.staffId);
                    onNext();
                  }}
                  className={`
                    relative p-3 rounded-xl text-center transition-all border-2
                    ${isSelected 
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" 
                      : "bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:shadow-md"
                    }
                  `}
                >
                  <span className="block text-lg font-bold">{slot.time}</span>
                  
                  {staffMember && (
                    <span className={`
                      block text-xs mt-1 truncate
                      ${isSelected ? 'text-blue-100' : 'text-slate-400'}
                    `}>
                      {staffMember.name}
                    </span>
                  )}

                  {slot.spotsLeft > 1 && (
                    <span className={`
                      absolute -top-2 -right-2 h-5 w-5 rounded-full text-xs flex items-center justify-center font-bold
                      ${isSelected ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}
                    `}>
                      {slot.spotsLeft}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Mehr anzeigen */}
          {filteredSlots.length > 12 && !showAllSlots && (
            <button
              onClick={() => setShowAllSlots(true)}
              className="w-full py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-xl transition-colors"
            >
              Alle {filteredSlots.length} Termine anzeigen
            </button>
          )}

          {/* Info */}
          <div className="flex items-center gap-4 text-sm text-slate-500 bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-blue-600 rounded" />
              <span>Verfügbar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-green-500 rounded-full" />
              <span>Mehrere Plätze</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} />
              <span>{staff.filter(s => s.isActive).length} Mitarbeiter</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
