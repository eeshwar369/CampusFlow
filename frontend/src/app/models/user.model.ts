export interface User {
  id: number;
  email: string;
  role: 'student' | 'admin' | 'seating_manager' | 'club_coordinator';
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
