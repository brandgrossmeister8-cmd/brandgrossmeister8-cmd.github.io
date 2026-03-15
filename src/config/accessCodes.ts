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
const DISABLED_KEY = 'game-disabled-codes';

export function getDisabledCodes(): string[] {
  try {
    const saved = localStorage.getItem(DISABLED_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

export function saveDisabledCodes(codes: string[]) {
  localStorage.setItem(DISABLED_KEY, JSON.stringify(codes));
}

export function disableCode(code: string) {
  const disabled = getDisabledCodes();
  if (!disabled.includes(code)) {
    saveDisabledCodes([...disabled, code]);
  }
}

export function enableCode(code: string) {
  const disabled = getDisabledCodes();
  saveDisabledCodes(disabled.filter(c => c !== code));
}

export function isCodeActive(code: string): boolean {
  return !getDisabledCodes().includes(code);
}

export function getActiveCodes(): string[] {
  const disabled = getDisabledCodes();
  return Object.keys(ACCESS_CODES).filter(c => !disabled.includes(c));
}

export function validateCode(code: string): string | null {
  const upper = code.trim().toUpperCase();
  return (ACCESS_CODES[upper] && isCodeActive(upper)) ? upper : null;
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
  return code !== null && ACCESS_CODES[code] !== undefined && isCodeActive(code);
}
