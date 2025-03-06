import React, { useState } from 'react';

/**
 * Props for the YouTubePlayer component
 */
interface YouTubePlayerProps {
  /** YouTube video ID to play */
  videoId: string | null;
  /** Theme/mood of the music */
  theme: string;
}

/**
 * Component that embeds a YouTube video player with audio-only option
 */
const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, theme }) => {
  const [isAudioOnly, setIsAudioOnly] = useState(true);

  // If no video ID is provided, show a message
  if (!videoId) {
    return (
      <div className="mt-4 p-4 bg-zinc-800 border border-zinc-700 text-center">
        <p className="text-zinc-500 font-mono text-xs">no music found for theme: {theme || 'unknown'}</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-zinc-400 text-xs font-mono mb-2 text-center">theme: {theme}</p>
      <div className="overflow-hidden border border-zinc-700">
        <div className="relative">
          {/* YouTube iframe - hidden when in audio-only mode */}
          <iframe
            title="YouTube Player"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
            width="100%"
            height={isAudioOnly ? "80" : "352"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={`border-0 ${isAudioOnly ? 'opacity-0' : ''}`}
            style={{ zIndex: 1 }}
          ></iframe>
          
          {/* Audio-only overlay when in audio-only mode */}
          {isAudioOnly && (
            <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
              <div className="text-zinc-400 text-center">
                <p className="font-mono text-xs">audio playing: {theme}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-3 bg-zinc-800 border-t border-zinc-700 flex justify-between items-center">
          <p className="text-xs text-zinc-500 font-mono text-center">
            ai-selected music
          </p>
          <button 
            onClick={() => setIsAudioOnly(!isAudioOnly)}
            className="text-xs px-3 py-1 border border-zinc-700 text-zinc-400 hover:bg-zinc-700/30 font-mono transition-colors"
          >
            {isAudioOnly ? 'SHOW VIDEO' : 'AUDIO ONLY'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayer;
