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
      <div className="mt-4 p-4 bg-secondary text-center">
        <p className="text-muted">no music found for theme: {theme || 'unknown'}</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-muted text-center mb-2">theme: {theme}</p>
      <div className="overflow-hidden border">
        <div className="position-relative">
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
            <div className="position-absolute top-0 start-0 end-0 bottom-0 bg-secondary d-flex align-items-center justify-content-center">
              <div className="text-center">
                <p className="text-muted">audio playing: {theme}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-3 bg-secondary border-top d-flex justify-content-between align-items-center">
          <p className="text-muted text-center">
            ai-selected music
          </p>
          <button 
            onClick={() => setIsAudioOnly(!isAudioOnly)}
            className="btn btn-secondary"
          >
            {isAudioOnly ? 'SHOW VIDEO' : 'AUDIO ONLY'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayer;
