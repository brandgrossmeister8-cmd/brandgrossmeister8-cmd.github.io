import { useState } from 'react';
import { ACCESS_CODES, getCustomNames, saveCustomNames, getDisabledCodes, disableCode, enableCode } from '@/config/accessCodes';
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
  const [disabledCodes, setDisabledCodes] = useState<string[]>(getDisabledCodes);

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
  const isDisabled = (code: string) => disabledCodes.includes(code);

  const toggleCode = (code: string) => {
    if (isDisabled(code)) {
      enableCode(code);
      setDisabledCodes(prev => prev.filter(c => c !== code));
    } else {
      disableCode(code);
      setDisabledCodes(prev => [...prev, code]);
    }
  };

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
            <h2 className="text-lg font-bold text-white">Ведущие ({codes.filter(c => !isDisabled(c)).length} из {codes.length})</h2>
          </div>

          <div className="space-y-3">
            {codes.map((code) => {
              const disabled = isDisabled(code);
              return (
                <div key={code} className={`flex items-center gap-3 rounded-xl border p-4 ${disabled ? 'bg-white/2 border-white/5 opacity-50' : 'bg-white/5 border-white/10'}`}>
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
                        <p className={`font-bold ${disabled ? 'text-white/40 line-through' : 'text-white'}`}>{getName(code)}</p>
                        {!disabled && (
                          <button
                            onClick={() => startEdit(code, getName(code))}
                            className="text-white/40 hover:text-white/80 text-xs transition-colors"
                            title="Изменить имя"
                          >
                            ✏️
                          </button>
                        )}
                      </div>
                    )}
                    <p className="text-white/50 font-mono text-sm">{code}</p>
                  </div>
                  {!disabled && (
                    <>
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
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className={`shrink-0 ${disabled ? 'border-green-500/30 text-green-400 hover:bg-green-500/10' : 'border-red-500/30 text-red-400 hover:bg-red-500/10'}`}
                    onClick={() => toggleCode(code)}
                  >
                    {disabled ? 'Включить' : 'Удалить'}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCodesPage;
