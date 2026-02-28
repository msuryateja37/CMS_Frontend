import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  employeeNumber?: string;
  firstName?: string;
  lastName?: string;
  role: {
    id: string;
    name: string;
  };
  province?: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
    building?: {
      id: string;
      name: string;
      province?: {
        id: string;
        name: string;
      };
    };
  };
}

class AuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const { accessToken, refreshToken, user } = response.data;

    // Store tokens and user in localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return response.data;
  }

  /**
   * Logout - clear tokens and call backend
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  /**
   * Get current user from backend
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    const { accessToken, refreshToken: newRefreshToken } = response.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);

    return response.data;
  }

  /**
   * Update own profile
   */
  async updateProfile(data: { fullName?: string; phone?: string; provinceId?: string; departmentId?: string }): Promise<User> {
    const response = await api.put<User>('/auth/profile', data);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  }

  /**
   * Get provinces list for profile editing
   */
  async getProvinces(): Promise<{ id: string; name: string }[]> {
    const response = await api.get<{ id: string; name: string }[]>('/org/provinces');
    return response.data;
  }

  /**
   * Get departments list for profile editing
   */
  async getDepartments(): Promise<{ id: string; name: string }[]> {
    const response = await api.get<{ id: string; name: string }[]>('/org/departments');
    return response.data;
  }

  /**
   * Get stored user from localStorage
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export default new AuthService();
