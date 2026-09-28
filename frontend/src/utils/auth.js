export const getUser = () => {
  try {
    const stored = localStorage.getItem('authUser');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  return getUser() !== null;
};

export const logout = () => {
  localStorage.removeItem('authUser');
};