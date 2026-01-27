import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        login: { label: 'Usuario', type: 'text' },
        password: { label: 'Contraseña', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) {
          throw new Error('Usuario y contraseña son requeridos');
        }

        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              login: credentials.login,
              password: credentials.password
            })
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.error || 'Credenciales inválidas');
          }

          return {
            id: data.user.id,
            login: data.user.login,
            nombre: data.user.nombre,
            apellido: data.user.apellido,
            email: data.user.email,
            rol: data.user.rol,
            sucursal: data.user.sucursal,
            token: data.token
          };
        } catch (error: any) {
          throw new Error(error.message || 'Error de autenticación');
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.login = user.login;
        token.nombre = user.nombre;
        token.apellido = user.apellido;
        token.rol = user.rol;
        token.sucursal = user.sucursal;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.login = token.login as string;
        session.user.nombre = token.nombre as string;
        session.user.apellido = token.apellido as string;
        session.user.rol = token.rol as any;
        session.user.sucursal = token.sucursal as string;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60
  },
  secret: process.env.NEXTAUTH_SECRET
};
