import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/db';
import { Provider } from '../../types';
import { Card, Button, Badge, Modal } from '../ui/Primitives';
import { Check, AlertCircle, Sparkles } from 'lucide-react';

interface SettingsProps {
  provider: Provider;
}

export const Settings: React.FC<SettingsProps> = ({ provider }) => {
  const [businessName, setBusinessName] = useState(provider.businessName || '');
  const [businessType, setBusinessType] = useState(provider.businessType || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Sync local state with provider prop for real-time updates from other devices
  useEffect(() => {
    setBusinessName(provider.businessName || '');
    setBusinessType(provider.businessType || '');
  }, [provider.businessName, provider.businessType]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const docRef = doc(db, 'providers', provider.id);
      await updateDoc(docRef, {
        businessName,
        businessType,
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Einstellungen</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-6">
          <h3 className="font-bold text-lg">Unternehmensprofil</h3>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Unternehmensname</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Dein Business Name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Branche</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="z.B. Friseursalon, Coaching, etc."
              />
            </div>
          </div>
          <Button 
            className="w-full" 
            onClick={handleSave} 
            disabled={isSaving}
          >
            {isSaving ? 'Wird gespeichert...' : 'Änderungen speichern'}
            {saveStatus === 'success' && <Check size={16} className="ml-2" />}
            {saveStatus === 'error' && <AlertCircle size={16} className="ml-2" />}
          </Button>
          {saveStatus === 'success' && (
            <p className="text-sm text-emerald-600 font-medium text-center">Profil erfolgreich aktualisiert!</p>
          )}
        </Card>

        <Card className="p-6 space-y-6 border-blue-100 bg-blue-50/30">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg">Abonnement & Abrechnung</h3>
            <Badge className="bg-blue-100 text-blue-700">
              {provider.subscriptionStatus === 'free' ? 'Free Plan' : 'Pro Plan'}
            </Badge>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Kostenlose Buchungen</span>
                <span className="font-bold">{provider.bookingCount || 0} / {provider.maxFreeBookings || 50}</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500" 
                  style={{ width: `${Math.min(((provider.bookingCount || 0) / (provider.maxFreeBookings || 50)) * 100, 100)}%` }}
                />
              </div>
            </div>
            {provider.subscriptionStatus === 'free' && (
              <div className="p-4 bg-white rounded-xl border border-blue-100 space-y-3">
                <p className="text-sm text-slate-600">
                  Upgrade auf **Pro** für unbegrenzte Buchungen und Premium-Features.
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">29,99€</span>
                  <span className="text-slate-400 text-sm">/ Monat</span>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsUpgradeModalOpen(true)}
                >
                  Jetzt Upgraden
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Modal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Upgrade auf Pro"
      >
        <div className="space-y-6">
          <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
            <Sparkles size={40} className="animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <h4 className="text-lg font-bold">Hol dir das volle SlotPilot Erlebnis</h4>
            <p className="text-slate-500 text-sm">
              Die Zahlungsfunktion wird gerade implementiert. In Kürze kannst du hier dein Abo abschließen und unbegrenzt Buchungen empfangen.
            </p>
          </div>
          <div className="space-y-3">
            {[
              'Unbegrenzte Buchungen',
              'Eigene Domain & Branding',
              'Team-Management',
              'Erweiterte Statistiken',
              'Priorisierter Support'
            ].map(feature => (
              <div key={feature} className="flex items-center gap-3 text-sm text-slate-600">
                <div className="h-5 w-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                  <Check size={12} />
                </div>
                {feature}
              </div>
            ))}
          </div>
          <Button className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest" onClick={() => setIsUpgradeModalOpen(false)}>Verstanden</Button>
        </div>
      </Modal>
    </div>
  );
};
