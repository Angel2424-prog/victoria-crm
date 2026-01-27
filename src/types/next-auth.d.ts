import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      login: string;
      nombre: string;
      apellido?: string;
      email: string;
      rol: any;
      sucursal?: string;
    } & DefaultSession['user'];
    accessToken?: string;
  }

  interface User extends DefaultUser {
    id: string;
    login: string;
    nombre: string;
    apellido?: string;
    email: string;
    rol: any;
    sucursal?: string;
    token?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    login: string;
    nombre: string;
    apellido?: string;
    rol: any;
    sucursal?: string;
    accessToken?: string;
  }
}
