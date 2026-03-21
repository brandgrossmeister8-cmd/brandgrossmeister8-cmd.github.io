import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContent, setContent, resetAll, getDefault, getAllOverrides, CONTENT_SECTIONS } from '@/config/contentStore';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

const MASTER_PASSWORD = '369852147';

const ContentEditorPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [authError, setAuthError] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  // Инициализируем значения
  useEffect(() => {
    if (authorized) {
      const values: Record<string, string> = {};
      CONTENT_SECTIONS.forEach(section => {
        section.keys.forEach(({ key }) => {
          values[key] = getContent(key);
        });
      });
      setEditValues(values);
    }
  }, [authorized]);

  const handleLogin = () => {
    if (password === MASTER_PASSWORD) {
      setAuthorized(true);
      setAuthError('');
    } else {
      setAuthError('Неверный пароль');
      setTimeout(() => setAuthError(''), 3000);
    }
  };

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    Object.entries(editValues).forEach(([key, value]) => {
      setContent(key, value);
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (!confirm('Сбросить все тексты к значениям по умолчанию? Это отменит все ваши правки.')) return;
    resetAll();
    const values: Record<string, string> = {};
    CONTENT_SECTIONS.forEach(section => {
      section.keys.forEach(({ key }) => {
        values[key] = getDefault(key);
      });
    });
    setEditValues(values);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const overrides = getAllOverrides();
  const changedCount = Object.keys(overrides).length;

  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#2A168F] px-4">
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white">РЕДАКТОР КОНТЕНТА</h1>
          <div className="bg-[#1E0F6E] rounded-2xl border border-white/20 p-8 shadow-2xl w-full space-y-4">
            <div className="text-center">
              <span className="text-4xl">✏️</span>
              <p className="text-white/70 text-sm mt-2">Управление контентом игры</p>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Мастер-пароль"
              className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white text-center focus:ring-2 focus:ring-white/40 outline-none"
              autoFocus
            />
            {authError && <p className="text-red-300 text-sm text-center">{authError}</p>}
            <Button
              className="w-full bg-white text-[#2A168F] hover:bg-white/90 font-bold"
              onClick={handleLogin}
            >
              Войти
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2A168F] px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">РЕДАКТОР КОНТЕНТА</h1>
          <p className="text-white/60 text-sm mt-1">Редактируйте тексты и параметры игры</p>
          {changedCount > 0 && (
            <p className="text-yellow-300 text-xs mt-2">Изменено полей: {changedCount}</p>
          )}
        </div>

        {CONTENT_SECTIONS.map(section => (
          <div key={section.id} className="bg-[#1E0F6E] rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
            >
              <h2 className="font-bold text-white text-lg">{section.title}</h2>
              {openSections[section.id]
                ? <ChevronUp className="w-5 h-5 text-white/60" />
                : <ChevronDown className="w-5 h-5 text-white/60" />
              }
            </button>

            {openSections[section.id] && (
              <div className="px-6 pb-6 space-y-4">
                {section.keys.map(({ key, label }) => {
                  const isChanged = editValues[key] !== getDefault(key);
                  return (
                    <div key={key} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-white/80 font-medium">
                          {label}
                          {isChanged && <span className="ml-2 text-yellow-300 text-xs">*изменено</span>}
                        </label>
                        {isChanged && (
                          <button
                            onClick={() => setEditValues(prev => ({ ...prev, [key]: getDefault(key) }))}
                            className="text-xs text-white/40 hover:text-white/80 transition-colors"
                          >
                            Сбросить
                          </button>
                        )}
                      </div>
                      <textarea
                        value={editValues[key] || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, [key]: e.target.value }))}
                        rows={editValues[key]?.length > 100 ? 3 : 1}
                        className={`w-full p-3 rounded-lg border bg-white/10 text-white text-sm focus:ring-2 focus:ring-white/40 outline-none resize-y ${
                          isChanged ? 'border-yellow-400/50' : 'border-white/20'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Действия */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-6"
            onClick={handleSave}
          >
            {saved ? '✓ Сохранено!' : 'Сохранить все изменения'}
          </Button>
          <Button
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            onClick={handleReset}
          >
            Сбросить всё
          </Button>
        </div>

        <div className="flex justify-center gap-3">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => navigate('/admin-codes')}>
            Управление ведущими
          </Button>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => navigate('/')}>
            На главную
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContentEditorPage;
