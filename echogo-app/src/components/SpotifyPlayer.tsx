import React from 'react';

interface SpotifyPlayerProps {
  playlistUri: string | null;
  theme: string;
}

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ playlistUri, theme }) => {
  if (!playlistUri) {
    return (
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No music found for theme: {theme || 'Unknown'}</p>
      </div>
    );
  }

  // Extract the playlist ID from the URI
  // Spotify URI format: spotify:playlist:37i9dQZF1DX4sWSpwq3LiO
  const playlistId = playlistUri.split(':').pop();

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">🎵 Music Theme: {theme}</h2>
      <div className="rounded-lg overflow-hidden shadow-lg">
        <iframe
          title="Spotify Player"
          src={`https://open.spotify.com/embed/playlist/${playlistId}`}
          width="100%"
          height="352"
          frameBorder="0"
          allow="encrypted-media"
          className="border-0"
        ></iframe>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Music selected based on the story's theme and mood.
      </p>
    </div>
  );
};

export default SpotifyPlayer;
