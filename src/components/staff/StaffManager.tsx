import React, { useState } from 'react';
import { useStaff } from '../../hooks/useStaff';
import { useServices } from '../../hooks/useServices';
import { StaffMember } from '../../types';
import { Button, Card, Modal, Input } from '../ui/Primitives';
import { Plus, Trash2, Edit2, User, Mail, Briefcase, X } from 'lucide-react';

export const StaffManager = ({ providerId }: { providerId: string }) => {
  const { staff, createStaff, updateStaff, deleteStaff } = useStaff(providerId);
  const { services } = useServices(providerId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialties: [] as string[],
    serviceIds: [] as string[],
    isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await updateStaff.mutateAsync({ id: editingStaff.id, ...formData });
      } else {
        await createStaff.mutateAsync({
          ...formData,
          providerId
        });
      }
      closeModal();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern des Mitarbeiters');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
    setFormData({ name: '', email: '', specialties: [], serviceIds: [], isActive: true });
  };

  const handleEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email,
      specialties: member.specialties || [],
      serviceIds: member.serviceIds || [],
      isActive: member.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Mitarbeiter wirklich löschen?')) return;
    setIsDeleting(id);
    try {
      await deleteStaff.mutateAsync(id);
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      alert('Fehler beim Löschen');
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Team & Mitarbeiter</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Verwalte dein Team und deren Verfügbarkeiten
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Mitarbeiter hinzufügen
        </Button>
      </div>

      {staff.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="text-slate-400" size={32} />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Noch keine Mitarbeiter</h3>
          <p className="text-slate-500 mb-6">Füge dein erstes Teammitglied hinzu</p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Mitarbeiter erstellen
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <Card key={member.id} className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shrink-0">
                  <span className="text-xl font-black text-blue-600">
                    {member.name.charAt(0).}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 truncate">{member.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Mail size={12} />
                        <span className="truncate">{member.email}</span>
                      </div>
                    </div>
                    {!member.isActive && (
                      <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                        Inaktiv
                      </span>
                    )}
                  </div>
                  
                  {member.specialties?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {member.specialties.map((spec, idx) => (
                        <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {member.serviceIds?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-400 mb-2">Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {member.serviceIds.map(id => {
                          const service = services.find(s => s.id === id);
                          return service ? (
                            <span key={id} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                              {service.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(member)}
                >
                  <Edit2 size={16} className="mr-2" />
                  Bearbeiten
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(member.id)}
                  isLoading={isDeleting === member.id}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingStaff ? 'Mitarbeiter bearbeiten' : 'Mitarbeiter hinzufügen'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Max Mustermann"
          />
          
          <Input
            label="E-Mail *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="max@beispiel.de"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Services
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
              {services.length === 0 ? (
                <p className="text-sm text-slate-500">Noch keine Services erstellt</p>
              ) : (
                services.map(service => (
                  <label key={service.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.serviceIds.includes(service.id)}
                      onChange={() => toggleService(service.id)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm">{service.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-slate-300"
            />
            <span className="text-sm text-slate-700">Aktiv</span>
          </label>
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" className="flex-1" onClick={closeModal}>
              Abbrechen
            </Button>
            <Button type="submit" className="flex-1">
              {editingStaff ? 'Speichern' : 'Hinzufügen'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
