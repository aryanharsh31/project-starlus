import * as SecureStore from 'expo-secure-store';

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await SecureStore.getItemAsync('token');
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
} 