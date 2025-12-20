import { useState, useEffect } from 'react';

function ExperienceBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('triply-experience-bar-dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
      setIsDismissed(true);
      document.documentElement.classList.remove('has-experience-bar');
    } else {
      document.documentElement.classList.add('has-experience-bar');
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('triply-experience-bar-dismissed', 'true');
    setIsDismissed(true);
    document.documentElement.classList.remove('has-experience-bar');
  };

  if (isDismissed || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 inset-x-0 z-[100] bg-gradient-to-r from-triply via-triply-teal to-triply-mint dark:from-triply-dark dark:via-triply-teal dark:to-triply-mint text-white dark:text-dark-text-primary py-2 px-4 sm:px-6 shadow-lg animate-slideDown">
      <div className="mx-auto max-w-6xl flex items-center justify-between gap-3 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium flex-1 overflow-x-auto mr-2 sm:mr-4">
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-triply-accentLight" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="whitespace-nowrap">95% رضا</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-triply-accentLight" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="whitespace-nowrap">24/7</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-triply-accentLight" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="whitespace-nowrap">أفضل الأسعار</span>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1.5 sm:p-2 rounded-lg hover:bg-white/10 dark:hover:bg-dark-surface/30 transition-colors ml-2 sm:ml-3"
          aria-label="إغلاق"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export { ExperienceBar };
