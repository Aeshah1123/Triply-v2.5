/**
 * صفحة Dashboard - لوحة التحكم للمستخدم المسجل
 * تعرض:
 * - معلومات المستخدم ونقاط الولاء
 * - الحجوزات القادمة والسابقة
 * - إمكانية إلغاء الحجوزات
 */

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useLanguage } from "../contexts/LanguageContext.jsx";
import { Link } from "react-router-dom";
import { formatDualCurrency } from "../data/currencyRates.js";
import { formatDate } from "../utils/translationHelpers.js";

const Dashboard = () => {
  const { t, language } = useLanguage();
  const {
    user,
    getUpcomingBookings,
    getPastBookings,
    cancelBooking,
    removeDuplicateBookings,
  } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const upcomingBookings = getUpcomingBookings();
  const pastBookings = getPastBookings();

  // Debug: عرض البيانات في console
  useEffect(() => {
    console.log("👤 User:", user);
    console.log("📦 User Bookings:", user?.bookings);
    console.log("⏰ Upcoming Bookings:", upcomingBookings);
    console.log("📅 Past Bookings:", pastBookings);

    // تنظيف الحجوزات المكررة تلقائياً عند فتح الصفحة
    if (user?.bookings && user.bookings.length > 0) {
      const removedCount = removeDuplicateBookings();
      if (removedCount > 0) {
        console.log(`🧹 تم حذف ${removedCount} حجز مكرر تلقائياً`);
      }
    }
  }, [user, upcomingBookings, pastBookings, removeDuplicateBookings]);

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    if (selectedBooking) {
      cancelBooking(selectedBooking.id);
      setShowCancelModal(false);
      setSelectedBooking(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return t("dashboard.status_confirmed");
      case "cancelled":
        return t("dashboard.status_cancelled");
      case "completed":
        return t("dashboard.status_completed");
      case "pending":
        return t("dashboard.status_pending");
      default:
        return status;
    }
  };

  const BookingCard = ({ booking, isPast }) => (
    <div className="glass-card p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-triply-dark dark:text-dark-text-primary mb-2">
            {booking.destination?.name || booking.destination}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
              booking.status
            )}`}
          >
            {getStatusText(booking.status)}
          </span>
        </div>
        {booking.destination?.image && (
          <img
            src={booking.destination.image}
            alt={booking.destination.name}
            className="w-20 h-20 rounded-lg object-cover"
          />
        )}
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-triply-slate/70 dark:text-dark-text-secondary">
          <svg
            className="ml-2"
            width="18"
            height="18"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm">
            {formatDate(booking.checkIn, language, 'short')} - {formatDate(booking.checkOut, language, 'short')}
          </span>
        </div>

        <div className="flex items-center text-triply-slate/70 dark:text-dark-text-secondary">
          <svg
            className="ml-2"
            width="18"
            height="18"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm">
            {booking.numberOfGuests}{" "}
            {booking.numberOfGuests === 1
              ? t("dashboard.traveler")
              : t("dashboard.travelers_plural")}
          </span>
        </div>

        <div className="text-triply-slate/70 dark:text-dark-text-secondary">
          <div className="flex items-center">
            <svg
              className="ml-2"
              width="18"
              height="18"
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
            <span className="text-sm font-semibold">
              {booking.totalAmount?.toLocaleString("en-US")} {language === 'ar' ? 'ريال' : 'SAR'} 🇸🇦
            </span>
          </div>
          {(() => {
            const dualCurrency = formatDualCurrency(
              booking.totalAmount || 0,
              booking.destination
            );
            return (
              dualCurrency.secondary && (
                <div className="text-xs text-triply dark:text-triply-mint mr-7 mt-1">
                  ≈ {dualCurrency.secondary}
                </div>
              )
            );
          })()}
        </div>

        {booking.selectedServices && booking.selectedServices.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {booking.selectedServices.map((service, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-triply/10 dark:bg-triply/20 text-triply dark:text-triply-mint text-xs rounded-full"
              >
                {service}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Link
          to={`/invoice/${booking.id}`}
          className="flex-1 py-2 px-4 bg-triply/10 dark:bg-triply/20 text-triply dark:text-triply-mint rounded-lg font-semibold hover:bg-triply/20 dark:hover:bg-triply/30 transition-colors text-center text-sm"
        >
          {t("dashboard.viewDetails")}
        </Link>
        {!isPast && booking.status === "confirmed" && (
          <button
            onClick={() => handleCancelClick(booking)}
            className="flex-1 py-2 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm"
          >
            {t("dashboard.cancelBooking")}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-triply/5 via-triply-teal/5 to-triply-accent/5 dark:from-dark-bg dark:via-dark-surface dark:to-dark-elevated py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-card p-8 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-triply-dark dark:text-dark-text-primary mb-2">
                {t("dashboard.welcome")}، {user?.name}
              </h1>
              <p className="text-triply-slate/70 dark:text-dark-text-secondary">
                {t("dashboard.title")}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-triply to-triply-teal rounded-full mb-2">
                  <svg
                    className="text-white"
                    width="32"
                    height="32"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p className="text-sm text-triply-slate/70 dark:text-dark-text-secondary">
                  {t("dashboard.loyaltyPoints")}
                </p>
                <p className="text-2xl font-bold text-triply dark:text-triply-mint">
                  {user?.loyaltyPoints || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-triply-slate/70 dark:text-dark-text-secondary text-sm mb-1">
                  {t("dashboard.upcomingBookings")}
                </p>
                <p className="text-3xl font-bold text-triply dark:text-triply-mint">
                  {upcomingBookings.length}
                </p>
              </div>
              <svg
                className="text-triply dark:text-triply-mint"
                width="40"
                height="40"
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
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-triply-slate/70 dark:text-dark-text-secondary text-sm mb-1">
                  {t("dashboard.pastBookings")}
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {pastBookings.filter((b) => b.status !== "cancelled").length}
                </p>
              </div>
              <svg
                className="text-green-600 dark:text-green-400"
                width="40"
                height="40"
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
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-triply-slate/70 dark:text-dark-text-secondary text-sm mb-1">
                  {t("dashboard.totalCost")}
                </p>
                <p className="text-2xl font-bold text-triply-accent dark:text-triply-accentLight">
                  {(user?.bookings || [])
                    .reduce((sum, b) => sum + (b.totalAmount || 0), 0)
                    .toLocaleString("ar-SA")}{" "}
                  ر.س
                </p>
              </div>
              <svg
                className="text-triply-accent dark:text-triply-accentLight"
                width="40"
                height="40"
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
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "upcoming"
                ? "bg-gradient-to-r from-triply to-triply-teal text-white shadow-lg"
                : "glass-card text-triply-slate/70 dark:text-dark-text-secondary hover:text-triply dark:hover:text-triply-mint"
            }`}
          >
            {t("dashboard.upcomingBookings")} ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "past"
                ? "bg-gradient-to-r from-triply to-triply-teal text-white shadow-lg"
                : "glass-card text-triply-slate/70 dark:text-dark-text-secondary hover:text-triply dark:hover:text-triply-mint"
            }`}
          >
            {t("dashboard.pastBookings")} ({pastBookings.length})
          </button>
        </div>

        {/* Bookings List */}
        <div className="grid md:grid-cols-2 gap-6">
          {activeTab === "upcoming" ? (
            upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  isPast={false}
                />
              ))
            ) : (
              <div className="col-span-2 glass-card p-12 text-center">
                <svg
                  className="mx-auto text-triply-slate/30 dark:text-dark-text-muted mb-4"
                  width="64"
                  height="64"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-triply-dark dark:text-dark-text-primary mb-2">
                  {t("dashboard.noUpcomingBookings")}
                </h3>
                <p className="text-triply-slate/70 dark:text-dark-text-secondary mb-4">
                  {t("dashboard.bookNewTrip")}
                </p>
                <Link
                  to="/#booking"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-triply to-triply-teal text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  {t("booking.title")}
                </Link>
              </div>
            )
          ) : pastBookings.length > 0 ? (
            pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} isPast={true} />
            ))
          ) : (
            <div className="col-span-2 glass-card p-12 text-center">
              <svg
                className="mx-auto text-triply-slate/30 dark:text-dark-text-muted mb-4"
                width="64"
                height="64"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="text-xl font-semibold text-triply-dark dark:text-dark-text-primary mb-2">
                {t("dashboard.noPastBookings")}
              </h3>
              <p className="text-triply-slate/70 dark:text-dark-text-secondary">
                {t("dashboard.noPastBookings")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-triply-dark dark:text-dark-text-primary">
                {t("dashboard.cancelBooking")}
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-triply-slate/40 dark:text-dark-text-muted hover:text-triply-slate/70 dark:hover:text-dark-text-secondary"
              >
                <svg
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <p className="text-triply-slate/70 dark:text-dark-text-secondary mb-6">
              {t("dashboard.confirmCancel")}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 px-4 bg-triply-slate/10 dark:bg-dark-surface text-triply-dark dark:text-dark-text-primary rounded-lg font-semibold hover:bg-triply-slate/20 dark:hover:bg-dark-elevated transition-colors"
              >
                {t("dashboard.cancelNo")}
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                {t("dashboard.cancelConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
