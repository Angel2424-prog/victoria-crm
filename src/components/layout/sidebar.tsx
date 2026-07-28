'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, UserPlus, Target, Calendar, Megaphone, LogOut, Sparkles, Bell, Shield, X } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const menuItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Victoria IA', href: '/victoria', icon: Sparkles, highlight: true },
  { title: 'Leads', href: '/crm/leads', icon: UserPlus },
  { title: 'Clientes', href: '/crm/clientes', icon: Users },
  { title: 'Oportunidades', href: '/crm/oportunidades', icon: Target },
  { title: 'Actividades', href: '/crm/actividades', icon: Calendar },
  { title: 'Campañas', href: '/marketing/campanas', icon: Megaphone },
  { title: 'Notificaciones', href: '/notificaciones', icon: Bell },
  { title: 'Usuarios', href: '/admin/usuarios', icon: Shield, adminOnly: true },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.es_admin;

  const getInitials = (nombre?: string, apellido?: string) => {
    return ((nombre?.charAt(0) || '') + (apellido?.charAt(0) || '')).toUpperCase() || 'U';
  };

  const filteredMenuItems = menuItems.filter(item => !(item as any).adminOnly || isAdmin);

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
        <h1 className="text-xl font-bold">CRM Seguros</h1>
        {/* Botón cerrar solo en móvil */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => (
            <li key={item.title}>
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : item.highlight
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                    : 'text-slate-300 hover:bg-slate-800'
                )}
              >
                <item.icon className={cn('h-5 w-5', item.highlight && 'animate-pulse')} />
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white text-xs">
              {getInitials(session?.user?.nombre, session?.user?.apellido)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{session?.user?.nombre} {session?.user?.apellido}</p>
            <p className="text-xs text-slate-400 truncate">{session?.user?.rol?.nombre}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-slate-800"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
