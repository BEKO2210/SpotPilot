import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, getDoc, updateDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/db';
import { Provider } from '../types';
import { Card, Button, Badge } from '../components/ui/Primitives';
import { Rocket, Building2, Globe, Clock, CheckCircle2 } from 'lucide-react';
import { useSettingsStore } from '../store/settings-store';

export const OnboardingPage = ({ providerId }: { providerId: string }) => {
  const [step, setStep] = useState(1);
  const [provider, setLocalProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    timezone: 'Europe/Berlin',
    bookingSlug: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { setProvider } = useSettingsStore();

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        setError(null);
        const docRef = doc(db, 'providers', providerId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Provider;
          setLocalProvider({ id: docSnap.id, ...data });
          setFormData({
            businessName: data.businessName || '',
            businessType: data.businessType || '',
            timezone: data.timezone || 'Europe/Berlin',
            bookingSlug: data.bookingSlug || providerId.substring(0, 8),
          });
        } else {
          setError("Profil konnte nicht geladen werden. Bitte lade die Seite neu.");
        }
      } catch (err) {
        console.error('Error fetching provider for onboarding:', err);
        setError("Fehler beim Laden der Daten. Bitte prüfe deine Verbindung.");
      } finally {
        setFetching(false);
      }
    };
    fetchProvider();
  }, [providerId]);

  const handleComplete = async () => {
    if (!provider) {
      setError("Provider-Daten fehlen. Bitte lade die Seite neu.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'providers', providerId);
      const updates = {
        ...formData,
        onboarded: true,
        subscriptionStatus: 'free' as const,
        bookingCount: 0,
        maxFreeBookings: 50,
      };
      await updateDoc(docRef, updates);
      
      // Create welcome notification
      await addDoc(collection(db, 'notifications'), {
        providerId,
        title: 'Willkommen bei SlotPilot!',
        message: 'Dein Account wurde erfolgreich eingerichtet. Viel Erfolg mit deinem Business!',
        type: 'success',
        isRead: false,
        createdAt: Timestamp.now()
      });
      
      setIsSuccess(true);
      // Small delay for success animation
      setTimeout(() => {
        setProvider({ ...provider, ...updates });
      }, 1500);
    } catch (err) {
      console.error('Onboarding failed:', err);
      setError("Einrichtung konnte nicht abgeschlossen werden. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-xl w-full p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">Willkommen bei SlotPilot</h1>
            <p className="text-slate-500">Lass uns dein Profil in wenigen Schritten einrichten.</p>
          </div>
          <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Rocket size={24} />
          </div>
        </div>

        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-blue-600' : 'bg-slate-200'}`} 
            />
          ))}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {isSuccess ? (
          <div className="py-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-100">
              <CheckCircle2 size={40} className="animate-in zoom-in-50 duration-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Alles bereit!</h2>
              <p className="text-slate-500">Dein Account wurde erfolgreich eingerichtet. Wir leiten dich zum Dashboard weiter...</p>
            </div>
          </div>
        ) : (
          <>
            {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600">
                <Building2 size={20} />
                <h3 className="font-semibold">Geschäftsdetails</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Name deines Unternehmens</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="z.B. Haarstudio Glanz"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Branche</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  >
                    <option value="">Wähle eine Branche</option>
                    <option value="Friseur">Friseur & Beauty</option>
                    <option value="Fitness">Fitness & Yoga</option>
                    <option value="Beratung">Beratung & Coaching</option>
                    <option value="Gesundheit">Gesundheit & Medizin</option>
                    <option value="Andere">Andere</option>
                  </select>
                </div>
              </div>
            </div>
            <Button 
              className="w-full" 
              size="lg" 
              disabled={!formData.businessName || !formData.businessType}
              onClick={() => setStep(2)}
            >
              Weiter
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600">
                <Globe size={20} />
                <h3 className="font-semibold">Dein Buchungslink</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Wähle deinen persönlichen Link</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">slotpilot.app/book/</span>
                    <input 
                      type="text" 
                      className="w-full pl-36 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={formData.bookingSlug}
                      onChange={(e) => setFormData({ ...formData, bookingSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    />
                  </div>
                  <p className="text-xs text-slate-400">Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt.</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Zurück</Button>
              <Button className="flex-1" disabled={!formData.bookingSlug} onClick={() => setStep(3)}>Weiter</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600">
                <Clock size={20} />
                <h3 className="font-semibold">Wähle deinen Plan</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Deine Zeitzone</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  >
                    <option value="Europe/Berlin">Berlin (GMT+1)</option>
                    <option value="Europe/London">London (GMT+0)</option>
                    <option value="America/New_York">New York (GMT-5)</option>
                  </select>
                </div>
                
                <div className="grid gap-6">
                  <motion.div 
                    whileHover={{ scale: 1.02, translateY: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData })} // Just for feedback
                    className="p-6 bg-white rounded-3xl relative overflow-hidden group cursor-pointer shadow-2xl shadow-blue-100/50 transition-all border-none"
                  >
                    <div className="absolute top-0 right-0 p-3">
                      <Badge className="bg-blue-600 text-white border-none px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-200">Aktiviert</Badge>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                          <Rocket size={24} />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-lg tracking-tight">Starter (Free)</h4>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Dauerhaft kostenlos</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {[
                          '50 Buchungen pro Monat',
                          '1 Dienstleistung inklusive',
                          'Basis-Statistiken',
                          'E-Mail Bestätigungen'
                        ].map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                            <div className="h-5 w-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                              <CheckCircle2 size={12} />
                            </div>
                            {feature}
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-blue-100 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900">0€</span>
                        <span className="text-slate-400 font-bold text-sm">/ Monat</span>
                      </div>
                    </div>
                  </motion.div>

                  <div className="p-6 bg-slate-50/50 rounded-3xl relative overflow-hidden opacity-60 grayscale-[0.5] cursor-not-allowed border-none">
                    <div className="absolute top-0 right-0 p-3">
                      <Badge className="bg-slate-200 text-slate-500 border-none px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">Coming Soon</Badge>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-slate-200 text-slate-400 rounded-2xl flex items-center justify-center">
                          <Globe size={24} />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-400 text-lg tracking-tight">Professional</h4>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Für Profis</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {[
                          'Unbegrenzte Buchungen',
                          'Unbegrenzte Services',
                          'Team-Management',
                          'Eigene Domain'
                        ].map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                            <div className="h-5 w-5 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center shrink-0">
                              <CheckCircle2 size={12} />
                            </div>
                            {feature}
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-300">29€</span>
                        <span className="text-slate-300 font-bold text-sm">/ Monat</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1 h-12 rounded-2xl font-black text-xs uppercase tracking-widest" 
                onClick={() => setStep(2)}
              >
                Zurück
              </Button>
              <Button 
                className="flex-[2] h-12 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100" 
                isLoading={loading} 
                onClick={handleComplete}
              >
                Einrichtung abschließen
              </Button>
            </div>
          </div>
        )}
      </>
    )}
  </Card>
</div>
  );
};
