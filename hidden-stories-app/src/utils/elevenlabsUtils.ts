import { Voice, getVoices } from '../api/elevenlabs';

/**
 * Cache for voices to avoid unnecessary API calls
 */
let voicesCache: Voice[] | null = null;

/**
 * Get all available voices from ElevenLabs
 * @param forceRefresh Whether to force a refresh of the cache
 * @returns A Promise that resolves to an array of Voice objects
 */
export const getAllVoices = async (forceRefresh = false): Promise<Voice[]> => {
  if (voicesCache && !forceRefresh) {
    return voicesCache;
  }
  
  try {
    const voices = await getVoices();
    voicesCache = voices;
    return voices;
  } catch (error) {
    console.error('Error fetching voices:', error);
    return [];
  }
};

/**
 * Get a voice by ID
 * @param voiceId The ID of the voice to get
 * @returns A Promise that resolves to a Voice object or null if not found
 */
export const getVoiceById = async (voiceId: string): Promise<Voice | null> => {
  const voices = await getAllVoices();
  return voices.find(voice => voice.voice_id === voiceId) || null;
};

/**
 * Get a voice by name
 * @param name The name of the voice to get
 * @returns A Promise that resolves to a Voice object or null if not found
 */
export const getVoiceByName = async (name: string): Promise<Voice | null> => {
  const voices = await getAllVoices();
  return voices.find(voice => voice.name.toLowerCase() === name.toLowerCase()) || null;
};

/**
 * Default voice settings for ElevenLabs
 */
export const defaultVoiceSettings = {
  stability: 0.5,
  similarity_boost: 0.75
};

/**
 * Popular ElevenLabs voice IDs
 */
export const popularVoices = {
  rachel: '21m00Tcm4TlvDq8ikWAM',
  adam: 'pNInz6obpgDQGcFmaJgB',
  sam: 'yoZ06aMxZJJ28mfd3POQ',
  antoni: 'ErXwobaYiN019PkySvjV',
  elli: 'MF3mGyEYCl7XYWbV9V6O',
  josh: 'TxGEqnHWrfWFTfGW9XjX',
  arnold: 'VR6AewLTigWG4xSOukaG',
  bella: 'EXAVITQu4vr4xnSDxMaL',
  daniel: 'onwK4e9ZLuTAKqWW03F9',
  ethan: '2EiwWnXFnvU5JabPnv8n'
};
