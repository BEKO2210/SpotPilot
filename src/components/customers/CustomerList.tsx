import React, { useState } from 'react';
import { useCustomers } from '../../hooks/useCustomers';
import { Card, Badge, Button } from '../ui/Primitives';
import { User, Mail, Phone, Calendar, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

export const CustomersPage = ({ providerId }: { providerId: string }) => {
  const { customers } = useCustomers(providerId);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchQuery.toLowerCase();
    return (
      customer.firstName.toLowerCase().includes(searchLower) ||
      customer.lastName.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      (customer.phone && customer.phone.includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Kunden</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Kunden suchen..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <Button variant="outline" icon={Filter}>Filter</Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredCustomers.length === 0 ? (
          <Card className="py-12 text-center bg-slate-50 border-none">
            <p className="text-slate-400">
              {searchQuery ? 'Keine Kunden gefunden.' : 'Noch keine Kunden angelegt.'}
            </p>
          </Card>
        ) : (
          filteredCustomers.map(customer => (
            <Card key={customer.id} className="flex flex-col md:flex-row md:items-center gap-6 p-6">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                <User size={32} />
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    {customer.firstName} {customer.lastName}
                  </h3>
                  {customer.tags.map(tag => (
                    <Badge key={tag} className="bg-blue-50 text-blue-600 border-blue-100">{tag}</Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><Mail size={14} /> {customer.email}</span>
                  {customer.phone && <span className="flex items-center gap-1.5"><Phone size={14} /> {customer.phone}</span>}
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} /> Letzte Buchung: {customer.lastBookingAt ? format(customer.lastBookingAt.toDate(), 'dd.MM.yyyy') : 'Nie'}
                  </span>
                </div>
              </div>

              <div className="flex gap-8 md:text-right shrink-0">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Umsatz</p>
                  <p className="text-lg font-bold text-slate-900">{customer.totalSpent.toFixed(2)} €</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">No-Shows</p>
                  <p className="text-lg font-bold text-red-500">{customer.noShowCount}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

