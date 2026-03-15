import { useState } from 'react';
import { ACCESS_CODES, getCustomNames, saveCustomNames } from '@/config/accessCodes';
import { BRAND_NAME } from '@/config/stages';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const MASTER_PASSWORD = '369852147';

const AdminCodesPage = () => {
  const [password, setPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [customNames, setCustomNames] = useState<Record<string, string>>(getCustomNames);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleLogin = () => {
    if (password === MASTER_PASSWORD) {
      setAuthorized(true);
      setError('');
    } else {
      setError('Неверный пароль');
      setTimeout(() => setError(''), 3000);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyLink = (code: string) => {
    const base = window.location.origin + window.location.pathname;
    const link = `${base}#/access?code=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(link);
    setCopied(`link-${code}`);
    setTimeout(() => setCopied(null), 2000);
  };

  const startEdit = (code: string, currentName: string) => {
    setEditingCode(code);
    setEditValue(currentName);
  };

  const saveEdit = (code: string) => {
    const trimmed = editValue.trim();
    if (trimmed) {
      const updated = { ...customNames, [code]: trimmed };
      setCustomNames(updated);
      saveCustomNames(updated);
    }
    setEditingCode(null);
    setEditValue('');
  };

  const getName = (code: string) => customNames[code] || ACCESS_CODES[code];

  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#2A168F] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6 w-full max-w-sm"
        >
          <h1 className="text-2xl font-bold text-white">{BRAND_NAME}</h1>
          <div className="bg-[#1E0F6E] rounded-2xl border border-white/20 p-8 shadow-2xl w-full space-y-4">
            <div className="text-center">
              <span className="text-4xl">🔒</span>
              <p className="text-white/70 text-sm mt-2">Панель управления доступом</p>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Мастер-пароль"
              className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white text-center focus:ring-2 focus:ring-white/40 outline-none"
              autoFocus
            />
            {error && <p className="text-red-300 text-sm text-center">{error}</p>}
            <Button
              variant="hero"
              className="w-full bg-white text-[#2A168F] hover:bg-white/90 font-bold"
              onClick={handleLogin}
            >
              Войти
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const codes = Object.keys(ACCESS_CODES);

  return (
    <div className="min-h-screen bg-[#2A168F] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">{BRAND_NAME}</h1>
          <p className="text-white/60 text-sm mt-1">Управление кодами доступа ведущих</p>
        </div>

        <div className="bg-[#1E0F6E] rounded-2xl border border-white/20 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Активные ведущие ({codes.length})</h2>
          </div>

          <div className="space-y-3">
            {codes.map((code) => (
              <div key={code} className="flex items-center gap-3 bg-white/5 rounded-xl border border-white/10 p-4">
                <div className="flex-1 min-w-0">
                  {editingCode === code ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(code)}
                        className="flex-1 p-2 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:ring-2 focus:ring-white/40 outline-none"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        className="bg-white text-[#2A168F] hover:bg-white/90 shrink-0"
                        onClick={() => saveEdit(code)}
                      >
                        ✓
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 shrink-0"
                        onClick={() => setEditingCode(null)}
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-white font-bold">{getName(code)}</p>
                      <button
                        onClick={() => startEdit(code, getName(code))}
                        className="text-white/40 hover:text-white/80 text-xs transition-colors"
                        title="Изменить имя"
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                  <p className="text-white/50 font-mono text-sm">{code}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 shrink-0"
                  onClick={() => copyCode(code)}
                >
                  {copied === code ? '✓' : 'Код'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 shrink-0"
                  onClick={() => copyLink(code)}
                >
                  {copied === `link-${code}` ? '✓' : 'Ссылка'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCodesPage;
