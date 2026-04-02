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
      const docRef = await addDoc(collection(db, 'staff'), {
        ...newStaff,
        createdAt: new Date()
      });
      return { id: docRef.id, ...newStaff };
    }
  });

  const updateStaff = useMutation({
    mutationFn: async ({ id, ...data }: Partial<StaffMember> & { id: string }) => {
      const docRef = doc(db, 'staff', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
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
