export const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100";

export const buttonPrimary = `${buttonBase} bg-green-600 text-white hover:bg-green-700`;
export const buttonSecondary = `${buttonBase} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700`;
export const buttonDanger = `${buttonBase} bg-red-600 text-white hover:bg-red-700`;
export const buttonWarning = `${buttonBase} bg-amber-500 text-white hover:bg-amber-600`;
