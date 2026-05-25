export interface TokenPayload {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export const decodeToken = (): TokenPayload | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(atob(match[1].split('.')[1]));
  } catch {
    return null;
  }
};
