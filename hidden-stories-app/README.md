# Hidden Stories

Hidden Stories is a location-based storytelling application that generates stories and music based on your selected location. It uses AI to create unique experiences for each place you choose.

## Features

- Interactive map selection
- AI-generated stories based on location
- Themed music selection via YouTube
- Text-to-speech using ElevenLabs API

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   cd hidden-stories-app
   npm install
   ```
3. Set up environment variables by creating a `.env` file in the root directory with the following:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_YOUTUBE_API_KEY=your_youtube_api_key
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## ElevenLabs Text-to-Speech Integration

The application uses ElevenLabs for high-quality text-to-speech. To use this feature:

1. Sign up for an account at [ElevenLabs](https://elevenlabs.io/)
2. Get your API key from the ElevenLabs dashboard
3. Add your API key to the `.env` file as `VITE_ELEVENLABS_API_KEY`

### Default Configuration

- The application uses the "Rachel" voice by default (voice ID: 21m00Tcm4TlvDq8ikWAM)
- The default model is "eleven_monolingual_v1"

### Voice Selection

The application includes a voice selector component that allows users to choose from available ElevenLabs voices. The voice selector:

- Automatically fetches available voices from your ElevenLabs account
- Allows switching between different voices
- Remembers the selected voice during the session

### Advanced Customization

For developers who want to customize the text-to-speech functionality further:

```typescript
// Use a specific voice and model
const audioBlob = await textToSpeech(story, {
  voiceId: 'your_preferred_voice_id',
  modelId: 'your_preferred_model_id',
  voice_settings: {
    stability: 0.5,
    similarity_boost: 0.75
  }
});
```

The application includes utility functions in `elevenlabsUtils.ts` to help with voice management:

- `getAllVoices()`: Get all available voices from your ElevenLabs account
- `getVoiceById(id)`: Find a specific voice by ID
- `getVoiceByName(name)`: Find a specific voice by name
- `popularVoices`: An object containing IDs of popular ElevenLabs voices

## Technologies Used

- React
- TypeScript
- Vite
- Google Maps API
- OpenAI API
- YouTube API
- ElevenLabs API
- Tailwind CSS
- Bootstrap

## License

MIT
