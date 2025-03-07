import React, { useState } from 'react';

/**
 * Props for the YouTubePlayer component
 */
interface YouTubePlayerProps {
  /** YouTube video ID to play */
  videoId: string | null;
  /** Search query used to find the video */
  searchQuery?: string | null;
  /** Title of the YouTube video */
  videoTitle?: string | null;
}

/**
 * Component that embeds a YouTube video player with audio-only option
 */
const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, searchQuery, videoTitle }) => {
  const [isAudioOnly, setIsAudioOnly] = useState(true);

  // If no video ID is provided, show a message
  if (!videoId) {
    return (
      <div className="mt-4 p-4 bg-secondary text-center">
        <p className="text-muted">no music found</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {searchQuery && (
        <p className="text-muted text-center mb-2">search query: "{searchQuery}"</p>
      )}
      {videoTitle && (
        <p className="text-muted text-center mb-2">playing: {videoTitle}</p>
      )}
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
            className={`border-0 ${isAudioOnly ? 'opacity-0' : 'opacity-100'}`}
            style={{ zIndex: 1 }}
          ></iframe>
          
          {/* Audio-only overlay when in audio-only mode */}
          {isAudioOnly && (
            <div className="position-absolute top-0 start-0 end-0 bottom-0 bg-secondary d-flex align-items-center justify-content-center">
              <div className="text-center">
                <p className="text-muted">audio playing: {videoTitle || 'music'}</p>
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
