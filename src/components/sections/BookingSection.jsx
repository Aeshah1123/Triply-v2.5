/**
 * قسم BookingSection - قسم الحجز السريع
 * يوفر نموذج حجز أولي مع:
 * - اختيار الوجهة
 * - اختيار الخدمات
 * - تحديد الميزانية
 * - حفظ التفضيلات في localStorage
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useLanguage } from "../../contexts/LanguageContext.jsx";
import { GlassButton } from "../ui/GlassButton.jsx";
import { FeedbackToast } from "../ui/FeedbackToast.jsx";
import {
  getBookingServices,
  getBudgetLevels,
  getBookingDestinations,
  destinationMapping,
} from "../../data/bookingOptions.js";
import { FormHelper } from "../ui/FormHelper.jsx";
import { BookingProgressIndicator } from "../BookingProgressIndicator.jsx";
import { useScrollReveal } from "../../hooks/useScrollReveal.js";
import { travelCosts } from "../../data/travelCosts.js";
import { currencyRates } from "../../data/currencyRates.js";
import { formatCurrency } from "../../utils/translationHelpers.js";

const STORAGE_KEY = "triply-booking-preferences";

function BookingSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [userBudget, setUserBudget] = useState("");

  // الخدمات المختارة (خدمة واحدة من كل نوع)
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [hasSavedPreferences, setHasSavedPreferences] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({
    threshold: 0.2,
  });
  const { ref: formRef, isVisible: formVisible } = useScrollReveal({
    threshold: 0.1,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return;
      }
      const parsed = JSON.parse(stored);
      if (parsed.destination) {
        setSelectedDestination(parsed.destination);
      }
      if (Array.isArray(parsed.services)) {
        setSelectedServices(parsed.services);
      }
      if (parsed.budget) {
        setSelectedBudget(parsed.budget);
      }
      setHasSavedPreferences(true);
      setFeedback({
        message: t("bookingMessages.preferencesRestored"),
        variant: "info",
      });
    } catch (error) {
      console.error("Failed to restore booking preferences", error);
    }
  }, []);

  useEffect(() => {
    const snapshot = {
      destination: selectedDestination,
      services: selectedServices,
      budget: selectedBudget,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    if (selectedDestination || selectedServices.length > 0 || selectedBudget) {
      setHasSavedPreferences(true);
    }

    // Update progress step based on form completion
    if (selectedDestination) {
      setCurrentStep(2);
      if (selectedServices.length > 0 || selectedBudget) {
        setCurrentStep(3);
      }
    } else {
      setCurrentStep(1);
    }
  }, [selectedDestination, selectedServices, selectedBudget]);

  // حساب التكلفة الإجمالية للخدمات المختارة
  const calculateTotalCost = () => {
    // البطاقات الآن لا تحتوي على أسعار محددة، فقط اختيار نعم/لا
    // يمكن إرجاع 0 أو حساب تقديري
    return 0;
  };

  // دالة لتحويل السعر لعملة الدولة
  const convertCurrency = (sarPrice) => {
    if (!selectedDestination)
      return {
        sar: sarPrice,
        local: sarPrice,
        currency: "ريال",
        symbol: "ریال",
        flag: "🇸🇦",
      };

    const destKey = destinationMapping[selectedDestination];
    const currencyInfo =
      currencyRates[destKey] || currencyRates[selectedDestination];

    if (!currencyInfo) {
      return {
        sar: sarPrice,
        local: sarPrice,
        currency: "ريال",
        symbol: "ريال",
        flag: "🇸🇦",
      };
    }

    const localPrice = (sarPrice * currencyInfo.rate).toFixed(2);
    return {
      sar: sarPrice,
      local: localPrice,
      currency: currencyInfo.currency,
      symbol: currencyInfo.symbol,
      flag: currencyInfo.flag,
    };
  };

  // الحصول على البيانات بناءً على الوجهة والفئة المختارة
  const getAvailableOptions = () => {
    if (!selectedDestination || !selectedBudget) {
      return { flights: [], hotels: [], restaurants: [], activities: [] };
    }

    const destinationKey = destinationMapping[selectedDestination];
    const cityData = travelCosts[destinationKey];

    if (!cityData) {
      return { flights: [], hotels: [], restaurants: [], activities: [] };
    }

    return {
      flights: cityData.flights || [],
      hotels: cityData.hotels?.[selectedBudget] || [],
      restaurants: cityData.restaurants?.[selectedBudget] || [],
      activities:
        cityData.activities?.filter((act) => act.category === selectedBudget) ||
        [],
    };
  };

  const availableOptions = getAvailableOptions();
  const bookingServices = getBookingServices(language);
  const budgetLevels = getBudgetLevels(language);

  const toggleService = (serviceId) => {
    const service = bookingServices.find((s) => s.id === serviceId);
    const currentTotal = calculateTotalCost();
    const budgetLimit = parseFloat(userBudget) || Infinity;

    // إذا كانت الخدمة مختارة بالفعل، اسمح بإلغائها
    if (selectedServices.includes(serviceId)) {
      setSelectedServices((prev) => prev.filter((id) => id !== serviceId));
      return;
    }

    // تحقق من الميزانية قبل إضافة خدمة جديدة
    const newTotal = currentTotal + (service?.estimatedCost || 0);
    if (userBudget && newTotal > budgetLimit) {
      setFeedback({
        message: `⚠️ لا يمكن إضافة هذه الخدمة! المجموع (${newTotal.toLocaleString()} ريال) سيتجاوز ميزانيتك (${budgetLimit.toLocaleString()} ريال)`,
        variant: "error",
      });
      return;
    }

    setSelectedServices((prev) => [...prev, serviceId]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    window.setTimeout(() => {
      setIsSubmitting(false);
      setFeedback({
        message: `تم استلام طلب الحجز لرحلتك إلى ${selectedDestination} وسنتواصل معك خلال ساعات`,
        variant: "success",
      });
    }, 1200);
  };

  const handleGetPriceQuote = () => {
    // إذا المستخدم مو مسجل دخول، نوديه لصفحة تسجيل الدخول
    if (!user) {
      setFeedback({
        message: t("bookingMessages.loginRequired"),
        variant: "error",
      });
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }

    const destinationKey = destinationMapping[selectedDestination] || "london";

    const snapshot = {
      destination: selectedDestination,
      destinationKey: destinationKey,
      services: selectedServices,
      budget: selectedBudget,
      userBudget: userBudget,
      selectedFlight: selectedFlight,
      selectedHotel: selectedHotel,
      selectedRestaurant: selectedRestaurant,
      selectedActivity: selectedActivity,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));

    const params = new URLSearchParams();
    if (destinationKey) {
      params.append("destination", destinationKey);
    }
    if (selectedBudget) {
      params.append("category", selectedBudget);
    }
    if (userBudget) {
      params.append("budget", userBudget);
    }
    const queryString = params.toString();
    navigate(`/booking-details${queryString ? "?" + queryString : ""}`);
  };

  const handleSavePreferences = () => {
    const snapshot = {
      destination: selectedDestination,
      services: selectedServices,
      budget: selectedBudget,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    setHasSavedPreferences(true);
    setFeedback({
      message: t("bookingMessages.preferencesSaved"),
      variant: "success",
    });
  };

  const handleRestorePreferences = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setFeedback({
          message: t("bookingMessages.noSavedPreferences"),
          variant: "info",
        });
        return;
      }
      const parsed = JSON.parse(stored);
      setSelectedDestination(parsed.destination ?? "");
      setSelectedServices(
        Array.isArray(parsed.services) ? parsed.services : []
      );
      setSelectedBudget(parsed.budget ?? "");
      setFeedback({
        message: t("bookingMessages.preferencesApplied"),
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to restore booking preferences", error);
      setFeedback({
        message: t("bookingMessages.restoreError"),
        variant: "error",
      });
    }
  };

  return (
    <section
      id="booking"
      className="section-padding relative overflow-hidden bg-gradient-to-b from-triply-sand/20 via-white to-triply-mint/10 dark:from-dark-bg dark:via-dark-surface/50 dark:to-dark-elevated"
    >
      {/* Decorative background elements */}
      <div
        className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-20 right-10 h-64 w-64 rounded-full bg-triply-mint/30 dark:bg-triply-teal/20 blur-3xl" />
        <div className="absolute bottom-20 left-10 h-80 w-80 rounded-full bg-triply-accent/20 dark:bg-triply-mint/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 text-right">
        <div
          ref={headerRef}
          className={`mb-12 space-y-4 text-center ${
            headerVisible ? "reveal-fade-down" : "reveal"
          }`}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-triply-mint to-triply-teal dark:from-triply-teal dark:to-triply-mint px-5 py-2 text-sm font-semibold text-white shadow-lg">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            {t("booking.badge")}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-triply-dark dark:text-dark-text-primary md:text-5xl leading-tight">
            {t("booking.title1")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-triply via-triply-teal to-triply-mint">
              {t("booking.title2")}
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-sm sm:text-base leading-7 text-triply-slate/75 dark:text-dark-text-secondary">
            {t("booking.description")}
          </p>

          {/* Progress Indicator */}
          <BookingProgressIndicator currentStep={currentStep} />
        </div>

        <div
          ref={formRef}
          className={`space-y-8 rounded-3xl border-2 border-triply-mint/40 dark:border-dark-border/50 bg-white/95 dark:bg-dark-elevated/80 backdrop-blur-xl p-6 sm:p-8 md:p-10 shadow-2xl hover:shadow-3xl transition-shadow duration-300 ${
            formVisible ? "reveal-scale" : "reveal"
          }`}
        >
          <FeedbackToast
            message={feedback?.message}
            variant={feedback?.variant}
            className="mb-4"
            onDismiss={() => setFeedback(null)}
          />
          {/* الخطوة 1: إدخال الميزانية واختيار الوجهة */}
          <div className="space-y-6 p-6 rounded-2xl bg-gradient-to-br from-triply-mint/5 to-triply-teal/5 dark:from-triply-teal/10 dark:to-triply-mint/5 border-2 border-triply-mint/30 dark:border-triply-teal/30">
            <div className="flex items-center gap-3 pb-3 border-b-2 border-triply-mint/20 dark:border-triply-teal/20">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-triply to-triply-teal text-white font-bold text-lg shadow-lg">
                1
              </span>
              <h3 className="text-xl font-bold text-triply-dark dark:text-dark-text-primary">
                {t("booking.step1Title")}
              </h3>
            </div>

            {/* إدخال الميزانية */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-base font-bold text-triply-dark dark:text-dark-text-primary">
                <svg
                  className="w-5 h-5 text-triply dark:text-triply-mint"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("booking.budgetLabel")}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={userBudget}
                  onChange={(e) => setUserBudget(e.target.value)}
                  placeholder={t("booking.budgetPlaceholder")}
                  min="0"
                  step="100"
                  className="w-full rounded-xl border-2 border-triply-mint/40 dark:border-dark-border/50 bg-white dark:bg-dark-surface px-5 py-4 text-right text-lg font-semibold text-triply-dark dark:text-dark-text-primary placeholder:text-triply-slate/40 dark:placeholder:text-dark-text-secondary/40 shadow-md transition-all duration-200 hover:border-triply dark:hover:border-triply-mint focus:border-triply dark:focus:border-triply-mint focus:outline-none focus:ring-4 focus:ring-triply/10 dark:focus:ring-triply-mint/20"
                />
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-triply-slate/60 dark:text-dark-text-secondary font-medium">
                  {language === 'ar' ? 'ريال' : 'SAR'}
                </span>
              </div>
              <FormHelper text={t("booking.budgetHelper")} />

              {/* عرض الميزانية المتبقية */}
              {userBudget && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-triply/10 to-triply-teal/10 dark:from-triply-teal/20 dark:to-triply-mint/10 border border-triply-mint/30 dark:border-triply-teal/30">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-triply-dark dark:text-dark-text-primary">
                      {t("booking.budgetSet")}
                    </span>
                    <span className="text-lg font-bold text-triply dark:text-triply-mint">
                      {formatCurrency(parseFloat(userBudget), language)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="font-semibold text-triply-dark dark:text-dark-text-primary">
                      {t("booking.budgetUsed")}
                    </span>
                    <span className="text-lg font-bold text-triply-accent dark:text-triply-accentLight">
                      {formatCurrency(calculateTotalCost(), language)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-triply-mint/20 dark:border-triply-teal/20">
                    <span className="font-semibold text-triply-dark dark:text-dark-text-primary">
                      {t("booking.budgetRemaining")}
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        parseFloat(userBudget) - calculateTotalCost() >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(
                        parseFloat(userBudget) - calculateTotalCost(),
                        language
                      )}
                    </span>
                  </div>
                  {/* شريط تقدم الميزانية */}
                  <div className="mt-3 h-3 bg-triply-sand/30 dark:bg-dark-surface/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        (calculateTotalCost() / parseFloat(userBudget)) * 100 >
                        90
                          ? "bg-gradient-to-r from-red-500 to-red-600"
                          : (calculateTotalCost() / parseFloat(userBudget)) *
                              100 >
                            70
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                          : "bg-gradient-to-r from-triply to-triply-teal"
                      }`}
                      style={{
                        width: `${Math.min(
                          (calculateTotalCost() / parseFloat(userBudget)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* اختيار الوجهة */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-base font-bold text-triply-dark dark:text-dark-text-primary">
                <svg
                  className="w-5 h-5 text-triply dark:text-triply-mint"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("booking.destinationLabel")}
              </label>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full rounded-xl border-2 border-triply-mint/40 dark:border-dark-border/50 bg-white dark:!bg-dark-surface px-5 py-4 pr-12 text-right text-base font-medium text-triply-dark dark:!text-dark-text-primary shadow-md transition-all duration-200 hover:border-triply dark:hover:border-triply-mint focus:border-triply dark:focus:border-triply-mint focus:bg-white dark:focus:!bg-dark-surface focus:outline-none focus:ring-4 focus:ring-triply/10 dark:focus:ring-triply-mint/20 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%228%22%20viewBox%3D%220%200%2012%208%22%3E%3Cpath%20fill%3D%22%230f5b4a%22%20d%3D%22M6%208L0%200h12z%22%2F%3E%3C%2Fsvg%3E')] dark:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%228%22%20viewBox%3D%220%200%2012%208%22%3E%3Cpath%20fill%3D%22%2371d4c1%22%20d%3D%22M6%208L0%200h12z%22%2F%3E%3C%2Fsvg%3E')] bg-[position:left_1.25rem_center] bg-no-repeat"
                required
                style={{ colorScheme: "dark" }}
              >
                <option
                  value=""
                  className="bg-white dark:bg-dark-surface text-triply-dark dark:text-dark-text-primary"
                >
                  {t("booking.destinationPlaceholder")}
                </option>
                {getBookingDestinations(language).map((dest) => (
                  <option
                    key={dest}
                    value={dest}
                    className="bg-white dark:bg-dark-surface text-triply-dark dark:text-dark-text-primary"
                  >
                    {dest}
                  </option>
                ))}
              </select>
              <FormHelper text={t("booking.destinationHelper")} />
            </div>
          </div>

          {/* اختيار الفئة */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-lg font-bold text-triply-dark dark:text-dark-text-primary">
              <svg
                className="w-6 h-6 text-triply dark:text-triply-mint"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                  clipRule="evenodd"
                />
              </svg>
              {t("booking.budgetLabel")}
            </label>
            <FormHelper text={t("booking.budgetHelper")} />
            <div className="grid gap-4 sm:grid-cols-3">
              {getBudgetLevels(language).map((budget) => (
                <button
                  key={budget.id}
                  type="button"
                  onClick={() => setSelectedBudget(budget.id)}
                  className={`group relative rounded-xl border-2 p-6 text-center transition-all duration-300 overflow-hidden ${
                    selectedBudget === budget.id
                      ? "border-triply dark:border-triply-mint bg-gradient-to-br from-triply/10 to-triply-mint/10 dark:from-triply-mint/20 dark:to-triply-teal/10 shadow-xl scale-[1.05]"
                      : "border-triply-mint/40 dark:border-dark-border/50 bg-gradient-to-br from-triply-sand/5 to-white dark:from-dark-surface/30 dark:to-dark-elevated/40 hover:border-triply dark:hover:border-triply-teal hover:shadow-lg hover:scale-[1.03]"
                  }`}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                  <div className="relative z-10 mb-3 text-xl font-bold text-triply-dark dark:text-dark-text-primary">
                    {budget.name}
                  </div>
                  <div className="relative z-10 text-xs leading-relaxed text-triply-slate/70 dark:text-dark-text-secondary">
                    {budget.description}
                  </div>
                  {selectedBudget === budget.id && (
                    <div className="relative z-10 mt-3">
                      <svg
                        className="w-8 h-8 mx-auto text-triply dark:text-triply-mint animate-bounce"
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
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* اختيار الخدمات */}
          {selectedDestination && selectedBudget && (
            <div className="space-y-6 animate-fade-in">
              <label className="flex items-center gap-2 text-lg font-bold text-triply-dark dark:text-dark-text-primary">
                <svg
                  className="w-6 h-6 text-triply dark:text-triply-mint"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("booking.step2Title")}
              </label>
              <FormHelper text={t("bookingMessages.selectServices")} />

              <div className="grid gap-3 sm:grid-cols-2">
                {/* حجز طيران */}
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedFlight(selectedFlight ? null : "selected");
                  }}
                  className={`group relative flex items-center gap-4 rounded-2xl border-2 p-6 text-right transition-all duration-300 overflow-hidden backdrop-blur-sm cursor-pointer ${
                    selectedFlight
                      ? "border-blue-500 dark:border-blue-500 bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100 dark:from-blue-900/60 dark:via-blue-950/50 dark:to-blue-900/60 shadow-xl shadow-blue-500/30 scale-[1.02]"
                      : "border-blue-200/60 dark:border-blue-800/40 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/50 dark:from-blue-950/40 dark:via-dark-surface/80 dark:to-blue-950/30 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 hover:scale-[1.02]"
                  }`}
                >
                  {/* Background Decoration */}
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-200/30 dark:bg-blue-800/20 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 text-4xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg shadow-blue-500/30">
                    ✈️
                  </div>
                  <div className="flex-1 text-right relative z-10">
                    <div className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-1">
                      {t("booking.flightLabel")}
                    </div>
                    <p className="text-sm text-blue-700/70 dark:text-blue-300/70">
                      {t("booking.serviceDescriptions.flight")}
                    </p>
                  </div>
                </div>

                {/* حجز فنادق */}
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedHotel(selectedHotel ? null : "selected");
                  }}
                  className={`group relative flex items-center gap-4 rounded-2xl border-2 p-6 text-right transition-all duration-300 overflow-hidden backdrop-blur-sm cursor-pointer ${
                    selectedHotel
                      ? "border-rose-500 dark:border-rose-500 bg-gradient-to-br from-rose-100 via-rose-50 to-rose-100 dark:from-rose-900/60 dark:via-rose-950/50 dark:to-rose-900/60 shadow-xl shadow-rose-500/30 scale-[1.02]"
                      : "border-rose-200/60 dark:border-rose-800/40 bg-gradient-to-br from-rose-50/80 via-white to-rose-50/50 dark:from-rose-950/40 dark:via-dark-surface/80 dark:to-rose-950/30 hover:border-rose-400 dark:hover:border-rose-600 hover:shadow-xl hover:shadow-rose-500/20 hover:-translate-y-1 hover:scale-[1.02]"
                  }`}
                >
                  {/* Background Decoration */}
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-rose-200/30 dark:bg-rose-800/20 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 dark:from-rose-500 dark:to-rose-700 text-4xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg shadow-rose-500/30">
                    🏨
                  </div>
                  <div className="flex-1 text-right relative z-10">
                    <div className="text-lg font-bold text-rose-900 dark:text-rose-100 mb-1">
                      {t("booking.hotelLabel")}
                    </div>
                    <p className="text-sm text-rose-700/70 dark:text-rose-300/70">
                      {t("booking.serviceDescriptions.hotel")}
                    </p>
                  </div>
                </div>

                {/* حجز مطاعم */}
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedRestaurant(
                      selectedRestaurant ? null : "selected"
                    );
                  }}
                  className={`group relative flex items-center gap-4 rounded-2xl border-2 p-6 text-right transition-all duration-300 overflow-hidden backdrop-blur-sm cursor-pointer ${
                    selectedRestaurant
                      ? "border-slate-500 dark:border-slate-500 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800/60 dark:via-slate-900/50 dark:to-slate-800/60 shadow-xl shadow-slate-500/30 scale-[1.02]"
                      : "border-slate-200/60 dark:border-slate-700/40 bg-gradient-to-br from-slate-50/80 via-white to-slate-50/50 dark:from-slate-900/40 dark:via-dark-surface/80 dark:to-slate-900/30 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-xl hover:shadow-slate-500/20 hover:-translate-y-1 hover:scale-[1.02]"
                  }`}
                >
                  {/* Background Decoration */}
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-slate-200/30 dark:bg-slate-700/20 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-400 to-slate-600 dark:from-slate-500 dark:to-slate-700 text-4xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg shadow-slate-500/30">
                    🍽️
                  </div>
                  <div className="flex-1 text-right relative z-10">
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {t("booking.restaurantLabel")}
                    </div>
                    <p className="text-sm text-slate-700/70 dark:text-slate-300/70">
                      {t("booking.serviceDescriptions.restaurant")}
                    </p>
                  </div>
                </div>

                {/* أنشطة وجولات */}
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedActivity(selectedActivity ? null : "selected");
                  }}
                  className={`group relative flex items-center gap-4 rounded-2xl border-2 p-6 text-right transition-all duration-300 overflow-hidden backdrop-blur-sm cursor-pointer ${
                    selectedActivity
                      ? "border-pink-500 dark:border-pink-500 bg-gradient-to-br from-pink-100 via-pink-50 to-pink-100 dark:from-pink-900/60 dark:via-pink-950/50 dark:to-pink-900/60 shadow-xl shadow-pink-500/30 scale-[1.02]"
                      : "border-pink-200/60 dark:border-pink-800/40 bg-gradient-to-br from-pink-50/80 via-white to-pink-50/50 dark:from-pink-950/40 dark:via-dark-surface/80 dark:to-pink-950/30 hover:border-pink-400 dark:hover:border-pink-600 hover:shadow-xl hover:shadow-pink-500/20 hover:-translate-y-1 hover:scale-[1.02]"
                  }`}
                >
                  {/* Background Decoration */}
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-pink-200/30 dark:bg-pink-800/20 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-pink-600 dark:from-pink-500 dark:to-pink-700 text-4xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg shadow-pink-500/30">
                    🎯
                  </div>
                  <div className="flex-1 text-right relative z-10">
                    <div className="text-lg font-bold text-pink-900 dark:text-pink-100 mb-1">
                      {t("booking.activityLabel")}
                    </div>
                    <p className="text-sm text-pink-700/70 dark:text-pink-300/70">
                      {t("booking.serviceDescriptions.activities")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ملخص الاختيار */}
        {(selectedDestination ||
          selectedServices.length > 0 ||
          selectedBudget ||
          selectedFlight ||
          selectedHotel ||
          selectedRestaurant ||
          selectedActivity) && (
          <div className="mt-8 rounded-2xl border-2 border-triply/30 dark:border-triply-mint/40 bg-gradient-to-br from-triply-sand/40 via-triply-mint/10 to-white dark:from-triply-teal/20 dark:via-dark-elevated/80 dark:to-dark-surface/60 backdrop-blur-sm p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-triply to-triply-teal dark:from-triply-mint dark:to-triply-teal shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-triply-dark dark:text-dark-text-primary">
                {t('booking.summaryTitle')}
              </h3>
            </div>
            <div className="space-y-3 text-sm sm:text-base">
              {selectedDestination && (
                <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-white dark:bg-dark-elevated border-2 border-triply-mint/40 dark:border-dark-border/40 shadow-sm hover:shadow-md transition-shadow">
                  <svg
                    className="w-5 h-5 text-triply dark:text-triply-mint flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <strong className="text-triply-dark dark:text-dark-text-primary">
                      {t('booking.destinationLabel')}:
                    </strong>
                    <span className="mr-2 font-semibold text-triply dark:text-triply-mint">
                      {selectedDestination}
                    </span>
                  </div>
                </div>
              )}
              {selectedServices.length > 0 && (
                <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-white dark:bg-dark-elevated border-2 border-triply-mint/40 dark:border-dark-border/40 shadow-sm hover:shadow-md transition-shadow">
                  <svg
                    className="w-5 h-5 text-triply dark:text-triply-mint flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <strong className="text-triply-dark dark:text-dark-text-primary">
                      {t('booking.servicesLabel')}:
                    </strong>
                    <span className="mr-2 font-semibold text-triply dark:text-triply-mint">
                      {selectedServices
                        .map(
                          (id) => bookingServices.find((s) => s.id === id)?.name
                        )
                        .join(" • ")}
                    </span>
                  </div>
                </div>
              )}
              {selectedBudget && (
                <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-white dark:bg-dark-elevated border-2 border-triply-mint/40 dark:border-dark-border/40 shadow-sm hover:shadow-md transition-shadow">
                  <svg
                    className="w-5 h-5 text-triply dark:text-triply-mint flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <strong className="text-triply-dark dark:text-dark-text-primary">
                      {t('booking.budgetLabel')}:
                    </strong>
                    <span className="mr-2 font-semibold text-triply dark:text-triply-mint">
                      {budgetLevels.find((b) => b.id === selectedBudget)?.name}
                    </span>
                  </div>
                </div>
              )}

              {/* الخدمات الإضافية المختارة */}
              {(selectedFlight ||
                selectedHotel ||
                selectedRestaurant ||
                selectedActivity) && (
                <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-triply/5 to-triply-mint/10 dark:from-triply-teal/10 dark:to-triply-mint/5 border-2 border-triply/20 dark:border-triply-mint/30 shadow-sm">
                  <svg
                    className="w-5 h-5 text-triply dark:text-triply-mint flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1">
                    <strong className="text-triply-dark dark:text-dark-text-primary block mb-2">
                      {t('booking.additionalServices')}:
                    </strong>
                    <div className="flex flex-wrap gap-2">
                      {selectedFlight && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium border border-blue-200 dark:border-blue-800">
                          ✈️ {t("booking.flightLabel")}
                        </span>
                      )}
                      {selectedHotel && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200 text-sm font-medium border border-rose-200 dark:border-rose-800">
                          🏨 {t("booking.hotelLabel")}
                        </span>
                      )}
                      {selectedRestaurant && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 text-sm font-medium border border-slate-200 dark:border-slate-700">
                          🍽️ {t("booking.restaurantLabel")}
                        </span>
                      )}
                      {selectedActivity && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 text-sm font-medium border border-pink-200 dark:border-pink-800">
                          🎯 {t("booking.activityLabel")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* زر الانتقال لصفحة الحجز */}
            <div className="mt-6 pt-6 border-t-2 border-triply/20 dark:border-triply-mint/30">
              <GlassButton
                type="button"
                variant="primary"
                size="lg"
                onClick={handleGetPriceQuote}
                className="w-full"
                disabled={!selectedDestination}
              >
                <div className="flex items-center justify-center gap-3">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-lg font-bold">
                    {t('booking.getQuoteButton')}
                  </span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </div>
              </GlassButton>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export { BookingSection };
