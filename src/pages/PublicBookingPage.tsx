import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/db';
import { Provider } from '../types';
import { BookingFlow } from '../components/booking/BookingFlow';
import { Card } from '../components/ui/Primitives';
import { Calendar } from 'lucide-react';

export const PublicBookingPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    
    const q = query(
      collection(db, 'providers'), 
      where('bookingSlug', '==', slug),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        setProvider({ id: doc.id, ...doc.data() } as Provider);
        setError(null);
      } else {
        setError('Dienstleister nicht gefunden.');
        setProvider(null);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error fetching provider:', err);
      setError('Fehler beim Laden des Dienstleisters.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <div className="h-16 w-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <Calendar size={32} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">{error || 'Nicht gefunden'}</h1>
          <p className="text-slate-500">Der gesuchte Buchungslink ist ungültig oder abgelaufen.</p>
        </Card>
      </div>
    );
  }

  return <BookingFlow provider={provider} />;
};
