/**
 * Коды доступа для ведущих.
 * Чтобы добавить ведущего — добавьте новую строку.
 * Чтобы отключить — удалите или закомментируйте.
 */
export const ACCESS_CODES: Record<string, string> = {
  'ANNA-7X': 'Анна',
  'IGOR-3K': 'Игорь',
  'LENA-9M': 'Елена',
  'RITA-5Z': 'Рита',
  'ALEX-2W': 'Алексей',
  'OLGA-6D': 'Ольга',
  'DIMA-8F': 'Дмитрий',
  'NATA-1Y': 'Наталья',
  'SERG-4H': 'Сергей',
  'KATE-0L': 'Екатерина',
};

const STORAGE_KEY = 'game-access-code';
const NAMES_KEY = 'game-custom-names';

export function validateCode(code: string): string | null {
  const upper = code.trim().toUpperCase();
  return ACCESS_CODES[upper] ? upper : null;
}

export function getCustomNames(): Record<string, string> {
  try {
    const saved = localStorage.getItem(NAMES_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

export function saveCustomNames(names: Record<string, string>) {
  localStorage.setItem(NAMES_KEY, JSON.stringify(names));
}

export function getHostName(code: string): string {
  const upper = code.trim().toUpperCase();
  const custom = getCustomNames();
  return custom[upper] || ACCESS_CODES[upper] || 'Ведущий';
}

export function saveCode(code: string) {
  localStorage.setItem(STORAGE_KEY, code.trim().toUpperCase());
}

export function getSavedCode(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function clearCode() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isAuthorized(): boolean {
  const code = getSavedCode();
  return code !== null && ACCESS_CODES[code] !== undefined;
}
