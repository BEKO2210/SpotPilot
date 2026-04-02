import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../lib/db';
import { Booking } from '../types';
import { useEffect, useState } from 'react';

export function useBookings(providerId: string, date?: string) {
  const queryClient = useQueryClient();
  const [realtimeBookings, setRealtimeBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!providerId) return;

    let q = query(collection(db, 'bookings'), where('providerId', '==', providerId));
    if (date) {
      q = query(q, where('date', '==', date));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setRealtimeBookings(bookings);
      queryClient.setQueryData(['bookings', providerId, date], bookings);
    });

    return () => unsubscribe();
  }, [providerId, date, queryClient]);

  const createBooking = useMutation({
    mutationFn: async (newBooking: Omit<Booking, 'id'>) => {
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...newBooking,
        createdAt: Timestamp.now()
      });
      return { id: docRef.id, ...newBooking };
    }
  });

  const updateBookingStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: Booking['status'] }) => {
      const docRef = doc(db, 'bookings', id);
      await updateDoc(docRef, { status });
    }
  });

  return {
    bookings: realtimeBookings,
    createBooking,
    updateBookingStatus
  };
}
