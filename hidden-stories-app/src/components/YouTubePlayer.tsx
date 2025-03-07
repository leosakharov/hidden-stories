import React, { useRef } from 'react';

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
  /** Whether to automatically play the video when component mounts */
  autoPlay?: boolean;
  /** Volume level (0-100) */
  volume?: number;
}

/**
 * Component that embeds a YouTube video player with audio-only option
 */
const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ 
  videoId, 
  autoPlay = false,
  volume = 30 // Default to 30% volume (lower than default)
}) => {
  const playerRef = useRef<HTMLIFrameElement>(null);

  // If no video ID is provided, show a nicer message
  if (!videoId) {
    return (
      <div className="mt-3 p-3 bg-dark bg-opacity-75 border border-secondary rounded shadow-lg text-center">
        <div className="d-flex flex-column align-items-center">
          <i className="bi bi-music-note-slash fs-3 text-secondary mb-2"></i>
          <p className="text-white mb-0">Music will play here when available</p>
          <small className="text-muted">Background music enhances your story experience</small>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-0">
      <div className="overflow-hidden border border-secondary rounded shadow-lg">
        <div className="position-relative">
          {/* YouTube iframe - full size video */}
          <iframe
            ref={playerRef}
            title="YouTube Player"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&mute=0&enablejsapi=1&controls=1&iv_load_policy=3&rel=0&origin=${encodeURIComponent(window.location.origin)}`}
            width="100%"
            height="315"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="border-0"
            id="youtube-player"
          ></iframe>
          
          {/* Script to control YouTube player volume */}
          <script dangerouslySetInnerHTML={{
            __html: `
              // Create YouTube player API callback
              var tag = document.createElement('script');
              tag.src = "https://www.youtube.com/iframe_api";
              var firstScriptTag = document.getElementsByTagName('script')[0];
              firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
              
              var player;
              function onYouTubeIframeAPIReady() {
                // Check if player already exists to avoid re-initialization
                if (!player) {
                  console.log('Initializing YouTube player');
                  player = new YT.Player('youtube-player', {
                    events: {
                      'onReady': onPlayerReady,
                      'onStateChange': onPlayerStateChange
                    }
                  });
                } else {
                  console.log('YouTube player already initialized');
                  // If player exists but onPlayerReady wasn't called, call it manually
                  if (window.onYouTubePlayerReady && player.getPlayerState) {
                    window.onYouTubePlayerReady(player);
                  }
                }
              }
              
              function onPlayerReady(event) {
                // Set volume (0-100)
                event.target.setVolume(${volume});
                ${autoPlay ? 'event.target.playVideo();' : ''}
                
                // Expose player to parent component via global callback
                if (window.onYouTubePlayerReady) {
                  console.log('YouTube player ready, exposing to parent');
                  window.onYouTubePlayerReady(event.target);
                  
                  // Store player in window for emergency access
                  window.youtubePlayer = event.target;
                } else {
                  console.log('YouTube player ready, but no parent callback available');
                  // Still store player in window for emergency access
                  window.youtubePlayer = event.target;
                }
              }
              
              function onPlayerStateChange(event) {
                console.log('YouTube player state changed:', event.data);
                // YT.PlayerState.PLAYING = 1, YT.PlayerState.PAUSED = 2
                // This helps with debugging player state
              }
            `
          }} />
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayer;
