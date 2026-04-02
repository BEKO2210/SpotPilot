import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/db';
import { Service } from '../types';
import { useEffect, useState } from 'react';

export function useServices(providerId: string) {
  const queryClient = useQueryClient();
  const [realtimeServices, setRealtimeServices] = useState<Service[]>([]);

  useEffect(() => {
    if (!providerId) return;

    const q = query(collection(db, 'services'), where('providerId', '==', providerId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
      setRealtimeServices(services);
      queryClient.setQueryData(['services', providerId], services);
    });

    return () => unsubscribe();
  }, [providerId, queryClient]);

  const createService = useMutation({
    mutationFn: async (newService: Omit<Service, 'id'>) => {
      const docRef = await addDoc(collection(db, 'services'), newService);
      return { id: docRef.id, ...newService };
    }
  });

  const updateService = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Service> & { id: string }) => {
      const docRef = doc(db, 'services', id);
      await updateDoc(docRef, data);
    }
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const docRef = doc(db, 'services', id);
      await deleteDoc(docRef);
    }
  });

  return {
    services: realtimeServices,
    createService,
    updateService,
    deleteService
  };
}
