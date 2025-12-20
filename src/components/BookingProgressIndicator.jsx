/**
 * مكون BookingProgressIndicator - مؤشر تقدم الحجز
 * يعرض خطوات عملية الحجز:
 * 1. تفاصيل الرحلة
 * 2. المراجعة والتأكيد
 * 3. الدفع
 * 4. التأكيد النهائي
 */

import PropTypes from 'prop-types';
import { useLanguage } from '../contexts/LanguageContext.jsx';

function BookingProgressIndicator({ currentStep = 1, steps }) {
  const { t } = useLanguage();
  
  const defaultSteps = [
    { id: 1, name: t('progress.destination'), description: t('progress.destinationDesc') },
    { id: 2, name: t('progress.services'), description: t('progress.servicesDesc') },
    { id: 3, name: t('progress.confirmation'), description: t('progress.confirmationDesc') },
  ];

  const stepsToUse = steps || defaultSteps;

  return (
    <div className="mb-8">
      <div className="mx-auto max-w-3xl">
        {/* Progress bar background */}
        <div className="relative px-4 sm:px-0">
          {/* Connector line */}
          <div className="absolute right-4 sm:right-0 top-5 sm:top-6 h-1 w-[calc(100%-2rem)] sm:w-full bg-triply-mint/20 dark:bg-dark-border" aria-hidden="true" />
          
          {/* Active progress line */}
          <div
            className="absolute right-4 sm:right-0 top-5 sm:top-6 h-1 bg-gradient-to-l from-triply to-triply-teal dark:from-triply-mint dark:to-triply-teal transition-all duration-500"
            style={{ width: `calc((100% - 2rem) * ${((currentStep - 1) / (stepsToUse.length - 1))} / 1)` }}
            aria-hidden="true"
          />

          {/* Steps */}
          <ol className="relative z-10 flex justify-between">
            {stepsToUse.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const isUpcoming = currentStep < step.id;

              return (
                <li key={step.id} className="flex flex-col items-center">
                  {/* Step circle */}
                  <div
                    className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 sm:border-4 transition-all duration-300 ${
                      isCompleted
                        ? 'border-triply dark:border-triply-mint bg-triply dark:bg-triply-mint text-white dark:text-dark-bg shadow-lg'
                        : isCurrent
                        ? 'border-triply dark:border-triply-mint bg-white dark:bg-dark-elevated text-triply dark:text-triply-mint shadow-xl scale-110 ring-2 sm:ring-4 ring-triply/20 dark:ring-triply-mint/20'
                        : 'border-triply-mint/30 dark:border-dark-border bg-triply-sand/30 dark:bg-dark-surface text-triply-slate/50 dark:text-dark-text-secondary'
                    }`}
                  >
                    {isCompleted ? (
                      // Checkmark for completed steps
                      <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      // Step number
                      <span className="text-base sm:text-lg font-bold">{step.id}</span>
                    )}
                  </div>

                  {/* Step text */}
                  <div className={`mt-2 sm:mt-3 text-center transition-all duration-300 ${index === 0 ? 'text-right' : index === stepsToUse.length - 1 ? 'text-left' : ''}`}>
                    <div
                      className={`text-xs sm:text-sm font-semibold ${
                        isCurrent
                          ? 'text-triply dark:text-triply-mint'
                          : isCompleted
                          ? 'text-triply-teal dark:text-triply-mint/80'
                          : 'text-triply-slate/60 dark:text-dark-text-secondary'
                      }`}
                    >
                      {step.name}
                    </div>
                    <div className={`mt-0.5 sm:mt-1 text-[10px] sm:text-xs ${isCurrent || isCompleted ? 'text-triply-slate/70 dark:text-dark-text-secondary' : 'text-triply-slate/50 dark:text-dark-text-secondary/70'}`}>
                      {step.description}
                    </div>
                  </div>

                  {/* Pulse animation for current step */}
                  {isCurrent && (
                    <div className="absolute top-0 h-10 w-10 sm:h-12 sm:w-12 animate-ping rounded-full bg-triply/20 dark:bg-triply-mint/20" aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Progress text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-triply-slate/70 dark:text-dark-text-secondary">
            الخطوة {currentStep} من {stepsToUse.length}
          </p>
          <div className="mx-auto mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-triply-mint/20 dark:bg-dark-border">
            <div
              className="h-full bg-gradient-to-r from-triply to-triply-teal dark:from-triply-mint dark:to-triply-teal transition-all duration-500"
              style={{ width: `${(currentStep / stepsToUse.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

BookingProgressIndicator.propTypes = {
  currentStep: PropTypes.number,
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ),
};

export { BookingProgressIndicator };
