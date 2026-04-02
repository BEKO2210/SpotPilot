import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, addDoc, updateDoc, deleteDoc, doc, onSnapshot, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/db';
import { Notification } from '../types';
import { useEffect, useState } from 'react';

export function useNotifications(providerId: string) {
  const queryClient = useQueryClient();
  const [realtimeNotifications, setRealtimeNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!providerId) return;

    const q = query(
      collection(db, 'notifications'), 
      where('providerId', '==', providerId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setRealtimeNotifications(notifications);
      queryClient.setQueryData(['notifications', providerId], notifications);
    });

    return () => unsubscribe();
  }, [providerId, queryClient]);

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const docRef = doc(db, 'notifications', id);
      await updateDoc(docRef, { isRead: true });
    }
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const unread = realtimeNotifications.filter(n => !n.isRead);
      const promises = unread.map(n => updateDoc(doc(db, 'notifications', n.id), { isRead: true }));
      await Promise.all(promises);
    }
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const docRef = doc(db, 'notifications', id);
      await deleteDoc(docRef);
    }
  });

  const createNotification = useMutation({
    mutationFn: async (newNotification: Omit<Notification, 'id' | 'createdAt'>) => {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...newNotification,
        createdAt: Timestamp.now()
      });
      return { id: docRef.id, ...newNotification };
    }
  });

  return {
    notifications: realtimeNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification
  };
}
