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
