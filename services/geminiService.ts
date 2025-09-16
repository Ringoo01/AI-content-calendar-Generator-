import { GoogleGenAI, Type } from "@google/genai";
import type { FormData, CalendarData, BrandIdentitySuggestion } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const calendarResponseSchema = {
    type: Type.OBJECT,
    properties: {
        calendar: {
            type: Type.ARRAY,
            description: "List of daily content plans for the entire month.",
            items: {
                type: Type.OBJECT,
                properties: {
                    date: { type: Type.STRING, description: "The date for the post, e.g., 'October 1', 'October 25'." },
                    posts: {
                        type: Type.ARRAY,
                        description: "A list of posts for this date. A single day can have multiple posts for different platforms.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                platform: { type: Type.STRING, description: "The social media platform, e.g., 'Instagram'." },
                                theme: { type: Type.STRING, description: "The content theme, e.g., 'Promotional'." },
                                idea: { type: Type.STRING, description: "The post idea or concept." },
                                caption: { type: Type.STRING, description: "A draft of the caption for the post, including a call to action where appropriate." },
                                hashtags: { type: Type.STRING, description: "A string of relevant hashtags, separated by spaces (e.g., #brand #niche #topic)." },
                                visual: { type: Type.STRING, description: "A description of the suggested visual/media type (e.g., 'Image of product', 'Short video')." }
                            },
                            required: ["platform", "theme", "idea", "caption", "hashtags", "visual"]
                        }
                    }
                },
                required: ["date", "posts"]
            }
        }
    },
    required: ["calendar"]
};

const suggestionResponseSchema = {
    type: Type.OBJECT,
    properties: {
        brandName: { type: Type.STRING, description: "A creative and fitting brand name." },
        targetAudience: { type: Type.STRING, description: "A concise description of the primary target audience." },
        tone: { type: Type.STRING, description: "The suggested tone of voice for communications." }
    },
    required: ["brandName", "targetAudience", "tone"]
};


const buildPrompt = (data: FormData): string => {
  const platformDetails = data.platforms
    .filter(p => p.name && p.considerations)
    .map(p => `${p.name}: "${p.considerations}"`)
    .join('\n');

  const imageContext = data.brandImage
    ? "An image has been provided to represent the brand's visual identity and personality. Use it as a key reference for the tone, style, and subject matter of the content."
    : "";

  return `
    You are an expert social media manager. Your task is to generate a complete and detailed social media content calendar for the brand "${data.brandName}" for the entire month of "${data.month}".

    **Critical Instructions:**
    1.  **Complete Calendar:** The output MUST cover every single day of the month of "${data.month}". From day 1 to the last day of the month. Do not omit any days.
    2.  **Post Frequency:** Generate content based on this frequency: "${data.postFrequency}". This means some days might have multiple posts across different platforms, while others might have none, depending on the strategy.
    3.  **JSON Structure:** The final output must be a single JSON object with a key "calendar". The value of "calendar" must be an array of objects, where each object represents a day.

    **Brand & Content Details:**

    ${imageContext}

    - Brand: "${data.brandName}"
    - Month: "${data.month}"
    - Target Audience: "${data.targetAudience}"
    - Tone of Voice: "${data.tone}"

    **Content Themes to incorporate:**
    - Promotional: "${data.promotionalTheme}"
    - Educational: "${data.educationalTheme}"
    - Entertaining: "${data.entertainingTheme}"
    - Engagement-focused: "${data.engagementTheme}"
    - Community Building: "${data.communityTheme}"

    **Platforms & Specifics:**
    ${platformDetails}

    **Key Dates/Campaigns:**
    "${data.keyDates}"

    **Output Format Example for a single day with multiple posts:**
    {
      "date": "${data.month} 1",
      "posts": [
        {
          "platform": "Instagram",
          "theme": "Educational",
          "idea": "A carousel post explaining 3 ways to style our new scarf.",
          "caption": "New scarf, endless possibilities! ✨ Which style is your favorite? 1, 2, or 3? Let us know below! #StyleGuide #ScarfSeason #HowToStyle",
          "hashtags": "#styleguide #scarfseason #howtostyle #fashiontips",
          "visual": "A 3-slide carousel image with high-quality graphics and product photos showing each style."
        },
        {
          "platform": "TikTok",
          "theme": "Entertaining",
          "idea": "A quick transition video showing the scarf with 5 different outfits in 10 seconds.",
          "caption": "5 looks, 1 scarf, 0 time wasted. Which one are you rocking this weekend? 🍂 #ScarfChallenge #OOTD #FallFashion",
          "hashtags": "#fashionhacks #outfitinspo #tiktokfashion #transitionvideo",
          "visual": "A short, fast-paced video set to a trending audio track, featuring quick cuts and outfit transitions."
        }
      ]
    }
    
    For days with no posts scheduled, the 'posts' array should be empty. It is crucial that these days are still included in the final 'calendar' array to ensure the month is complete.
  `;
};

