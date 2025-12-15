/**
 * Format date to Thai locale string
 */
export const formatDateThai = (date: Date): string => {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Format date to ISO string
 */
export const formatDateISO = (date: Date): string => {
  return date.toISOString();
};

/**
 * Check if date is expired
 */
export const isExpired = (expiryDate: Date): boolean => {
  return new Date() > expiryDate;
};

/**
 * Add minutes to current date
 */
export const addMinutes = (minutes: number): Date => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  return date;
};

/**
 * Add days to current date
 */
export const addDays = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * Calculate age from birth date
 */
export const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

/**
 * Get start and end of day
 */
export const getStartOfDay = (date: Date): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const getEndOfDay = (date: Date): Date => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

/**
 * Get date range for queries
 */
export const getDateRange = (days: number): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  return { start, end };
};
