import axios from "axios";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "your_openai_api_key_here";
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || "your_youtube_api_key_here";

export const fetchMusicForStory = async (story: string) => {
  try {
    console.log("Fetching music for story:", story);
    console.log("Using OpenAI API key:", OPENAI_API_KEY.substring(0, 10) + "...");
    console.log("Using YouTube API key:", YOUTUBE_API_KEY.substring(0, 10) + "...");
    
    // Comment out mock response
    // console.log("Using mock music response for testing");
    // 
    // // Mock music theme
    // const musicTheme = "Jazz";
    // console.log("Music theme:", musicTheme);
    // 
    // // Mock search query
    // const searchQuery = "New York City Jazz 1920s";
    // console.log("Search query:", searchQuery);
    // 
    // // Mock video ID (this is a real YouTube video ID for a jazz music video)
    // const videoId = "vmDDOFXSgAs";
    // console.log("Video ID:", videoId);
    // 
    // return {
    //   theme: musicTheme,
    //   searchQuery,
    //   videoId,
    //   videoUrl: `https://www.youtube.com/watch?v=${videoId}`
    // };
    
    // Use the actual APIs
    console.log("Using actual APIs for music recommendation");
    
    // AI determines the mood & theme of the story
    const openAIResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a music curator that suggests music genres based on storytelling themes.",
          },
          {
            role: "user",
            content: `Based on the following historical fact, what is the best music genre to represent it? 
                      Example answer: "Jazz", "Ambient", "Rock", "Classical". Fact: ${story}`,
          },
        ],
      },
      { 
        headers: { 
          Authorization: `Bearer ${OPENAI_API_KEY}`, 
          "Content-Type": "application/json" 
        } 
      }
    );
    
    console.log("OpenAI theme response:", openAIResponse.data);
    const musicTheme = openAIResponse.data.choices[0].message.content.trim();
    console.log("Music theme:", musicTheme);

    // Get a more specific music recommendation based on the theme
    const musicRecommendationResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a music expert who can recommend specific music based on themes and moods.",
          },
          {
            role: "user",
            content: `Recommend a specific search query for YouTube to find a good ${musicTheme} music track that would match this story: "${story}". 
                      Just provide the search query, nothing else. Make it specific enough to find good results but not too long.`,
          },
        ],
      },
      { 
        headers: { 
          Authorization: `Bearer ${OPENAI_API_KEY}`, 
          "Content-Type": "application/json" 
        } 
      }
    );
    
    console.log("OpenAI search query response:", musicRecommendationResponse.data);
    const searchQuery = musicRecommendationResponse.data.choices[0].message.content.trim();
    console.log("Search query:", searchQuery);

    // Fetch a video from YouTube matching this search query
    console.log("Fetching YouTube video for search query:", searchQuery);
    const youtubeResponse = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: { 
        part: "snippet",
        maxResults: 1,
        q: `${searchQuery} music`,
        type: "video",
        videoCategoryId: "10", // Music category
        key: YOUTUBE_API_KEY
      }
    });
    
    console.log("YouTube response:", youtubeResponse.data);
    const videoId = youtubeResponse.data.items[0]?.id.videoId || null;
    console.log("Video ID:", videoId);

    return {
      theme: musicTheme,
      searchQuery,
      videoId,
      videoUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null
    };
  } catch (error) {
    console.error("Error determining music for story:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data || error.message);
    }
    return { 
      theme: "Unknown", 
      searchQuery: null,
      videoId: null,
      videoUrl: null
    };
  }
};
