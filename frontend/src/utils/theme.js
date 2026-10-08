export const getTheme = () => {
  return localStorage.getItem('theme') || 'light';
};

export const setTheme = (theme) => {
  localStorage.setItem('theme', theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const toggleTheme = () => {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
};

export const initTheme = () => {
  const theme = getTheme();
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  }
};