import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/db';
import { Customer } from '../types';
import { useEffect, useState } from 'react';

export function useCustomers(providerId: string) {
  const queryClient = useQueryClient();
  const [realtimeCustomers, setRealtimeCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    if (!providerId) return;

    const q = query(collection(db, 'customers'), where('providerId', '==', providerId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
      setRealtimeCustomers(customers);
      queryClient.setQueryData(['customers', providerId], customers);
    });

    return () => unsubscribe();
  }, [providerId, queryClient]);

  const findCustomerByEmail = async (email: string) => {
    const q = query(
      collection(db, 'customers'), 
      where('providerId', '==', providerId),
      where('email', '==', email),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Customer;
  };

  const createCustomer = useMutation({
    mutationFn: async (newCustomer: Omit<Customer, 'id'>) => {
      const docRef = await addDoc(collection(db, 'customers'), newCustomer);
      return { id: docRef.id, ...newCustomer };
    }
  });

  const updateCustomer = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Customer> & { id: string }) => {
      const docRef = doc(db, 'customers', id);
      await updateDoc(docRef, data);
    }
  });

  return {
    customers: realtimeCustomers,
    findCustomerByEmail,
    createCustomer,
    updateCustomer
  };
}
