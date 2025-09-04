export interface Platform {
  id: string;
  name: string;
  considerations: string;
}

export interface FormData {
  brandName: string;
  month: string;
  targetAudience: string;
  promotionalTheme: string;
  educationalTheme: string;
  entertainingTheme: string;
  engagementTheme: string;
  communityTheme: string;
  platforms: Platform[];
  keyDates: string;
  tone: string;
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
