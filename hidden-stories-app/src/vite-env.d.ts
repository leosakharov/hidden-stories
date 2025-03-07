/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_YOUTUBE_API_KEY: string;
  readonly VITE_ELEVENLABS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
