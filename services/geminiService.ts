import { GoogleGenAI, Type } from "@google/genai";
import type { FormData, CalendarData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
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


const buildPrompt = (data: FormData): string => {
  const platformDetails = data.platforms
    .filter(p => p.name && p.considerations)
    .map(p => `${p.name}: "${p.considerations}"`)
    .join('\n');

  return `
    Generate a detailed social media content calendar for "${data.brandName}" for the month of "${data.month}".

    Target Audience: "${data.targetAudience}".

    Content Themes:
    - Promotional: "${data.promotionalTheme}".
    - Educational: "${data.educationalTheme}".
    - Entertaining: "${data.entertainingTheme}".
    - Engagement-focused: "${data.engagementTheme}".
    - Community Building: "${data.communityTheme}".

    Preferred Platforms (and specific content considerations for each):
    ${platformDetails}

    Key Dates/Campaigns to Include:
    "${data.keyDates}"

    For each day of the month, create a JSON object. The 'date' field should be a string like "Month Day" (e.g., "${data.month} 1"). The 'posts' field should be an array of post objects.
    
    The tone should be "${data.tone}".
    
    Ensure every single day of the month of ${data.month} is included in the calendar array, even if there are no posts scheduled for that day. In that case, return an empty 'posts' array for that date.
  `;
};

export const generateCalendar = async (data: FormData): Promise<CalendarData | string> => {
  try {
    const prompt = buildPrompt(data);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
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
            prompt: `A short, engaging social media video about: "${prompt}"`,
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