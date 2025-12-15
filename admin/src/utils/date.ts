/**
 * Convert date to Buddhist Era format (DD/MM/YYYY + 543)
 * @param date - Date object or date string
 * @returns Formatted date string in DD/MM/YYYY format (Buddhist Era)
 */
export const toBuddhistYear = (date: Date | string): string => {
  const d = new Date(date);
  const buddhistYear = d.getFullYear() + 543;
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}/${buddhistYear}`;
};

