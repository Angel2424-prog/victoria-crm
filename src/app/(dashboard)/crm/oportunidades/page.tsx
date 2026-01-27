'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Target, 
  Plus, 
  Search, 
  DollarSign,
  Calendar,
  User,
  TrendingUp,
  Edit,
  Trash2,
  X,
  Loader2,
  ChevronRight
} from 'lucide-react';

interface Oportunidad {
  _id: string;
  nombre: string;
  cliente: { _id: string; nombre: string };
  valor: number;
  etapa: string;
  probabilidad: number;
  fechaCierre: string;
  descripcion: string;
  createdAt: string;
}

const ETAPAS = [
  { id: 'prospecto', nombre: 'Prospecto', color: 'bg-slate-500' },
  { id: 'contactado', nombre: 'Contactado', color: 'bg-blue-500' },
  { id: 'propuesta', nombre: 'Propuesta', color: 'bg-yellow-500' },
  { id: 'negociacion', nombre: 'Negociación', color: 'bg-orange-500' },
  { id: 'cerrado_ganado', nombre: 'Cerrado Ganado', color: 'bg-green-500' },
  { id: 'cerrado_perdido', nombre: 'Cerrado Perdido', color: 'bg-red-500' },
];

export default function OportunidadesPage() {
  const { data: session } = useSession();
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEtapa, setFiltroEtapa] = useState<string>('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingOportunidad, setEditingOportunidad] = useState<Oportunidad | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    clienteId: '',
    valor: 0,
    etapa: 'prospecto',
    probabilidad: 50,
    fechaCierre: '',
    descripcion: ''
  });

  useEffect(() => {
    cargarOportunidades();
  }, []);

  const cargarOportunidades = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/oportunidades`, {
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setOportunidades(data.data);
      }
    } catch (error) {
      console.error('Error cargando oportunidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingOportunidad 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/oportunidades/${editingOportunidad._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/oportunidades`;
      
      const res = await fetch(url, {
        method: editingOportunidad ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(session as any)?.accessToken}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        cargarOportunidades();
        cerrarModal();
      }
    } catch (error) {
      console.error('Error guardando oportunidad:', error);
    }
  };

  const eliminarOportunidad = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta oportunidad?')) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/oportunidades/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` }
      });

      if (res.ok) {
        cargarOportunidades();
      }
    } catch (error) {
      console.error('Error eliminando oportunidad:', error);
    }
  };

  const abrirModal = (oportunidad?: Oportunidad) => {
    if (oportunidad) {
      setEditingOportunidad(oportunidad);
      setFormData({
        nombre: oportunidad.nombre,
        clienteId: oportunidad.cliente?._id || '',
        valor: oportunidad.valor,
        etapa: oportunidad.etapa,
        probabilidad: oportunidad.probabilidad,
        fechaCierre: oportunidad.fechaCierre?.split('T')[0] || '',
        descripcion: oportunidad.descripcion || ''
      });
    } else {
      setEditingOportunidad(null);
      setFormData({
        nombre: '',
        clienteId: '',
        valor: 0,
        etapa: 'prospecto',
        probabilidad: 50,
        fechaCierre: '',
        descripcion: ''
      });
    }
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingOportunidad(null);
  };

  const getEtapaInfo = (etapaId: string) => {
    return ETAPAS.find(e => e.id === etapaId) || ETAPAS[0];
  };

  const oportunidadesFiltradas = oportunidades.filter(o => {
    const matchSearch = o.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEtapa = filtroEtapa === 'todos' || o.etapa === filtroEtapa;
    return matchSearch && matchEtapa;
  });

  const stats = {
    total: oportunidades.length,
    valorTotal: oportunidades.reduce((acc, o) => acc + (o.valor || 0), 0),
    enNegociacion: oportunidades.filter(o => o.etapa === 'negociacion').length,
    cerradas: oportunidades.filter(o => o.etapa === 'cerrado_ganado').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Oportunidades</h1>
          <p className="text-slate-500">Gestiona tu pipeline de ventas</p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nueva Oportunidad
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              <p className="text-sm text-slate-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">${stats.valorTotal.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Valor Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.enNegociacion}</p>
              <p className="text-sm text-slate-500">En Negociación</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <Target className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.cerradas}</p>
              <p className="text-sm text-slate-500">Cerradas Ganadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar oportunidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFiltroEtapa('todos')}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              filtroEtapa === 'todos'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Todos
          </button>
          {ETAPAS.slice(0, 4).map((etapa) => (
            <button
              key={etapa.id}
              onClick={() => setFiltroEtapa(etapa.id)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                filtroEtapa === etapa.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {etapa.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Oportunidades */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Oportunidad</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Cliente</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Valor</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Etapa</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Probabilidad</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Fecha Cierre</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {oportunidadesFiltradas.map((oportunidad) => {
              const etapa = getEtapaInfo(oportunidad.etapa);
              return (
                <tr key={oportunidad._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{oportunidad.nombre}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {oportunidad.cliente?.nombre || 'Sin cliente'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-green-600">
                      ${oportunidad.valor?.toLocaleString() || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${etapa.color}`}>
                      {etapa.nombre}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${oportunidad.probabilidad || 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-600">{oportunidad.probabilidad || 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {oportunidad.fechaCierre 
                      ? new Date(oportunidad.fechaCierre).toLocaleDateString()
                      : '-'
                    }
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => abrirModal(oportunidad)}
                        className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => eliminarOportunidad(oportunidad._id)}
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {oportunidadesFiltradas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">No hay oportunidades</p>
                  <button
                    onClick={() => abrirModal()}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                  >
                    Crear primera oportunidad
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingOportunidad ? 'Editar Oportunidad' : 'Nueva Oportunidad'}
              </h2>
              <button onClick={cerrarModal} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Valor ($)</label>
                  <input
                    type="number"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Probabilidad (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probabilidad}
                    onChange={(e) => setFormData({ ...formData, probabilidad: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Etapa</label>
                <select
                  value={formData.etapa}
                  onChange={(e) => setFormData({ ...formData, etapa: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  {ETAPAS.map((etapa) => (
                    <option key={etapa.id} value={etapa.id}>{etapa.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Fecha de Cierre</label>
                <input
                  type="date"
                  value={formData.fechaCierre}
                  onChange={(e) => setFormData({ ...formData, fechaCierre: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                >
                  {editingOportunidad ? 'Guardar Cambios' : 'Crear Oportunidad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
