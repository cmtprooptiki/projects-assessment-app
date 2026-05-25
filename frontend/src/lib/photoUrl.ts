export function getPhotoUrl(photo: string | null | undefined): string | null {
  if (!photo) return null;
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api$/, '');
  return `${base}${photo}`;
}
