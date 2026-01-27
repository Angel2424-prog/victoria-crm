'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Phone, Mail, ThermometerSun } from 'lucide-react';
import { useApi } from '@/lib/hooks/useApi';

interface Lead {
  _id: string;
  codigo: string;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  celular?: string;
  temperatura: 'Frio' | 'Tibio' | 'Caliente';
  puntuacion: number;
  etapa?: { _id: string; nombre: string; color: string };
  ejecutivo?: { nombre: string; apellido: string };
  canal?: { _id: string; nombre: string };
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [temperatura, setTemperatura] = useState('');
  const { get, del } = useApi();

  useEffect(() => { fetchLeads(); }, [pagination.page, search, temperatura]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pagination.page.toString(), limit: pagination.limit.toString() });
      if (search) params.append('search', search);
      if (temperatura && temperatura !== 'all') params.append('temperatura', temperatura);
      const json = await get(`/leads?${params}`);
      if (json.success) { setLeads(json.data); setPagination(json.pagination); }
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este lead?')) return;
    const res = await del(`/leads/${id}`);
    if (res.success) fetchLeads();
  };

  const getTemperaturaColor = (temp: string) => {
    switch (temp) {
      case 'Caliente': return 'bg-red-100 text-red-700';
      case 'Tibio': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leads</h1>
        <Button><Plus className="mr-2 h-4 w-4" />Nuevo Lead</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={temperatura} onValueChange={setTemperatura}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Temperatura" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Frio">Frío</SelectItem>
                <SelectItem value="Tibio">Tibio</SelectItem>
                <SelectItem value="Caliente">Caliente</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchLeads}>Buscar</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{pagination.total} leads encontrados</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Temperatura</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No se encontraron leads</TableCell></TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead._id}>
                      <TableCell className="font-mono text-sm">{lead.codigo}</TableCell>
                      <TableCell>
                        <div className="font-medium">{lead.nombre} {lead.apellido}</div>
                        {lead.canal && <div className="text-xs text-muted-foreground">{lead.canal.nombre}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {lead.email && <div className="flex items-center gap-1 text-xs"><Mail className="h-3 w-3" />{lead.email}</div>}
                          {(lead.telefono || lead.celular) && <div className="flex items-center gap-1 text-xs"><Phone className="h-3 w-3" />{lead.celular || lead.telefono}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.etapa ? <Badge style={{ backgroundColor: lead.etapa.color }} className="text-white">{lead.etapa.nombre}</Badge> : <Badge variant="outline">Sin etapa</Badge>}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTemperaturaColor(lead.temperatura)}><ThermometerSun className="mr-1 h-3 w-3" />{lead.temperatura}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-blue-600" style={{ width: `${lead.puntuacion}%` }} /></div>
                          <span className="text-xs">{lead.puntuacion}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(lead._id)}><Trash2 className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">Página {pagination.page} de {pagination.totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={pagination.page === 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}>Anterior</Button>
                <Button variant="outline" size="sm" disabled={pagination.page === pagination.totalPages} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}>Siguiente</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
