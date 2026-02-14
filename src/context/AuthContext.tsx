import React, { createContext, useState, useContext, useEffect } from 'react';
import { Entrepreneur, Investor, UserRole, AuthContextType, User } from '../types';
import { users } from '../data/users';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const USER_STORAGE_KEY = 'business_nexus_user';
const RESET_TOKEN_KEY = 'business_nexus_reset_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Entrepreneur | Investor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      const parsed: Entrepreneur | Investor = JSON.parse(storedUser);
      setUser(parsed);
    }
    setIsLoading(false);
  }, []);

  // Login
  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      await new Promise(res => setTimeout(res, 1000)); // simulate API delay

      const foundUser = users.find(
        u => u.email === email && u.role === role
      ) as Entrepreneur | Investor | undefined;

      if (!foundUser) throw new Error('Invalid credentials');

      setUser(foundUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(foundUser));
      toast.success('Successfully logged in!');
    } catch (err) {
      toast.error((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register
  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<void> => {
    setIsLoading(true);
    try {
      await new Promise(res => setTimeout(res, 1000)); // simulate API delay

      if (users.some(u => u.email === email)) {
        throw new Error('Email already in use');
      }

      let newUser: Entrepreneur | Investor;

      if (role === 'entrepreneur') {
        newUser = {
          id: `e${users.length + 1}`,
          role: 'entrepreneur',
          name,
          email,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          bio: '',
          isOnline: true,
          createdAt: new Date().toISOString(),
          startupName: '',
          pitchSummary: '',
          fundingNeeded: '',
          industry: '',
          location: '',
          foundedYear: new Date().getFullYear(),
          teamSize: 1
        };
      } else {
        newUser = {
          id: `i${users.length + 1}`,
          role: 'investor',
          name,
          email,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          bio: '',
          isOnline: true,
          createdAt: new Date().toISOString(),
          investmentInterests: [],
          investmentStage: [],
          portfolioCompanies: [],
          totalInvestments: 0,
          minimumInvestment: '',
          maximumInvestment: ''
        };
      }

      users.push(newUser);
      setUser(newUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      toast.success('Account created successfully!');
    } catch (err) {
      toast.error((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password (mock)
  const forgotPassword = async (email: string) => {
    try {
      await new Promise(res => setTimeout(res, 1000));
      const u = users.find(u => u.email === email);
      if (!u) throw new Error('No account found with this email');
      const token = Math.random().toString(36).substring(2, 15);
      localStorage.setItem(RESET_TOKEN_KEY, token);
      toast.success('Password reset instructions sent to your email');
    } catch (err) {
      toast.error((err as Error).message);
      throw err;
    }
  };

  // Reset password (mock)
  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await new Promise(res => setTimeout(res, 1000));
      const storedToken = localStorage.getItem(RESET_TOKEN_KEY);
      if (token !== storedToken) throw new Error('Invalid or expired token');
      localStorage.removeItem(RESET_TOKEN_KEY);
      toast.success('Password reset successfully');
    } catch (err) {
      toast.error((err as Error).message);
      throw err;
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    toast.success('Logged out successfully');
  };

  // Update Profile
  const updateProfile = async (userId: string, updates: Partial<Entrepreneur | Investor>) => {
    try {
      await new Promise(res => setTimeout(res, 1000));
      const index = users.findIndex(u => u.id === userId);
      if (index === -1) throw new Error('User not found');
      const updatedUser = { ...users[index], ...updates } as Entrepreneur | Investor;
      users[index] = updatedUser;

      if (user?.id === userId) {
        setUser(updatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      }
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error((err as Error).message);
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
