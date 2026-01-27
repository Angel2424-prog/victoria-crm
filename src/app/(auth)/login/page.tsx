'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, User, Lock, Shield } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ login: '', password: '' });

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

  return (
    <div className="min-h-screen relative">
      {/* ========== IMAGEN DE FONDO COMPLETA ========== */}
      <div className="absolute inset-0">
        <Image
          src="/images/victoria-login.png"
          alt="Victoria - CRM Seguros"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* ========== CONTENEDOR DEL FORMULARIO ========== */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-8">

        {/* Card de Login */}
        <div className="relative z-10 w-full max-w-[420px]">
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45)',
              borderRadius: '20px',
              padding: '40px',
            }}
          >
            {/* Header del card */}
            <div className="text-center mb-10">
              <h1 className="text-[2rem] lg:text-[2.5rem] font-semibold text-white mb-3 tracking-tight">
                CRM Seguros
              </h1>
              <p className="text-blue-200/70 text-sm tracking-wide">
                Ingresa tus credenciales
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-red-500/15 border border-red-500/25 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* Campo Usuario */}
              <div className="space-y-2">
                <label htmlFor="login" className="block text-[13px] font-medium text-blue-100/90 mb-1">
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-blue-300/40" />
                  </div>
                  <input
                    id="login"
                    type="text"
                    value={formData.login}
                    onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                    placeholder="Ingresa tu usuario"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-blue-200/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400/40 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-[13px] font-medium text-blue-100/90 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-blue-300/40" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-blue-200/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400/40 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Link recuperar contraseña */}
              <div className="text-right">
                <button 
                  type="button" 
                  className="text-sm text-blue-300/60 hover:text-blue-200 transition-colors duration-200"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Botón de login */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-[#2b7cff] hover:to-[#1f5edc] text-white font-semibold shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  'Ingresar'
                )}
              </button>
            </form>

            {/* Footer del card */}
            <div className="mt-10 pt-6 border-t border-white/8 text-center">
              <p className="text-blue-200/35 text-xs tracking-wide">
                © 2024 CRM Seguros. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
