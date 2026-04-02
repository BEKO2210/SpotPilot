import React from 'react';
import { motion } from 'motion/react';
import { Clock, Tag } from 'lucide-react';
import { useServices } from '../../hooks/useServices';
import { useBookingStore } from '../../store/booking-store';
import { Card, Badge } from '../ui/Primitives';
import { formatCurrency } from '../../lib/utils';

export const ServiceSelector = ({ providerId, onNext }: { providerId: string; onNext: () => void }) => {
  const { services } = useServices(providerId);
  const { setSelectedService, selectedService } = useBookingStore();

  const activeServices = services.filter(s => s.isActive);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Wähle eine Dienstleistung</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {activeServices.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              onClick={() => {
                setSelectedService(service);
                onNext();
              }}
              className={selectedService?.id === service.id ? "border-blue-500 bg-blue-50/30" : ""}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-slate-900">{service.name}</h3>
                <span className="font-semibold text-blue-600">
                  {formatCurrency(service.price)}
                </span>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                {service.description || "Keine Beschreibung verfügbar."}
              </p>
              <div className="flex gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {service.duration} Min.
                </span>
                {service.category && (
                  <span className="flex items-center gap-1">
                    <Tag size={14} /> {service.category}
                  </span>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
