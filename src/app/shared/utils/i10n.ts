export function formatDate(date: string) {
  if (!date) return 'No due date';

  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid date';

    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();

    return `${day}.${month}.${year}`;
  } catch {
    return 'Invalid date';
  }
}
