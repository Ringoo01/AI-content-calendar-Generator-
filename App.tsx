import React, { useState, useCallback, useRef } from 'react';
import { generateCalendar, generateImage, startVideoGeneration, getVideoOperationStatus, fetchVideo, generateBrandIdentitySuggestions } from './services/geminiService';
import type { FormData, Platform, CalendarData, PostIdea, CalendarEntry, BrandIdentitySuggestion } from './types';
import { PlusIcon, TrashIcon, SparklesIcon, ClipboardIcon, CheckIcon, PlatformIcon, ExportIcon, PhotoIcon, SpinnerIcon } from './components/icons';

const initialFormData: FormData = {
  brandName: "",
  month: "October",
  postFrequency: "Medium (1-2 posts per day on relevant platforms)",
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
  brandImage: undefined,
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

const FormSelect: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[]; }> = ({ label, name, value, onChange, options }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <select
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white appearance-none"
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  </div>
);


const ImageUpload: React.FC<{
  image: { mimeType: string; data: string } | undefined;
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
}> = ({ image, onImageSelect, onImageRemove }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Brand Personality Image (Optional)</label>
      <div className="mt-1">
        {image ? (
          <div className="relative group w-full p-2 border border-gray-200 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={`data:${image.mimeType};base64,${image.data}`} alt="Brand preview" className="h-16 w-16 object-cover rounded-md" />
              <div>
                <p className="text-sm font-medium text-gray-800">Image selected</p>
                <p className="text-xs text-gray-500">{image.mimeType}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onImageRemove}
              className="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"
              aria-label="Remove image"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <label
              htmlFor="file-upload"
              className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:border-indigo-500 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG, or WEBP</p>
              </div>
              <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
            </label>
            <p className="text-xs text-gray-500 mt-1.5">Provide an image (e.g., product photo, moodboard) to help the AI understand your brand's visual style.</p>
          </>
        )}
      </div>
    </div>
  );
};

