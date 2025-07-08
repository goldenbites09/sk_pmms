import { supabase } from './supabase'

export interface AuthState {
  userId: string | null;
  userRole: string | null;
  email: string | null;
  isLoggedIn: boolean;
}

export class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    userId: null,
    userRole: null,
    email: null,
    isLoggedIn: false
  };

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async initialize() {
    try {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (error) {
        console.error('Auth initialization error:', error);
        return;
      }

      if (user) {
        this.authState = {
          userId: user.id,
          userRole: localStorage.getItem('userRole'),
          email: user.email,
          isLoggedIn: true
        };
        
        // Sync with localStorage
        localStorage.setItem('userId', user.id);
        localStorage.setItem('isLoggedIn', 'true');
      } else {
        this.authState = {
          userId: null,
          userRole: null,
          email: null,
          isLoggedIn: false
        };
        
        // Clear localStorage
        localStorage.removeItem('userId');
        localStorage.removeItem('isLoggedIn');
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.authState.isLoggedIn = false;
    }
  }

  public getUserId(): string | null {
    return this.authState.userId;
  }

  public isLoggedIn(): boolean {
    return this.authState.isLoggedIn;
  }

  public getUserRole(): string | null {
    return this.authState.userRole;
  }

  public getEmail(): string | null {
    return this.authState.email;
  }

  public async refreshSession() {
    try {
      const {
        data: { session },
        error
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Session refresh error:', error);
        this.authState.isLoggedIn = false;
        return;
      }

      if (session?.user) {
        this.authState.userId = session.user.id;
        this.authState.email = session.user.email;
        this.authState.isLoggedIn = true;
      } else {
        this.authState.isLoggedIn = false;
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      this.authState.isLoggedIn = false;
    }
  }

  public async signOut() {
    try {
      await supabase.auth.signOut();
      this.authState = {
        userId: null,
        userRole: null,
        email: null,
        isLoggedIn: false
      };
      
      // Clear localStorage
      localStorage.removeItem('userId');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }
}

// Export a singleton instance
export const authService = AuthService.getInstance();
