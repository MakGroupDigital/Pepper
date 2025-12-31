import { GoogleGenAI, Type } from "@google/genai";

// Lazy initialization - only create client when needed and if API key exists
let aiClient: GoogleGenAI | null = null;

const getAIClient = (): GoogleGenAI | null => {
  if (aiClient) return aiClient;
  
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    console.warn('🌶️ Gemini API key not configured - AI features will use mock data');
    return null;
  }
  
  try {
    aiClient = new GoogleGenAI({ apiKey });
    return aiClient;
  } catch (error) {
    console.error('Failed to initialize Gemini:', error);
    return null;
  }
};

// Mock data for demo mode
const MOCK_CHALLENGES = [
  {
    title: "🔥 Spice Flip Challenge",
    description: "Filme-toi en train de faire un flip (ou tente!) puis ajoute un filtre épicé. Tag 3 amis pour qu'ils relèvent le défi!",
    suggestedMusic: "Hot Girl Summer - Megan Thee Stallion"
  },
  {
    title: "🌶️ Pepper Dance Off",
    description: "Crée ta propre chorégraphie sur le beat drop. Plus c'est épicé, mieux c'est!",
    suggestedMusic: "Unholy - Sam Smith ft. Kim Petras"
  },
  {
    title: "⚡ Glow Up en 5 sec",
    description: "Montre ta transformation la plus rapide. Du réveil au mode soirée en un claquement de doigts!",
    suggestedMusic: "About Damn Time - Lizzo"
  },
  {
    title: "🎭 Mood Switch",
    description: "Passe d'une émotion à l'autre au rythme de la musique. Surprends tout le monde!",
    suggestedMusic: "As It Was - Harry Styles"
  }
];

const MOCK_CAPTIONS = [
  "Cette énergie est UNMATCHED fr fr 🌶️🔥 #peperr #vibes #hot",
  "On est pas prêts pour ce level 💯✨ #spicy #trending #fire",
  "Le mood quand t'es dans ta zone 🎯🌶️ #peperr #goals #lit",
  "Personne peut nous arrêter maintenant 🚀🔥 #unstoppable #vibes #hot"
];

export const generateSpicyCaption = async (topic: string): Promise<string> => {
  const client = getAIClient();
  
  if (!client) {
    // Return mock caption in demo mode
    const randomCaption = MOCK_CAPTIONS[Math.floor(Math.random() * MOCK_CAPTIONS.length)];
    return randomCaption;
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Generate a short, viral, spicy social media caption for a video about: ${topic}. Include 3 trending hashtags and emojis. Make it feel like modern Gen-Z / Street slang. Keep it under 20 words.`,
      config: {
        temperature: 0.9,
      }
    });
    return response.text || "Vibes are through the roof! 🌶️✨";
  } catch (error) {
    console.error("Gemini Error:", error);
    return MOCK_CAPTIONS[Math.floor(Math.random() * MOCK_CAPTIONS.length)];
  }
};

export const getSpicyChallengeIdea = async () => {
  const client = getAIClient();
  
  if (!client) {
    // Return mock challenge in demo mode
    const randomChallenge = MOCK_CHALLENGES[Math.floor(Math.random() * MOCK_CHALLENGES.length)];
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return randomChallenge;
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: "Suggest a creative 'Spicy Challenge' for a short-form video app called Peperr. It should be fun, interactive, and high-energy. Respond in French.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            suggestedMusic: { type: Type.STRING }
          },
          required: ["title", "description", "suggestedMusic"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback to mock data on error
    return MOCK_CHALLENGES[Math.floor(Math.random() * MOCK_CHALLENGES.length)];
  }
};
