import React, { useState, useCallback } from 'react';
import { generateCalendar, generateImage, startVideoGeneration, getVideoOperationStatus, fetchVideo } from './services/geminiService';
import type { FormData, Platform, CalendarData, PostIdea, CalendarEntry } from './types';
import { PlusIcon, TrashIcon, SparklesIcon, ClipboardIcon, CheckIcon, PlatformIcon, ExportIcon, PhotoIcon, SpinnerIcon } from './components/icons';

const initialFormData: FormData = {
  brandName: "",
  month: "October",
  targetAudience: "Young adults aged 18-35 interested in sustainable fashion",
  promotionalTheme: "Showcasing new product launches, highlighting special offers",
  educationalTheme: "Providing tips on sustainable fashion, explaining product benefits",
  entertainingTheme: "Behind-the-scenes glimpses, fun facts, relatable memes",
  engagementTheme: "Asking questions, starting discussions, user-generated content features",
  communityTheme: "Featuring customer testimonials, celebrating milestones",
  platforms: [
    { id: "1", name: "Instagram", considerations: "High-quality visuals, Reels ideas, Stories prompts, carousels" },
    { id: "2", name: "Facebook", considerations: "Longer-form posts, community group discussions" },
    { id: "3", name: "TikTok", considerations: "Short, engaging video concepts, trending sounds, challenges" },
  ],
  keyDates: "New Collection Launch on Oct 15th, World Environment Day on Oct 4th",
  tone: "Friendly and informative",
};

const FormInput: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; }> = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type="text"
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
    />
  </div>
);

const FormTextarea: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; rows?: number; }> = ({ label, name, value, onChange, placeholder, rows = 3 }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
    />
  </div>
);

