import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BRAND_NAME, GAME_TITLE } from '@/config/stages';
import { validateCode, getHostName, saveCode, isAuthorized } from '@/config/accessCodes';
import { motion } from 'framer-motion';

const AccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  // Если уже авторизован — сразу в игру
  useEffect(() => {
    if (isAuthorized()) {
      navigate('/game', { replace: true });
      return;
    }
    // Если код передан через ссылку — автоматически проверяем
    const urlCode = searchParams.get('code');
    if (urlCode) {
      const valid = validateCode(urlCode);
      if (valid) {
        saveCode(valid);
        navigate('/game', { replace: true });
      } else {
        setError('Код из ссылки недействителен');
      }
    }
  }, [searchParams, navigate]);

  const handleSubmit = () => {
    const validCode = validateCode(code);
    if (validCode) {
      saveCode(validCode);
      navigate('/game');
    } else {
      setError('Неверный код доступа');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#2A168F] relative overflow-hidden px-4">
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
            <p className="text-white/70 text-sm mt-2">Введите код доступа ведущего</p>
          </div>

          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Например: ANNA-7X"
            className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white text-center text-lg font-mono tracking-widest placeholder:text-white/30 focus:ring-2 focus:ring-white/40 outline-none"
            autoFocus
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
            disabled={!code.trim()}
          >
            Войти
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AccessPage;
