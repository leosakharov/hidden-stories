import axios from "axios";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "your_openai_api_key_here";
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || "your_youtube_api_key_here";

export const fetchMusicForStory = async (story: string) => {
  try {
    console.log("Fetching music for story:", story);

    // Step 1: Generate a theme and an optimized YouTube search query directly from the story
    const openAIResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You create precise YouTube search queries for finding music that fits historical stories.",
          },
          {
            role: "user",
            content: `Create a YouTube search query for music related to this historical story: "${story}".
                      
                      - Consider time period, cultural background, and emotional tone.
                      - If relevant, include keywords such as "folk music", "traditional", "historical music", or specific genres.
                      - Keep the query under 10 words.
                      - Return ONLY the search query, no explanations, no quotation marks.`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const searchQuery = openAIResponse.data.choices[0].message.content.trim();
    console.log("Generated YouTube search query:", searchQuery);

    // Step 2: Fetch YouTube videos based on this query
    const youtubeResponse = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        maxResults: 5, // Fetch multiple results for better selection
        q: searchQuery, // Directly using the AI-generated search query
        type: "video",
        videoCategoryId: "10", // Music category
        videoEmbeddable: true, // Ensure the video can be embedded
        key: YOUTUBE_API_KEY,
      },
    });

    console.log("YouTube response:", youtubeResponse.data);

    // Step 3: Pick the first embeddable video
    const videoItem = youtubeResponse.data.items[0] || null;
    const videoId = videoItem?.id?.videoId || null;
    const videoTitle = videoItem?.snippet?.title || null;

    return {
      searchQuery,
      videoId,
      videoUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null,
      videoTitle,
    };
  } catch (error) {
    console.error("Error fetching music for story:", error);
    return {
      searchQuery: null,
      videoId: null,
      videoUrl: null,
    };
  }
};
