# Hidden Stories

A location-based storytelling application that generates stories and music based on the selected location, powered by AI.

## Features

- Interactive map for location selection
- AI-generated stories based on the selected location
- Background music that matches the story's theme
- Text-to-speech narration of the stories
- Responsive design for various screen sizes

## Technologies Used

- React 19
- TypeScript
- Vite
- Google Maps API
- OpenAI API
- ElevenLabs API (for text-to-speech)
- YouTube API (for music)
- Bootstrap for styling

## Deployment to GitHub Pages

This application is configured to be deployed to GitHub Pages. There are two ways to deploy it:

### Method 1: Using gh-pages package (deploys to gh-pages branch)

1. Make sure you have the gh-pages package installed:
   ```
   npm install --save-dev gh-pages
   ```

2. Build and deploy the application:
   ```
   npm run deploy
   ```

3. Configure GitHub Pages in the repository settings:
   - Go to your GitHub repository
   - Navigate to Settings > Pages
   - Under "Source", select "Deploy from a branch"
   - Under "Branch", select "gh-pages" and "/ (root)"
   - Click "Save"

### Method 2: Deploying to the root of the repository (main branch)

This method is useful for GitHub user sites (username.github.io) where the content must be in the root of the repository.

1. Run the deploy-to-root.js script from the root of the repository:
   ```
   node deploy-to-root.js
   ```

   This script will:
   - Build the application
   - Copy the built files to the root of the repository
   - Commit and push the changes to the main branch

2. Configure GitHub Pages in the repository settings:
   - Go to your GitHub repository
   - Navigate to Settings > Pages
   - Under "Source", select "Deploy from a branch"
   - Under "Branch", select "main" and "/ (root)"
   - Click "Save"

Your site should be available at: https://leosakharov.github.io/

## Local Development

1. Clone the repository:
   ```
   git clone https://github.com/leosakharov/Hidden-Stories.git
   cd Hidden-Stories/hidden-stories-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your API keys:
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

5. Open your browser and navigate to `http://localhost:5173`

## Building for Production

To build the application for production:

```
npm run build
```

The built files will be in the `dist` directory.

## License

This project is licensed under the MIT License.