const PostCard: React.FC<{ post: PostIdea; }> = ({ post }) => {
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
                
                const initialProgress = operation.metadata?.progressPercent;
                setVisualState(prev => ({ 
                    ...prev, 
                    status: 'polling', 
                    message: initialProgress !== undefined 
                        ? `Generating video... ${initialProgress}% complete.` 
                        : 'Video generation started. This can take several minutes.' 
                }));

                while (!operation.done) {
                    await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s for smoother progress
                    operation = await getVideoOperationStatus(operation);

                    const progress = operation.metadata?.progressPercent;
                    if (progress !== undefined) {
                        setVisualState(current => ({ ...current, message: `Generating video... ${progress}% complete.` }));
                    }
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
        <>
        <div className={`p-2.5 rounded-lg mb-2 transition-all duration-300 ${isScheduled ? 'bg-yellow-50/70 border-l-4 border-yellow-400' : 'bg-white hover:bg-gray-50/80 border'}`}>
            <div className="relative aspect-video bg-gray-200 rounded-md mb-2.5 flex items-center justify-center overflow-hidden">
                {visualState.status === 'success' && visualState.url ? (
                    visualState.type === 'image' ? (
                        <img src={visualState.url} alt={post.idea} className="w-full h-full object-cover" />
                    ) : (
                        <video src={visualState.url} controls className="w-full h-full object-cover bg-black" />
                    )
                ) : (visualState.status === 'generating' || visualState.status === 'polling') ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-2">
                        <SpinnerIcon className="w-8 h-8 text-indigo-500" />
                        <p className="text-sm text-gray-700 mt-2 font-semibold">
                            {visualState.type === 'video' ? 'Creating Video' : 'Creating Image'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{visualState.message}</p>
                    </div>
                ) : visualState.status === 'error' ? (
                    visualState.type === 'image' ? (
                        <div className="flex flex-col items-center justify-center h-full w-full text-center p-3 bg-gray-100">
                            <div className="text-gray-400">
                                <PhotoIcon className="w-12 h-12" />
                            </div>
                            <p className="text-xs text-gray-500 mt-2 font-medium">Image generation failed</p>
                            <button 
                                onClick={handleGenerateVisual} 
                                className="mt-2 px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full w-full text-center p-3 bg-red-50 text-red-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-sm font-semibold">Generation Failed</p>
                            <p className="text-xs mt-1 text-red-700">{visualState.message}</p>
                            <button 
                                onClick={handleGenerateVisual} 
                                className="mt-3 px-3 py-1 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                            >
                                Retry
                            </button>
                        </div>
                    )
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
                    onClick={() => setIsScheduled(!isScheduled)}
                    className={`w-full px-2.5 py-1 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors ${isScheduled ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {isScheduled ? 'Scheduled' : 'Schedule'}
                </button>
                <button onClick={handleCopy} className={`p-1.5 rounded-md transition-colors ${isCopied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} title="Copy post text">
                    {isCopied ? <CheckIcon className="w-3.5 h-3.5"/> : <ClipboardIcon className="w-3.5 h-3.5"/>}
                </button>
            </div>

            <div className="mt-2">
                {visualState.status === 'success' ? (
                    <button
                        onClick={handleGenerateVisual}
                        className="w-full px-2.5 py-1 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors bg-purple-100 text-purple-700 hover:bg-purple-200"
                    >
                        <SparklesIcon className="w-3.5 h-3.5" />
                        Regenerate
                    </button>
                ) : (
                    <button
                        onClick={handleGenerateVisual}
                        disabled={visualState.status === 'generating' || visualState.status === 'polling'}
                        className="w-full px-2.5 py-1 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                        <PhotoIcon className="w-3.5 h-3.5" />
                        Generate Visual
                    </button>
                )}
            </div>
        </div>
        </>
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

const BrandAssistantModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onApply: (suggestions: BrandIdentitySuggestion) => void;
}> = ({ isOpen, onClose, onApply }) => {
    const [description, setDescription] = useState('');
    const [suggestions, setSuggestions] = useState<BrandIdentitySuggestion | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!description.trim()) {
            setError("Please provide a description of your business.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuggestions(null);
        const result = await generateBrandIdentitySuggestions(description);
        if (typeof result === 'string') {
            setError(result);
        } else {
            setSuggestions(result);
        }
        setIsLoading(false);
    };

    const handleApply = () => {
        if (suggestions) {
            onApply(suggestions);
        }
    };
    
    const handleClose = () => {
        // Reset state on close
        setDescription('');
        setSuggestions(null);
        setError(null);
        setIsLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-indigo-500" />
                        Brand Identity Assistant
                    </h3>
                     <p className="text-sm text-gray-500 mt-1">Describe your business, and I'll suggest a brand identity for you.</p>
                </div>
                <div className="p-6 space-y-4">
                    <FormTextarea
                        label="Describe your business or product"
                        name="businessDescription"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., A subscription box for eco-friendly dog toys made from recycled materials."
                        rows={4}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition"
                    >
                        {isLoading ? <SpinnerIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                        {isLoading ? "Generating..." : "Get Suggestions"}
                    </button>
                    {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
                    
                    {suggestions && (
                        <div className="space-y-4 pt-4 border-t mt-4">
                            <h4 className="font-semibold text-gray-800">Here are my suggestions:</h4>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs font-medium text-gray-500">Brand Name</p>
                                <p className="text-md font-semibold text-indigo-700">{suggestions.brandName}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs font-medium text-gray-500">Target Audience</p>
                                <p className="text-sm text-gray-800">{suggestions.targetAudience}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs font-medium text-gray-500">Tone of Voice</p>
                                <p className="text-sm text-gray-800">{suggestions.tone}</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end items-center gap-3 rounded-b-xl">
                    <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                    <button type="button" onClick={handleApply} disabled={!suggestions || isLoading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed">
                        Apply Suggestions
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Page Components ---

const FormPage: React.FC<{
  onCalendarGenerated: (data: CalendarData, formData: FormData) => void;
}> = ({ onCalendarGenerated }) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleImageSelect = useCallback((file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result?.toString().split(',')[1];
      if (base64String) {
        setFormData(prev => ({
          ...prev,
          brandImage: {
            mimeType: file.type,
            data: base64String,
          }
        }));
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleImageRemove = useCallback(() => {
    setFormData(prev => ({ ...prev, brandImage: undefined }));
  }, []);

  const handleApplySuggestions = useCallback((suggestions: BrandIdentitySuggestion) => {
      setFormData(prev => ({
          ...prev,
          brandName: suggestions.brandName,
          targetAudience: suggestions.targetAudience,
          tone: suggestions.tone,
      }));
      setIsAssistantModalOpen(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const result = await generateCalendar(formData);
    if (typeof result === 'string') {
        setError(result);
    } else {
        onCalendarGenerated(result, formData);
    }
    setIsLoading(false);
  };

  return (
    <>
      <BrandAssistantModal 
          isOpen={isAssistantModalOpen}
          onClose={() => setIsAssistantModalOpen(false)}
          onApply={handleApplySuggestions}
      />
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 self-start">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">Calendar Configuration</h2>
            <fieldset className="space-y-4">
               <div>
                  <div className="flex justify-between items-center mb-1">
                      <label htmlFor="brandName" className="block text-sm font-medium text-gray-700">Brand Name</label>
                      <button type="button" onClick={() => setIsAssistantModalOpen(true)} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                          <SparklesIcon className="w-3.5 h-3.5" />
                          AI Assistant
                      </button>
                  </div>
                  <input
                    type="text"
                    name="brandName"
                    id="brandName"
                    value={formData.brandName}
                    onChange={handleInputChange}
                    placeholder="e.g., EcoThreads Apparel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                  />
               </div>
              <ImageUpload image={formData.brandImage} onImageSelect={handleImageSelect} onImageRemove={handleImageRemove} />
              <FormSelect label="Month" name="month" value={formData.month} onChange={handleInputChange} options={months} />
              <FormSelect 
                label="Post Frequency" 
                name="postFrequency" 
                value={formData.postFrequency} 
                onChange={handleInputChange} 
                options={[
                    "Low (Posts on key dates or a few times a week)",
                    "Medium (1-2 posts per day on relevant platforms)",
                    "High (Multiple posts daily across various platforms)"
                ]} 
              />
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
            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
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
      </div>
    </>
  );
};

const CalendarPage: React.FC<{
  calendarData: CalendarData;
  formData: FormData;
  onBack: () => void;
}> = ({ calendarData, formData, onBack }) => {

  const handleExportCSV = useCallback(() => {
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
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-t8;' });
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
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-full flex flex-col">
      <div className="border-b pb-3 mb-4 flex justify-between items-center flex-wrap gap-2">
          <h2 className="text-xl font-semibold text-gray-800">
            {formData.month} Content Calendar for {formData.brandName}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 transition"
            >
              &larr; Generate New Calendar
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              <ExportIcon className="w-4 h-4" />
              Export to CSV
            </button>
          </div>
      </div>
      <div className="flex-grow relative">
          <CalendarView data={calendarData} monthName={formData.month} />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [activeFormData, setActiveFormData] = useState<FormData | null>(null);

  const handleCalendarGenerated = (data: CalendarData, formData: FormData) => {
    setCalendarData(data);
    setActiveFormData(formData);
  };
  
  const handleBackToForm = () => {
    setCalendarData(null);
    setActiveFormData(null);
  };

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
        {activeFormData && calendarData ? (
          <CalendarPage 
            calendarData={calendarData}
            formData={activeFormData}
            onBack={handleBackToForm}
          />
        ) : (
          <FormPage
            onCalendarGenerated={handleCalendarGenerated}
          />
        )}
      </main>
    </div>
  );
};

export default App;
