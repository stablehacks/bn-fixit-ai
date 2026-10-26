'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, MapPin, Home, ClipboardList, ArrowRight } from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Property } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        const res = await fetch('/api/properties');
        const json = await res.json();
        if (json.success) {
          setProperties(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, []);

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Property Portfolio</h1>
          <p className="text-sm text-slate-500 mt-1">
            Managed residential communities and unit inventories under active operations.
          </p>
        </div>

        {loading ? (
          <div className="p-16 text-center text-sm text-slate-400">Loading properties...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(prop => (
              <Card key={prop.id} className="hover:border-slate-300 transition-all flex flex-col justify-between">
                <div>
                  <CardHeader className="bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{prop.name}</CardTitle>
                        <CardDescription className="font-mono text-[10px]">{prop.id}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start gap-2 text-xs text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <span>{prop.address}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Total Units</span>
                        <span className="font-bold text-slate-800 text-sm">{prop.unit_count} Units</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Status</span>
                        <Badge variant="success" className="text-[10px]">
                          Active Management
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Onboarded {formatDate(prop.created_at)}
                  </span>
                  <Link href={`/requests`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      Requests <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
