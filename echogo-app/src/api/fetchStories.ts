import axios from "axios";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "your_openai_api_key_here";

export const fetchLocalStory = async (lat: number, lng: number, address?: string) => {
  try {
    console.log("OpenAI API Key:", OPENAI_API_KEY ? "Exists" : "Missing");
    console.log("Fetching local story for coordinates:", lat, lng);
    console.log("Using OpenAI API key:", OPENAI_API_KEY.substring(0, 10) + "...");
    
    // If address is not provided, convert lat/lng to location name (using OpenStreetMap API)
    let locationName = address;
    if (!locationName) {
      const locationResponse = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      console.log("Location response:", locationResponse.data);
      
      const city = locationResponse.data.address.city || 
                   locationResponse.data.address.town || 
                   locationResponse.data.address.village || 
                   "this location";
      
      locationName = city;
      console.log("Detected location:", locationName);
    } else {
      console.log("Using provided address:", locationName);
    }
    
    // Comment out mock story
    // console.log("Using mock story for testing");
    // return `New York City's iconic Times Square was originally called Longacre Square until 1904 when The New York Times moved its headquarters there. The city's first subway line opened that same year, with a station at 42nd Street. Today, despite its name, Times Square is actually shaped more like a bowtie, formed by the intersection of Broadway and Seventh Avenue.`;
    
    // Use the OpenAI API to get a real story
    console.log("Using OpenAI API to get a story");
    const openAIResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert storyteller with internet access who provides up-to-date historical, cultural, and current stories about specific locations in a fun and engaging way. Use your knowledge of recent events, local businesses, and points of interest to provide the most current and accurate information possible. When appropriate, mention specific sources where more information could be found (like local news sites, Wikipedia, or official websites).",
          },
          {
            role: "user",
            content: `Tell me an interesting, little-known, or funny historical fact about this specific address: "${address || locationName}". Focus on very local landmarks, buildings, events, or stories that happened at this exact spot or within a 200m radius. Use your internet access to find the most up-to-date and accurate information about this specific location. Include recent events or changes if relevant. Make it engaging and not too long (max 3 sentences).`,
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
    
    console.log("OpenAI response:", openAIResponse.data);
    return openAIResponse.data.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching local story:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data || error.message);
    }
    return "No interesting facts found at this location.";
  }
};
