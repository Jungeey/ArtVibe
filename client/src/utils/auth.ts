export interface User {
  _id: string;
  email: string;
  role: 'admin' | 'vendor' | 'user';
  vendorVerified?: boolean;
  verificationStatus?: 'pending' | 'approved' | 'suspended';
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
  return user?.role === 'vendor' && (user?.vendorVerified !== false);
};

export const VendorVerificationStatus = (): string | null => {
  const user = getUser();
  return user?.role === 'vendor' ? user?.verificationStatus || null : null;
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

// Enhanced auth verification with debugging
export const verifyAuth = (): { isAuthenticated: boolean; user: User | null; token: string | null } => {
  const token = getToken();
  const user = getUser();
  
  const authState = {
    isAuthenticated: !!(token && user),
    user,
    token
  };
  
  console.log('🔐 Auth verification:', authState);
  return authState;
};

// Check if current user matches order customer
export const isOrderOwner = (orderCustomerEmail: string): boolean => {
  const user = getUser();
  return user?.email === orderCustomerEmail;
};

// Get user display name
export const getUserDisplayName = (): string => {
  const user = getUser();
  return user?.name || user?.email || 'Customer';
};

// Validate token exists and user data is complete
export const validateAuth = (): boolean => {
  const token = getToken();
  const user = getUser();
  
  if (!token) {
    console.log('🚫 No token found');
    return false;
  }
  
  if (!user) {
    console.log('🚫 No user data found');
    return false;
  }
  
  if (!user.email) {
    console.log('🚫 User data incomplete - missing email');
    return false;
  }
  
  console.log('✅ Auth validation passed for user:', user.email);
  return true;
};