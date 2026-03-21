import { useState, useRef, useCallback, useEffect } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SpeechRecognitionApi: any = typeof window !== 'undefined'
  ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  : null;

export function useSpeechRecognition(lang = 'ru-RU') {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);

  const isSupported = !!SpeechRecognitionApi;

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    setIsListening(false);
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognitionApi) {
      setError('Браузер не поддерживает голосовой ввод. Используйте Chrome или Edge.');
      return;
    }

    // Stop previous if running
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }

    setError(null);
    setTranscript('');
    shouldListenRef.current = true;

    const recognition = new SpeechRecognitionApi();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    let finalTranscript = '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(finalTranscript + interim);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      const err = event.error || event.message || 'unknown';
      if (err === 'not-allowed' || err === 'permission-denied') {
        setError('Доступ к микрофону запрещён. Разрешите доступ в настройках браузера.');
      } else if (err !== 'aborted' && err !== 'no-speech') {
        setError(`Ошибка распознавания: ${err}`);
      }
      shouldListenRef.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      if (shouldListenRef.current) {
        try { recognition.start(); } catch { /* already started */ }
      } else {
        setIsListening(false);
      }
    };

    recognition.onstart = () => {
      setIsListening(true);
    };

    try {
      recognition.start();
    } catch (e) {
      setError('Не удалось запустить распознавание речи. Попробуйте Chrome.');
      setIsListening(false);
    }
  }, [lang]);

  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    };
  }, []);

  return { isListening, transcript, error, startListening, stopListening, isSupported };
}
