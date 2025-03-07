import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { textToSpeech } from '../api/elevenlabs';
import { popularVoices } from '../shared/utils';

// Define the ref handle type
export interface StoryReaderHandle {
  handlePlay: () => Promise<void>;
  handlePause: () => void;
  handleResume: () => Promise<void>;
  handleStop: () => void;
  isPlaying: boolean;
  audioUrl: string | null;
}

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
const StoryReader = forwardRef<StoryReaderHandle, StoryReaderProps>(
  ({ story, autoPlay = false }, ref) => {
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
      // Check if window.stopButtonPressed exists and is true
      const stopPressed = (window as any).stopButtonPressed === true;
      
      if (autoPlay && story && !isPlaying && !isLoading && !stopPressed) {
        console.log('Auto-playing story');
        handlePlay();
      } else if (stopPressed) {
        console.log('Auto-play prevented because stop button was pressed');
      }
    }, [story, autoPlay, isPlaying, isLoading]);

    // Set up audio event listeners
    useEffect(() => {
      if (audioRef.current) {
        const audio = audioRef.current;
        
        const handleEnded = () => {
          setIsPlaying(false);
          // Dispatch a custom event to notify parent components
          window.dispatchEvent(new CustomEvent('story-ended'));
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
          // Simulate playing for UI purposes
          setIsPlaying(true);
          setTimeout(() => setIsPlaying(false), 10000);
        }
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to get audio from ElevenLabs with the selected voice
        try {
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
              // Simulate playing for UI purposes
              setIsPlaying(true);
              setTimeout(() => setIsPlaying(false), 10000);
            }
          }
        } catch (err: unknown) {
          console.error('Error generating speech:', err);
          setError('API key issue. Demo mode active.');
          
          // Just simulate playing with UI updates
          setIsPlaying(true);
          
          // Show the audio visualization
          const waveAnimation = document.querySelector('.audio-waves');
          if (waveAnimation) {
            waveAnimation.classList.add('active');
          }
          
          // Stop after 10 seconds
          setTimeout(() => {
            setIsPlaying(false);
            if (waveAnimation) {
              waveAnimation.classList.remove('active');
            }
          }, 10000);
        }
      } catch (err: unknown) {
        console.error('Error in play handler:', err);
        setError('Failed to generate speech. Please try again.');
        // Simulate playing for UI purposes
        setIsPlaying(true);
        setTimeout(() => setIsPlaying(false), 10000);
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
     * Stop reading the story and reset position without playing
     */
    const handleStop = () => {
      if (audioRef.current) {
        // Make sure to pause first
        audioRef.current.pause();
        // Then reset the position
        audioRef.current.currentTime = 0;
        // Update the UI state
        setIsPlaying(false);
        
        // Log for debugging
        console.log('Audio stopped and reset');
      }
    };
    
    /**
     * Pause reading the story without resetting position
     */
    const handlePause = () => {
      console.log('StoryReader handlePause called');
      
      if (audioRef.current) {
        try {
          console.log('Pausing audio element, current time:', audioRef.current.currentTime);
          audioRef.current.pause();
          console.log('Audio element paused successfully');
          
          // Double-check that the audio is actually paused
          setTimeout(() => {
            if (audioRef.current && !audioRef.current.paused) {
              console.warn('Audio element not paused after pause() call, trying again');
              audioRef.current.pause();
            }
          }, 100);
        } catch (error) {
          console.error('Error pausing audio:', error);
        }
      } else {
        console.warn('Audio element reference not available for pause');
      }
      
      setIsPlaying(false);
    };
    
    /**
     * Resume reading the story from current position
     */
    const handleResume = async () => {
      if (audioRef.current) {
        try {
          await playAudioWithRetry(audioRef.current);
          setIsPlaying(true);
        } catch (err: unknown) {
          console.error('Error resuming audio:', err);
          setError('Failed to resume audio. Please try again.');
        }
      }
    };

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    handlePlay,
    handlePause,
    handleResume,
    handleStop,
    isPlaying,
    audioUrl
  }));

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
      <>
        {/* Compact audio controls for unified player */}
        <div className="d-flex align-items-center">
          {/* Play/Pause button */}
          <button
            onClick={isPlaying ? handlePause : (audioUrl ? handleResume : handlePlay)}
            className={`btn ${isPlaying ? "btn-outline-danger" : "btn-outline-primary"} rounded-circle p-2 me-2`}
            disabled={!story || isLoading}
            style={{ width: '38px', height: '38px' }}
          >
            {isLoading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : isPlaying ? (
              <i className="bi bi-pause-fill"></i>
            ) : (
              <i className="bi bi-play-fill"></i>
            )}
          </button>
          
          {/* Audio visualization */}
          {isPlaying && (
            <div className="audio-waves d-flex align-items-center gap-1 me-2">
              <div className="wave-bar bg-primary" style={{ height: '12px', width: '2px', animation: 'wave 0.5s infinite' }}></div>
              <div className="wave-bar bg-primary" style={{ height: '16px', width: '2px', animation: 'wave 0.7s infinite' }}></div>
              <div className="wave-bar bg-primary" style={{ height: '10px', width: '2px', animation: 'wave 0.4s infinite' }}></div>
            </div>
          )}
          
          {/* Voice selector - compact dropdown */}
          <select
            className="form-select form-select-sm bg-dark text-white border-secondary"
            value={selectedVoiceId}
            onChange={(e) => handleVoiceSelect(e.target.value)}
            disabled={isLoading || isPlaying}
            style={{ width: 'auto', maxWidth: '100px' }}
          >
            <option value={popularVoices.rachel}>Rachel</option>
            <option value={popularVoices.sam}>Sam</option>
            <option value={popularVoices.antoni}>Antoni</option>
            <option value={popularVoices.elli}>Elli</option>
            <option value={popularVoices.josh}>Josh</option>
          </select>
        </div>
        
        {/* Error message - more compact for the unified player */}
        {error && (
          <div className="position-absolute top-100 start-50 translate-middle-x mt-2" style={{ zIndex: 1000, width: '200px' }}>
            <div className="alert alert-danger p-1 small text-center">
              <small>{error}</small>
            </div>
          </div>
        )}
        
        {/* Hidden audio element */}
        <audio ref={audioRef} style={{ display: 'none' }} />
      </>
    );
  }
);

export default StoryReader;
