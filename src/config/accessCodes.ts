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
const EXTRA_CODES_KEY = 'game-extra-codes';
const TG_KEY = 'game-host-telegrams';

export function getTelegramLinks(): Record<string, string> {
  try {
    const saved = localStorage.getItem(TG_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

export function saveTelegramLinks(links: Record<string, string>) {
  localStorage.setItem(TG_KEY, JSON.stringify(links));
}

export function getHostTelegram(code: string): string {
  const upper = code.trim().toUpperCase();
  const links = getTelegramLinks();
  return links[upper] || '';
}

export function getCurrentHostTelegram(): string {
  const code = getSavedCode();
  if (!code) return '';
  if (code === 'MASTER') return localStorage.getItem('game-host-telegram') || '';
  return getHostTelegram(code);
}

export function getExtraCodes(): Record<string, string> {
  try {
    const saved = localStorage.getItem(EXTRA_CODES_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

export function saveExtraCodes(codes: Record<string, string>) {
  localStorage.setItem(EXTRA_CODES_KEY, JSON.stringify(codes));
}

export function getAllCodes(): Record<string, string> {
  return { ...ACCESS_CODES, ...getExtraCodes() };
}

export function addCode(code: string, name: string) {
  const extra = getExtraCodes();
  extra[code.trim().toUpperCase()] = name.trim();
  saveExtraCodes(extra);
}

export function removeExtraCode(code: string) {
  const extra = getExtraCodes();
  delete extra[code];
  saveExtraCodes(extra);
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += '-';
  code += digits[Math.floor(Math.random() * digits.length)];
  code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function generateUniqueCode(): string {
  const all = getAllCodes();
  let code = generateCode();
  while (all[code]) code = generateCode();
  return code;
}

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
  const all = getAllCodes();
  return (all[upper] && isCodeActive(upper)) ? upper : null;
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
  const all = getAllCodes();
  return custom[upper] || all[upper] || 'Ведущий';
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
  if (!code) return false;
  if (code === 'MASTER') return true;
  const all = getAllCodes();
  return all[code] !== undefined && isCodeActive(code);
}
