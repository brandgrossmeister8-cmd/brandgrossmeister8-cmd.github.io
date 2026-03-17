/**
 * Система доступа ведущих.
 * Все коды создаются через админку — предустановленных нет.
 * Код генерируется автоматически на основе имени.
 */

const STORAGE_KEY = 'game-access-code';
const NAMES_KEY = 'game-custom-names';
const DISABLED_KEY = 'game-disabled-codes';
const CODES_KEY = 'game-host-codes'; // { code: name }
const TG_KEY = 'game-host-telegrams'; // { code: tg }

// --- Хранение кодов ---

export function getAllCodes(): Record<string, string> {
  try {
    const saved = localStorage.getItem(CODES_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

export function saveAllCodes(codes: Record<string, string>) {
  localStorage.setItem(CODES_KEY, JSON.stringify(codes));
}

// --- Генерация кода из имени ---

function transliterate(name: string): string {
  const map: Record<string, string> = {
    'а':'A','б':'B','в':'V','г':'G','д':'D','е':'E','ё':'E','ж':'ZH','з':'Z',
    'и':'I','й':'Y','к':'K','л':'L','м':'M','н':'N','о':'O','п':'P','р':'R',
    'с':'S','т':'T','у':'U','ф':'F','х':'H','ц':'C','ч':'CH','ш':'SH','щ':'SH',
    'ъ':'','ы':'Y','ь':'','э':'E','ю':'YU','я':'YA',
  };
  return name.toLowerCase().split('').map(c => map[c] || c.toUpperCase()).join('');
}

function generateCodeFromName(name: string): string {
  const clean = name.trim();
  const prefix = transliterate(clean).replace(/[^A-Z]/g, '').slice(0, 4).toUpperCase();
  const digits = '23456789';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const d = digits[Math.floor(Math.random() * digits.length)];
  const c = chars[Math.floor(Math.random() * chars.length)];
  return `${prefix || 'HOST'}-${d}${c}`;
}

export function generateUniqueCode(name: string): string {
  const all = getAllCodes();
  let code = generateCodeFromName(name);
  let attempts = 0;
  while (all[code] && attempts < 50) {
    code = generateCodeFromName(name);
    attempts++;
  }
  return code;
}

// --- Добавление / удаление ---

export function addHost(name: string): string {
  const code = generateUniqueCode(name);
  const all = getAllCodes();
  all[code] = name.trim();
  saveAllCodes(all);
  return code;
}

export function removeHost(code: string) {
  const all = getAllCodes();
  delete all[code];
  saveAllCodes(all);
  // Убираем из TG и disabled тоже
  const tg = getTelegramLinks();
  delete tg[code];
  saveTelegramLinks(tg);
  const disabled = getDisabledCodes();
  saveDisabledCodes(disabled.filter(c => c !== code));
}

// --- Отключение / включение ---

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
  if (!disabled.includes(code)) saveDisabledCodes([...disabled, code]);
}

export function enableCode(code: string) {
  saveDisabledCodes(getDisabledCodes().filter(c => c !== code));
}

export function isCodeActive(code: string): boolean {
  return !getDisabledCodes().includes(code);
}

// --- Telegram ---

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
  return getTelegramLinks()[code.trim().toUpperCase()] || '';
}

export function getCurrentHostTelegram(): string {
  const code = getSavedCode();
  if (!code) return '';
  if (code === 'MASTER') {
    // Для мастер-пароля берём первый TG из таблицы админки
    const links = getTelegramLinks();
    const values = Object.values(links).filter(v => v);
    return values[0] || localStorage.getItem('game-host-telegram') || '';
  }
  return getHostTelegram(code);
}

// --- Кастомные имена (переименование) ---

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

// --- Авторизация ---

export function validateCode(code: string): string | null {
  const upper = code.trim().toUpperCase();
  const all = getAllCodes();
  return (all[upper] && isCodeActive(upper)) ? upper : null;
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
