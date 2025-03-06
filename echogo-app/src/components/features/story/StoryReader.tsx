import React, { useState, useEffect } from 'react';
import { useSpeechSynthesis } from 'react-speech-kit';

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
 * Component that displays a story and provides text-to-speech functionality
 */
const StoryReader: React.FC<StoryReaderProps> = ({ story, autoPlay = false }) => {
  const { speak, cancel, speaking, supported } = useSpeechSynthesis();
  const [isPlaying, setIsPlaying] = useState(false);

  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  // Auto-play the story if enabled and supported
  useEffect(() => {
    if (autoPlay && story && supported && !speaking) {
      handlePlay();
    }
  }, [story, autoPlay, supported, speaking]);

  /**
   * Start reading the story aloud
   */
  const handlePlay = () => {
    if (!story) return;
    
    setIsPlaying(true);
    speak({ 
      text: story,
      onEnd: () => setIsPlaying(false)
    });
  };

  /**
   * Stop reading the story
   */
  const handleStop = () => {
    cancel();
    setIsPlaying(false);
  };

  if (!supported) {
    return (
      <div className="text-xs text-red-400 mt-2 font-mono text-center">
        text-to-speech not supported
      </div>
    );
  }

  return (
    <div className="mt-4 text-center">
      <div className="flex items-center space-x-3">
        <button
          onClick={isPlaying ? handleStop : handlePlay}
          className={`border px-3 py-1 text-xs font-mono transition-colors ${
            isPlaying 
              ? "border-red-700 text-red-400 hover:bg-red-900/20" 
              : "border-zinc-700 text-zinc-400 hover:bg-zinc-700/30"
          }`}
          disabled={!story}
        >
          {isPlaying ? "STOP" : "LISTEN"}
        </button>
        <span className="text-xs text-zinc-500 font-mono">
          {isPlaying ? "audio playing" : "text-to-speech"}
        </span>
      </div>
    </div>
  );
};

export default StoryReader;
