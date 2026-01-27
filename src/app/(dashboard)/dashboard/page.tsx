'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserPlus, Target, Calendar, TrendingUp, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { useApi } from '@/lib/hooks/useApi';

interface DashboardData {
  contadores: {
    totalLeads: number;
    leadsNuevos: number;
    totalClientes: number;
    clientesNuevos: number;
    oportunidadesAbiertas: number;
    oportunidadesGanadas: number;
    actividadesPendientes: number;
    valorOportunidades: number;
  };
  leadsPorEtapa: Array<{ _id: string; count: number; etapa?: { nombre: string; color: string } }>;
  proximasActividades: Array<{ _id: string; asunto: string; tipo: string; fecha_programada: string }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const json = await get('/dashboard');
      if (json.success) setData(json.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-16" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { title: 'Total Leads', value: data?.contadores.totalLeads || 0, icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Leads Nuevos (30d)', value: data?.contadores.leadsNuevos || 0, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Total Clientes', value: data?.contadores.totalClientes || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Clientes Nuevos (30d)', value: data?.contadores.clientesNuevos || 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Oportunidades Abiertas', value: data?.contadores.oportunidadesAbiertas || 0, icon: Target, color: 'text-orange-600', bg: 'bg-orange-100' },
    { title: 'Oportunidades Ganadas', value: data?.contadores.oportunidadesGanadas || 0, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Actividades Pendientes', value: data?.contadores.actividadesPendientes || 0, icon: Calendar, color: 'text-red-600', bg: 'bg-red-100' },
    { title: 'Valor Pipeline', value: formatCurrency(data?.contadores.valorOportunidades || 0), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Badge variant="outline" className="text-lg px-4 py-1">
          Pipeline: {formatCurrency(data?.contadores.valorOportunidades || 0)}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`rounded-full p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Pipeline de Leads</CardTitle></CardHeader>
          <CardContent>
            {data?.leadsPorEtapa && data.leadsPorEtapa.length > 0 ? (
              <div className="space-y-3">
                {data.leadsPorEtapa.map((item) => (
                  <div key={item._id || 'sin-etapa'} className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.etapa?.color || '#94a3b8' }} />
                    <span className="flex-1 text-sm">{item.etapa?.nombre || 'Sin etapa'}</span>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay leads en el pipeline</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Próximas Actividades</CardTitle></CardHeader>
          <CardContent>
            {data?.proximasActividades && data.proximasActividades.length > 0 ? (
              <div className="space-y-3">
                {data.proximasActividades.map((actividad) => (
                  <div key={actividad._id} className="flex items-start gap-3 rounded-lg border p-3">
                    <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{actividad.asunto}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{actividad.tipo}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay actividades programadas</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
