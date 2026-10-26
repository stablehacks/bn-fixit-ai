'use client';

import React, { useEffect, useState } from 'react';
import { Users, Phone, Mail, MapPin, CheckCircle, Clock, Star, Wrench } from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Contractor } from '@/lib/types';

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContractors() {
      try {
        setLoading(true);
        const res = await fetch('/api/contractors');
        const json = await res.json();
        if (json.success) {
          setContractors(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadContractors();
  }, []);

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contractor Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Vetted trade professionals available for automated matching and maintenance dispatch.
          </p>
        </div>

        {loading ? (
          <div className="p-16 text-center text-sm text-slate-400">Loading contractors...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contractors.map(c => {
              const availabilityColor = {
                available: 'success',
                on_call: 'warning',
                busy: 'neutral',
              }[c.availability_status] as any;

              return (
                <Card key={c.id} className="hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div>
                    <CardHeader className="bg-slate-50/50">
                      <div className="flex items-start justify-between w-full">
                        <div>
                          <CardTitle className="text-sm">{c.name}</CardTitle>
                          <p className="text-xs font-semibold text-emerald-700">{c.company}</p>
                        </div>
                        <Badge variant={availabilityColor} className="text-[10px] capitalize">
                          {c.availability_status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                      {/* Trade Categories */}
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1.5">Trade Specialties</span>
                        <div className="flex flex-wrap gap-1.5">
                          {c.service_categories.map((cat, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded capitalize"
                            >
                              {cat.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Service Area & Response */}
                      <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Coverage: {c.service_area}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Est. Response: {c.response_time_est || 'Same day'}</span>
                        </div>
                        {c.rating && (
                          <div className="flex items-center gap-1.5 text-amber-600 font-semibold">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                            <span>{c.rating} / 5.0 Rating</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>

                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {c.contact_details.phone}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">{c.id}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}
