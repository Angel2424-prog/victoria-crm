'use client';

import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function useApi() {
  const { data: session } = useSession();
  // El token viene del backend y se guarda en accessToken
  const token = (session as any)?.accessToken;
  
  console.log('useApi - API_URL:', API_URL);
  console.log('useApi - token exists:', !!token);

  const apiCall = useCallback(async <T = any>(
    endpoint: string,
    options: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: any } = {}
  ): Promise<{ success: boolean; data?: T; error?: string; pagination?: any; message?: string }> => {
    const { method = 'GET', body } = options;

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const url = `${API_URL}${endpoint}`;
      console.log('useApi - Fetching:', url);
      
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      
      const text = await response.text();
      console.log('useApi - Response status:', response.status);
      console.log('useApi - Response text (first 200 chars):', text.substring(0, 200));
      
      // Intentar parsear como JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('useApi - Error parsing JSON:', parseError);
        return { success: false, error: 'Error: La respuesta no es JSON válido. Posible problema de conexión con el backend.' };
      }
      
      if (!response.ok) return { success: false, error: data.error || 'Error en la solicitud' };
      return data;
    } catch (error: any) {
      console.error('useApi - Fetch error:', error);
      return { success: false, error: error.message || 'Error de conexión' };
    }
  }, [token]);

  const get = useCallback(<T = any>(endpoint: string) => apiCall<T>(endpoint, { method: 'GET' }), [apiCall]);
  const post = useCallback(<T = any>(endpoint: string, body: any) => apiCall<T>(endpoint, { method: 'POST', body }), [apiCall]);
  const put = useCallback(<T = any>(endpoint: string, body: any) => apiCall<T>(endpoint, { method: 'PUT', body }), [apiCall]);
  const del = useCallback(<T = any>(endpoint: string) => apiCall<T>(endpoint, { method: 'DELETE' }), [apiCall]);

  return { get, post, put, del, apiCall };
}
