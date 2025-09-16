export interface Platform {
  id: string;
  name: string;
  considerations: string;
}

export interface FormData {
  brandName: string;
  month: string;
  postFrequency: string;
  targetAudience: string;
  promotionalTheme: string;
  educationalTheme: string;
  entertainingTheme: string;
  engagementTheme: string;
  communityTheme: string;
  platforms: Platform[];
  keyDates: string;
  tone: string;
  brandImage?: {
    mimeType: string;
    data: string; // base64 encoded string
  };
}

export interface PostIdea {
  platform: string;
  theme: string;
  idea: string;
  caption: string;
  hashtags: string;
  visual: string;
}

export interface CalendarEntry {
  date: string; // e.g., "October 1"
  posts: PostIdea[];
}

export interface CalendarData {
    calendar: CalendarEntry[];
}

export interface BrandIdentitySuggestion {
  brandName: string;
  targetAudience: string;
  tone: string;
}

export type ConnectionKey = 'meta' | 'tiktok' | 'snapchat';

export interface Connection {
  id: ConnectionKey;
  name: string;
  connected: boolean;
  Icon: React.FC<{ className?: string }>;
}