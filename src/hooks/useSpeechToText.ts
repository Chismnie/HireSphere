import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechToTextOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export const useSpeechToText = (options: UseSpeechToTextOptions = {}) => {
  const {
    lang = 'zh-CN',
    continuous = true,
    interimResults = true,
    onResult,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const isSupported = typeof window !== 'undefined' && 
    (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      setError(event.error);
      setIsListening(false);
      if (onError) onError(event.error);
    };

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        currentTranscript += result[0].transcript;
        if (result.isFinal) isFinal = true;
      }

      setTranscript(currentTranscript);
      if (onResult) onResult(currentTranscript, isFinal);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [lang, continuous, interimResults, onResult, onError, isSupported]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Speech recognition start failed:', err);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        // 强制调用 abort() 立即停止，而不是等待 stop() 的缓冲
        recognitionRef.current.abort();
        setIsListening(false);
      } catch (err) {
        console.error('Speech recognition stop failed:', err);
      }
    }
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
  };
};