const PostCard: React.FC<{ post: PostIdea }> = ({ post }) => {
    const [isScheduled, setIsScheduled] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [visualState, setVisualState] = useState<{
        status: 'idle' | 'generating' | 'polling' | 'success' | 'error';
        url: string | null;
        message: string | null;
        type: 'image' | 'video' | null;
    }>({ status: 'idle', url: null, message: null, type: null });


    const handleCopy = () => {
        const textToCopy = `Platform: ${post.platform}\nIdea: ${post.idea}\n\nCaption:\n${post.caption}\n\nHashtags: ${post.hashtags}`;
        navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }
    
    const handleGenerateVisual = async () => {
        setVisualState({ status: 'generating', url: null, message: 'Preparing to generate...', type: null });
        
        const isVideo = /video|reel|short|animation/i.test(post.visual);
        const prompt = post.idea; 

        if (isVideo) {
            setVisualState(prev => ({ ...prev, type: 'video', message: 'Starting video generation...' }));
            try {
                let operation = await startVideoGeneration(prompt);
                setVisualState(prev => ({ ...prev, status: 'polling', message: 'Video generation started. This can take several minutes. Checking status...' }));

                while (!operation.done) {
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    operation = await getVideoOperationStatus(operation);
                }

                const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
                if (downloadLink) {
                    setVisualState(prev => ({ ...prev, status: 'generating', message: 'Finalizing video...' }));
                    const blob = await fetchVideo(downloadLink);
                    const videoUrl = URL.createObjectURL(blob);
                    setVisualState({ status: 'success', url: videoUrl, message: null, type: 'video' });
                } else {
                    throw new Error("Video process finished but no downloadable video was found.");
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                setVisualState({ status: 'error', url: null, message: errorMessage, type: 'video' });
            }
        } else {
            setVisualState(prev => ({ ...prev, type: 'image', message: 'Generating image...' }));
            try {
                const imageUrl = await generateImage(prompt);
                setVisualState({ status: 'success', url: imageUrl, message: null, type: 'image' });
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                setVisualState({ status: 'error', url: null, message: errorMessage, type: 'image' });
            }
        }
    };
    
    return (
        <div className={`p-2.5 rounded-lg mb-2 transition-all duration-300 ${isScheduled ? 'bg-green-50 border-l-4 border-green-400' : 'bg-white hover:bg-gray-50/80 border'}`}>
            <div className="relative aspect-video bg-gray-200 rounded-md mb-2.5 flex items-center justify-center overflow-hidden">
                {visualState.status === 'success' && visualState.url ? (
                    visualState.type === 'image' ? (
                        <img src={visualState.url} alt={post.idea} className="w-full h-full object-cover" />
                    ) : (
                        <video src={visualState.url} controls className="w-full h-full object-cover bg-black" />
                    )
                ) : (visualState.status === 'generating' || visualState.status === 'polling') ? (
                    <div className="text-center p-2">
                        <SpinnerIcon className="w-8 h-8 text-indigo-500 mx-auto" />
                        <p className="text-xs text-gray-600 mt-2 font-medium">{visualState.message}</p>
                    </div>
                ) : visualState.status === 'error' ? (
                     <div className="text-center p-2 text-red-600">
                        <p className="text-xs font-semibold">Generation Failed</p>
                        <p className="text-[10px] mt-1">{visualState.message}</p>
                        <button onClick={handleGenerateVisual} className="mt-2 px-2 py-0.5 text-xs bg-red-100 rounded">Retry</button>
                    </div>
                ) : (
                    <div className="text-center">
                        <PhotoIcon className="w-8 h-8 text-gray-400"/>
                        <p className="text-xs text-gray-500 mt-1">No visual generated</p>
                    </div>
                )}
            </div>
            
            <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-1.5">
                <div className="flex items-center gap-1.5">
                    <PlatformIcon platform={post.platform} className="w-4 h-4 text-gray-400" />
                    <span>{post.platform}</span>
                </div>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">{post.theme}</span>
            </div>
            <p className="text-sm font-medium text-gray-800 leading-snug">{post.idea}</p>
            <p className="text-xs text-gray-500 mt-1">{post.caption.substring(0, 50)}...</p>
            
            <div className="mt-2.5 flex items-center justify-between gap-2">
                <button
                    onClick={handleGenerateVisual}
                    disabled={visualState.status === 'generating' || visualState.status === 'polling' || visualState.status === 'success'}
                    className="flex-1 px-2.5 py-1 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed">
                    <PhotoIcon className="w-3.5 h-3.5" />
                    {visualState.status === 'success' ? 'Visual Ready' : 'Generate Visual'}
                </button>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsScheduled(!isScheduled)}
                        className={`p-1.5 rounded-md flex items-center transition-colors ${isScheduled ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
                        {isScheduled ? <CheckIcon className="w-3.5 h-3.5" /> : <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                    </button>
                     <button onClick={handleCopy} className={`p-1.5 rounded-md transition-colors ${isCopied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        {isCopied ? <CheckIcon className="w-3.5 h-3.5"/> : <ClipboardIcon className="w-3.5 h-3.5"/>}
                    </button>
                </div>
            </div>
        </div>
    )
}

const CalendarView: React.FC<{ data: CalendarData, monthName: string }> = ({ data, monthName }) => {
    const monthIndex = new Date(Date.parse(monthName +" 1, 2024")).getMonth();
    const year = new Date().getFullYear();
    const firstDayOfMonth = new Date(year, monthIndex, 1).getDay(); // 0=Sun, 1=Mon, ...
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const calendarDays: (CalendarEntry | null)[] = Array(firstDayOfMonth).fill(null);
    data.calendar.forEach(entry => {
        const day = parseInt(entry.date.split(' ')[1], 10);
        calendarDays[firstDayOfMonth + day -1] = entry;
    });
    
    for(let i=0; i < daysInMonth; i++) {
        const index = firstDayOfMonth + i;
        if (index >= calendarDays.length || !calendarDays[index]) {
             calendarDays[index] = { date: `${monthName} ${i + 1}`, posts: [] };
        }
    }


    return (
        <div className="flex flex-col h-full">
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-sm text-gray-600 mb-2">
                {days.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 grid-rows-5 gap-1 flex-grow">
                {calendarDays.slice(0, 35).map((dayData, index) => (
                    <div key={index} className={`bg-gray-50/70 rounded-lg p-1.5 border flex flex-col ${dayData ? '' : 'bg-gray-100/50'}`}>
                        {dayData && (
                            <>
                                <span className="font-semibold text-xs text-gray-700">{dayData.date.split(' ')[1]}</span>
                                <div className="mt-1 overflow-y-auto flex-grow">
                                    {dayData.posts.map((post, postIndex) => <PostCard key={postIndex} post={post} />)}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handlePlatformChange = useCallback((id: string, field: 'name' | 'considerations', value: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  }, []);
  
  const addPlatform = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      platforms: [...prev.platforms, { id: Date.now().toString(), name: '', considerations: '' }]
    }));
  }, []);

  const removePlatform = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.filter(p => p.id !== id)
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setCalendarData(null);
    const result = await generateCalendar(formData);
    if (typeof result === 'string') {
        setError(result);
    } else {
        setCalendarData(result);
    }
    setIsLoading(false);
  };
  
  const handleExportCSV = useCallback(() => {
    if (!calendarData) return;

    const escapeCSV = (str: string) => {
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ['Date', 'Platform', 'Theme', 'Idea', 'Caption', 'Hashtags', 'Visual'];
    const rows = calendarData.calendar.flatMap(day =>
      day.posts.map(post =>
        [
          escapeCSV(day.date),
          escapeCSV(post.platform),
          escapeCSV(post.theme),
          escapeCSV(post.idea),
          escapeCSV(post.caption),
          escapeCSV(post.hashtags),
          escapeCSV(post.visual),
        ].join(',')
      )
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.download = `${formData.brandName}-${formData.month}-content-calendar.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [calendarData, formData.brandName, formData.month]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AI Content Calendar Generator</h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
          {/* Form Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 self-start">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">Calendar Configuration</h2>
              <fieldset className="space-y-4">
                <FormInput label="Brand Name" name="brandName" value={formData.brandName} onChange={handleInputChange} placeholder="e.g., EcoThreads Apparel" />
                <FormInput label="Month" name="month" value={formData.month} onChange={handleInputChange} placeholder="e.g., November" />
                <FormTextarea label="Target Audience" name="targetAudience" value={formData.targetAudience} onChange={handleInputChange} />
                <FormInput label="Tone" name="tone" value={formData.tone} onChange={handleInputChange} placeholder="e.g., Playful and Witty" />
              </fieldset>
              <fieldset className="space-y-4">
                  <legend className="text-lg font-medium text-gray-900 mb-2">Content Themes</legend>
                  <FormTextarea label="Promotional" name="promotionalTheme" value={formData.promotionalTheme} onChange={handleInputChange} />
                  <FormTextarea label="Educational" name="educationalTheme" value={formData.educationalTheme} onChange={handleInputChange} />
              </fieldset>
              <fieldset>
                <legend className="text-lg font-medium text-gray-900 mb-2">Platforms</legend>
                <div className="space-y-4">
                  {formData.platforms.map((platform, index) => (
                    <div key={platform.id} className="p-4 border rounded-lg bg-gray-50/50 relative">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label={`Platform ${index + 1} Name`} name={`platform-name-${platform.id}`} value={platform.name} onChange={(e) => handlePlatformChange(platform.id, 'name', e.target.value)} placeholder="e.g., TikTok" />
                        <FormTextarea label="Considerations" name={`platform-considerations-${platform.id}`} value={platform.considerations} onChange={(e) => handlePlatformChange(platform.id, 'considerations', e.target.value)} rows={2} />
                      </div>
                      <button type="button" onClick={() => removePlatform(platform.id)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addPlatform} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 transition">
                    <PlusIcon className="w-5 h-5" /> Add Platform
                  </button>
                </div>
              </fieldset>
              <fieldset>
                <FormTextarea label="Key Dates & Campaigns" name="keyDates" value={formData.keyDates} onChange={handleInputChange} placeholder="e.g., Product Launch on Oct 15th, Holiday Sale..." />
              </fieldset>
              <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5"/> Generate Calendar
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Result Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mt-8 lg:mt-0 min-h-[80vh] flex flex-col">
            <div className="border-b pb-3 mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Generated Content Calendar</h2>
                <button
                  onClick={handleExportCSV}
                  disabled={!calendarData || isLoading}
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                >
                  <ExportIcon className="w-4 h-4" />
                  Export to CSV
                </button>
            </div>
            <div className="flex-grow relative">
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl z-10">
                  <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-4 text-lg font-medium text-gray-700">Generating your calendar...</p>
                  <p className="text-sm text-gray-500">This might take a moment.</p>
                </div>
              )}
              {error && <div className="text-red-500 bg-red-50 p-4 rounded-md">{error}</div>}
              {calendarData ? (
                <CalendarView data={calendarData} monthName={formData.month} />
              ) : (
                !isLoading && !error && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-lg font-medium">Your calendar will appear here</h3>
                        <p className="max-w-md">Fill in the details on the left and click "Generate Calendar" to get started.</p>
                    </div>
                )
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;