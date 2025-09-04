import React from 'react';

export const PlusIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </svg>
);

export const ClipboardIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 0 1-2.25 2.25H9A2.25 2.25 0 0 1 6.75 4.5v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
  </svg>
);

export const CheckIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

export const ExportIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
  </svg>
);

export const PhotoIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

export const SpinnerIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const PlatformIcon: React.FC<{ platform: string, className?: string }> = ({ platform, className = "w-4 h-4" }) => {
    const p = platform.toLowerCase();
    if (p.includes('instagram')) return <InstagramIcon className={className} />;
    if (p.includes('facebook')) return <FacebookIcon className={className} />;
    if (p.includes('twitter')) return <TwitterIcon className={className} />;
    if (p.includes('linkedin')) return <LinkedInIcon className={className} />;
    if (p.includes('tiktok')) return <TikTokIcon className={className} />;
    if (p.includes('pinterest')) return <PinterestIcon className={className} />;
    return null;
};
export { PlatformIcon };

const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);
const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
);
const TwitterIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
    </svg>
);
const LinkedInIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
        <rect x="2" y="9" width="4" height="12"></rect>
        <circle cx="4" cy="4" r="2"></circle>
    </svg>
);
const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.03-4.83-1-6.7-2.91-1.87-1.9-2.86-4.58-2.65-7.18.2-2.6 1.5-4.93 3.35-6.51 1.86-1.59 4.2-2.54 6.55-2.55.02 1.52.02 3.04.01 4.56-.99.31-1.98.74-2.89 1.3-.41.25-.82.53-1.21.85-.25.21-.5.43-.78.64-.17.14-.34.28-.5.43-.03.02-.07.05-.1.07-.39.31-.76.66-1.12 1.02-.12.12-.23.24-.35.37-.24.26-.48.53-.69.81-.22.29-.42.6-.6.93-.18.33-.34.67-.48 1.02-.07.17-.14.35-.2.52-.07.21-.12.42-.17.63-.04.18-.08.36-.12.54-.03.18-.05.36-.07.54-.03.18-.04.37-.05.55-.02.19-.03.38-.03.57.01.22.02.43.05.65.02.18.04.36.08.53.07.35.18.68.32 1s.32.61.51.89c.19.28.41.55.65.79.24.25.5.48.78.69.28.21.57.4.88.57.31.18.63.33.96.47.34.14.68.26 1.04.36.36.1.72.18 1.09.24.37.06.74.09 1.12.11.38.02.76.03 1.13.03.4-.01.8-.02 1.2-.05.39-.03.79-.08 1.18-.15.39-.07.78-.16 1.16-.28.38-.11.75-.25 1.11-.42.36-.17.72-.36 1.05-.59.33-.22.65-.48.95-.76.3-.29.58-.61.83-.96.25-.35.47-.73.67-1.13.2-.4.37-.82.51-1.25.14-.44.25-.89.33-1.35.08-.46.13-.92.16-1.39.02-.45.03-.91.02-1.37s-.02-.93-.05-1.39c-.04-.46-.09-.92-.16-1.38-.07-.46-.17-.91-.28-1.36-.12-.45-.26-.89-.42-1.32-.16-.43-.35-.85-.56-1.26-.21-.41-.45-.8-.71-1.18-.26-.38-.55-.74-.86-1.08-.31-.34-.64-.66-1-..95-.35-.29-.72-.56-1.1-.79-.38-.23-.77-.43-1.17-.61-.4-.18-.8-.33-1.21-.45-.41-.12-.83-.21-1.25-.27-.42-.06-.85-.09-1.28-.1-.43-.01-.86-.01-1.28-.01z"></path>
    </svg>
);
const PinterestIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.017 2c-5.49 0-8.667 4.41-8.667 8.47 0 3.42 1.833 6.34 4.5 7.43.333.15.417.083.5-.167.167-.666.5-2.083.667-2.75.167-.5.083-.917-.25-1.25-1.25-1.167-1.833-2.833-1.833-4.583 0-3.583 2.583-6.417 5.917-6.417 3.25 0 5.167 2.333 5.167 5.583 0 3.833-1.583 6.583-3.833 6.583-1.25 0-2.167-.917-1.833-2.083.417-1.417 1.167-2.917 1.167-3.833 0-.917-.417-1.667-1.25-1.667-1 0-1.833 1-1.833 2.333 0 .833-.25 1.583-.583 2.167-.417.75-1.333 3-1.333 4.167 0 1.25.917 2.25 2.25 2.25 2.917 0 4.833-3.083 4.833-6.167 0-2.5-1.833-4.5-4.417-4.5z" />
    </svg>
);