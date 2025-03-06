# EchoGo: AI-Driven Music & Story Explorer

EchoGo is a React application that combines AI-generated stories with music curation to create a unique location-based experience. The app allows users to select a location on a map, then uses AI to generate a story about that location, and finally curates music from YouTube that matches the theme of the story.

## Features

- **Location Selection**: Users can select any location on Google Maps
- **AI-Generated Stories**: The app uses OpenAI's GPT to generate interesting historical or cultural stories about the selected location
- **Music Theme Generation**: AI analyzes the story to determine the most appropriate music genre
- **YouTube Integration**: The app searches for and plays relevant music from YouTube based on the determined theme
- **Text-to-Speech**: The AI-generated story can be read aloud using the browser's speech synthesis capabilities
- **Audio-Only Mode**: The YouTube player can be toggled between video and audio-only modes

## Project Structure

The project follows a feature-based organization pattern:

```
echogo-app/
├── public/                  # Static assets
└── src/
    ├── api/                 # API integration
    │   ├── fetchMusic.ts    # Music API calls
    │   └── fetchStories.ts  # Story generation API calls
    ├── assets/              # Static assets for the app
    ├── components/          # React components
    │   ├── ui/              # Generic UI components
    │   └── features/        # Feature-specific components
    │       ├── map/         # Map-related components
    │       ├── story/       # Story-related components
    │       └── music/       # Music-related components
    ├── constants/           # Application constants
    │   └── mapStyles.ts     # Google Maps styling
    ├── hooks/               # Custom React hooks
    │   └── useGeolocation.ts # Geolocation hook
    ├── utils/               # Utility functions
    │   └── geocoding.ts     # Geocoding utilities
    ├── types/               # TypeScript type definitions
    ├── styles/              # Component-specific styles
    ├── App.tsx              # Main App component
    ├── index.css            # Global styles
    └── main.tsx             # Entry point
```

## Prerequisites

Before running the application, you'll need:

1. **Google Maps API Key**: For the map functionality
2. **OpenAI API Key**: For generating stories and determining music themes
3. **YouTube API Key**: For searching and fetching music videos

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_YOUTUBE_API_KEY=your_youtube_api_key
   ```

## Running the Application

To start the development server:

```
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## How It Works

1. **User Selects a Location**: The user clicks on a location on the Google Map
2. **Story Generation**: The app converts the latitude and longitude to a city name, then uses OpenAI's GPT to generate a story about that location
3. **Music Theme Determination**: The app uses OpenAI's GPT to analyze the story and determine the most appropriate music genre
4. **Music Search**: The app searches YouTube for a video that matches the theme
5. **Presentation**: The app displays the story with text-to-speech option and embeds the YouTube video with an audio-only toggle option

## Code Organization

### Components

Components are organized by feature:

- **Map Components**: Handle location selection and display
- **Story Components**: Display and read stories
- **Music Components**: Play music from YouTube

### Custom Hooks

- **useGeolocation**: Manages browser geolocation API interactions

### Utilities

- **geocoding.ts**: Handles conversion between coordinates and addresses

### Constants

- **mapStyles.ts**: Contains styling for Google Maps

## Technologies Used

- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Vite**: Build tool
- **Google Maps API**: Map functionality
- **OpenAI API**: Story and theme generation
- **YouTube Data API**: Music search and playback
- **Web Speech API**: Text-to-speech functionality

## Future Enhancements

- Add user accounts to save favorite locations and stories
- Implement more sophisticated music selection based on story sentiment analysis
- Add support for multiple languages
- Enhance the map with markers for popular or interesting locations
- Add playlist support for continuous music playback
- Implement caching to reduce API calls
