export interface User {
  _id: string;
  email: string;
  role: 'admin' | 'vendor' | 'user';
  vendorVerified?: boolean;
  name?: string;
}

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const getUser = (): User | null => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const isLoggedIn = (): boolean => {
  const token = getToken();
  return !!token;
};

export const getUserRole = (): string => {
  const user = getUser();
  return user?.role || 'user';
};

export const isAdmin = (): boolean => getUserRole() === 'admin';
export const isVendor = (): boolean => getUserRole() === 'vendor';
export const isUser = (): boolean => getUserRole() === 'user';

export const isVendorVerified = (): boolean => {
  const user = getUser();
  // Default to true if vendorVerified field doesn't exist (for backward compatibility)
  return user?.role === 'vendor' && (user?.vendorVerified !== false);
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const setAuthData = (token: string, user: User): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Add a function to check if we have complete user data
export const hasCompleteUserData = (): boolean => {
  const user = getUser();
  return !!(user && user._id && user.email && user.role);
};