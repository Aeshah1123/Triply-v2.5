import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  calculateDestination,
  getDestinations,
  getQuizQuestions,
} from "../../data/aiQuizData.js";
import { GlassButton } from "../ui/GlassButton.jsx";
import { useScrollReveal } from "../../hooks/useScrollReveal.js";
import { useLanguage } from "../../contexts/LanguageContext.jsx";

function AITravelAssistant() {
  const { t } = useLanguage();
  const translatedDestinations = getDestinations(t);
  const quizQuestions = getQuizQuestions(t);
  const navigate = useNavigate();
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.2 });

  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
  };

  const handleAnswer = (optionIndex) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    // إذا كان هذا آخر سؤال
    if (currentQuestion === quizQuestions.length - 1) {
      // عرض loading
      setIsLoading(true);

      // محاكاة معالجة AI
      setTimeout(() => {
        const calculatedResult = calculateDestination(newAnswers, translatedDestinations);
        setResult(calculatedResult);
        setIsLoading(false);
      }, 2000);
    } else {
      // الانتقال للسؤال التالي
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleRestart = () => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
  };

  const handleBookNow = () => {
    // حفظ الوجهة المختارة والانتقال لصفحة التفاصيل
    localStorage.setItem(
      "triply-booking-details",
      JSON.stringify({
        destination: result.destination,
        category: "midRange",
      })
    );
    navigate(`/booking-details?destination=${result.destination}`);
  };

  // الشاشة الترحيبية
  if (!quizStarted && !result) {
    return (
      <section
        ref={sectionRef}
        className={`section-padding bg-gradient-to-b from-white via-triply-sand/30 to-white dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg ${
          isVisible ? "reveal-fade-up" : "reveal"
        }`}
      >
        <div className="container-custom">
          <div className="mx-auto max-w-4xl text-center">
            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-triply to-triply-teal dark:from-triply-mint dark:to-triply-teal shadow-2xl mb-6 animate-bounce">
                <svg
                  className="w-14 h-14 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                  <circle cx="9" cy="9" r="1.5" />
                  <circle cx="15" cy="9" r="1.5" />
                  <path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              </div>

              <h2 className="gradient-text font-display text-3xl sm:text-4xl md:text-5xl leading-tight mb-4">
                {t("aiAssistant.title")}
              </h2>

              <p className="text-lg text-triply-slate/80 dark:text-dark-text-secondary max-w-2xl mx-auto leading-relaxed">
                {t("aiAssistant.description")}
                <br />
                <span className="font-semibold text-triply dark:text-triply-mint">
                  {t("aiAssistant.subtitle")}
                </span>{" "}
                {t("aiAssistant.subtitleDesc")}
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid gap-6 sm:grid-cols-3 mb-10">
              <div className="glass-card p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-triply to-triply-teal dark:from-triply-mint dark:to-triply-teal mb-3 shadow-lg">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L1 21h22L12 2zm0 3.5L19.5 19h-15L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-triply-dark dark:text-dark-text-primary mb-2">
                  {t("aiAssistant.feature1Title")}
                </h3>
                <p className="text-sm text-triply-slate/70 dark:text-dark-text-secondary">
                  {t("aiAssistant.feature1Desc")}
                </p>
              </div>

              <div className="glass-card p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-triply-teal to-triply-accent dark:from-triply-teal dark:to-triply-mint mb-3 shadow-lg">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93 0 4.08-3.05 7.44-7 7.93v2.02c5.05-.5 9-4.76 9-9.95s-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm-1-11v6l5.25 3.15.75-1.23-4.5-2.67V8H11z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-triply-dark dark:text-dark-text-primary mb-2">
                  {t("aiAssistant.feature2Title")}
                </h3>
                <p className="text-sm text-triply-slate/70 dark:text-dark-text-secondary">
                  {t("aiAssistant.feature2Desc")}
                </p>
              </div>

              <div className="glass-card p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-triply-accent to-triply dark:from-triply-mint dark:to-triply mb-3 shadow-lg">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-triply-dark dark:text-dark-text-primary mb-2">
                  {t("aiAssistant.feature3Title")}
                </h3>
                <p className="text-sm text-triply-slate/70 dark:text-dark-text-secondary">
                  {t("aiAssistant.feature3Desc")}
                </p>
              </div>
            </div>

            {/* Destinations Preview */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {Object.values(translatedDestinations).map((dest) => (
                <div
                  key={dest.name}
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-triply-mint/20 dark:bg-triply-teal/20 border-2 border-triply-mint/40 dark:border-triply-teal/40 hover:border-triply dark:hover:border-triply-mint hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-triply to-triply-teal dark:from-triply-mint dark:to-triply-teal flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </div>
                  <span className="font-bold text-triply-dark dark:text-dark-text-primary">
                    {dest.name}
                  </span>
                  <span className="text-lg">{dest.flag}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-triply via-triply-teal to-triply-accent rounded-full blur-xl opacity-30 animate-pulse"></div>
              <GlassButton
                variant="accent"
                size="lg"
                onClick={handleStartQuiz}
                className="relative group overflow-hidden px-12 py-4 text-lg shadow-2xl"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <svg
                    className="w-6 h-6 group-hover:scale-125 transition-transform"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7.38 21.01c.49.49 1.28.49 1.77 0l8.31-8.31c.39-.39.39-1.02 0-1.41L9.15 2.98c-.49-.49-1.28-.49-1.77 0s-.49 1.28 0 1.77L14.62 12l-7.25 7.25c-.48.48-.48 1.28.01 1.76z" />
                  </svg>
                  {t("aiAssistant.startButton")}
                </span>
              </GlassButton>
            </div>

            <p className="text-sm text-triply-slate/60 dark:text-dark-text-secondary mt-4 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
              </svg>
              {t("aiAssistant.expectedTime")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // شاشة Loading
  if (isLoading) {
    return (
      <section className="section-padding bg-gradient-to-b from-white via-triply-sand/30 to-white dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg">
        <div className="container-custom">
          <div className="mx-auto max-w-2xl text-center">
            <div className="relative">
              {/* دوائر متحركة */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-triply/20 dark:border-triply-mint/20 animate-ping"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-triply-teal/30 dark:border-triply-teal/30 animate-pulse"></div>
              </div>

              {/* أيقونة AI */}
              <div className="relative flex items-center justify-center w-40 h-40 mx-auto mb-8">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-triply to-triply-teal dark:from-triply-mint dark:to-triply-teal shadow-2xl animate-bounce">
                  <svg
                    className="w-16 h-16 text-white animate-spin"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                </div>
              </div>
            </div>

            <h3 className="gradient-text font-display text-3xl mb-4">
              {t("aiAssistant.loadingMessage")}
            </h3>

            <div className="space-y-3 mb-8">
              <p className="text-triply-slate dark:text-dark-text-secondary animate-pulse flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 11.75A1.25 1.25 0 0 0 7.75 13A1.25 1.25 0 0 0 9 14.25A1.25 1.25 0 0 0 10.25 13A1.25 1.25 0 0 0 9 11.75zm6 0A1.25 1.25 0 0 0 13.75 13A1.25 1.25 0 0 0 15 14.25A1.25 1.25 0 0 0 16.25 13A1.25 1.25 0 0 0 15 11.75zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z" />
                </svg>
                {t("aiAssistant.aiProcessing")}
              </p>
              <p className="text-triply-slate dark:text-dark-text-secondary animate-pulse delay-100 flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                </svg>
                {t("aiAssistant.aiProcessing")}
              </p>
              <p className="text-triply-slate dark:text-dark-text-secondary animate-pulse delay-200 flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                {t("aiAssistant.aiProcessing")}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-triply-mint/20 dark:bg-dark-surface rounded-full h-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-triply via-triply-teal to-triply-mint animate-progress"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // شاشة النتيجة
  if (result) {
    const destData = result.destinationData;

    return (
      <section className="section-padding bg-gradient-to-b from-white via-triply-sand/30 to-white dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl">
            {/* النتيجة الرئيسية */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-2xl mb-6 animate-bounce">
                <svg
                  className="w-10 h-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <h3 className="gradient-text font-display text-2xl sm:text-3xl mb-3 flex items-center justify-center gap-3">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {t("aiAssistant.resultsTitle")}
              </h3>

              <div className="inline-block p-8 rounded-3xl bg-gradient-to-br from-triply/10 via-triply-teal/10 to-triply-mint/10 dark:from-triply-mint/20 dark:via-triply-teal/20 dark:to-triply/20 border-4 border-triply dark:border-triply-mint shadow-2xl mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-triply to-triply-teal dark:from-triply-mint dark:to-triply-teal shadow-xl">
                    <div className="text-white">{destData.icon}</div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <h2 className="text-5xl font-black text-triply dark:text-triply-mint">
                    {destData.name}
                  </h2>
                  <span className="text-4xl">{destData.flag}</span>
                </div>
                <p className="text-xl text-triply-slate dark:text-dark-text-secondary">
                  {destData.description}
                </p>
              </div>

              <p className="text-lg text-triply-slate/80 dark:text-dark-text-secondary mb-2">
                {t("aiAssistant.matchPercentage")}:{" "}
                <span className="text-3xl font-bold text-triply dark:text-triply-mint">
                  {result.percentages[result.destination]}%
                </span>
              </p>
            </div>

            {/* مميزات الوجهة */}
            <div className="glass-card p-8 mb-8">
              <h4 className="text-xl font-bold text-triply-dark dark:text-dark-text-primary mb-6 text-center flex items-center justify-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                {t("aiAssistant.whyDestination")} {destData.name}؟
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {destData.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 rounded-xl bg-triply-mint/10 dark:bg-triply-teal/20 border border-triply-mint/30 dark:border-triply-teal/30"
                  >
                    <svg
                      className="w-6 h-6 text-triply dark:text-triply-mint flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-semibold text-triply-dark dark:text-dark-text-primary">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* نسب جميع الوجهات */}
            <div className="glass-card p-8 mb-8">
              <h4 className="text-xl font-bold text-triply-dark dark:text-dark-text-primary mb-6 text-center flex items-center justify-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                </svg>
                {t("aiAssistant.allResults")}
              </h4>
              <div className="space-y-4">
                {Object.entries(result.percentages)
                  .sort(([, a], [, b]) => b - a)
                  .map(([dest, percentage]) => (
                    <div key={dest} className="relative">
                      <div className="flex justify-between items-center mb-2">
                        <span className="flex items-center gap-3 font-semibold text-triply-dark dark:text-dark-text-primary">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-triply to-triply-teal dark:from-triply-mint dark:to-triply-teal flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-white"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                          </div>
                          <span>
                            {translatedDestinations[dest].name} {translatedDestinations[dest].flag}
                          </span>
                        </span>
                        <span className="text-xl font-bold text-triply dark:text-triply-mint">
                          {percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-triply-mint/20 dark:bg-dark-surface rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-triply via-triply-teal to-triply-mint transition-all duration-1000 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GlassButton
                variant="accent"
                size="lg"
                onClick={handleBookNow}
                className="group"
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 10v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2h4l2-3h4l2 3h4c1.1 0 2 .9 2 2zm-9 9c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0-8c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3z" />
                  </svg>
                  {t("aiAssistant.bookTo")} {destData.name}
                </span>
              </GlassButton>

              <GlassButton
                variant="secondary"
                size="lg"
                onClick={handleRestart}
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                  </svg>
                  {t("aiAssistant.retryTest")}
                </span>
              </GlassButton>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // شاشة الأسئلة
  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <section className="section-padding bg-gradient-to-b from-white via-triply-sand/30 to-white dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg">
      <div className="container-custom">
        <div className="mx-auto max-w-3xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-triply-slate dark:text-dark-text-secondary">
                {t("aiAssistant.questionNumber")} {currentQuestion + 1}{" "}
                {t("aiAssistant.questionOf")} {quizQuestions.length}
              </span>
              <span className="text-sm font-bold text-triply dark:text-triply-mint">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-triply-mint/20 dark:bg-dark-surface rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-triply via-triply-teal to-triply-mint transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* السؤال */}
          <div className="glass-card p-8 sm:p-12 mb-6 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-triply to-triply-teal dark:from-triply-mint dark:to-triply-teal shadow-2xl mb-6 animate-bounce">
              <div className="text-white">{question.icon}</div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-triply-dark dark:text-dark-text-primary mb-2">
              {question.question}
            </h3>
          </div>

          {/* الخيارات */}
          <div className="grid gap-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="group relative overflow-hidden p-6 rounded-2xl bg-white/70 dark:bg-dark-elevated/70 backdrop-blur-xl border-2 border-triply-mint/40 dark:border-triply-teal/40 hover:border-triply dark:hover:border-triply-mint hover:shadow-2xl transition-all duration-300 text-right hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-triply to-triply-teal dark:from-triply-mint dark:to-triply-teal flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-lg font-semibold text-triply-dark dark:text-dark-text-primary group-hover:text-triply dark:group-hover:text-triply-mint transition-colors">
                    {option.text}
                  </span>
                </div>

                {/* تأثير hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-triply/5 to-triply-teal/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </button>
            ))}
          </div>

          {/* زر الرجوع */}
          {currentQuestion > 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setCurrentQuestion(currentQuestion - 1);
                  setAnswers(answers.slice(0, -1));
                }}
                className="text-triply-slate dark:text-dark-text-secondary hover:text-triply dark:hover:text-triply-mint transition-colors text-sm font-semibold"
              >
                {t("aiAssistant.backToPrevious")}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AITravelAssistant;
