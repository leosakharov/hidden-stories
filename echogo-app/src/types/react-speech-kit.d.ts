declare module 'react-speech-kit' {
  export interface SpeechOptions {
    text: string;
    voice?: SpeechSynthesisVoice;
    rate?: number;
    pitch?: number;
    volume?: number;
    onEnd?: () => void;
    onStart?: () => void;
    onPause?: () => void;
    onResume?: () => void;
    onError?: (error: any) => void;
  }

  export interface UseSpeechSynthesisResult {
    speak: (options: SpeechOptions) => void;
    cancel: () => void;
    speaking: boolean;
    supported: boolean;
    voices: SpeechSynthesisVoice[];
    pause: () => void;
    resume: () => void;
  }

  export function useSpeechSynthesis(options?: {
    onEnd?: () => void;
    onStart?: () => void;
    onPause?: () => void;
    onResume?: () => void;
    onError?: (error: any) => void;
  }): UseSpeechSynthesisResult;

  export interface UseSpeechRecognitionOptions {
    onResult?: (result: string) => void;
    onEnd?: () => void;
    onStart?: () => void;
    onError?: (error: any) => void;
  }

  export interface UseSpeechRecognitionResult {
    listen: (options?: { interimResults?: boolean }) => void;
    stop: () => void;
    listening: boolean;
    supported: boolean;
  }

  export function useSpeechRecognition(options?: UseSpeechRecognitionOptions): UseSpeechRecognitionResult;
}
