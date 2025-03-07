import React, { useState } from "react";
// API imports
import { fetchLocalStory } from "./api/fetchStories";
import { fetchMusicForStory } from "./api/fetchMusic";
// Component imports
import MapSelector from "./components/features/map/MapSelector";
import StoryReader from "./components/features/story/StoryReader";
import YouTubePlayer from "./components/features/music/YouTubePlayer";

const App: React.FC = () => {
  const [story, setStory] = useState<string | null>(null);
  const [music, setMusic] = useState<{ 
    theme: string; 
    searchQuery: string | null;
    videoId: string | null;
    videoUrl: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLocationSelect = async (lat: number, lng: number, address?: string) => {
    setIsLoading(true);
    setStory(null);
    setMusic(null);

    try {
      // Step 1: Fetch local story based on location and address
      const localStory = await fetchLocalStory(lat, lng, address);
      setStory(localStory);

      // Step 2: Determine music theme based on story
      const musicResponse = await fetchMusicForStory(localStory);
      setMusic(musicResponse);
    } catch (error) {
      console.error("Error in location selection flow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container min-vh-100 bg-dark text-light p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="display-4 mb-2">Hidden Stories</h1>
          <p className="text-muted">location-based stories and music // powered by AI</p>
        </header>

        {/* Location Section */}
        <div className="card bg-secondary mb-8">
          <div className="card-header text-center">
            <h2 className="h5">Location</h2>
          </div>
          <div className="card-body">
            <MapSelector onLocationSelect={handleLocationSelect} />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="card bg-secondary mb-8 text-center p-8">
            <div className="spinner-border text-light mb-4" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="text-muted">processing...</p>
          </div>
        )}

        {/* Story Section */}
        {story && !isLoading && (
          <div className="card bg-secondary mb-8">
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
          <div className="card bg-secondary mb-8">
            <div className="card-header text-center">
              <h2 className="h5">Music</h2>
            </div>
            <div className="card-body text-center">
              <YouTubePlayer videoId={music.videoId} theme={music.theme} />
              {music.searchQuery && (
                <p className="text-muted mt-2">query: {music.searchQuery}</p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-muted mt-12">
          <p>AI-driven location-based experience</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
