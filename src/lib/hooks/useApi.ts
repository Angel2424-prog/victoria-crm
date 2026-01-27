'use client';

import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function useApi() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const apiCall = useCallback(async <T = any>(
    endpoint: string,
    options: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: any } = {}
  ): Promise<{ success: boolean; data?: T; error?: string; pagination?: any; message?: string }> => {
    const { method = 'GET', body } = options;

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error || 'Error en la solicitud' };
      return data;
    } catch (error: any) {
      return { success: false, error: error.message || 'Error de conexión' };
    }
  }, [token]);

  const get = useCallback(<T = any>(endpoint: string) => apiCall<T>(endpoint, { method: 'GET' }), [apiCall]);
  const post = useCallback(<T = any>(endpoint: string, body: any) => apiCall<T>(endpoint, { method: 'POST', body }), [apiCall]);
  const put = useCallback(<T = any>(endpoint: string, body: any) => apiCall<T>(endpoint, { method: 'PUT', body }), [apiCall]);
  const del = useCallback(<T = any>(endpoint: string) => apiCall<T>(endpoint, { method: 'DELETE' }), [apiCall]);

  return { get, post, put, del, apiCall };
}
