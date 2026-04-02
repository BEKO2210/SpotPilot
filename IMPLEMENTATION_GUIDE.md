# SlotPilot - Implementierungs-Guide

## 🚨 Sofort umsetzen: Mitarbeiter-Verwaltung

### 1. StaffManager Komponente erstellen

`src/components/staff/StaffManager.tsx`
```typescript
import React, { useState } from 'react';
import { useStaff } from '../../hooks/useStaff';
import { StaffMember } from '../../types';
import { Button, Card, Modal, Input } from '../ui/Primitives';
import { Plus, Trash2, Edit2, User } from 'lucide-react';

export const StaffManager = ({ providerId }: { providerId: string }) => {
  const { staff, createStaff, updateStaff, deleteStaff } = useStaff(providerId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialties: [] as string[],
    serviceIds: [] as string[],
    isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) {
      await updateStaff.mutate({ id: editingStaff.id, ...formData });
    } else {
      await createStaff.mutate({
        ...formData,
        providerId
      });
    }
    setIsModalOpen(false);
    setEditingStaff(null);
    setFormData({ name: '', email: '', specialties: [], serviceIds: [], isActive: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Mitarbeiter</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Verwalte dein Team und deren Verfügbarkeiten
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Mitarbeiter hinzufügen
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {staff.map((member) => (
          <Card key={member.id} className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <User className="text-blue-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">{member.name}</h3>
                <p className="text-sm text-slate-500">{member.email}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {member.specialties.map((spec) => (
                    <span key={spec} className="text-xs bg-slate-100 px-2 py-1 rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-100">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setEditingStaff(member);
                  setFormData({
                    name: member.name,
                    email: member.email,
                    specialties: member.specialties,
                    serviceIds: member.serviceIds,
                    isActive: member.isActive
                  });
                  setIsModalOpen(true);
                }}
              >
                <Edit2 size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-600 hover:text-red-700"
                onClick={() => deleteStaff.mutate(member.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStaff(null);
        }}
        title={editingStaff ? 'Mitarbeiter bearbeiten' : 'Mitarbeiter hinzufügen'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="E-Mail"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Button type="submit" className="w-full">
            {editingStaff ? 'Speichern' : 'Hinzufügen'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
```

### 2. useStaff Hook erstellen

`src/hooks/useStaff.ts`
```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/db';
import { StaffMember } from '../types';
import { useEffect, useState } from 'react';

export function useStaff(providerId: string) {
  const queryClient = useQueryClient();
  const [realtimeStaff, setRealtimeStaff] = useState<StaffMember[]>([]);

  useEffect(() => {
    if (!providerId) return;

    const q = query(
      collection(db, 'staff'),
      where('providerId', '==', providerId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const staff = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as StaffMember));
      setRealtimeStaff(staff);
      queryClient.setQueryData(['staff', providerId], staff);
    });

    return () => unsubscribe();
  }, [providerId, queryClient]);

  const createStaff = useMutation({
    mutationFn: async (newStaff: Omit<StaffMember, 'id'>) => {
      const docRef = await addDoc(collection(db, 'staff'), newStaff);
      return { id: docRef.id, ...newStaff };
    }
  });

  const updateStaff = useMutation({
    mutationFn: async ({ id, ...data }: Partial<StaffMember> & { id: string }) => {
      const docRef = doc(db, 'staff', id);
      await updateDoc(docRef, data);
    }
  });

  const deleteStaff = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'staff', id));
    }
  });

  return {
    staff: realtimeStaff,
    createStaff,
    updateStaff,
    deleteStaff
  };
}
```

---

## 🎯 Smart Slot Engine

### 3. Slot-Berechnung implementieren