export const generateCalendar = async (data: FormData): Promise<CalendarData | string> => {
  try {
    const prompt = buildPrompt(data);
    
    const textPart = { text: prompt };
    // FIX: Explicitly type `parts` to allow both text and image parts. This prevents a
    // TypeScript error when adding the image part to the array, which would
    // otherwise be inferred as containing only text parts.
    const parts: ({ text: string; } | { inlineData: { mimeType: string; data: string; }; })[] = [textPart];

    if (data.brandImage) {
        const imagePart = {
          inlineData: {
            mimeType: data.brandImage.mimeType,
            data: data.brandImage.data,
          },
        };
        // Put image part first for better context
        parts.unshift(imagePart);
    }
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: calendarResponseSchema,
        },
    });
    
    const text = response.text.trim();
    // Sometimes the model might wrap the JSON in markdown backticks
    const sanitizedText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    
    const jsonData = JSON.parse(sanitizedText);
    
    // Basic validation
    if (jsonData && Array.isArray(jsonData.calendar)) {
        return jsonData as CalendarData;
    } else {
        throw new Error("Invalid JSON structure received from the API.");
    }

  } catch (error) {
    console.error("Error generating content:", error);
    if (error instanceof Error) {
        return `An error occurred while generating the calendar: ${error.message}. Please check the console for more details.`;
    }
    return "An unknown error occurred while generating the calendar.";
  }
};

export const generateBrandIdentitySuggestions = async (description: string): Promise<BrandIdentitySuggestion | string> => {
    try {
        const prompt = `
            Act as an expert brand strategist. Based on the following business description, generate a creative brand name, a clear target audience description, and a suitable brand tone.
            
            Business Description: "${description}"

            Provide a single, concise suggestion for each field.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestionResponseSchema,
            },
        });
        
        const text = response.text.trim();
        const sanitizedText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        const jsonData = JSON.parse(sanitizedText);
        
        if (jsonData && jsonData.brandName && jsonData.targetAudience && jsonData.tone) {
            return jsonData as BrandIdentitySuggestion;
        } else {
            throw new Error("Invalid JSON structure received for brand suggestions.");
        }

    } catch (error) {
        console.error("Error generating brand suggestions:", error);
        if (error instanceof Error) {
            return `An error occurred while generating suggestions: ${error.message}.`;
        }
        return "An unknown error occurred while generating suggestions.";
    }
};


export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A high-quality, professional social media post image for: "${prompt}"`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("Image generation was successful but returned no images.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate image: ${error.message}`);
        }
        throw new Error("An unknown error occurred during image generation.");
    }
};

export const startVideoGeneration = async (prompt: string): Promise<any> => {
    try {
        const operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: `short, engaging social media video with upbeat music and text overlays about: "${prompt}"`,
            config: {
                numberOfVideos: 1
            }
        });
        return operation;
    } catch (error) {
        console.error("Error starting video generation:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to start video generation: ${error.message}`);
        }
        throw new Error("An unknown error occurred while starting video generation.");
    }
};

export const getVideoOperationStatus = async (operation: any): Promise<any> => {
    try {
        const status = await ai.operations.getVideosOperation({ operation: operation });
        return status;
    } catch (error) {
        console.error("Error getting video operation status:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to check video status: ${error.message}`);
        }
        throw new Error("An unknown error occurred while checking video status.");
    }
};


export const fetchVideo = async (downloadLink: string): Promise<Blob> => {
    if (!process.env.API_KEY) {
        throw new Error("API key not available for fetching video.");
    }
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
    }
    return response.blob();
};