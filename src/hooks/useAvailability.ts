import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/db';
import { Availability, Blocker } from '../types';
import { useEffect, useState } from 'react';

export function useAvailability(providerId: string) {
  const queryClient = useQueryClient();
  const [realtimeAvailability, setRealtimeAvailability] = useState<Availability[]>([]);
  const [realtimeBlockers, setRealtimeBlockers] = useState<Blocker[]>([]);

  useEffect(() => {
    if (!providerId) return;

    const qAvail = query(collection(db, 'availability'), where('providerId', '==', providerId));
    const unsubAvail = onSnapshot(qAvail, (snapshot) => {
      const avail = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Availability));
      setRealtimeAvailability(avail);
      queryClient.setQueryData(['availability', providerId], avail);
    });

    const qBlock = query(collection(db, 'blockers'), where('providerId', '==', providerId));
    const unsubBlock = onSnapshot(qBlock, (snapshot) => {
      const blockers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blocker));
      setRealtimeBlockers(blockers);
      queryClient.setQueryData(['blockers', providerId], blockers);
    });

    return () => {
      unsubAvail();
      unsubBlock();
    };
  }, [providerId, queryClient]);

  const updateAvailability = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Availability> & { id: string }) => {
      const docRef = doc(db, 'availability', id);
      await updateDoc(docRef, data);
    }
  });

  const createBlocker = useMutation({
    mutationFn: async (newBlocker: Omit<Blocker, 'id'>) => {
      const docRef = await addDoc(collection(db, 'blockers'), newBlocker);
      return { id: docRef.id, ...newBlocker };
    }
  });

  return {
    availability: realtimeAvailability,
    blockers: realtimeBlockers,
    updateAvailability,
    createBlocker
  };
}
