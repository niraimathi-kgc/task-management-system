import { jwtDecode } from 'jwt-decode';

interface AuthTokens {
  access: string;
  refresh: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

class AuthService {
  private static instance: AuthService;
  private tokens: AuthTokens | null = null;
  private user: User | null = null;

  private constructor() {
    // Initialize without localStorage
    if (typeof window !== 'undefined') {
      // Only access localStorage on the client side
      const storedTokens = window.localStorage.getItem('auth_tokens');
      if (storedTokens) {
        try {
          const parsedTokens = JSON.parse(storedTokens);
          if (this.isValidTokens(parsedTokens)) {
            this.tokens = parsedTokens;
            this.user = this.parseUserFromToken(this.tokens.access);
          } else {
            // Invalid tokens in storage, remove them
            window.localStorage.removeItem('auth_tokens');
          }
        } catch (error) {
          // Invalid JSON in storage, remove it
          window.localStorage.removeItem('auth_tokens');
        }
      }
    }
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const tokens: AuthTokens = await response.json();
      this.setTokens(tokens);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  logout(): void {
    this.tokens = null;
    this.user = null;
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('auth_tokens');
    }
  }

  async refreshToken(): Promise<boolean> {
    if (!this.tokens?.refresh) {
      return false;
    }

    try {
      const response = await fetch('http://localhost:8000/api/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: this.tokens.refresh }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const { access }: { access: string } = await response.json();
      this.tokens = { ...this.tokens, access };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('auth_tokens', JSON.stringify(this.tokens));
      }
      this.user = this.parseUserFromToken(access);
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      return false;
    }
  }

  getAccessToken(): string | null {
    return this.tokens?.access || null;
  }

  isAuthenticated(): boolean {
    return !!this.tokens?.access;
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  private setTokens(tokens: AuthTokens): void {
    this.tokens = tokens;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('auth_tokens', JSON.stringify(tokens));
    }
    this.user = this.parseUserFromToken(tokens.access);
  }

  private parseUserFromToken(token: string): User | null {
    try {
      const decoded = jwtDecode<{ user_id: number }>(token);
      // In a real application, you might want to fetch the full user profile here
      return {
        id: decoded.user_id,
        username: '', // These would be populated from the API
        email: '',
        role: '',
      };
    } catch (error) {
      console.error('Token parsing error:', error);
      return null;
    }
  }

  private isValidTokens(tokens: any): tokens is AuthTokens {
    return (
      tokens &&
      typeof tokens === 'object' &&
      typeof tokens.access === 'string' &&
      typeof tokens.refresh === 'string'
    );
  }
}

export const authService = AuthService.getInstance(); 