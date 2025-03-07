import React, { useState, useEffect, useRef } from "react";
// API imports
import { fetchLocalStory } from "./api/fetchStories";
import { fetchMusicForStory } from "./api/fetchMusic";
// Component imports
import MapSelector from "./components/MapSelector";
import StoryReader, { StoryReaderHandle } from "./components/StoryReader";
import YouTubePlayer from "./components/YouTubePlayer";

// Extend Window interface to include our custom properties
declare global {
  interface Window {
    onYouTubePlayerReady?: (player: any) => void;
    youtubePlayer?: any;
    YT?: any;
  }
}

const App: React.FC = () => {
  const [story, setStory] = useState<string | null>(null);
  const [music, setMusic] = useState<{ 
    searchQuery: string | null;
    videoId: string | null;
    videoUrl: string | null;
    videoTitle?: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address?: string;
  } | null>(null);
  const [autoPlayMusic, setAutoPlayMusic] = useState<boolean>(false);
  const [autoPlayStory, setAutoPlayStory] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Reference to the YouTube player API
  const youtubePlayerRef = useRef<any>(null);

  // Store the selected location without generating a story
  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setSelectedLocation({ lat, lng, address });
    // Clear any existing story and music when location changes
    setStory(null);
    setMusic(null);
  };

  // Generate story and music based on the selected location
  const handleGenerateStory = async () => {
    if (!selectedLocation) return;
    
    setIsLoading(true);
    setStory(null);
    setMusic(null);
    setAutoPlayMusic(false);
    setAutoPlayStory(false);

    try {
      // Step 1: Fetch local story based on location and address
      const localStory = await fetchLocalStory(
        selectedLocation.lat, 
        selectedLocation.lng, 
        selectedLocation.address
      );
      setStory(localStory);

      // Step 2: Find music based on story
      const musicResponse = await fetchMusicForStory(localStory);
      setMusic(musicResponse);
      
      // Step 3: Set autoplay flags to trigger the sequence
      // First start the music
      setAutoPlayMusic(true);
      
      // Then after a short delay, start the story narration
      setTimeout(() => {
        setAutoPlayStory(true);
      }, 2000); // 2 second delay before starting the voice
      
    } catch (error) {
      console.error("Error in story generation flow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // State for showing/hiding story text - hidden by default
  const [showStoryText, setShowStoryText] = useState(false);
  
  // State for showing/hiding music - shown by default when available
  const [showMusic, setShowMusic] = useState(true);
  
  // Reference to the YouTube player component
  const youtubeRef = useRef<HTMLDivElement>(null);
  
  // Auto-play text-to-speech when story is generated
  useEffect(() => {
    if (autoPlayStory && story && !isLoading) {
      // The StoryReader component will handle auto-play with the autoPlay prop
      setIsPlaying(true);
    }
  }, [autoPlayStory, story, isLoading]);
  
  // Track if stop was recently pressed to prevent auto-restart
  const stopButtonPressed = useRef(false);
  
  // Reference to the StoryReader component methods
  const storyReaderRef = useRef<StoryReaderHandle | null>(null);
  
  // Function to handle play/pause for both voice and music
  const handlePlayPause = async () => {
    console.log("Play/Pause button clicked, current state:", isPlaying ? "playing" : "paused");
    
    if (isPlaying) {
      // Pause voice
      if (storyReaderRef.current) {
        console.log("Pausing voice via StoryReader");
        storyReaderRef.current.handlePause();
      } else {
        console.log("StoryReader ref not available for pause");
      }
      
      // Try to get YouTube player from different sources
      const player = youtubePlayerRef.current || (window as any).youtubePlayer;
      
      // Pause YouTube video if available
      if (player) {
        try {
          console.log("Attempting to pause YouTube video");
          player.pauseVideo();
          console.log("YouTube video paused successfully");
        } catch (error) {
          console.error("Error pausing YouTube video:", error);
        }
      } else {
        console.log("YouTube player ref not available for pause");
        
        // Try to find the YouTube iframe directly
        const iframe = document.getElementById('youtube-player') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          try {
            console.log("Attempting to pause YouTube video via iframe postMessage");
            iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          } catch (error) {
            console.error("Error pausing YouTube video via iframe:", error);
          }
        }
      }
      
      setIsPlaying(false);
    } else {
      // Resume or start voice
      if (storyReaderRef.current) {
        console.log("Starting/resuming voice via StoryReader");
        if (storyReaderRef.current.audioUrl) {
          await storyReaderRef.current.handleResume();
        } else {
          await storyReaderRef.current.handlePlay();
        }
      } else {
        console.log("StoryReader ref not available for play");
      }
      
      // Try to get YouTube player from different sources
      const player = youtubePlayerRef.current || (window as any).youtubePlayer;
      
      // Play YouTube video if available
      if (player) {
        try {
          console.log("Attempting to play YouTube video");
          player.playVideo();
          console.log("YouTube video playing successfully");
        } catch (error) {
          console.error("Error playing YouTube video:", error);
        }
      } else {
        console.log("YouTube player ref not available for play");
        
        // Try to find the YouTube iframe directly
        const iframe = document.getElementById('youtube-player') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          try {
            console.log("Attempting to play YouTube video via iframe postMessage");
            iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          } catch (error) {
            console.error("Error playing YouTube video via iframe:", error);
          }
        }
      }
      
      setIsPlaying(true);
    }
  };
  
  // Function to completely stop playback and reset
  const handleStop = () => {
    console.log("Stop button clicked");
    
    // Mark that stop was pressed to prevent auto-restart (both local and global)
    stopButtonPressed.current = true;
    (window as any).stopButtonPressed = true;
    
    // Stop voice and reset position
    if (storyReaderRef.current) {
      console.log("Stopping audio via StoryReader");
      storyReaderRef.current.handleStop();
    } else {
      console.log("StoryReader ref not available");
    }
    
    // Try to get YouTube player from different sources
    const player = youtubePlayerRef.current || (window as any).youtubePlayer;
    
    // Stop YouTube video if available
    if (player) {
      try {
        console.log("Stopping YouTube video via player API");
        // First pause the video
        player.pauseVideo();
        // Then seek to the beginning
        player.seekTo(0, true);
        console.log("YouTube video reset to beginning");
      } catch (error) {
        console.error("Error stopping YouTube video:", error);
      }
    } else {
      console.log("YouTube player ref not available, trying iframe postMessage");
      
      // Try to find the YouTube iframe directly
      const iframe = document.getElementById('youtube-player') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        try {
          console.log("Attempting to stop YouTube video via iframe postMessage");
          // First pause the video
          iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          // Then seek to the beginning
          iframe.contentWindow.postMessage('{"event":"command","func":"seekTo","args":[0, true]}', '*');
          console.log("YouTube video commands sent via postMessage");
        } catch (error) {
          console.error("Error stopping YouTube video via iframe:", error);
        }
      }
    }
    
    setIsPlaying(false);
    
    // Reset the stop button flags after a short delay
    setTimeout(() => {
      stopButtonPressed.current = false;
      (window as any).stopButtonPressed = false;
    }, 1000);
  };
  
  // Listen for YouTube player ready event
  useEffect(() => {
    // Create a global callback for the YouTube API
    window.onYouTubePlayerReady = (player: any) => {
      console.log("YouTube player reference received in App component");
      youtubePlayerRef.current = player;
    };
    
    return () => {
      // Clean up
      delete window.onYouTubePlayerReady;
    };
  }, []);
  
  // Debug YouTube player reference
  useEffect(() => {
    if (music?.videoId && showMusic) {
      // Check if YouTube player reference is available after a short delay
      const checkYouTubeRef = setTimeout(() => {
        if (youtubePlayerRef.current) {
          console.log("YouTube player reference is available");
        } else {
          console.log("YouTube player reference is still not available");
          
          // If YouTube API is loaded but our reference is missing, try to get it
          if (window.YT && window.YT.Player) {
            try {
              const player = new window.YT.Player('youtube-player');
              if (player) {
                console.log("Retrieved YouTube player reference manually");
                youtubePlayerRef.current = player;
              }
            } catch (error) {
              console.error("Error retrieving YouTube player manually:", error);
            }
          }
        }
      }, 3000);
      
      return () => clearTimeout(checkYouTubeRef);
    }
  }, [music?.videoId, showMusic]);
  
  // Listen for story player ended event to update playing state
  useEffect(() => {
    const handleStoryEnded = () => {
      setIsPlaying(false);
    };
    
    window.addEventListener('story-ended', handleStoryEnded);
    
    return () => {
      window.removeEventListener('story-ended', handleStoryEnded);
    };
  }, []);

  return (
    <div className="min-vh-100 bg-dark text-light position-relative h-100">
      {/* Full-screen Map */}
      <div className="position-absolute top-0 start-0 end-0 bottom-0">
        <MapSelector onLocationSelect={handleLocationSelect} />
      </div>
      
      {/* Overlay Content */}
      <div className="position-relative z-1">
        {/* Header */}
        <header className="text-center p-3 bg-dark bg-opacity-90">
          <h1 className="display-4 mb-2 text-white">Hidden Stories</h1>
          <p className="text-white">Location-based stories and music // powered by AI</p>
        </header>

        {/* Center Content Container */}
        <div className="container-fluid p-4">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              {/* Unified Player - Always visible */}
              <div className="text-center mb-4">
                <div className="unified-player bg-dark bg-opacity-90 p-3 rounded-pill shadow-lg border border-secondary" style={{ maxWidth: '500px', margin: '0 auto' }}>
                  <div className="d-flex align-items-center justify-content-between">
                    {/* Left side: Generate Story Button */}
                    <div className="d-flex align-items-center">
                      <button 
                        className="btn btn-primary" 
                        onClick={handleGenerateStory}
                        disabled={!selectedLocation || isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Processing...
                          </>
                        ) : (
                          "Generate Story"
                        )}
                      </button>
                    </div>
                    
                    {/* Middle: Control buttons (play/stop, show/hide music, show/hide text) */}
                    <div className="d-flex align-items-center flex-grow-1 mx-3 justify-content-center">
                      {/* Play/Pause button */}
                      <button
                        className={`btn ${story ? 'btn-outline-primary' : 'btn-outline-secondary'} rounded-circle p-2 mx-1`}
                        disabled={!story}
                        style={{ width: '38px', height: '38px' }}
                        onClick={handlePlayPause}
                      >
                        <i className={`bi bi-${isPlaying ? 'pause-fill' : 'play-fill'}`}></i>
                      </button>
                      
                      {/* Stop button */}
                      <button
                        className="btn btn-outline-danger rounded-circle p-2 mx-1"
                        disabled={!story}
                        style={{ width: '38px', height: '38px' }}
                        onClick={handleStop}
                      >
                        <i className="bi bi-stop-fill"></i>
                      </button>
                      
                      {/* Music visibility toggle */}
                      <button
                        onClick={() => setShowMusic(!showMusic)}
                        className="btn btn-outline-light rounded-circle p-2 mx-1"
                        style={{ width: '38px', height: '38px' }}
                        disabled={!music?.videoId}
                      >
                        <i className={`bi bi-${showMusic ? 'music-note-beamed' : 'music-note'} fs-6`}></i>
                      </button>
                      
                      {/* Text visibility toggle */}
                      <button
                        onClick={() => setShowStoryText(!showStoryText)}
                        className="btn btn-outline-light rounded-circle p-2 mx-1"
                        style={{ width: '38px', height: '38px' }}
                        disabled={!story}
                      >
                        <i className={`bi bi-${showStoryText ? 'eye-slash' : 'eye'} fs-6`}></i>
                      </button>
                    </div>
                    
                    {/* Right side: Voice selector */}
                    <div className="voice-selector">
                      <select
                        className="form-select form-select-sm bg-dark text-white border-secondary"
                        disabled={!story}
                        style={{ width: 'auto', maxWidth: '100px' }}
                      >
                        <option>Rachel</option>
                        <option>Sam</option>
                        <option>Antoni</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Hidden StoryReader for audio playback */}
              <div className="audio-controls" style={{ display: 'none' }}>
                {story && (
                  <StoryReader 
                    story={story} 
                    autoPlay={autoPlayStory}
                    ref={storyReaderRef}
                    key={`story-reader-${Date.now()}`} // Force re-creation on story change
                  />
                )}
              </div>
              
              {/* Content Section */}
              <div className="mb-4">
                {/* Story Text - Only shown when story exists and showStoryText is true */}
                {story && !isLoading && showStoryText && (
                  <div className="card bg-dark bg-opacity-90 border-secondary mb-4 shadow-lg story-text-container">
                    <div className="card-body">
                      <p className="mb-0 text-white text-justify px-3" style={{ fontSize: '0.9rem' }}>{story}</p>
                    </div>
                  </div>
                )}
                
                {/* YouTube Player - Only visible when music is available and showMusic is true */}
                {music?.videoId && showMusic && (
                  <div ref={youtubeRef} className="youtube-container mt-3">
                    <YouTubePlayer 
                      videoId={music.videoId} 
                      searchQuery={music.searchQuery}
                      videoTitle={music.videoTitle}
                      autoPlay={autoPlayMusic}
                      volume={30} // Lower volume for background music
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
