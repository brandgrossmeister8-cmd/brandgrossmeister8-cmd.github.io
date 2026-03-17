import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ACCESS_CODES, getAllCodes, getCustomNames, saveCustomNames, getDisabledCodes, disableCode, enableCode, addCode, generateUniqueCode, getExtraCodes, removeExtraCode, getTelegramLinks, saveTelegramLinks } from '@/config/accessCodes';
import { BRAND_NAME } from '@/config/stages';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const MASTER_PASSWORD = '369852147';

const AdminCodesPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [customNames, setCustomNames] = useState<Record<string, string>>(getCustomNames);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [disabledCodes, setDisabledCodes] = useState<string[]>(getDisabledCodes);
  const [newName, setNewName] = useState('');
  const [allCodes, setAllCodes] = useState<Record<string, string>>(getAllCodes);
  const [tgLinks, setTgLinks] = useState<Record<string, string>>(getTelegramLinks);
  const [editingTg, setEditingTg] = useState<string | null>(null);
  const [tgValue, setTgValue] = useState('');

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

  const getName = (code: string) => customNames[code] || allCodes[code] || ACCESS_CODES[code];
  const isDisabled = (code: string) => disabledCodes.includes(code);
  const getTg = (code: string) => tgLinks[code] || '';

  const startEditTg = (code: string) => {
    setEditingTg(code);
    setTgValue(getTg(code));
  };

  const saveEditTg = (code: string) => {
    const clean = tgValue.trim().replace('@', '');
    const updated = { ...tgLinks, [code]: clean };
    setTgLinks(updated);
    saveTelegramLinks(updated);
    setEditingTg(null);
    setTgValue('');
  };

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

  const codes = Object.keys(allCodes);
  const extraCodes = getExtraCodes();

  const handleAddHost = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const code = generateUniqueCode();
    addCode(code, trimmed);
    setAllCodes(getAllCodes());
    setNewName('');
  };

  const handleDeleteExtra = (code: string) => {
    removeExtraCode(code);
    setAllCodes(getAllCodes());
  };

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

          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddHost()}
              placeholder="Имя нового ведущего"
              className="flex-1 p-3 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:ring-2 focus:ring-white/40 outline-none placeholder:text-white/30"
            />
            <Button
              className="bg-white text-[#2A168F] hover:bg-white/90 font-bold shrink-0"
              onClick={handleAddHost}
              disabled={!newName.trim()}
            >
              + Добавить
            </Button>
          </div>

          <div className="space-y-3">
            {codes.map((code) => {
              const disabled = isDisabled(code);
              return (
                <div key={code} className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 rounded-xl border p-3 sm:p-4 ${disabled ? 'bg-white/2 border-white/5 opacity-50' : 'bg-white/5 border-white/10'}`}>
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
                    {!disabled && (
                      editingTg === code ? (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-white/40 text-xs">TG:</span>
                          <input
                            value={tgValue}
                            onChange={(e) => setTgValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEditTg(code)}
                            placeholder="username"
                            className="flex-1 p-1 rounded border border-white/20 bg-white/10 text-white text-xs outline-none"
                            autoFocus
                          />
                          <button onClick={() => saveEditTg(code)} className="text-green-400 text-xs">✓</button>
                          <button onClick={() => setEditingTg(null)} className="text-white/40 text-xs">✕</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-white/40 text-xs">TG: {getTg(code) ? `@${getTg(code)}` : 'не указан'}</span>
                          <button onClick={() => startEditTg(code)} className="text-white/30 hover:text-white/70 text-xs">✏️</button>
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {!disabled && (
                      <>
                        <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => copyCode(code)}>
                          {copied === code ? '✓' : 'Код'}
                        </Button>
                        <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => copyLink(code)}>
                          {copied === `link-${code}` ? '✓' : 'Ссылка'}
                        </Button>
                      </>
                    )}
                    {disabled ? (
                      <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10" onClick={() => toggleCode(code)}>
                        Включить
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10" onClick={() => toggleCode(code)}>
                        Отключить
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      onClick={() => { if (extraCodes[code]) { handleDeleteExtra(code); } else { toggleCode(code); if (!disabled) disableCode(code); } }}>
                      Удалить
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => navigate('/')}>
            На главную
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminCodesPage;
