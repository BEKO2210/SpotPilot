import React, { useState } from 'react';
import { useServices } from '../../hooks/useServices';
import { Service } from '../../types';
import { Button, Card, Badge, Modal } from '../ui/Primitives';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Plus, Edit2, Trash2, Clock, Tag } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export const ServiceManager = ({ providerId }: { providerId: string }) => {
  const { services, createService, updateService, deleteService } = useServices(providerId);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    category: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateService.mutateAsync({
        id: editingId,
        ...formData,
      });
    } else {
      await createService.mutateAsync({
        providerId,
        ...formData,
        priceType: 'fixed',
        capacity: 1,
        bufferBefore: 0,
        bufferAfter: 0,
        addons: [],
        isActive: true,
        sortOrder: services.length,
      });
    }
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', description: '', duration: 30, price: 0, category: '' });
  };

  const handleEdit = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description || '',
      duration: service.duration,
      price: service.price,
      category: service.category || '',
    });
    setEditingId(service.id);
    setIsAdding(true);
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deleteService.mutateAsync(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Dienstleistungen</h1>
        <Button icon={Plus} onClick={() => {
          setEditingId(null);
          setFormData({ name: '', description: '', duration: 30, price: 0, category: '' });
          setIsAdding(true);
        }}>Service hinzufügen</Button>
      </div>

      {isAdding && (
        <Card className="p-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <h3 className="font-bold text-lg">{editingId ? 'Service bearbeiten' : 'Neuen Service hinzufügen'}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200" 
                  placeholder="z.B. Haarschnitt"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Kategorie</label>
                <input 
                  type="text" 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200" 
                  placeholder="z.B. Styling"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Dauer (Minuten)</label>
                <input 
                  type="number" 
                  required
                  value={isNaN(formData.duration) ? '' : formData.duration}
                  onChange={e => setFormData({...formData, duration: e.target.value === '' ? NaN : parseInt(e.target.value)})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Preis (€)</label>
                <input 
                  type="number" 
                  required
                  value={isNaN(formData.price) ? '' : formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value === '' ? NaN : parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200" 
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Beschreibung</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200" 
                placeholder="Kurze Beschreibung der Dienstleistung..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}>Abbrechen</Button>
              <Button type="submit" isLoading={createService.isPending || updateService.isPending}>
                {editingId ? 'Aktualisieren' : 'Speichern'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map(service => (
          <Card 
            key={service.id} 
            className={cn(
              "group overflow-hidden transition-all duration-300 border-none",
              expandedId === service.id ? "shadow-2xl shadow-blue-100 scale-[1.02] bg-white z-10" : "hover:shadow-lg hover:scale-[1.01] bg-white"
            )}
            onClick={() => setExpandedId(expandedId === service.id ? null : service.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-900">{service.name}</h3>
                <Badge className="mt-1">{service.category || 'Allgemein'}</Badge>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(service)}><Edit2 size={14} /></Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:bg-red-50"
                  onClick={() => setDeleteConfirmId(service.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock size={16} /> {service.duration} Min.
              </div>
              <div className="text-lg font-bold text-blue-600">
                {formatCurrency(service.price)}
              </div>
            </div>
            
            <AnimatePresence>
              {expandedId === service.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <Tag size={12} /> Beschreibung
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {service.description || 'Keine Beschreibung verfügbar.'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Service löschen"
      >
        <div className="space-y-6">
          <p className="text-slate-600">
            Möchtest du diesen Service wirklich unwiderruflich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>Abbrechen</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleDelete} isLoading={deleteService.isPending}>
              Löschen
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

