export type UserRole = 'student' | 'faculty' | 'admin' | 'seating_manager' | 'club_coordinator';

export interface User {
  id: number;
  email: string;
  role: UserRole | string; // Allow string for dynamic role switching
  roles?: string[]; // Array of all roles user has access to
  activeRole?: string; // Currently active role
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn: string;
}
