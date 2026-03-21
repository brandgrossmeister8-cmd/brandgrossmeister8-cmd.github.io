/**
 * Система доступа ведущих.
 * Данные хранятся в Firebase Firestore (доступны с любого устройства).
 * Локальный кэш используется для быстрого чтения.
 * Код текущей сессии хранится в localStorage.
 */

import { db } from '@/config/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const STORAGE_KEY = 'game-access-code';

// --- Локальный кэш (синхронизируется с Firestore) ---

interface HostsData {
  codes: Record<string, string>;       // { code: name }
  disabled: string[];                   // отключённые коды
  telegrams: Record<string, string>;    // { code: tg }
  customNames: Record<string, string>;  // { code: customName }
}

let cache: HostsData = {
  codes: {},
  disabled: [],
  telegrams: {},
  customNames: {},
};

let listeners: Array<() => void> = [];
let unsubFirestore: (() => void) | null = null;

function notifyListeners() {
  listeners.forEach(fn => fn());
}

// --- Firestore sync ---

async function saveToFirestore() {
  try {
    await setDoc(doc(db, 'hosts', 'data'), cache);
  } catch (e) {
    console.error('Firestore save error:', e);
  }
}

export async function loadFromFirestore(): Promise<void> {
  try {
    const snap = await getDoc(doc(db, 'hosts', 'data'));
    if (snap.exists()) {
      const data = snap.data() as HostsData;
      cache = {
        codes: data.codes || {},
        disabled: data.disabled || [],
        telegrams: data.telegrams || {},
        customNames: data.customNames || {},
      };
    }
    notifyListeners();
  } catch (e) {
    console.error('Firestore load error:', e);
  }
}

/** Подписка на изменения в реальном времени */
export function subscribeToFirestore() {
  if (unsubFirestore) return;
  unsubFirestore = onSnapshot(doc(db, 'hosts', 'data'), (snap) => {
    if (snap.exists()) {
      const data = snap.data() as HostsData;
      cache = {
        codes: data.codes || {},
        disabled: data.disabled || [],
        telegrams: data.telegrams || {},
        customNames: data.customNames || {},
      };
      notifyListeners();
    }
  }, (err) => {
    console.error('Firestore realtime error:', err);
  });
}

/** Подписка на обновления кэша (для React компонентов) */
export function onCacheUpdate(fn: () => void) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter(l => l !== fn);
  };
}

// --- Хранение кодов ---

export function getAllCodes(): Record<string, string> {
  return { ...cache.codes };
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
  cache.codes[code] = name.trim();
  saveToFirestore();
  notifyListeners();
  return code;
}

export function removeHost(code: string) {
  delete cache.codes[code];
  delete cache.telegrams[code];
  cache.disabled = cache.disabled.filter(c => c !== code);
  delete cache.customNames[code];
  saveToFirestore();
  notifyListeners();
}

// --- Отключение / включение ---

export function getDisabledCodes(): string[] {
  return [...cache.disabled];
}

export function disableCode(code: string) {
  if (!cache.disabled.includes(code)) {
    cache.disabled.push(code);
    saveToFirestore();
    notifyListeners();
  }
}

export function enableCode(code: string) {
  cache.disabled = cache.disabled.filter(c => c !== code);
  saveToFirestore();
  notifyListeners();
}

export function isCodeActive(code: string): boolean {
  return !cache.disabled.includes(code);
}

// --- Telegram ---

export function getTelegramLinks(): Record<string, string> {
  return { ...cache.telegrams };
}

export function saveTelegramLinks(links: Record<string, string>) {
  cache.telegrams = { ...links };
  saveToFirestore();
  notifyListeners();
}

export function getHostTelegram(code: string): string {
  return cache.telegrams[code.trim().toUpperCase()] || '';
}

export function getCurrentHostTelegram(): string {
  const code = getSavedCode();
  if (!code) return '';
  if (code === 'MASTER') return '';
  return getHostTelegram(code);
}

// --- Кастомные имена (переименование) ---

export function getCustomNames(): Record<string, string> {
  return { ...cache.customNames };
}

export function saveCustomNames(names: Record<string, string>) {
  cache.customNames = { ...names };
  saveToFirestore();
  notifyListeners();
}

export function getHostName(code: string): string {
  const upper = code.trim().toUpperCase();
  return cache.customNames[upper] || cache.codes[upper] || 'Ведущий';
}

// --- Авторизация (сессия — localStorage) ---

export function validateCode(code: string): string | null {
  const upper = code.trim().toUpperCase();
  return (cache.codes[upper] && isCodeActive(upper)) ? upper : null;
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
  return cache.codes[code] !== undefined && isCodeActive(code);
}
