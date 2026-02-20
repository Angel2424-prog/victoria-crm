import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

interface Permiso {
  modulo: string;
  puede_ver: boolean;
  puede_crear: boolean;
  puede_editar: boolean;
  puede_eliminar: boolean;
}

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
      es_admin?: boolean;
      permisos?: Permiso[];
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
    es_admin?: boolean;
    permisos?: Permiso[];
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
    es_admin?: boolean;
    permisos?: Permiso[];
    accessToken?: string;
  }
}
