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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Phone, Mail, Star } from 'lucide-react';
import { useApi } from '@/lib/hooks/useApi';

interface Cliente {
  _id: string;
  codigo: string;
  nombre: string;
  apellido?: string;
  documento: string;
  tipo_documento: string;
  email?: string;
  telefono?: string;
  celular?: string;
  clasificacion: 'VIP' | 'Premium' | 'Estandar';
  scoring: number;
  ejecutivo?: { nombre: string; apellido: string };
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [clasificacion, setClasificacion] = useState('');
  const { get, del } = useApi();

  useEffect(() => { fetchClientes(); }, [pagination.page, search, clasificacion]);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pagination.page.toString(), limit: pagination.limit.toString() });
      if (search) params.append('search', search);
      if (clasificacion && clasificacion !== 'all') params.append('clasificacion', clasificacion);
      const json = await get(`/clientes?${params}`);
      if (json.success) { setClientes(json.data); setPagination(json.pagination); }
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Desactivar este cliente?')) return;
    const res = await del(`/clientes/${id}`);
    if (res.success) fetchClientes();
  };

  const getClasificacionColor = (clasificacion: string) => {
    switch (clasificacion) {
      case 'VIP': return 'bg-amber-100 text-amber-700';
      case 'Premium': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button><Plus className="mr-2 h-4 w-4" />Nuevo Cliente</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={clasificacion} onValueChange={setClasificacion}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Clasificación" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Estandar">Estándar</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchClientes}>Buscar</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{pagination.total} clientes encontrados</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Clasificación</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No se encontraron clientes</TableCell></TableRow>
                ) : (
                  clientes.map((cliente) => (
                    <TableRow key={cliente._id}>
                      <TableCell className="font-mono text-sm">{cliente.codigo}</TableCell>
                      <TableCell><div className="font-medium">{cliente.nombre} {cliente.apellido}</div></TableCell>
                      <TableCell>{cliente.tipo_documento}-{cliente.documento}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {cliente.email && <div className="flex items-center gap-1 text-xs"><Mail className="h-3 w-3" />{cliente.email}</div>}
                          {(cliente.telefono || cliente.celular) && <div className="flex items-center gap-1 text-xs"><Phone className="h-3 w-3" />{cliente.celular || cliente.telefono}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getClasificacionColor(cliente.clasificacion)}><Star className="mr-1 h-3 w-3" />{cliente.clasificacion}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-purple-600" style={{ width: `${cliente.scoring}%` }} /></div>
                          <span className="text-xs">{cliente.scoring}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(cliente._id)}><Trash2 className="mr-2 h-4 w-4" />Desactivar</DropdownMenuItem>
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
