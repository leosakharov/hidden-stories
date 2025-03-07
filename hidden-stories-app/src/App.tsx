import React, { useState } from "react";
// API imports
import { fetchLocalStory } from "./api/fetchStories";
import { fetchMusicForStory } from "./api/fetchMusic";
// Component imports
import MapSelector from "./components/MapSelector";
import StoryReader from "./components/StoryReader";
import YouTubePlayer from "./components/YouTubePlayer";

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
    } catch (error) {
      console.error("Error in story generation flow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container min-vh-100 bg-dark text-light p-4">
      <div className="mx-auto" style={{ maxWidth: '1024px' }}>
        {/* Header */}
        <header className="mb-5 text-center">
          <h1 className="display-4 mb-2">Hidden Stories</h1>
          <p className="text-muted">location-based stories and music // powered by AI</p>
        </header>

        {/* Location Section */}
        <div className="card bg-secondary mb-5">
          <div className="card-header text-center">
            <h2 className="h5">Location</h2>
          </div>
          <div className="card-body">
            <MapSelector onLocationSelect={handleLocationSelect} />
          </div>
        </div>

        {/* Generate Story Button */}
        {selectedLocation && !isLoading && (
          <div className="text-center mb-5">
            <button 
              className="btn btn-primary btn-lg" 
              onClick={handleGenerateStory}
            >
              Generate Story
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="card bg-secondary mb-5 text-center p-5">
            <div className="spinner-border text-light mb-4" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">processing...</p>
          </div>
        )}

        {/* Story Section */}
        {story && !isLoading && (
          <div className="card bg-secondary mb-5">
            <div className="card-header text-center">
              <h2 className="h5">Story</h2>
            </div>
            <div className="card-body text-center">
              <p className="mb-4">{story}</p>
              <StoryReader story={story} />
            </div>
          </div>
        )}

        {/* Music Section */}
        {music && music.videoId && !isLoading && (
          <div className="card bg-secondary mb-5">
            <div className="card-header text-center">
              <h2 className="h5">Music</h2>
            </div>
            <div className="card-body text-center">
              <YouTubePlayer 
                videoId={music.videoId} 
                searchQuery={music.searchQuery}
                videoTitle={music.videoTitle}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-muted mt-5">
          <p>AI-driven location-based experience</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
