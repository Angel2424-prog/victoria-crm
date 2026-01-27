'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Send, 
  Users, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Loader2
} from 'lucide-react';

interface Destinatario {
  clienteId?: string;
  nombre: string;
  email?: string;
  telefono?: string;
}

interface EstadisticasNotificaciones {
  porTipo: {
    email: { enviados: number; pendientes: number; fallidos: number; entregados: number };
    sms: { enviados: number; pendientes: number; fallidos: number; entregados: number };
    whatsapp: { enviados: number; pendientes: number; fallidos: number; entregados: number };
  };
  totales: { email?: number; sms?: number; whatsapp?: number };
}

export default function NotificacionesPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'enviar' | 'historial' | 'estadisticas'>('enviar');
  const [tipoEnvio, setTipoEnvio] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [asunto, setAsunto] = useState('');
  const [destinatarios, setDestinatarios] = useState<Destinatario[]>([]);
  const [nuevoDestinatario, setNuevoDestinatario] = useState({ nombre: '', email: '', telefono: '' });
  const [resultado, setResultado] = useState<{ success: boolean; message: string } | null>(null);
  const [estadisticas, setEstadisticas] = useState<EstadisticasNotificaciones | null>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'email' | 'sms' | 'whatsapp'>('todos');

  useEffect(() => {
    if (activeTab === 'estadisticas') {
      cargarEstadisticas();
    } else if (activeTab === 'historial') {
      cargarHistorial();
    }
  }, [activeTab, filtroTipo]);

  const cargarEstadisticas = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notificaciones/estadisticas`, {
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setEstadisticas(data.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const cargarHistorial = async () => {
    try {
      const params = new URLSearchParams();
      if (filtroTipo !== 'todos') params.append('tipo', filtroTipo);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notificaciones?${params}`, {
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setHistorial(data.data);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  const agregarDestinatario = () => {
    if (tipoEnvio === 'email' && !nuevoDestinatario.email) return;
    if ((tipoEnvio === 'sms' || tipoEnvio === 'whatsapp') && !nuevoDestinatario.telefono) return;
    
    setDestinatarios([...destinatarios, { ...nuevoDestinatario }]);
    setNuevoDestinatario({ nombre: '', email: '', telefono: '' });
  };

  const eliminarDestinatario = (index: number) => {
    setDestinatarios(destinatarios.filter((_, i) => i !== index));
  };

  const enviarNotificacion = async () => {
    if (!mensaje || destinatarios.length === 0) {
      setResultado({ success: false, message: 'Completa todos los campos requeridos' });
      return;
    }

    setLoading(true);
    setResultado(null);

    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/notificaciones/enviar/${tipoEnvio}`;
      const body: any = { destinatarios, mensaje };
      
      if (tipoEnvio === 'email') {
        body.asunto = asunto;
        body.contenido = mensaje;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(session as any)?.accessToken}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      setResultado({ success: data.success, message: data.message || data.error });
      
      if (data.success) {
        setDestinatarios([]);
        setMensaje('');
        setAsunto('');
      }
    } catch (error) {
      setResultado({ success: false, message: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Phone className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      default: return null;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'enviado': return 'text-blue-400';
      case 'entregado': return 'text-green-400';
      case 'fallido': return 'text-red-400';
      case 'pendiente': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Centro de Notificaciones</h1>
          <p className="text-blue-200/60">Envía campañas por Email, SMS y WhatsApp</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('enviar')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'enviar' 
              ? 'bg-blue-600 text-white' 
              : 'text-blue-200/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Send className="h-4 w-4 inline mr-2" />
          Enviar
        </button>
        <button
          onClick={() => setActiveTab('historial')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'historial' 
              ? 'bg-blue-600 text-white' 
              : 'text-blue-200/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="h-4 w-4 inline mr-2" />
          Historial
        </button>
        <button
          onClick={() => setActiveTab('estadisticas')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'estadisticas' 
              ? 'bg-blue-600 text-white' 
              : 'text-blue-200/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart3 className="h-4 w-4 inline mr-2" />
          Estadísticas
        </button>
      </div>

      {/* Tab: Enviar */}
      {activeTab === 'enviar' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel izquierdo - Configuración */}
          <div className="space-y-6">
            {/* Tipo de envío */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Canal de envío</h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTipoEnvio('email')}
                  className={`p-4 rounded-xl border transition-all ${
                    tipoEnvio === 'email'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                      : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                  }`}
                >
                  <Mail className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm">Email</span>
                </button>
                <button
                  onClick={() => setTipoEnvio('sms')}
                  className={`p-4 rounded-xl border transition-all ${
                    tipoEnvio === 'sms'
                      ? 'bg-green-600/20 border-green-500 text-green-400'
                      : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                  }`}
                >
                  <Phone className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm">SMS</span>
                </button>
                <button
                  onClick={() => setTipoEnvio('whatsapp')}
                  className={`p-4 rounded-xl border transition-all ${
                    tipoEnvio === 'whatsapp'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                  }`}
                >
                  <MessageSquare className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm">WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Mensaje */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Mensaje</h3>
              
              {tipoEnvio === 'email' && (
                <div className="mb-4">
                  <label className="block text-sm text-blue-200/60 mb-2">Asunto</label>
                  <input
                    type="text"
                    value={asunto}
                    onChange={(e) => setAsunto(e.target.value)}
                    placeholder="Asunto del correo"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-blue-200/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-blue-200/60 mb-2">
                  Contenido {tipoEnvio !== 'email' && '(máx. 160 caracteres para SMS)'}
                </label>
                <textarea
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder={`Escribe tu mensaje aquí...\n\nUsa {{nombre}} para personalizar`}
                  rows={5}
                  maxLength={tipoEnvio === 'sms' ? 160 : undefined}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-blue-200/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                />
                {tipoEnvio === 'sms' && (
                  <p className="text-xs text-blue-200/40 mt-1">{mensaje.length}/160 caracteres</p>
                )}
              </div>
            </div>
          </div>

          {/* Panel derecho - Destinatarios */}
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">
                <Users className="h-5 w-5 inline mr-2" />
                Destinatarios ({destinatarios.length})
              </h3>

              {/* Agregar destinatario */}
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  value={nuevoDestinatario.nombre}
                  onChange={(e) => setNuevoDestinatario({ ...nuevoDestinatario, nombre: e.target.value })}
                  placeholder="Nombre"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-blue-200/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                {tipoEnvio === 'email' ? (
                  <input
                    type="email"
                    value={nuevoDestinatario.email}
                    onChange={(e) => setNuevoDestinatario({ ...nuevoDestinatario, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-blue-200/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                ) : (
                  <input
                    type="tel"
                    value={nuevoDestinatario.telefono}
                    onChange={(e) => setNuevoDestinatario({ ...nuevoDestinatario, telefono: e.target.value })}
                    placeholder="+58 412 1234567"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-blue-200/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                )}
                <button
                  onClick={agregarDestinatario}
                  className="w-full py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  + Agregar destinatario
                </button>
              </div>

              {/* Lista de destinatarios */}
              <div className="max-h-48 overflow-y-auto space-y-2">
                {destinatarios.map((dest, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5"
                  >
                    <div>
                      <p className="text-white text-sm">{dest.nombre || 'Sin nombre'}</p>
                      <p className="text-blue-200/50 text-xs">
                        {tipoEnvio === 'email' ? dest.email : dest.telefono}
                      </p>
                    </div>
                    <button
                      onClick={() => eliminarDestinatario(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {destinatarios.length === 0 && (
                  <p className="text-center text-blue-200/40 py-4">
                    No hay destinatarios agregados
                  </p>
                )}
              </div>
            </div>

            {/* Resultado */}
            {resultado && (
              <div className={`p-4 rounded-xl border ${
                resultado.success 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {resultado.success ? (
                  <CheckCircle className="h-5 w-5 inline mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 inline mr-2" />
                )}
                {resultado.message}
              </div>
            )}

            {/* Botón enviar */}
            <button
              onClick={enviarNotificacion}
              disabled={loading || destinatarios.length === 0 || !mensaje}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Enviar {tipoEnvio === 'email' ? 'Emails' : tipoEnvio === 'sms' ? 'SMS' : 'WhatsApp'}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tab: Historial */}
      {activeTab === 'historial' && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-2">
            <button
              onClick={() => setFiltroTipo('todos')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filtroTipo === 'todos' ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/60'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroTipo('email')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filtroTipo === 'email' ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/60'
              }`}
            >
              <Mail className="h-3 w-3 inline mr-1" /> Email
            </button>
            <button
              onClick={() => setFiltroTipo('sms')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filtroTipo === 'sms' ? 'bg-green-600 text-white' : 'bg-white/5 text-white/60'
              }`}
            >
              <Phone className="h-3 w-3 inline mr-1" /> SMS
            </button>
            <button
              onClick={() => setFiltroTipo('whatsapp')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filtroTipo === 'whatsapp' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-white/60'
              }`}
            >
              <MessageSquare className="h-3 w-3 inline mr-1" /> WhatsApp
            </button>
          </div>

          {/* Tabla de historial */}
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-sm font-medium text-blue-200/60">Tipo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-blue-200/60">Destinatario</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-blue-200/60">Mensaje</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-blue-200/60">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-blue-200/60">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((notif, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        notif.tipo === 'email' ? 'bg-blue-500/20 text-blue-400' :
                        notif.tipo === 'sms' ? 'bg-green-500/20 text-green-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {getTipoIcon(notif.tipo)}
                        {notif.tipo.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white text-sm">{notif.destinatarioNombre || 'N/A'}</p>
                      <p className="text-blue-200/50 text-xs">
                        {notif.destinatarioEmail || notif.destinatarioTelefono}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white/80 text-sm truncate max-w-xs">
                        {notif.asunto || notif.mensaje}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${getEstadoColor(notif.estado)}`}>
                        {notif.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-blue-200/50 text-sm">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {historial.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-blue-200/40">
                      No hay notificaciones en el historial
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Estadísticas */}
      {activeTab === 'estadisticas' && estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Email Stats */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Mail className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Email</h3>
                <p className="text-blue-200/50 text-sm">
                  Total: {estadisticas.totales.email || 0}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-200/60">Enviados</span>
                <span className="text-blue-400">{estadisticas.porTipo.email.enviados}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-200/60">Entregados</span>
                <span className="text-green-400">{estadisticas.porTipo.email.entregados}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-200/60">Fallidos</span>
                <span className="text-red-400">{estadisticas.porTipo.email.fallidos}</span>
              </div>
            </div>
          </div>

          {/* SMS Stats */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-green-500/20">
                <Phone className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">SMS</h3>
                <p className="text-blue-200/50 text-sm">
                  Total: {estadisticas.totales.sms || 0}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-200/60">Enviados</span>
                <span className="text-blue-400">{estadisticas.porTipo.sms.enviados}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-200/60">Entregados</span>
                <span className="text-green-400">{estadisticas.porTipo.sms.entregados}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-200/60">Fallidos</span>
                <span className="text-red-400">{estadisticas.porTipo.sms.fallidos}</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Stats */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <MessageSquare className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">WhatsApp</h3>
                <p className="text-blue-200/50 text-sm">
                  Total: {estadisticas.totales.whatsapp || 0}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-200/60">Enviados</span>
                <span className="text-blue-400">{estadisticas.porTipo.whatsapp.enviados}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-200/60">Entregados</span>
                <span className="text-green-400">{estadisticas.porTipo.whatsapp.entregados}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-200/60">Fallidos</span>
                <span className="text-red-400">{estadisticas.porTipo.whatsapp.fallidos}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nota de configuración */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
        <p className="text-yellow-400 text-sm">
          <strong>Nota:</strong> Para envíos reales, configura las siguientes variables en el backend:
        </p>
        <ul className="text-yellow-400/80 text-xs mt-2 space-y-1 ml-4 list-disc">
          <li><strong>Email:</strong> SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM</li>
          <li><strong>SMS/WhatsApp:</strong> TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, TWILIO_WHATSAPP_NUMBER</li>
        </ul>
      </div>
    </div>
  );
}
