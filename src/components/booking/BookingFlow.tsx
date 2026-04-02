import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ServiceSelector } from './ServiceSelector';
import { DatePicker } from './DatePicker';
import { TimeSlotGrid } from './TimeSlotGrid';
import { BookingForm } from './BookingForm';
import { BookingSummary } from './BookingSummary';
import { BookingConfirmation } from './BookingConfirmation';
import { useBookingStore } from '../../store/booking-store';
import { ChevronLeft, X } from 'lucide-react';
import { Button } from '../ui/Primitives';
import { Provider } from '../../types';

type Step = 'service' | 'date' | 'time' | 'form' | 'summary' | 'confirmation';

export const BookingFlow = ({ provider }: { provider: Provider }) => {
  const [step, setStep] = useState<Step>('service');
  const { reset } = useBookingStore();
  const providerId = provider.id;

  const next = (nextStep: Step) => setStep(nextStep);
  const back = () => {
    if (step === 'date') setStep('service');
    else if (step === 'time') setStep('date');
    else if (step === 'form') setStep('time');
    else if (step === 'summary') setStep('form');
  };

  const steps: Record<Step, React.ReactNode> = {
    service: <ServiceSelector providerId={providerId} onNext={() => next('date')} />,
    date: <DatePicker onNext={() => next('time')} />,
    time: <TimeSlotGrid provider={provider} onNext={() => next('form')} />,
    form: <BookingForm onNext={() => next('summary')} />,
    summary: <BookingSummary providerId={providerId} onNext={() => next('confirmation')} />,
    confirmation: <BookingConfirmation />,
  };

  const progress = {
    service: 20,
    date: 40,
    time: 60,
    form: 80,
    summary: 90,
    confirmation: 100,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 min-h-screen flex flex-col">
      {step !== 'confirmation' && (
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {step !== 'service' && (
                <Button variant="ghost" size="sm" onClick={back}>
                  <ChevronLeft size={20} />
                </Button>
              )}
              <h1 className="text-2xl font-bold text-slate-900">Termin buchen</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={reset}>
              <X size={20} />
            </Button>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress[step]}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
