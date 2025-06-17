import * as SecureStore from 'expo-secure-store';

// Use 10.0.2.2 for Android emulator to access host machine's localhost
const API_URL = 'http://10.0.2.2:8000/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = 'Network request failed';
    try {
      const data = await response.json();
      errorMessage = data.detail || data.error || errorMessage;
    } catch (e) {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

export const authFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = await SecureStore.getItemAsync('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Token ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      await SecureStore.deleteItemAsync('token');
      throw new Error('Unauthorized');
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Network request failed');
  }
};

export const login = async (username: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(response);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Login failed: ${error.message}`);
    }
    throw new Error('Login failed');
  }
};

export const register = async (username: string, email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    return handleResponse(response);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
    throw new Error('Registration failed');
  }
};

export const getProfile = async () => {
  const response = await authFetch('/profile/');
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  return response.json();
};

export const getNotes = async () => {
  const response = await authFetch('/notes/');
  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }
  return response.json();
};

export const createNote = async (note: { title: string; content: string }) => {
  const response = await authFetch('/notes/', {
    method: 'POST',
    body: JSON.stringify(note),
  });

  if (!response.ok) {
    throw new Error('Failed to create note');
  }

  return response.json();
};

export const updateNote = async (id: number, note: { title: string; content: string }) => {
  const response = await authFetch(`/notes/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(note),
  });

  if (!response.ok) {
    throw new Error('Failed to update note');
  }

  return response.json();
};

export const deleteNote = async (id: number) => {
  const response = await authFetch(`/notes/${id}/`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete note');
  }

  return response.json();
}; 