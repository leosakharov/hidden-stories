import axios from 'axios';

// Get the API key from environment variables
const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

if (!API_KEY) {
  throw new Error('ElevenLabs API key is not set. Please check your .env file.');
}

// Define types for the ElevenLabs API
export interface Voice {
  voice_id: string;
  name: string;
  category?: string;
  description?: string;
  preview_url?: string;
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface TextToSpeechOptions {
  voiceId?: string;
  modelId?: string;
  voice_settings?: VoiceSettings;
}

/**
 * Convert text to speech using the ElevenLabs API
 * @param text The text to convert to speech
 * @param options Options for the text-to-speech conversion
 * @returns A Promise that resolves to an audio blob
 */
export const textToSpeech = async (
  text: string,
  options: TextToSpeechOptions = {}
): Promise<Blob> => {
  // Default voice ID - using "Rachel" which is a popular ElevenLabs voice
  // You can change this to any voice ID from your ElevenLabs account
  const voiceId = options.voiceId || '21m00Tcm4TlvDq8ikWAM';
  
  // Default model - using "eleven_monolingual_v1"
  const modelId = options.modelId || 'eleven_monolingual_v1';

  try {
    const response = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      data: {
        text,
        model_id: modelId,
        voice_settings: options.voice_settings
      },
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      responseType: 'blob'
    });

    return response.data;
  } catch (error) {
    console.error('Error with ElevenLabs API:', error);
    throw error;
  }
};

/**
 * Play audio with error handling
 * @param audioBlob The audio blob to play
 */
export const playAudio = async (audioBlob: Blob) => {
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);

  try {
    await audio.play();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Audio play was interrupted, retrying...');
      // Retry playing the audio
      setTimeout(() => {
        audio.play().catch((retryError) => {
          console.error('Retrying audio play failed:', retryError);
        });
      }, 100);
    } else {
      console.error('Error playing audio:', error);
    }
  }
};

/**
 * Get available voices from the ElevenLabs API
 * @returns A Promise that resolves to an array of Voice objects
 */
export const getVoices = async (): Promise<Voice[]> => {
  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    return response.data.voices;
  } catch (error) {
    console.error('Error fetching ElevenLabs voices:', error);
    throw error;
  }
};
