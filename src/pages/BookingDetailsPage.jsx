/**
 * صفحة BookingDetailsPage - صفحة تفاصيل الحجز
 * يدخل المستخدم:
 * - الوجهة والتواريخ
 * - اختيار الطيران والفندق
 * - الأنشطة والمطاعم
 * - حساب التكلفة الإجمالية
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext.jsx";
import { GlassButton } from "../components/ui/GlassButton.jsx";
import { FeedbackToast } from "../components/ui/FeedbackToast.jsx";
import { travelCosts, calculateDays } from "../data/travelCosts.js";
import { currencyRates } from "../data/currencyRates.js";
import { useScrollReveal } from "../hooks/useScrollReveal.js";
import {
  formatCurrency,
  getDestinationName,
  getCategoryName,
  translateDuration,
  translateActivityDescription,
} from "../utils/translationHelpers.js";

const STORAGE_KEY = "triply-booking-details";

// ترجمة أسماء شركات الطيران والفئات/الأمتعة حسب اللغة
const airlineNameMap = {
  "الخطوط السعودية - اقتصادية": {
    ar: "الخطوط السعودية - اقتصادية",
    en: "Saudia - Economy",
  },
  "الخطوط السعودية - درجة الأعمال": {
    ar: "الخطوط السعودية - درجة الأعمال",
    en: "Saudia - Business",
  },
  "الاتحاد للطيران - درجة الأعمال": {
    ar: "الاتحاد للطيران - درجة الأعمال",
    en: "Etihad Airways - Business",
  },
  "طيران الإمارات - الدرجة الأولى": {
    ar: "طيران الإمارات - الدرجة الأولى",
    en: "Emirates - First Class",
  },
  "Air France - درجة الأعمال": {
    ar: "Air France - درجة الأعمال",
    en: "Air France - Business",
  },
  "الخطوط التركية - درجة الأعمال": {
    ar: "الخطوط التركية - درجة الأعمال",
    en: "Turkish Airlines - Business",
  },
  "فلاي دبي - اقتصادية": {
    ar: "فلاي دبي - اقتصادية",
    en: "Flydubai - Economy",
  },
  "مصر للطيران - اقتصادية": {
    ar: "مصر للطيران - اقتصادية",
    en: "EgyptAir - Economy",
  },
};

const flightClassMap = {
  Economy: { ar: "اقتصادي", en: "Economy" },
  Business: { ar: "درجة الأعمال", en: "Business" },
  "First Class": { ar: "الدرجة الأولى", en: "First Class" },
};

const mealMap = {
  قياسية: { ar: "قياسية", en: "Standard" },
  مميزة: { ar: "مميزة", en: "Premium" },
  فاخرة: { ar: "فاخرة", en: "Luxury" },
};

const translateAirlineName = (name, language) => {
  const mapped = airlineNameMap[name];
  if (mapped) return mapped[language] || name;
  return name;
};

const translateFlightClass = (value, language) => {
  const mapped = flightClassMap[value];
  if (mapped) return mapped[language] || value;
  return value;
};

const translateBaggage = (value, language) => {
  if (!value) return "";
  if (language === "en") return value.replace("كجم", "kg");
  return value;
};

const translateMeals = (value, language) => {
  if (!value) return "";
  const mapped = mealMap[value];
  if (mapped) return mapped[language] || value;
  return value;
};

function BookingDetailsPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({
    threshold: 0.2,
  });
  const { ref: formRef, isVisible: formVisible } = useScrollReveal({
    threshold: 0.1,
  });

  // الحالة الأساسية
  const [destination, setDestination] = useState("london");
  const [category, setCategory] = useState("budget");

  console.log("BookingDetailsPage loaded", { destination, category });
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [days, setDays] = useState(0);

  // الخدمات المختارة
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);

  // UI state
  const [showSummary, setShowSummary] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  // الميزانية
  const [budget, setBudget] = useState("");
  const [budgetError, setBudgetError] = useState("");

  // عدد الأشخاص
  const [numberOfGuests, setNumberOfGuests] = useState(1);

  // Toast notifications
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });

  // دالة لعرض التنبيه
  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "error" });
    }, 5000);
  };

  // استرجاع البيانات من localStorage أو URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const savedPreferences = localStorage.getItem("triply-booking-preferences");
    const savedBookingData = localStorage.getItem("triply-booking-data");

    console.log("📥 Loading preferences:", {
      savedPreferences,
      params: params.toString(),
    });

    // أولوية للبيانات من URL parameters
    const urlDestination = params.get("destination");
    const urlCategory = params.get("category");
    const urlBudget = params.get("budget");

    if (urlDestination) {
      console.log("✅ Setting destination from URL:", urlDestination);
      setDestination(urlDestination);
    } else if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        console.log("📦 Parsed preferences:", parsed);
        if (parsed.destinationKey) {
          console.log(
            "✅ Setting destination from localStorage:",
            parsed.destinationKey
          );
          setDestination(parsed.destinationKey);
        }
      } catch (e) {
        console.error("Error parsing saved preferences:", e);
      }
    }

    // تعيين الفئة (category) من URL أو localStorage
    if (urlCategory) {
      console.log("✅ Setting category from URL:", urlCategory);
      setCategory(urlCategory);
    } else if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        if (parsed.budget) {
          console.log("✅ Setting category from localStorage:", parsed.budget);
          setCategory(parsed.budget);
        }
      } catch (e) {
        console.error("Error parsing saved preferences:", e);
      }
    }

    // تعيين الميزانية المحددة
    if (urlBudget) {
      console.log("✅ Setting budget from URL:", urlBudget);
      setBudget(urlBudget);
    } else if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        if (parsed.userBudget) {
          console.log(
            "✅ Setting budget from localStorage:",
            parsed.userBudget
          );
          setBudget(parsed.userBudget);
        }
      } catch (e) {
        console.error("Error parsing saved preferences:", e);
      }
    }

    // استرجاع الخدمات المختارة من الصفحة الأولى
    // تحقق من الخدمات المحفوظة وتحديد أيها تم اختياره
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        console.log('📦 Saved preferences:', parsed);
        
        // تخزين نوع الخدمات المختارة
        if (parsed.selectedFlight === 'selected' || parsed.selectedFlight) {
          localStorage.setItem('triply-needs-flight', 'true');
        }
        if (parsed.selectedHotel === 'selected' || parsed.selectedHotel) {
          localStorage.setItem('triply-needs-hotel', 'true');
        }
        if (parsed.selectedRestaurant === 'selected' || parsed.selectedRestaurant) {
          localStorage.setItem('triply-needs-restaurant', 'true');
        }
        if (parsed.selectedActivity === 'selected' || parsed.selectedActivity) {
          localStorage.setItem('triply-needs-activity', 'true');
        }
      } catch (e) {
        console.error("Error parsing saved preferences:", e);
      }
    }

    // تحميل بقية البيانات المحفوظة من bookingDetails إذا وجدت
    const bookingDetails = localStorage.getItem(STORAGE_KEY);
    if (bookingDetails) {
      try {
        const parsed = JSON.parse(bookingDetails);
        if (parsed.arrivalDate) setArrivalDate(parsed.arrivalDate);
        if (parsed.departureDate) setDepartureDate(parsed.departureDate);
        if (parsed.numberOfGuests) setNumberOfGuests(parsed.numberOfGuests);
        if (parsed.selectedFlight) setSelectedFlight(parsed.selectedFlight);
        if (parsed.selectedHotel) setSelectedHotel(parsed.selectedHotel);
        if (parsed.selectedRestaurants)
          setSelectedRestaurants(parsed.selectedRestaurants);
        if (parsed.selectedActivities)
          setSelectedActivities(parsed.selectedActivities);
      } catch (e) {
        console.error("Error parsing booking details:", e);
      }
    }
  }, [location]);

  // حساب عدد الأيام تلقائيًا
  useEffect(() => {
    if (arrivalDate && departureDate) {
      const calculatedDays = calculateDays(arrivalDate, departureDate);
      setDays(calculatedDays);
    }
  }, [arrivalDate, departureDate]);

  // حفظ في localStorage
  useEffect(() => {
    const data = {
      destination,
      category,
      arrivalDate,
      departureDate,
      days,
      numberOfGuests,
      selectedFlight,
      selectedHotel,
      selectedRestaurants,
      selectedActivities,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [
    destination,
    category,
    arrivalDate,
    departureDate,
    days,
    numberOfGuests,
    selectedFlight,
    selectedHotel,
    selectedRestaurants,
    selectedActivities,
  ]);

  // دالة لتحويل السعر لعملة الدولة
  const convertCurrency = (sarPrice) => {
    const currencyInfo = currencyRates[destination];

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

  // حساب التكلفة الإجمالية
  useEffect(() => {
    let total = 0;

    // الطيران
    if (selectedFlight && selectedFlight !== "selected") {
      try {
        const flight =
          typeof selectedFlight === "string"
            ? JSON.parse(selectedFlight)
            : selectedFlight;
        if (flight.price) {
          total += flight.price;
        }
      } catch (e) {
        console.log("Flight data is not a JSON object:", selectedFlight);
      }
    }

    // الفندق
    if (selectedHotel && selectedHotel !== "selected" && days > 0) {
      try {
        const hotel =
          typeof selectedHotel === "string"
            ? JSON.parse(selectedHotel)
            : selectedHotel;
        if (hotel.price) {
          total += hotel.price * days;
        }
      } catch (e) {
        console.log("Hotel data is not a JSON object:", selectedHotel);
      }
    }

    // المطاعم
    if (selectedRestaurants.length > 0) {
      selectedRestaurants.forEach((rest) => {
        if (rest !== "selected") {
          try {
            const restaurant =
              typeof rest === "string" ? JSON.parse(rest) : rest;
            if (restaurant.price) {
              total += restaurant.price;
            }
          } catch (e) {
            console.log("Restaurant data is not a JSON object:", rest);
          }
        }
      });
    }

    // الأنشطة
    if (selectedActivities.length > 0) {
      selectedActivities.forEach((act) => {
        if (act !== "selected") {
          try {
            const activity = typeof act === "string" ? JSON.parse(act) : act;
            if (activity.price) {
              total += activity.price;
            }
          } catch (e) {
            console.log("Activity data is not a JSON object:", act);
          }
        }
      });
    }

    // ضرب المجموع في عدد الأشخاص
    total = total * numberOfGuests;

    setTotalCost(total);

    // التحقق من تجاوز الميزانية
    if (budget && parseFloat(budget) > 0 && total > parseFloat(budget)) {
      setBudgetError(
        t("bookingDetails.budgetExceeded", {
          total: total.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US'),
          budget: parseFloat(budget).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')
        })
      );
    } else {
      setBudgetError("");
    }
  }, [
    selectedFlight,
    selectedHotel,
    selectedRestaurants,
    selectedActivities,
    days,
    numberOfGuests,
    budget,
  ]);

  const cityData = travelCosts[destination];
  const flights = cityData?.flights || [];
  const hotels = cityData?.hotels?.[category] || [];
  const restaurants = cityData?.restaurants?.[category] || [];
  const activities = cityData?.activities || [];

  console.log("cityData:", {
    cityData,
    flights: flights.length,
    hotels: hotels.length,
    restaurants: restaurants.length,
    activities: activities.length,
  });

  // فلترة الأنشطة حسب الفئة
  const filteredActivities = activities.filter(
    (act) => act.category === category
  );

  // اختيار الخدمات تلقائياً عند تحميل الصفحة (إذا كانت محددة من الصفحة السابقة)
  useEffect(() => {
    const needsFlight = localStorage.getItem('triply-needs-flight');
    const needsHotel = localStorage.getItem('triply-needs-hotel');
    const needsRestaurant = localStorage.getItem('triply-needs-restaurant');
    const needsActivity = localStorage.getItem('triply-needs-activity');

    if (needsFlight === 'true' && !selectedFlight && flights.length > 0) {
      setSelectedFlight(flights[0]);
      localStorage.removeItem('triply-needs-flight');
    }
    if (needsHotel === 'true' && !selectedHotel && hotels.length > 0) {
      setSelectedHotel(hotels[0]);
      localStorage.removeItem('triply-needs-hotel');
    }
    if (needsRestaurant === 'true' && selectedRestaurants.length === 0 && restaurants.length > 0) {
      setSelectedRestaurants([restaurants[0]]);
      localStorage.removeItem('triply-needs-restaurant');
    }
    if (needsActivity === 'true' && selectedActivities.length === 0 && filteredActivities.length > 0) {
      setSelectedActivities([filteredActivities[0]]);
      localStorage.removeItem('triply-needs-activity');
    }
  }, [flights, hotels, restaurants, filteredActivities]);

  // التحقق من إمكانية إضافة خدمة
  const canAddService = (serviceCost) => {
    if (!budget || parseFloat(budget) <= 0) return true;
    return totalCost + serviceCost <= parseFloat(budget);
  };

  // Toggle restaurant selection
  const toggleRestaurant = (restaurant) => {
    setSelectedRestaurants((prev) => {
      const exists = prev.find((r) => r.id === restaurant.id);
      if (exists) {
        return prev.filter((r) => r.id !== restaurant.id);
      } else {
        // التحقق من الميزانية قبل الإضافة
        const restaurantCost = restaurant.price;
        if (!canAddService(restaurantCost)) {
          showToast(
            `لا يمكن إضافة هذا المطعم لأنه سيتجاوز ميزانيتك المحددة (${parseFloat(
              budget
            ).toLocaleString()} ر.س)`
          );
          return prev;
        }
        return [...prev, restaurant];
      }
    });
  };

  // Toggle activity selection
  const toggleActivity = (activity) => {
    setSelectedActivities((prev) => {
      const exists = prev.find((a) => a.id === activity.id);
      if (exists) {
        return prev.filter((a) => a.id !== activity.id);
      } else {
        // التحقق من الميزانية قبل الإضافة
        if (!canAddService(activity.price)) {
          showToast(
            `لا يمكن إضافة هذا النشاط لأنه سيتجاوز ميزانيتك المحددة (${parseFloat(
              budget
            ).toLocaleString()} ر.س)`
          );
          return prev;
        }
        return [...prev, activity];
      }
    });
  };

  // الانتقال لصفحة التأكيد
  const handleConfirmBooking = () => {
    // التحقق من عدد الأشخاص
    if (!numberOfGuests || numberOfGuests < 1) {
      showToast(t('bookingDetails.guestsRequired') || "يجب تحديد عدد الأشخاص (الحد الأدنى: 1)");
      return;
    }

    // التحقق من الميزانية قبل التأكيد
    if (budget && parseFloat(budget) > 0 && totalCost > parseFloat(budget)) {
      showToast(
        `لا يمكن تأكيد الحجز! التكلفة الإجمالية (${totalCost.toLocaleString()} ر.س) تجاوزت الميزانية المحددة (${parseFloat(
          budget
        ).toLocaleString()} ر.س)`
      );
      return;
    }

    const bookingData = {
      destination,
      category,
      arrivalDate,
      departureDate,
      days,
      numberOfGuests,
      selectedFlight,
      selectedHotel,
      selectedRestaurants,
      selectedActivities,
      totalCost,
      pricePerPerson: totalCost / numberOfGuests,
      budget,
    };

    // حفظ البيانات في localStorage
    localStorage.setItem(
      "triply-booking-confirmation",
      JSON.stringify(bookingData)
    );

    // الانتقال لصفحة التأكيد
    navigate("/booking-confirmation", { state: { bookingData } });
  };

  // مشاركة عبر واتساب
  const handleWhatsAppShare = () => {
    const message = `
${t('bookingDetails.whatsappTitle')}

${t('bookingDetails.whatsappDestination', { destination: getDestinationName(destination, language) })}
${t('bookingDetails.whatsappCategory', { category: getCategoryName(category, language) })}
${t('bookingDetails.whatsappArrival', { date: arrivalDate })}
${t('bookingDetails.whatsappDeparture', { date: departureDate })}
${t('bookingDetails.whatsappDays', { days })}

${t('bookingDetails.whatsappFlight', { 
  airline: selectedFlight?.airline || t('bookingDetails.notSpecified'), 
  price: selectedFlight?.price || 0 
})}
${t('bookingDetails.whatsappHotel', { 
  hotel: selectedHotel?.name || t('bookingDetails.notSpecified'), 
  price: selectedHotel?.price || 0 
})}
${t('bookingDetails.whatsappRestaurants', { count: selectedRestaurants.length })}
${t('bookingDetails.whatsappActivities', { count: selectedActivities.length })}

${t('bookingDetails.whatsappTotal', { total: totalCost.toFixed(2) })}

---
${t('bookingDetails.whatsappFooter')}
    `.trim();

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-triply-sand/20 via-white to-triply-mint/10 dark:from-dark-bg dark:via-dark-surface/50 dark:to-dark-elevated">
      {/* Header */}
      <div className="relative overflow-hidden bg-hero-gradient dark:bg-gradient-to-br dark:from-dark-bg dark:via-dark-surface dark:to-dark-elevated">
        <div
          className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-10 right-10 h-64 w-64 rounded-full bg-triply-mint/40 dark:bg-triply-teal/30 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-triply-accent/30 dark:bg-triply-mint/20 blur-3xl" />
        </div>

        <div
          ref={headerRef}
          className={`relative mx-auto max-w-6xl px-6 py-16 text-right text-white dark:text-dark-text-primary ${
            headerVisible ? "reveal-fade-down" : "reveal"
          }`}
        >
          <button
            onClick={() => navigate("/")}
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/90 dark:text-dark-text-secondary hover:text-white dark:hover:text-dark-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            {t("bookingDetails.backToHome")}
          </button>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight mb-4">
            {t("bookingDetails.titlePart1")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-triply-mint via-triply-sand to-white dark:from-triply-teal dark:via-triply-mint dark:to-triply-sand">
              {t("bookingDetails.titleHighlight")}
            </span>{" "}
            {t("bookingDetails.titlePart2")}
          </h1>
          <p className="text-sm sm:text-base leading-7 text-white/80 dark:text-dark-text-secondary max-w-2xl">
            {t("bookingDetails.subtitle")}
          </p>
        </div>
      </div>

      {/* Main Form */}
      <div className="relative mx-auto max-w-6xl px-6 py-12">
        <div
          ref={formRef}
          className={`space-y-8 ${formVisible ? "reveal-scale" : "reveal"}`}
        >
          {/* الخيارات الأساسية */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-triply-mint/40 dark:border-triply-teal/40 bg-gradient-to-br from-white via-triply-sand/20 to-triply-mint/10 dark:from-dark-elevated/90 dark:via-dark-surface/80 dark:to-dark-bg/90 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-2xl hover:shadow-ambient dark:hover:shadow-ambient-dark transition-all duration-500">
            {/* Decorative gradient overlay */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-triply-mint/30 to-triply-teal/20 dark:from-triply-teal/20 dark:to-triply-mint/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-br from-triply-accent/20 to-triply-mint/10 dark:from-triply-accent/10 dark:to-triply-mint/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-triply via-triply-teal to-triply-mint dark:from-triply-mint dark:via-triply-teal dark:to-triply shadow-lg">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-triply-dark dark:text-dark-text-primary">
                    {t('bookingDetails.step1Title')}
                  </h2>
                  <p className="text-sm text-triply-slate/70 dark:text-dark-text-secondary">
                    {t('bookingDetails.step1Description')}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 grid gap-6 md:grid-cols-2">
              {/* الوجهة */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-triply-dark dark:text-dark-text-primary">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-triply/10 dark:bg-triply-mint/10">
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
                  </div>
                  {t('bookingDetails.destinationLabel')}
                </label>
                <div className="relative group">
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full rounded-xl border-2 border-triply-mint/40 dark:border-dark-border/50 bg-white dark:!bg-dark-surface px-5 py-3.5 text-right text-base font-medium text-triply-dark dark:!text-dark-text-primary shadow-lg transition-all duration-300 hover:border-triply dark:hover:border-triply-mint hover:shadow-xl focus:border-triply dark:focus:border-triply-mint focus:outline-none focus:ring-4 focus:ring-triply/20 dark:focus:ring-triply-mint/30 group-hover:scale-[1.02]"
                  >
                    <option value="london">{t('bookingDetails.dest_london')}</option>
                    <option value="paris">{t('bookingDetails.dest_paris')}</option>
                    <option value="turkey">{t('bookingDetails.dest_turkey')}</option>
                    <option value="dubai">{t('bookingDetails.dest_dubai')}</option>
                    <option value="egypt">{t('bookingDetails.dest_egypt')}</option>
                  </select>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-triply/0 via-triply-mint/5 to-triply/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>

              {/* الفئة */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-triply-dark dark:text-dark-text-primary">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-triply/10 dark:bg-triply-mint/10">
                    <svg
                      className="w-5 h-5 text-triply dark:text-triply-mint"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  {t('bookingDetails.categoryLabel')}
                </label>
                <div className="relative group">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border-2 border-triply-mint/40 dark:border-dark-border/50 bg-white dark:!bg-dark-surface px-5 py-3.5 text-right text-base font-medium text-triply-dark dark:!text-dark-text-primary shadow-lg transition-all duration-300 hover:border-triply dark:hover:border-triply-mint hover:shadow-xl focus:border-triply dark:focus:border-triply-mint focus:outline-none focus:ring-4 focus:ring-triply/20 dark:focus:ring-triply-mint/30 group-hover:scale-[1.02]"
                  >
                    <option value="budget">{t('bookingDetails.category_budget')}</option>
                    <option value="midRange">{t('bookingDetails.category_midRange')}</option>
                    <option value="luxury">{t('bookingDetails.category_luxury')}</option>
                  </select>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-triply/0 via-triply-mint/5 to-triply/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>

              {/* تاريخ الوصول */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-triply-dark dark:text-dark-text-primary">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-triply/10 dark:bg-triply-mint/10">
                    <svg
                      className="w-5 h-5 text-triply dark:text-triply-mint"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  {t('bookingDetails.arrivalDate')}
                </label>
                <div className="relative group">
                  <input
                    type="date"
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    className="w-full rounded-xl border-2 border-triply-mint/40 dark:border-dark-border/50 bg-white dark:!bg-dark-surface px-5 py-3.5 text-right text-base font-medium text-triply-dark dark:!text-dark-text-primary shadow-lg transition-all duration-300 hover:border-triply dark:hover:border-triply-mint hover:shadow-xl focus:border-triply dark:focus:border-triply-mint focus:outline-none focus:ring-4 focus:ring-triply/20 dark:focus:ring-triply-mint/30 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-triply/0 via-triply-mint/5 to-triply/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>

              {/* تاريخ المغادرة */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-triply-dark dark:text-dark-text-primary">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-triply/10 dark:bg-triply-mint/10">
                    <svg
                      className="w-5 h-5 text-triply dark:text-triply-mint"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  {t('bookingDetails.departureDate')}
                </label>
                <div className="relative group">
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    min={arrivalDate}
                    className="w-full rounded-xl border-2 border-triply-mint/40 dark:border-dark-border/50 bg-white dark:!bg-dark-surface px-5 py-3.5 text-right text-base font-medium text-triply-dark dark:!text-dark-text-primary shadow-lg transition-all duration-300 hover:border-triply dark:hover:border-triply-mint hover:shadow-xl focus:border-triply dark:focus:border-triply-mint focus:outline-none focus:ring-4 focus:ring-triply/20 dark:focus:ring-triply-mint/30 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-triply/0 via-triply-mint/5 to-triply/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>

              {/* الميزانية */}
              <div className="space-y-3 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-triply-dark dark:text-dark-text-primary">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-triply-accent to-triply dark:from-triply-mint dark:to-triply-teal">
                    <svg
                      className="w-5 h-5 text-white"
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
                  </div>
                  <span className="text-lg">{t('bookingDetails.budget')}</span>
                  <span className="text-xs text-triply-slate/60 dark:text-dark-text-secondary font-normal">
                    ({t('bookingDetails.budgetHelper')})
                  </span>
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder={t('bookingDetails.budgetPlaceholder')}
                    min="0"
                    step="100"
                    className="w-full rounded-xl border-2 border-triply-accent/40 dark:border-triply-mint/40 bg-gradient-to-br from-white to-triply-sand/20 dark:from-dark-surface dark:to-dark-elevated pr-5 pl-20 py-4 text-right text-lg font-bold text-triply-dark dark:!text-dark-text-primary shadow-xl transition-all duration-300 hover:border-triply-accent dark:hover:border-triply-mint hover:shadow-2xl focus:border-triply-accent dark:focus:border-triply-mint focus:outline-none focus:ring-4 focus:ring-triply-accent/30 dark:focus:ring-triply-mint/30 group-hover:scale-[1.02] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-triply-accent dark:text-triply-mint font-bold text-lg pointer-events-none">
                    ر.س
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-triply-accent/0 via-triply-accent/5 to-triply-accent/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
                {budget && parseFloat(budget) > 0 && (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-triply-mint/20 via-triply-teal/10 to-triply-mint/20 dark:from-triply-teal/20 dark:via-triply-mint/10 dark:to-triply-teal/20 border border-triply-mint/30 dark:border-triply-teal/30">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-triply-dark dark:text-dark-text-primary">
                        💰 {t('bookingDetails.budgetSet')}
                      </span>
                      <span className="text-lg font-bold text-triply dark:text-triply-mint">
                        {parseFloat(budget).toLocaleString()} ر.س
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-triply-slate dark:text-dark-text-secondary">
                        {t('bookingDetails.budgetRemaining')}
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          parseFloat(budget) - totalCost >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {(parseFloat(budget) - totalCost).toLocaleString()} ر.س
                      </span>
                    </div>
                  </div>
                )}
                {budgetError && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 animate-pulse">
                    <svg
                      className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm font-bold text-red-700 dark:text-red-300">
                      {budgetError}
                    </p>
                  </div>
                )}
              </div>

              {/* عدد الأشخاص */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-triply-dark dark:text-dark-text-primary">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-triply/10 dark:bg-triply-mint/10">
                    <svg
                      className="w-5 h-5 text-triply dark:text-triply-mint"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  {t('bookingDetails.numberOfGuests')} *
                </label>
                <div className="relative group">
                  <select
                    value={numberOfGuests}
                    onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
                    className="w-full rounded-xl border-2 border-triply-mint/40 dark:border-dark-border/50 bg-white dark:!bg-dark-surface px-5 py-3.5 text-right text-base font-medium text-triply-dark dark:!text-dark-text-primary shadow-lg transition-all duration-300 hover:border-triply dark:hover:border-triply-mint hover:shadow-xl focus:border-triply dark:focus:border-triply-mint focus:outline-none focus:ring-4 focus:ring-triply/20 dark:focus:ring-triply-mint/30 group-hover:scale-[1.02] cursor-pointer"
                    required
                  >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? t('bookingDetails.person') : t('bookingDetails.persons')}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-triply/0 via-triply-mint/5 to-triply/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <p className="text-xs text-triply-slate/60 dark:text-dark-text-secondary">
                  {t('bookingDetails.guestsHelp')}
                </p>
              </div>
            </div>

            {/* عدد الأيام */}
            {days > 0 && (
              <div className="relative z-10 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-triply via-triply-teal to-triply-mint dark:from-triply-mint dark:via-triply-teal dark:to-triply px-6 py-3 text-sm font-bold text-white shadow-xl animate-pulse">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span>{t('bookingDetails.daysCount', { count: days })}</span>
              </div>
            )}
          </div>

          {/* الطيران */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-triply-mint/40 dark:border-triply-teal/40 bg-gradient-to-br from-white via-triply-sand/20 to-triply-mint/10 dark:from-dark-elevated/90 dark:via-dark-surface/80 dark:to-dark-bg/90 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-2xl hover:shadow-ambient dark:hover:shadow-ambient-dark transition-all duration-500">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-triply-accent/20 to-triply-mint/10 dark:from-triply-accent/10 dark:to-triply-mint/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-triply via-triply-teal to-triply-mint dark:from-triply-mint dark:via-triply-teal dark:to-triply shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-triply-dark dark:text-dark-text-primary">
                  {t('bookingDetails.flightsTitle')}
                </h2>
                <p className="text-sm text-triply-slate/70 dark:text-dark-text-secondary">
                  {t('bookingDetails.flightsDescription')}
                </p>
              </div>
            </div>

            <div className="relative z-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {flights.map((flight) => (
                <button
                  key={flight.id}
                  onClick={() => {
                    // حساب التكلفة الجديدة
                    const newTotal =
                      totalCost - (selectedFlight?.price || 0) + flight.price;
                    if (
                      budget &&
                      parseFloat(budget) > 0 &&
                      newTotal > parseFloat(budget)
                    ) {
                      showToast(
                        t('bookingDetails.flightExceedsBudget', {
                          budget: parseFloat(budget).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')
                        })
                      );
                      return;
                    }
                    setSelectedFlight(flight);
                  }}
                  className={`group relative overflow-hidden rounded-2xl p-6 text-right transition-all duration-500 border-2 ${
                    selectedFlight?.id === flight.id
                      ? "border-triply dark:border-triply-mint shadow-2xl dark:shadow-glow-dark bg-gradient-to-br from-triply/5 via-triply-mint/10 to-triply-teal/5 dark:from-triply-mint/10 dark:via-triply-teal/10 dark:to-triply/5 scale-105"
                      : "border-triply-mint/30 dark:border-dark-border/40 bg-white/80 dark:bg-dark-surface/60 hover:border-triply dark:hover:border-triply-mint hover:shadow-xl hover:scale-[1.03]"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedFlight?.id === flight.id
                          ? "border-triply dark:border-triply-mint bg-triply dark:bg-triply-mint"
                          : "border-triply-mint/50 dark:border-triply-teal/50"
                      }`}
                    >
                      {selectedFlight?.id === flight.id && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-triply-dark dark:text-dark-text-primary mb-2">
                    {translateAirlineName(flight.airline, language)}
                  </h3>
                  <p className="text-sm text-triply-slate/70 dark:text-dark-text-secondary mb-3">
                    {translateFlightClass(flight.class, language)} • {translateBaggage(flight.baggage, language)}
                    {flight.meals ? ` • ${translateMeals(flight.meals, language)}` : ""}
                  </p>
                  <p className="text-2xl font-bold text-triply dark:text-triply-mint">
                    {formatCurrency(flight.price, language)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* الفنادق */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-triply-mint/40 dark:border-triply-teal/40 bg-gradient-to-br from-white via-triply-sand/20 to-triply-mint/10 dark:from-dark-elevated/90 dark:via-dark-surface/80 dark:to-dark-bg/90 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-2xl hover:shadow-ambient dark:hover:shadow-ambient-dark transition-all duration-500">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-triply-mint/20 to-triply-teal/10 dark:from-triply-teal/10 dark:to-triply-mint/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-triply via-triply-teal to-triply-mint dark:from-triply-mint dark:via-triply-teal dark:to-triply shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-triply-dark dark:text-dark-text-primary">
                  {t('bookingDetails.hotelsTitle')}
                </h2>
                <p className="text-sm text-triply-slate/70 dark:text-dark-text-secondary">
                  {t('bookingDetails.hotelsDescription')}
                </p>
              </div>
            </div>

            <div className="relative z-10 grid gap-4 sm:grid-cols-2">
              {hotels.map((hotel) => (
                <button
                  key={hotel.id}
                  onClick={() => {
                    const newTotal =
                      totalCost -
                      (selectedHotel ? selectedHotel.price * days : 0) +
                      hotel.price * days;
                    if (
                      budget &&
                      parseFloat(budget) > 0 &&
                      newTotal > parseFloat(budget)
                    ) {
                      showToast(
                        `لا يمكن اختيار هذا الفندق لأنه سيتجاوز ميزانيتك المحددة (${parseFloat(
                          budget
                        ).toLocaleString()} ر.س)`
                      );
                      return;
                    }
                    setSelectedHotel(hotel);
                  }}
                  className={`group relative overflow-hidden rounded-2xl p-6 text-right transition-all duration-500 border-2 ${
                    selectedHotel?.id === hotel.id
                      ? "border-triply dark:border-triply-mint shadow-2xl dark:shadow-glow-dark bg-gradient-to-br from-triply/5 via-triply-mint/10 to-triply-teal/5 dark:from-triply-mint/10 dark:via-triply-teal/10 dark:to-triply/5 scale-105"
                      : "border-triply-mint/30 dark:border-dark-border/40 bg-white/80 dark:bg-dark-surface/60 hover:border-triply dark:hover:border-triply-mint hover:shadow-xl hover:scale-[1.03]"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedHotel?.id === hotel.id
                          ? "border-triply dark:border-triply-mint bg-triply dark:bg-triply-mint"
                          : "border-triply-mint/50 dark:border-triply-teal/50"
                      }`}
                    >
                      {selectedHotel?.id === hotel.id && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(hotel.stars)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-4 h-4 text-triply-accent dark:text-triply-accentLight"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-triply-dark dark:text-dark-text-primary mb-2">
                    {hotel.name}
                  </h3>
                  <p className="text-sm text-triply-slate/70 dark:text-dark-text-secondary mb-3">
                    {hotel.location}
                  </p>
                  <p className="text-2xl font-bold text-triply dark:text-triply-mint">
                    {formatCurrency(hotel.price, language, 'perNight')}
                  </p>
                  {days > 0 && (
                    <p className="text-xs text-triply-slate/60 dark:text-dark-text-secondary mt-1">
                      {t('bookingDetails.totalNights', {
                        amount: (hotel.price * days).toFixed(2),
                        nights: days
                      })}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* المطاعم */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-triply-mint/40 dark:border-triply-teal/40 bg-gradient-to-br from-white via-triply-sand/20 to-triply-mint/10 dark:from-dark-elevated/90 dark:via-dark-surface/80 dark:to-dark-bg/90 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-2xl hover:shadow-ambient dark:hover:shadow-ambient-dark transition-all duration-500">
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-br from-triply-accent/20 to-triply-mint/10 dark:from-triply-accent/10 dark:to-triply-mint/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-triply via-triply-teal to-triply-mint dark:from-triply-mint dark:via-triply-teal dark:to-triply shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-triply-dark dark:text-dark-text-primary">
                  {t('bookingDetails.restaurantsTitle')}
                </h2>
                <p className="text-sm text-triply-slate/70 dark:text-dark-text-secondary">
                  {t('bookingDetails.restaurantsDescription')}
                </p>
              </div>
            </div>

            <div className="relative z-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant) => {
                const isSelected = selectedRestaurants.find(
                  (r) => r.id === restaurant.id
                );
                return (
                  <button
                    key={restaurant.id}
                    onClick={() => toggleRestaurant(restaurant)}
                    className={`group relative overflow-hidden rounded-2xl p-6 text-right transition-all duration-500 border-2 ${
                      isSelected
                        ? "border-triply dark:border-triply-mint shadow-2xl dark:shadow-glow-dark bg-gradient-to-br from-triply/5 via-triply-mint/10 to-triply-teal/5 dark:from-triply-mint/10 dark:via-triply-teal/10 dark:to-triply/5 scale-105"
                        : "border-triply-mint/30 dark:border-dark-border/40 bg-white/80 dark:bg-dark-surface/60 hover:border-triply dark:hover:border-triply-mint hover:shadow-xl hover:scale-[1.03]"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? "border-triply dark:border-triply-mint bg-triply dark:bg-triply-mint"
                            : "border-triply-mint/50 dark:border-triply-teal/50"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-triply-dark dark:text-dark-text-primary mb-2">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-triply-slate/70 dark:text-dark-text-secondary mb-3">
                      {t(`cuisineTypes.${restaurant.cuisine}`) || restaurant.cuisine} • {restaurant.location}
                    </p>
                    <p className="text-2xl font-bold text-triply dark:text-triply-mint">
                      {formatCurrency(restaurant.price, language, 'perDay')}
                    </p>
                    {days > 0 && isSelected && (
                      <p className="text-xs text-triply-slate/60 dark:text-dark-text-secondary mt-1">
                        {t('bookingDetails.totalNights', {
                          amount: (restaurant.price * days).toFixed(2),
                          nights: days
                        })}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* الأنشطة */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-triply-mint/40 dark:border-triply-teal/40 bg-gradient-to-br from-white via-triply-sand/20 to-triply-mint/10 dark:from-dark-elevated/90 dark:via-dark-surface/80 dark:to-dark-bg/90 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-2xl hover:shadow-ambient dark:hover:shadow-ambient-dark transition-all duration-500">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-triply-teal/20 to-triply-mint/10 dark:from-triply-teal/10 dark:to-triply-mint/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-triply via-triply-teal to-triply-mint dark:from-triply-mint dark:via-triply-teal dark:to-triply shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-triply-dark dark:text-dark-text-primary">
                  {t('bookingDetails.activitiesTitle')}
                </h2>
                <p className="text-sm text-triply-slate/70 dark:text-dark-text-secondary">
                  {t('bookingDetails.activitiesDescription')}
                </p>
              </div>
            </div>

            <div className="relative z-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredActivities.map((activity) => {
                const isSelected = selectedActivities.find(
                  (a) => a.id === activity.id
                );
                return (
                  <button
                    key={activity.id}
                    onClick={() => toggleActivity(activity)}
                    className={`group relative overflow-hidden rounded-2xl p-6 text-right transition-all duration-500 border-2 ${
                      isSelected
                        ? "border-triply dark:border-triply-mint shadow-2xl dark:shadow-glow-dark bg-gradient-to-br from-triply/5 via-triply-mint/10 to-triply-teal/5 dark:from-triply-mint/10 dark:via-triply-teal/10 dark:to-triply/5 scale-105"
                        : "border-triply-mint/30 dark:border-dark-border/40 bg-white/80 dark:bg-dark-surface/60 hover:border-triply dark:hover:border-triply-mint hover:shadow-xl hover:scale-[1.03]"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? "border-triply dark:border-triply-mint bg-triply dark:bg-triply-mint"
                            : "border-triply-mint/50 dark:border-triply-teal/50"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-triply-dark dark:text-dark-text-primary mb-2">
                      {activity.name}
                    </h3>
                    <p className="text-sm text-triply-slate/70 dark:text-dark-text-secondary mb-3">
                      {translateDuration(activity.duration, language)} • {translateActivityDescription(activity.description, language)}
                    </p>
                    <p className="text-2xl font-bold text-triply dark:text-triply-mint">
                      {activity.price === 0
                        ? t('bookingDetails.free')
                        : formatCurrency(activity.price, language)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* الملخص النهائي */}
          <div className="relative overflow-hidden rounded-3xl border-4 border-triply dark:border-triply-mint bg-gradient-to-br from-triply-mint/20 via-triply-teal/15 to-triply-accent/10 dark:from-triply-teal/30 dark:via-triply-mint/25 dark:to-triply-accent/15 backdrop-blur-xl p-8 sm:p-10 space-y-8 shadow-2xl hover:shadow-ambient dark:hover:shadow-ambient-dark transition-all duration-500">
            {/* Decorative elements */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-triply-accent/30 to-triply-mint/20 dark:from-triply-accent/20 dark:to-triply-mint/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-gradient-to-br from-triply-teal/30 to-triply-mint/20 dark:from-triply-teal/20 dark:to-triply-mint/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-triply via-triply-teal to-triply-mint dark:from-triply-mint dark:via-triply-teal dark:to-triply shadow-2xl">
                <svg
                  className="w-9 h-9 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path
                    fillRule="evenodd"
                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-triply-dark dark:text-dark-text-primary">
                  {t('bookingDetails.summaryTitle')}
                </h2>
                <p className="text-sm text-triply-slate/80 dark:text-dark-text-secondary">
                  {t('bookingDetails.summaryDescription')}
                </p>
              </div>
            </div>

            <div className="relative z-10 space-y-5">
              {selectedFlight && (
                <div className="flex justify-between items-center p-4 rounded-xl bg-white/60 dark:bg-dark-surface/50 backdrop-blur-sm border border-triply-mint/30 dark:border-triply-teal/30 hover:shadow-lg transition-all duration-300">
                  <span className="text-xl font-bold text-triply dark:text-triply-mint">
                    {formatCurrency(selectedFlight.price, language)}
                  </span>
                  <span className="text-base text-triply-slate/90 dark:text-dark-text-secondary font-medium">
                    {t('bookingDetails.flightLabel')}
                  </span>
                </div>
              )}

              {selectedHotel && days > 0 && (
                <div className="flex justify-between items-center p-4 rounded-xl bg-white/60 dark:bg-dark-surface/50 backdrop-blur-sm border border-triply-mint/30 dark:border-triply-teal/30 hover:shadow-lg transition-all duration-300">
                  <span className="text-xl font-bold text-triply dark:text-triply-mint">
                    {formatCurrency((selectedHotel.price * days), language)}
                  </span>
                  <span className="text-base text-triply-slate/90 dark:text-dark-text-secondary font-medium">
                    {t('bookingDetails.hotelNights', { count: days })}
                  </span>
                </div>
              )}

              {selectedRestaurants.length > 0 && days > 0 && (
                <div className="flex justify-between items-center p-4 rounded-xl bg-white/60 dark:bg-dark-surface/50 backdrop-blur-sm border border-triply-mint/30 dark:border-triply-teal/30 hover:shadow-lg transition-all duration-300">
                  <span className="text-xl font-bold text-triply dark:text-triply-mint">
                    {formatCurrency(
                      selectedRestaurants.reduce((sum, r) => sum + r.price * days, 0),
                      language
                    )}
                  </span>
                  <span className="text-base text-triply-slate/90 dark:text-dark-text-secondary font-medium">
                    {t('bookingDetails.restaurantsCount', { count: selectedRestaurants.length })}
                  </span>
                </div>
              )}

              {selectedActivities.length > 0 && (
                <div className="flex justify-between items-center p-4 rounded-xl bg-white/60 dark:bg-dark-surface/50 backdrop-blur-sm border border-triply-mint/30 dark:border-triply-teal/30 hover:shadow-lg transition-all duration-300">
                  <span className="text-xl font-bold text-triply dark:text-triply-mint">
                    {formatCurrency(
                      selectedActivities.reduce((sum, a) => sum + a.price, 0),
                      language
                    )}
                  </span>
                  <span className="text-base text-triply-slate/90 dark:text-dark-text-secondary font-medium">
                    {t('bookingDetails.activitiesCount', { count: selectedActivities.length })}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center p-6 rounded-2xl bg-gradient-to-r from-triply/10 via-triply-teal/10 to-triply-mint/10 dark:from-triply-mint/20 dark:via-triply-teal/20 dark:to-triply/20 border-2 border-triply dark:border-triply-mint shadow-xl mt-6">
                <div className="text-left">
                  {/* عرض عدد الأشخاص والسعر للشخص الواحد */}
                  {numberOfGuests > 1 && (
                    <div className="mb-3 text-sm text-triply-dark/70 dark:text-dark-text-secondary">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span className="font-semibold">{numberOfGuests} {numberOfGuests === 1 ? t('bookingDetails.person') : t('bookingDetails.persons')}</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-xs">{t('bookingDetails.pricePerPerson')}: </span>
                        <span className="font-bold text-triply dark:text-triply-mint">
                          {(totalCost / numberOfGuests).toLocaleString()} {language === 'ar' ? 'ريال' : 'SAR'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-4xl font-black text-triply dark:text-triply-mint">
                      {totalCost.toLocaleString()}
                    </span>
                    <span className="text-xl font-semibold text-triply-slate dark:text-dark-text-secondary mr-2">
                      {language === 'ar' ? 'ريال 🇸🇦' : 'SAR 🇸🇦'}
                    </span>
                  </div>
                  {(() => {
                    const converted = convertCurrency(totalCost);
                    if (converted.currency !== "ريال") {
                      return (
                        <div className="text-lg text-triply-dark/70 dark:text-dark-text-secondary mt-2">
                          {converted.flag}{" "}
                          {Number(converted.local).toLocaleString()}{" "}
                          {converted.symbol}
                        </div>
                      );
                    }
                  })()}
                </div>
                <span className="text-xl font-bold text-triply-dark dark:text-dark-text-primary">
                  {t('bookingDetails.totalCost')}
                </span>
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="grid gap-4 sm:grid-cols-2 pt-4">
              <GlassButton
                variant="accent"
                size="lg"
                onClick={handleConfirmBooking}
                disabled={totalCost === 0}
                className="w-full"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {t('bookingDetails.confirmBooking')}
              </GlassButton>

              <GlassButton
                variant="primary"
                size="lg"
                onClick={handleWhatsAppShare}
                disabled={totalCost === 0}
                className="w-full"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                {t('bookingDetails.whatsappShare')}
              </GlassButton>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <FeedbackToast
            message={toast.message}
            variant={toast.type}
            onDismiss={() =>
              setToast({ show: false, message: "", type: "error" })
            }
            className="min-w-[320px] max-w-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

export default BookingDetailsPage;
