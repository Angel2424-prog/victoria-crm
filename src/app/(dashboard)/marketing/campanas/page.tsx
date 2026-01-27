'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Calendar,
  Users,
  Target,
  BarChart3,
  Play,
  Pause,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  X,
  Loader2
} from 'lucide-react';

interface Campana {
  _id: string;
  nombre: string;
  descripcion: string;
  tipo: 'email' | 'sms' | 'whatsapp' | 'mixta';
  estado: 'borrador' | 'activa' | 'pausada' | 'completada';
  fechaInicio: string;
  fechaFin: string;
  objetivo: string;
  presupuesto: number;
  audiencia: {
    tipo: string;
    filtros: any;
    cantidad: number;
  };
  metricas: {
    enviados: number;
    entregados: number;
    abiertos: number;
    clicks: number;
    conversiones: number;
  };
  createdAt: string;
}

export default function CampanasPage() {
  const { data: session } = useSession();
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingCampana, setEditingCampana] = useState<Campana | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'email',
    objetivo: '',
    presupuesto: 0,
    fechaInicio: '',
    fechaFin: ''
  });

  useEffect(() => {
    cargarCampanas();
  }, []);

  const cargarCampanas = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campanas`, {
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setCampanas(data.data);
      }
    } catch (error) {
      console.error('Error cargando campañas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCampana 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/campanas/${editingCampana._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/campanas`;
      
      const res = await fetch(url, {
        method: editingCampana ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(session as any)?.accessToken}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        cargarCampanas();
        cerrarModal();
      }
    } catch (error) {
      console.error('Error guardando campaña:', error);
    }
  };

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campanas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(session as any)?.accessToken}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (res.ok) {
        cargarCampanas();
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
    }
  };

  const eliminarCampana = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta campaña?')) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campanas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` }
      });

      if (res.ok) {
        cargarCampanas();
      }
    } catch (error) {
      console.error('Error eliminando campaña:', error);
    }
  };

  const abrirModal = (campana?: Campana) => {
    if (campana) {
      setEditingCampana(campana);
      setFormData({
        nombre: campana.nombre,
        descripcion: campana.descripcion || '',
        tipo: campana.tipo,
        objetivo: campana.objetivo || '',
        presupuesto: campana.presupuesto || 0,
        fechaInicio: campana.fechaInicio?.split('T')[0] || '',
        fechaFin: campana.fechaFin?.split('T')[0] || ''
      });
    } else {
      setEditingCampana(null);
      setFormData({
        nombre: '',
        descripcion: '',
        tipo: 'email',
        objetivo: '',
        presupuesto: 0,
        fechaInicio: '',
        fechaFin: ''
      });
    }
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingCampana(null);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activa': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pausada': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completada': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'activa': return <Play className="h-3 w-3" />;
      case 'pausada': return <Pause className="h-3 w-3" />;
      case 'completada': return <CheckCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'email': return 'bg-blue-500/20 text-blue-400';
      case 'sms': return 'bg-green-500/20 text-green-400';
      case 'whatsapp': return 'bg-emerald-500/20 text-emerald-400';
      default: return 'bg-purple-500/20 text-purple-400';
    }
  };

  const campanasFiltradas = campanas.filter(c => {
    const matchSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || c.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  const stats = {
    total: campanas.length,
    activas: campanas.filter(c => c.estado === 'activa').length,
    completadas: campanas.filter(c => c.estado === 'completada').length,
    enviados: campanas.reduce((acc, c) => acc + (c.metricas?.enviados || 0), 0)
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
          <h1 className="text-2xl font-bold text-slate-800">Campañas de Marketing</h1>
          <p className="text-slate-500">Gestiona tus campañas de email, SMS y WhatsApp</p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nueva Campaña
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Megaphone className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              <p className="text-sm text-slate-500">Total Campañas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Play className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.activas}</p>
              <p className="text-sm text-slate-500">Activas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <CheckCircle className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.completadas}</p>
              <p className="text-sm text-slate-500">Completadas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Users className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.enviados}</p>
              <p className="text-sm text-slate-500">Mensajes Enviados</p>
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
            placeholder="Buscar campañas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
        <div className="flex gap-2">
          {['todos', 'borrador', 'activa', 'pausada', 'completada'].map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                filtroEstado === estado
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Campañas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {campanasFiltradas.map((campana) => (
          <div
            key={campana._id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all"
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800 truncate">{campana.nombre}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{campana.descripcion || 'Sin descripción'}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${getTipoColor(campana.tipo)}`}>
                  {campana.tipo.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getEstadoColor(campana.estado)}`}>
                  {getEstadoIcon(campana.estado)}
                  {campana.estado}
                </span>
                {campana.fechaInicio && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(campana.fechaInicio).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Métricas */}
              {campana.metricas && (
                <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-slate-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-slate-800">{campana.metricas.enviados || 0}</p>
                    <p className="text-xs text-slate-500">Enviados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-green-600">{campana.metricas.entregados || 0}</p>
                    <p className="text-xs text-slate-500">Entregados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-blue-600">{campana.metricas.abiertos || 0}</p>
                    <p className="text-xs text-slate-500">Abiertos</p>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex items-center gap-2">
                {campana.estado === 'borrador' && (
                  <button
                    onClick={() => cambiarEstado(campana._id, 'activa')}
                    className="flex-1 py-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors text-sm"
                  >
                    <Play className="h-4 w-4 inline mr-1" /> Activar
                  </button>
                )}
                {campana.estado === 'activa' && (
                  <button
                    onClick={() => cambiarEstado(campana._id, 'pausada')}
                    className="flex-1 py-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors text-sm"
                  >
                    <Pause className="h-4 w-4 inline mr-1" /> Pausar
                  </button>
                )}
                {campana.estado === 'pausada' && (
                  <button
                    onClick={() => cambiarEstado(campana._id, 'activa')}
                    className="flex-1 py-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors text-sm"
                  >
                    <Play className="h-4 w-4 inline mr-1" /> Reanudar
                  </button>
                )}
                <button
                  onClick={() => abrirModal(campana)}
                  className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => eliminarCampana(campana._id)}
                  className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {campanasFiltradas.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Megaphone className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">No hay campañas</p>
            <button
              onClick={() => abrirModal()}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Crear primera campaña
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingCampana ? 'Editar Campaña' : 'Nueva Campaña'}
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

              <div>
                <label className="block text-sm text-slate-600 mb-1">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Tipo</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="mixta">Mixta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Presupuesto</label>
                  <input
                    type="number"
                    value={formData.presupuesto}
                    onChange={(e) => setFormData({ ...formData, presupuesto: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Objetivo</label>
                <input
                  type="text"
                  value={formData.objetivo}
                  onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                  placeholder="Ej: Aumentar ventas en 20%"
                  className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
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
                  {editingCampana ? 'Guardar Cambios' : 'Crear Campaña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
