import React, { useState, useEffect, useRef } from 'react';
import { textToSpeech } from '../api/elevenlabs';
import VoiceSelector from './VoiceSelector';
import { popularVoices } from '../shared/utils';

/**
 * Props for the StoryReader component
 */
interface StoryReaderProps {
  /** The story text to be read */
  story: string;
  /** Whether to automatically play the story when component mounts */
  autoPlay?: boolean;
}

/**
 * Component that displays a story and provides text-to-speech functionality using ElevenLabs
 */
const StoryReader: React.FC<StoryReaderProps> = ({ story, autoPlay = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(popularVoices.rachel);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
      }
    };
  }, [audioUrl]);

  // Auto-play the story if enabled
  useEffect(() => {
    if (autoPlay && story && !isPlaying && !isLoading) {
      handlePlay();
    }
  }, [story, autoPlay, isPlaying, isLoading]);

  // Set up audio event listeners
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const handleEnded = () => {
        setIsPlaying(false);
      };
      
      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [audioRef.current]);

  /**
   * Start reading the story aloud using ElevenLabs
   */
  const handlePlay = async () => {
    if (!story || isLoading) return;
    
    // If we already have audio and the voice hasn't changed, just play it
    if (audioUrl && audioRef.current) {
      try {
        await playAudioWithRetry(audioRef.current);
        setIsPlaying(true);
      } catch (err: unknown) {
        console.error('Error playing existing audio:', err);
        setError('Failed to play audio. Please try again.');
      }
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get audio from ElevenLabs with the selected voice
      const audioBlob = await textToSpeech(story, {
        voiceId: selectedVoiceId
      });
      
      // Create a URL for the audio blob
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      // Play the audio
      if (audioRef.current) {
        audioRef.current.src = url;
        
        // Make sure the audio is loaded before playing
        audioRef.current.load();
        
        try {
          await playAudioWithRetry(audioRef.current);
          setIsPlaying(true);
        } catch (err: unknown) {
          console.error('Error playing new audio:', err);
          setError('Failed to play audio. Please try again.');
        }
      }
    } catch (err: unknown) {
      console.error('Error generating speech:', err);
      setError('Failed to generate speech. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Play audio with retry mechanism for AbortError
   */
  const playAudioWithRetry = async (audio: HTMLAudioElement, retries = 3): Promise<void> => {
    try {
      await audio.play();
    } catch (error: unknown) {
      // Type guard to check if error is an object with a name property
      if (
        error && 
        typeof error === 'object' && 
        'name' in error && 
        error.name === 'AbortError' && 
        retries > 0
      ) {
        console.warn('Audio play was interrupted, retrying...', retries, 'attempts left');
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 300));
        return playAudioWithRetry(audio, retries - 1);
      }
      throw error;
    }
  };

  /**
   * Stop reading the story
   */
  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  // Handle voice selection
  const handleVoiceSelect = (voiceId: string) => {
    // If the voice changes, we need to clear the audio URL so it will be regenerated
    if (voiceId !== selectedVoiceId) {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      setSelectedVoiceId(voiceId);
    }
  };

  return (
    <div className="mt-4 text-center">
      <div className="d-flex align-items-center justify-content-center gap-3">
        <button
          onClick={isPlaying ? handleStop : handlePlay}
          className={`btn ${isPlaying ? "btn-danger" : "btn-secondary"}`}
          disabled={!story || isLoading}
        >
          {isLoading ? "LOADING..." : isPlaying ? "STOP" : "LISTEN"}
        </button>
        <span className="text-muted">
          {isLoading ? "generating audio..." : isPlaying ? "audio playing" : "ElevenLabs TTS"}
        </span>
      </div>
      
      {/* Voice selector */}
      {!isPlaying && (
        <VoiceSelector 
          onVoiceSelect={handleVoiceSelect} 
          selectedVoiceId={selectedVoiceId} 
        />
      )}
      
      {error && (
        <div className="text-danger mt-2">
          {error}
        </div>
      )}
      
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default StoryReader;
