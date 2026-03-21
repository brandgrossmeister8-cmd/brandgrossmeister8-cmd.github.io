import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BRAND_NAME, GAME_TITLE } from '@/config/stages';
import { validateCode, saveCode, isAuthorized, saveCustomNames, getCustomNames, getHostName, loadFromFirestore, onCacheUpdate } from '@/config/accessCodes';
import { motion } from 'framer-motion';

const MASTER_PASSWORD = '369852147';
const HOST_NAME_KEY = 'game-host-display-name';
const HOST_TG_KEY = 'game-host-telegram';

const AccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  // Дождаться загрузки данных из Firestore перед проверкой кода
  useEffect(() => {
    loadFromFirestore().then(() => setLoaded(true));
    return onCacheUpdate(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (isAuthorized()) {
      navigate('/', { replace: true });
      return;
    }
    const urlCode = searchParams.get('code');
    if (urlCode) {
      const valid = validateCode(urlCode);
      if (valid) {
        // Имя берём из базы — не спрашиваем
        const hostName = getHostName(valid);
        localStorage.setItem(HOST_NAME_KEY, hostName);
        saveCode(valid);
        navigate('/', { replace: true });
      } else {
        setError('Код из ссылки недействителен');
      }
    }
  }, [searchParams, navigate, loaded]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Введите ваше имя');
      return;
    }
    if (code === MASTER_PASSWORD) {
      localStorage.setItem(HOST_NAME_KEY, name.trim());
      saveCode('MASTER');
      navigate('/');
      return;
    }
    const validCode = validateCode(code);
    if (validCode) {
      const custom = getCustomNames();
      custom[validCode] = name.trim();
      saveCustomNames(custom);
      saveCode(validCode);
      navigate('/');
    } else {
      setError('Неверный код доступа');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#6838CE] relative overflow-hidden px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 right-0 h-px bg-white opacity-10" />
        <div className="absolute top-3/4 left-0 right-0 h-px bg-white opacity-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center gap-6 text-center w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-white tracking-wide">{BRAND_NAME}</h1>
        <h2 className="text-xl text-white/80">{GAME_TITLE}</h2>

        <div className="bg-[#1E0F6E] rounded-2xl border border-white/20 p-8 shadow-2xl w-full space-y-4">
          <div className="text-center">
            <span className="text-4xl">🔑</span>
            <p className="text-white/70 text-sm mt-2">Вход для ведущего</p>
          </div>

          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            placeholder="Ваше имя"
            className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white text-center text-lg placeholder:text-white/30 focus:ring-2 focus:ring-white/40 outline-none"
            autoFocus
          />

          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Код доступа"
            className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white text-center text-lg font-mono tracking-widest placeholder:text-white/30 focus:ring-2 focus:ring-white/40 outline-none"
          />

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-300 text-sm"
            >
              {error}
            </motion.p>
          )}

          <Button
            variant="hero"
            size="xl"
            className="w-full bg-white text-[#2A168F] hover:bg-white/90 font-bold"
            onClick={handleSubmit}
            disabled={!code.trim() || !name.trim()}
          >
            Войти
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AccessPage;
