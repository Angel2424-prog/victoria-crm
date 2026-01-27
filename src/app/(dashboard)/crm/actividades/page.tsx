'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Phone,
  Mail,
  Users,
  Clock,
  CheckCircle,
  Edit,
  Trash2,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface Actividad {
  _id: string;
  tipo: 'llamada' | 'email' | 'reunion' | 'tarea';
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  duracion: number;
  estado: 'pendiente' | 'completada' | 'cancelada';
  cliente?: { _id: string; nombre: string };
  lead?: { _id: string; nombre: string };
  createdAt: string;
}

const TIPOS = [
  { id: 'llamada', nombre: 'Llamada', icon: Phone, color: 'bg-blue-100 text-blue-600' },
  { id: 'email', nombre: 'Email', icon: Mail, color: 'bg-green-100 text-green-600' },
  { id: 'reunion', nombre: 'Reunión', icon: Users, color: 'bg-purple-100 text-purple-600' },
  { id: 'tarea', nombre: 'Tarea', icon: CheckCircle, color: 'bg-orange-100 text-orange-600' },
];

export default function ActividadesPage() {
  const { data: session } = useSession();
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingActividad, setEditingActividad] = useState<Actividad | null>(null);
  const [formData, setFormData] = useState({
    tipo: 'llamada',
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '',
    duracion: 30,
    estado: 'pendiente'
  });

  useEffect(() => {
    cargarActividades();
  }, []);

  const cargarActividades = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/actividades`, {
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setActividades(data.data);
      }
    } catch (error) {
      console.error('Error cargando actividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingActividad 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/actividades/${editingActividad._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/actividades`;
      
      const res = await fetch(url, {
        method: editingActividad ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(session as any)?.accessToken}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        cargarActividades();
        cerrarModal();
      }
    } catch (error) {
      console.error('Error guardando actividad:', error);
    }
  };

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/actividades/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(session as any)?.accessToken}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (res.ok) {
        cargarActividades();
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
    }
  };

  const eliminarActividad = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta actividad?')) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/actividades/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` }
      });

      if (res.ok) {
        cargarActividades();
      }
    } catch (error) {
      console.error('Error eliminando actividad:', error);
    }
  };

  const abrirModal = (actividad?: Actividad) => {
    if (actividad) {
      setEditingActividad(actividad);
      setFormData({
        tipo: actividad.tipo,
        titulo: actividad.titulo,
        descripcion: actividad.descripcion || '',
        fecha: actividad.fecha?.split('T')[0] || '',
        hora: actividad.hora || '',
        duracion: actividad.duracion || 30,
        estado: actividad.estado
      });
    } else {
      setEditingActividad(null);
      setFormData({
        tipo: 'llamada',
        titulo: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '',
        duracion: 30,
        estado: 'pendiente'
      });
    }
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingActividad(null);
  };

  const getTipoInfo = (tipoId: string) => {
    return TIPOS.find(t => t.id === tipoId) || TIPOS[0];
  };

  const actividadesFiltradas = actividades.filter(a => {
    const matchSearch = a.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filtroTipo === 'todos' || a.tipo === filtroTipo;
    const matchEstado = filtroEstado === 'todos' || a.estado === filtroEstado;
    return matchSearch && matchTipo && matchEstado;
  });

  const stats = {
    total: actividades.length,
    pendientes: actividades.filter(a => a.estado === 'pendiente').length,
    completadas: actividades.filter(a => a.estado === 'completada').length,
    hoy: actividades.filter(a => {
      const hoy = new Date().toISOString().split('T')[0];
      return a.fecha?.split('T')[0] === hoy;
    }).length
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
          <h1 className="text-2xl font-bold text-slate-800">Actividades</h1>
          <p className="text-slate-500">Gestiona tus tareas, llamadas y reuniones</p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nueva Actividad
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              <p className="text-sm text-slate-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.pendientes}</p>
              <p className="text-sm text-slate-500">Pendientes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.completadas}</p>
              <p className="text-sm text-slate-500">Completadas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <AlertCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.hoy}</p>
              <p className="text-sm text-slate-500">Para Hoy</p>
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
            placeholder="Buscar actividades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="todos">Todos los tipos</option>
            {TIPOS.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
            ))}
          </select>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      {/* Lista de Actividades */}
      <div className="space-y-3">
        {actividadesFiltradas.map((actividad) => {
          const tipo = getTipoInfo(actividad.tipo);
          const TipoIcon = tipo.icon;
          return (
            <div
              key={actividad._id}
              className={`bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-all ${
                actividad.estado === 'completada' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${tipo.color}`}>
                  <TipoIcon className="h-5 w-5" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold text-slate-800 ${
                      actividad.estado === 'completada' ? 'line-through' : ''
                    }`}>
                      {actividad.titulo}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      actividad.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-600' :
                      actividad.estado === 'completada' ? 'bg-green-100 text-green-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {actividad.estado}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                    {actividad.fecha && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(actividad.fecha).toLocaleDateString()}
                      </span>
                    )}
                    {actividad.hora && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {actividad.hora}
                      </span>
                    )}
                    {actividad.duracion && (
                      <span>{actividad.duracion} min</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {actividad.estado === 'pendiente' && (
                    <button
                      onClick={() => cambiarEstado(actividad._id, 'completada')}
                      className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                      title="Marcar como completada"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => abrirModal(actividad)}
                    className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => eliminarActividad(actividad._id)}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {actividadesFiltradas.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">No hay actividades</p>
            <button
              onClick={() => abrirModal()}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Crear primera actividad
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
                {editingActividad ? 'Editar Actividad' : 'Nueva Actividad'}
              </h2>
              <button onClick={cerrarModal} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Tipo</label>
                <div className="grid grid-cols-4 gap-2">
                  {TIPOS.map((tipo) => {
                    const TipoIcon = tipo.icon;
                    return (
                      <button
                        key={tipo.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, tipo: tipo.id })}
                        className={`p-3 rounded-lg border transition-all ${
                          formData.tipo === tipo.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <TipoIcon className={`h-5 w-5 mx-auto mb-1 ${
                          formData.tipo === tipo.id ? 'text-blue-600' : 'text-slate-400'
                        }`} />
                        <span className={`text-xs ${
                          formData.tipo === tipo.id ? 'text-blue-600' : 'text-slate-500'
                        }`}>
                          {tipo.nombre}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Título *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Hora</label>
                  <input
                    type="time"
                    value={formData.hora}
                    onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Duración (minutos)</label>
                <input
                  type="number"
                  value={formData.duracion}
                  onChange={(e) => setFormData({ ...formData, duracion: parseInt(e.target.value) })}
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
                  {editingActividad ? 'Guardar Cambios' : 'Crear Actividad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