`src/lib/slotCalculator.ts`
```typescript
import { format, addMinutes, parse, isWithinInterval, startOfDay } from 'date-fns';
import { Availability, Blocker, Booking, Service } from '../types';

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  staffId?: string;
}

interface CalculateSlotsParams {
  date: Date;
  service: Service;
  availabilities: Availability[];
  bookings: Booking[];
  blockers: Blocker[];
  staffId?: string;
}

export function calculateAvailableSlots({
  date,
  service,
  availabilities,
  bookings,
  blockers,
  staffId
}: CalculateSlotsParams): TimeSlot[] {
  const dayOfWeek = date.getDay();
  const dateStr = format(date, 'yyyy-MM-dd');
  
  // 1. Finde Verfügbarkeiten für den Tag
  const dayAvailability = availabilities.filter(a => 
    a.dayOfWeek === dayOfWeek && 
    a.isActive &&
    (staffId ? a.staffId === staffId : true)
  );

  if (dayAvailability.length === 0) return [];

  const slots: TimeSlot[] = [];
  const slotDuration = service.duration + service.bufferBefore + service.bufferAfter;

  // 2. Für jede Verfügbarkeits-Periode
  dayAvailability.forEach(availability => {
    const start = parse(availability.startTime, 'HH:mm', date);
    const end = parse(availability.endTime, 'HH:mm', date);
    
    let currentSlot = start;

    while (addMinutes(currentSlot, slotDuration) <= end) {
      const slotStart = format(currentSlot, 'HH:mm');
      const slotEnd = format(addMinutes(currentSlot, service.duration), 'HH:mm');
      
      // 3. Prüfe auf Pausen
      const isInBreak = availability.breaks.some(breakTime => {
        const breakStart = parse(breakTime.start, 'HH:mm', date);
        const breakEnd = parse(breakTime.end, 'HH:mm', date);
        return isWithinInterval(currentSlot, { start: breakStart, end: breakEnd }) ||
               isWithinInterval(addMinutes(currentSlot, service.duration), { start: breakStart, end: breakEnd });
      });

      // 4. Prüfe auf Blocker (Urlaub/Krank)
      const isBlocked = blockers.some(blocker => {
        if (staffId && blocker.staffId !== staffId) return false;
        const blockerStart = blocker.startDate.toDate();
        const blockerEnd = blocker.endDate.toDate();
        return isWithinInterval(date, { start: startOfDay(blockerStart), end: blockerEnd });
      });

      // 5. Prüfe auf bestehende Buchungen
      const isBooked = bookings.some(booking => {
        if (booking.date !== dateStr) return false;
        if (staffId && booking.staffId !== staffId) return false;
        
        const bookingStart = parse(booking.startTime, 'HH:mm', date);
        const bookingEnd = parse(booking.endTime, 'HH:mm', date);
        
        return isWithinInterval(currentSlot, { start: bookingStart, end: bookingEnd }) ||
               isWithinInterval(addMinutes(currentSlot, service.duration), { start: bookingStart, end: bookingEnd });
      });

      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        available: !isInBreak && !isBlocked && !isBooked,
        staffId: availability.staffId
      });

      currentSlot = addMinutes(currentSlot, 30); // 30-Minuten-Raster
    }
  });

  return slots;
}
```

### 4. Verfügbarkeits-Verwaltung

`src/components/staff/AvailabilityManager.tsx`
```typescript
import React from 'react';
import { useAvailability } from '../../hooks/useAvailability';
import { Card, Button } from '../ui/Primitives';
import { Clock, Plus } from 'lucide-react';

const DAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

export const AvailabilityManager = ({ 
  providerId, 
  staffId 
}: { 
  providerId: string; 
  staffId?: string;
}) => {
  const { availabilities, createAvailability } = useAvailability(providerId, staffId);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="text-blue-600" size={24} />
          <h3 className="font-bold text-slate-900">Verfügbarkeiten</h3>
        </div>
        <Button size="sm">
          <Plus size={16} className="mr-2" />
          Hinzufügen
        </Button>
      </div>

      <div className="space-y-3">
        {DAYS.map((day, index) => {
          const dayAvail = availabilities.filter(a => a.dayOfWeek === index);
          return (
            <div key={day} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
              <span className="w-32 font-medium text-slate-700">{day}</span>
              {dayAvail.length > 0 ? (
                <div className="flex gap-2">
                  {dayAvail.map((avail, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {avail.startTime} - {avail.endTime}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 text-sm">Nicht verfügbar</span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
```

---

## 📅 Kalender mit freien Slots

### 5. WeekView erweitern

Ersetze in `WeekView.tsx` die Grid-Logik:
```typescript
// NEU: Zeige freie Slots als klickbare Bereiche
{hours.map(hour => (
  <div 
    key={hour} 
    className="h-24 border-b border-slate-50 group-hover:bg-slate-50/30 transition-colors relative"
  >
    {/* Freie Slots für diese Stunde */}
    {getFreeSlotsForHour(day, hour).map((slot, idx) => (
      <div
        key={idx}
        className="absolute inset-x-1 rounded-lg bg-emerald-50 border border-emerald-200 
                   hover:bg-emerald-100 cursor-pointer transition-colors"
        style={{ top: `${(parseInt(slot.startTime.split(':')[1]) / 60) * 100}%`,
                 height: `${(slot.duration / 60) * 100}%` }}
        onClick={() => onSlotClick(slot)}
      >
        <span className="text-xs text-emerald-700 font-medium px-2">Verfügbar</span>
      </div>
    ))}
  </div>
))}
```

---

## 🔄 App.tsx Route hinzufügen

```typescript
import { StaffManager } from './components/staff/StaffManager';

// Neue Route:
<Route path="/staff" element={
  !user ? <Navigate to="/login" /> : 
  !provider?.onboarded ? <Navigate to="/onboarding" /> :
  <DashboardLayout provider={provider}>
    <StaffManager providerId={user.uid} />
  </DashboardLayout>
} />
```

Sidebar-Item in `navItems`:
```typescript
{ icon: Users, label: 'Team', path: '/staff' }
```

---

## ⚡ Quick Wins (30 Minuten)

1. **StaffManager erstellen** → Kopiere Code von oben
2. **useStaff Hook erstellen** → Analog zu useBookings
3. **Route /staff hinzufügen** → Siehe oben
4. **Sidebar aktualisieren** → "Team" statt trennen

Damit hast du funktionierende Mitarbeiter-Verwaltung!

**Nächster Schritt:** Slot-Berechnung mit `calculateAvailableSlots()`
