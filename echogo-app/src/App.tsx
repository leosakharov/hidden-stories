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
    <div className="min-h-screen bg-zinc-900 text-zinc-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-light text-zinc-100 mb-2 tracking-tight">
            EchoGo
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm font-mono">
            location-based stories and music // powered by AI
          </p>
        </header>

        {/* Location Section */}
        <div className="bg-zinc-800 border border-zinc-700 rounded mb-8">
          <div className="p-3 border-b border-zinc-700 text-center">
            <h2 className="text-sm font-mono text-zinc-300 uppercase tracking-wider">Location</h2>
          </div>
          <div className="p-4">
            <MapSelector onLocationSelect={handleLocationSelect} />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-zinc-800 border border-zinc-700 rounded mb-8 p-8 text-center">
            <div className="animate-pulse h-4 w-32 bg-zinc-700 mx-auto mb-4"></div>
            <p className="text-zinc-400 text-sm font-mono">processing...</p>
          </div>
        )}

        {/* Story Section */}
        {story && !isLoading && (
          <div className="bg-zinc-800 border border-zinc-700 rounded mb-8">
            <div className="p-3 border-b border-zinc-700 text-center">
              <h2 className="text-sm font-mono text-zinc-300 uppercase tracking-wider">Story</h2>
            </div>
            <div className="p-6 text-center">
              <p className="text-zinc-300 font-light mb-4">{story}</p>
              <StoryReader story={story} />
            </div>
          </div>
        )}

        {/* Music Section */}
        {music && music.videoId && !isLoading && (
          <div className="bg-zinc-800 border border-zinc-700 rounded mb-8">
            <div className="p-3 border-b border-zinc-700 text-center">
              <h2 className="text-sm font-mono text-zinc-300 uppercase tracking-wider">Music</h2>
            </div>
            <div className="p-6 text-center">
              <YouTubePlayer videoId={music.videoId} theme={music.theme} />
              {music.searchQuery && (
                <p className="text-xs text-zinc-500 mt-2 font-mono">
                  query: {music.searchQuery}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-zinc-600 text-xs mt-12 font-mono">
          <p>
            AI-driven location-based experience
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
