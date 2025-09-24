export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};

export const getUserRole = () => {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.role || 'user'; // Default to 'user' if no role found
    }
    return 'user';
  } catch (error) {
    console.error('Error parsing user data:', error);
    return 'user';
  }
};

export const isAdmin = () => {
  return getUserRole() === 'admin';
};

export const isVendor = () => {
  return getUserRole() === 'vendor';
};

export const isUser = () => {
  return getUserRole() === 'user';
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};