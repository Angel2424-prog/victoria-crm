'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, Search, Edit, Trash2, Key, Shield, UserCheck, UserX, 
  Users, CheckCircle2, XCircle, Eye, PenLine, Trash, Save
} from 'lucide-react';
import { useApi } from '@/lib/hooks/useApi';
import { toast } from 'sonner';

interface Permiso {
  modulo: string;
  puede_ver: boolean;
  puede_crear: boolean;
  puede_editar: boolean;
  puede_eliminar: boolean;
}

interface Usuario {
  _id: string;
  login: string;
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
  es_admin: boolean;
  activo: boolean;
  bloqueado: boolean;
  permisos: Permiso[];
  rol?: { _id: string; nombre: string };
  sucursal?: { _id: string; nombre: string };
  fecha_creacion: string;
  ultimo_acceso?: string;
}

interface Modulo {
  id: string;
  nombre: string;
  acciones: string[];
}

const MODULOS_DEFAULT: Modulo[] = [
  { id: 'dashboard', nombre: 'Dashboard', acciones: ['ver', 'crear', 'editar', 'eliminar'] },
  { id: 'leads', nombre: 'Leads', acciones: ['ver', 'crear', 'editar', 'eliminar'] },
  { id: 'clientes', nombre: 'Clientes', acciones: ['ver', 'crear', 'editar', 'eliminar'] },
  { id: 'oportunidades', nombre: 'Oportunidades', acciones: ['ver', 'crear', 'editar', 'eliminar'] },
  { id: 'actividades', nombre: 'Actividades', acciones: ['ver', 'crear', 'editar', 'eliminar'] },
  { id: 'campanas', nombre: 'Campañas', acciones: ['ver', 'crear', 'editar', 'eliminar'] },
  { id: 'reportes', nombre: 'Reportes', acciones: ['ver', 'crear', 'editar', 'eliminar'] },
  { id: 'configuracion', nombre: 'Configuración', acciones: ['ver', 'crear', 'editar', 'eliminar'] },
  { id: 'usuarios', nombre: 'Usuarios', acciones: ['ver', 'crear', 'editar', 'eliminar'] },
];

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInactivos, setShowInactivos] = useState(false);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'crear' | 'editar' | 'permisos' | 'password'>('crear');
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    es_admin: false,
  });
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [newPassword, setNewPassword] = useState('');
  
  const { get, post, put, del } = useApi();

  useEffect(() => { fetchUsuarios(); }, [search, showInactivos]);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (!showInactivos) params.append('activo', 'true');
      
      const json = await get(`/usuarios?${params}`);
      if (json.success) {
        setUsuarios(json.data);
      } else {
        toast.error(json.error || 'Error al cargar usuarios');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setDialogMode('crear');
    setFormData({ login: '', password: '', nombre: '', apellido: '', email: '', telefono: '', es_admin: false });
    setPermisos(MODULOS_DEFAULT.map(m => ({ modulo: m.id, puede_ver: false, puede_crear: false, puede_editar: false, puede_eliminar: false })));
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const openEditDialog = (usuario: Usuario) => {
    setDialogMode('editar');
    setFormData({
      login: usuario.login,
      password: '',
      nombre: usuario.nombre,
      apellido: usuario.apellido || '',
      email: usuario.email,
      telefono: usuario.telefono || '',
      es_admin: usuario.es_admin,
    });
    setSelectedUser(usuario);
    setDialogOpen(true);
  };

  const openPermisosDialog = (usuario: Usuario) => {
    setDialogMode('permisos');
    setSelectedUser(usuario);
    // Inicializar permisos con los del usuario o crear vacíos
    const permisosUsuario = MODULOS_DEFAULT.map(m => {
      const existente = usuario.permisos?.find(p => p.modulo === m.id);
      return existente || { modulo: m.id, puede_ver: false, puede_crear: false, puede_editar: false, puede_eliminar: false };
    });
    setPermisos(permisosUsuario);
    setDialogOpen(true);
  };

  const openPasswordDialog = (usuario: Usuario) => {
    setDialogMode('password');
    setSelectedUser(usuario);
    setNewPassword('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (dialogMode === 'crear') {
        if (!formData.login || !formData.password || !formData.nombre || !formData.email) {
          toast.error('Complete todos los campos requeridos');
          setSaving(false);
          return;
        }
        const res = await post('/usuarios', { ...formData, permisos });
        if (res.success) {
          toast.success('Usuario creado correctamente');
          setDialogOpen(false);
          fetchUsuarios();
        } else {
          toast.error(res.error || 'Error al crear usuario');
        }
      } else if (dialogMode === 'editar' && selectedUser) {
        const { login, password, ...updateData } = formData;
        const res = await put(`/usuarios/${selectedUser._id}`, updateData);
        if (res.success) {
          toast.success('Usuario actualizado correctamente');
          setDialogOpen(false);
          fetchUsuarios();
        } else {
          toast.error(res.error || 'Error al actualizar usuario');
        }
      } else if (dialogMode === 'permisos' && selectedUser) {
        const res = await put(`/usuarios/${selectedUser._id}/permisos`, { permisos });
        if (res.success) {
          toast.success('Permisos actualizados correctamente');
          setDialogOpen(false);
          fetchUsuarios();
        } else {
          toast.error(res.error || 'Error al actualizar permisos');
        }
      } else if (dialogMode === 'password' && selectedUser) {
        if (!newPassword || newPassword.length < 6) {
          toast.error('La contraseña debe tener al menos 6 caracteres');
          setSaving(false);
          return;
        }
        const res = await put(`/usuarios/${selectedUser._id}/password`, { password: newPassword });
        if (res.success) {
          toast.success('Contraseña actualizada correctamente');
          setDialogOpen(false);
        } else {
          toast.error(res.error || 'Error al cambiar contraseña');
        }
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActivo = async (usuario: Usuario) => {
    try {
      const res = await put(`/usuarios/${usuario._id}/toggle`, {});
      if (res.success) {
        toast.success(res.message);
        fetchUsuarios();
      } else {
        toast.error(res.error || 'Error al cambiar estado');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleDelete = async (usuario: Usuario) => {
    if (!confirm(`¿Está seguro de desactivar al usuario ${usuario.nombre}?`)) return;
    try {
      const res = await del(`/usuarios/${usuario._id}`);
      if (res.success) {
        toast.success('Usuario desactivado');
        fetchUsuarios();
      } else {
        toast.error(res.error || 'Error al desactivar usuario');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const togglePermiso = (modulo: string, accion: 'puede_ver' | 'puede_crear' | 'puede_editar' | 'puede_eliminar') => {
    setPermisos(prev => prev.map(p => 
      p.modulo === modulo ? { ...p, [accion]: !p[accion] } : p
    ));
  };

  const toggleTodosPermisos = (modulo: string, valor: boolean) => {
    setPermisos(prev => prev.map(p => 
      p.modulo === modulo ? { ...p, puede_ver: valor, puede_crear: valor, puede_editar: valor, puede_eliminar: valor } : p
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Gestión de Usuarios
          </h1>
          <p className="text-muted-foreground">Administra usuarios y sus permisos de acceso</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre, email o login..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="pl-9" 
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={showInactivos} onCheckedChange={setShowInactivos} />
              <Label>Mostrar inactivos</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{usuarios.length} usuarios encontrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario._id} className={!usuario.activo ? 'opacity-50' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {usuario.nombre} {usuario.apellido}
                            {usuario.es_admin && (
                              <Badge className="bg-purple-100 text-purple-700">Admin</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">@{usuario.login}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      {usuario.rol?.nombre || <span className="text-muted-foreground">Sin rol</span>}
                    </TableCell>
                    <TableCell>
                      {usuario.bloqueado ? (
                        <Badge variant="destructive">Bloqueado</Badge>
                      ) : usuario.activo ? (
                        <Badge className="bg-green-100 text-green-700">Activo</Badge>
                      ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {usuario.ultimo_acceso 
                        ? new Date(usuario.ultimo_acceso).toLocaleDateString('es-VE')
                        : <span className="text-muted-foreground">Nunca</span>
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(usuario)} title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openPermisosDialog(usuario)} title="Permisos">
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openPasswordDialog(usuario)} title="Cambiar contraseña">
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleToggleActivo(usuario)}
                          title={usuario.activo ? 'Desactivar' : 'Activar'}
                        >
                          {usuario.activo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {usuarios.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog para crear/editar usuario - Diseño Premium SaaS 2026 */}
      <Dialog open={dialogOpen && (dialogMode === 'crear' || dialogMode === 'editar')} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0 bg-white rounded-2xl border-0 shadow-2xl shadow-slate-200/50 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header del Modal */}
          <div className="px-8 pt-8 pb-6 border-b border-slate-100">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl font-semibold text-slate-900 tracking-tight">
                {dialogMode === 'crear' ? 'Nuevo Usuario' : 'Editar Usuario'}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 font-normal">
                {dialogMode === 'crear' ? 'Complete los datos del nuevo usuario' : 'Modifique los datos del usuario'}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Contenido del Formulario */}
          <div className="px-8 py-6 space-y-5 flex-1 overflow-y-auto">
            {/* Login y Contraseña - Solo en modo crear */}
            {dialogMode === 'crear' && (
              <div className="space-y-5 pb-5 border-b border-slate-100">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Login <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    value={formData.login} 
                    onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                    placeholder="usuario123"
                    className="h-11 bg-slate-50 border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Contraseña <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    type="password"
                    value={formData.password} 
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    className="h-11 bg-slate-50 border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Nombre y Apellido - Grid de 2 columnas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input 
                  value={formData.nombre} 
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Juan"
                  className="h-11 bg-slate-50 border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Apellido</Label>
                <Input 
                  value={formData.apellido} 
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  placeholder="Pérez"
                  className="h-11 bg-slate-50 border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input 
                type="email"
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@empresa.com"
                className="h-11 bg-slate-50 border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Teléfono</Label>
              <Input 
                value={formData.telefono} 
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="+58 412 123 4567"
                className="h-11 bg-slate-50 border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>

            {/* Switch Administrador - Diseño Premium */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl">
                <Switch 
                  checked={formData.es_admin} 
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, es_admin: checked })}
                  className="mt-0.5 data-[state=checked]:bg-blue-600"
                />
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-slate-900 cursor-pointer">
                    Es Administrador
                  </Label>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Otorga acceso completo al sistema, incluyendo gestión de usuarios y configuración.
                  </p>
                </div>
              </div>
            </div>

            {/* Sección de Permisos - Solo si NO es admin */}
            {!formData.es_admin && (
              <div className="pt-5 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <Label className="text-sm font-semibold text-slate-900">Permisos de Acceso</Label>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Configure qué módulos y acciones puede realizar este usuario.
                </p>
                <div className="bg-slate-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-3">
                    {MODULOS_DEFAULT.map((modulo) => {
                      const permiso = permisos.find(p => p.modulo === modulo.id);
                      const todosActivos = permiso && permiso.puede_ver && permiso.puede_crear && permiso.puede_editar && permiso.puede_eliminar;
                      
                      return (
                        <div key={modulo.id} className="bg-white rounded-lg p-3 border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-900">{modulo.nombre}</span>
                            <Button 
                              type="button"
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleTodosPermisos(modulo.id, !todosActivos)}
                              className="h-7 text-xs"
                            >
                              {todosActivos ? 'Quitar todos' : 'Dar todos'}
                            </Button>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div className="flex items-center gap-2">
                              <Switch 
                                checked={permiso?.puede_ver || false}
                                onCheckedChange={() => togglePermiso(modulo.id, 'puede_ver')}
                                className="scale-75"
                              />
                              <span className="text-xs text-slate-600">Ver</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch 
                                checked={permiso?.puede_crear || false}
                                onCheckedChange={() => togglePermiso(modulo.id, 'puede_crear')}
                                className="scale-75"
                              />
                              <span className="text-xs text-slate-600">Crear</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch 
                                checked={permiso?.puede_editar || false}
                                onCheckedChange={() => togglePermiso(modulo.id, 'puede_editar')}
                                className="scale-75"
                              />
                              <span className="text-xs text-slate-600">Editar</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch 
                                checked={permiso?.puede_eliminar || false}
                                onCheckedChange={() => togglePermiso(modulo.id, 'puede_eliminar')}
                                className="scale-75"
                              />
                              <span className="text-xs text-slate-600">Eliminar</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Footer con Botones Premium */}
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setDialogOpen(false)}
              className="h-11 px-6 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-medium transition-all duration-200"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-200 disabled:opacity-50 disabled:shadow-none"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Guardar Usuario
                </span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para cambiar contraseña - Diseño Premium */}
      <Dialog open={dialogOpen && dialogMode === 'password'} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md p-0 gap-0 bg-white rounded-2xl border-0 shadow-2xl shadow-slate-200/50">
          <div className="px-8 pt-8 pb-6 border-b border-slate-100">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" />
                Cambiar Contraseña
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 font-normal">
                Nueva contraseña para <span className="font-medium text-slate-700">{selectedUser?.nombre}</span>
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="px-8 py-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Nueva Contraseña <span className="text-red-500">*</span>
              </Label>
              <Input 
                type="password"
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="h-11 bg-slate-50 border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
              <p className="text-xs text-slate-500 mt-2">La contraseña debe tener al menos 6 caracteres.</p>
            </div>
          </div>
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setDialogOpen(false)}
              className="h-11 px-6 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-medium transition-all duration-200"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-200"
            >
              {saving ? 'Guardando...' : 'Cambiar Contraseña'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para permisos - Diseño Premium */}
      <Dialog open={dialogOpen && dialogMode === 'permisos'} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0 bg-white rounded-2xl border-0 shadow-2xl shadow-slate-200/50 max-h-[85vh] overflow-hidden flex flex-col">
          <div className="px-8 pt-8 pb-6 border-b border-slate-100">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Permisos de {selectedUser?.nombre}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 font-normal">
                Configure los permisos de acceso a cada módulo del sistema
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {selectedUser?.es_admin ? (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <p className="font-semibold text-slate-900">Este usuario es Administrador</p>
                <p className="text-sm text-slate-500 mt-1">Tiene acceso completo a todos los módulos del sistema</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Módulo</TableHead>
                    <TableHead className="text-center w-20">
                      <Eye className="h-4 w-4 mx-auto" />
                      <span className="text-xs">Ver</span>
                    </TableHead>
                    <TableHead className="text-center w-20">
                      <Plus className="h-4 w-4 mx-auto" />
                      <span className="text-xs">Crear</span>
                    </TableHead>
                    <TableHead className="text-center w-20">
                      <PenLine className="h-4 w-4 mx-auto" />
                      <span className="text-xs">Editar</span>
                    </TableHead>
                    <TableHead className="text-center w-20">
                      <Trash className="h-4 w-4 mx-auto" />
                      <span className="text-xs">Eliminar</span>
                    </TableHead>
                    <TableHead className="text-center w-20">Todos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MODULOS_DEFAULT.map((modulo) => {
                    const permiso = permisos.find(p => p.modulo === modulo.id);
                    const todosActivos = permiso && permiso.puede_ver && permiso.puede_crear && permiso.puede_editar && permiso.puede_eliminar;
                    
                    return (
                      <TableRow key={modulo.id}>
                        <TableCell className="font-medium">{modulo.nombre}</TableCell>
                        <TableCell className="text-center">
                          <Switch 
                            checked={permiso?.puede_ver || false}
                            onCheckedChange={() => togglePermiso(modulo.id, 'puede_ver')}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch 
                            checked={permiso?.puede_crear || false}
                            onCheckedChange={() => togglePermiso(modulo.id, 'puede_crear')}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch 
                            checked={permiso?.puede_editar || false}
                            onCheckedChange={() => togglePermiso(modulo.id, 'puede_editar')}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch 
                            checked={permiso?.puede_eliminar || false}
                            onCheckedChange={() => togglePermiso(modulo.id, 'puede_eliminar')}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleTodosPermisos(modulo.id, !todosActivos)}
                          >
                            {todosActivos ? (
                              <XCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            )}
          </div>
          
          {/* Footer con Botones Premium */}
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setDialogOpen(false)}
              className="h-11 px-6 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-medium transition-all duration-200"
            >
              Cancelar
            </Button>
            {!selectedUser?.es_admin && (
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-200"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Guardando...' : 'Guardar Permisos'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
