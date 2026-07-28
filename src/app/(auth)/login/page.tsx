'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, User, Lock, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ login: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        login: formData.login,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  /* ── campos reutilizables ── */
  const LoginField = ({ mobile }: { mobile: boolean }) => (
    <>
      {error && (
        <div className="rounded-lg bg-red-500/15 border border-red-500/25 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Usuario */}
      <div className="space-y-1">
        <label
          htmlFor={mobile ? 'login-m' : 'login'}
          className="block text-[13px] font-medium text-blue-100/90"
        >
          Usuario
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-blue-300/40" />
          </span>
          <input
            id={mobile ? 'login-m' : 'login'}
            type="text"
            value={formData.login}
            onChange={(e) => setFormData({ ...formData, login: e.target.value })}
            placeholder="Ingresa tu usuario"
            required
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-blue-200/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all duration-200"
          />
        </div>
      </div>

      {/* Contraseña */}
      <div className="space-y-1">
        <label
          htmlFor={mobile ? 'password-m' : 'password'}
          className="block text-[13px] font-medium text-blue-100/90"
        >
          Contraseña
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-blue-300/40" />
          </span>
          <input
            id={mobile ? 'password-m' : 'password'}
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            required
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-blue-200/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all duration-200"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-300/40 hover:text-blue-200 transition-colors duration-200"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="text-right">
        <button type="button" className="text-sm text-blue-300/60 hover:text-blue-200 transition-colors duration-200">
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-[#2b7cff] hover:to-[#1f5edc] text-white font-semibold shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (<><Loader2 className="h-5 w-5 animate-spin" />Ingresando...</>) : 'Ingresar'}
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-[#050d1a]">

      {/* ══════════════════════════════════════════
          LAYOUT MÓVIL / TABLET  (< lg)
          Imagen de Victoria arriba + form abajo
      ══════════════════════════════════════════ */}
      <div className="lg:hidden flex flex-col min-h-screen">

        {/* Imagen de Victoria — banner superior */}
        <div className="relative w-full" style={{ height: '45vh' }}>
          <Image
            src="/images/victoria-login.png"
            alt="Victoria - CRM Seguros"
            fill
            className="object-cover object-left-top"
            priority
          />
          {/* Gradiente suave hacia abajo */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#050d1a]" />
          {/* Título sobre la imagen */}
          <div className="absolute bottom-5 left-0 right-0 text-center px-4">
            <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">
              CRM Seguros
            </h1>
            <p className="text-blue-200/80 text-sm mt-1">Tu asistente inteligente de seguros</p>
          </div>
        </div>

        {/* Formulario en la parte inferior */}
        <div className="flex-1 px-6 pt-4 pb-10">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
            <LoginField mobile={true} />
          </form>
          <p className="text-blue-200/30 text-xs text-center mt-8">
            © 2024 CRM Seguros. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          LAYOUT DESKTOP  (lg+)
          Imagen de fondo completa + form a la derecha
      ══════════════════════════════════════════ */}
      <div className="hidden lg:block min-h-screen relative overflow-hidden">

        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <Image
            src="/images/victoria-login.png"
            alt="Victoria - CRM Seguros"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Formulario alineado a la derecha */}
        <div className="relative z-10 min-h-screen flex items-center justify-end pr-24 xl:pr-32">
          <div className="w-full max-w-[420px]">
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45)',
                borderRadius: '20px',
                padding: '40px',
              }}
            >
              <div className="text-center mb-10">
                <h1 className="text-[2.5rem] font-semibold text-white mb-3 tracking-tight">
                  CRM Seguros
                </h1>
                <p className="text-blue-200/70 text-sm tracking-wide">Ingresa tus credenciales</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <LoginField mobile={false} />
              </form>

              <div className="mt-10 pt-6 border-t border-white/8 text-center">
                <p className="text-blue-200/35 text-xs tracking-wide">
                  © 2024 CRM Seguros. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
