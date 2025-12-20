/**
 * صفحة PaymentPage - صفحة الدفع
 * توفر:
 * - اختيار طريقة الدفع (فيزا، مدى، أبل باي، إلخ)
 * - إدخال بيانات الدفع بشكل آمن
 * - معالجة عملية الدفع
 */

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext.jsx";
import { FeedbackToast } from "../components/ui/FeedbackToast";
import {
  ApplePayLogo,
  MadaLogo,
  StcPayLogo,
  VisaLogo,
} from "../components/ui/PaymentLogos.jsx";
import { formatCurrency } from "../utils/translationHelpers.js";
import { formatDualCurrency } from "../data/currencyRates.js";

function PaymentPage() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  if (!bookingData) {
    navigate("/");
    return null;
  }

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      5000
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // تنسيق رقم البطاقة
    if (name === "cardNumber") {
      const cleaned = value.replace(/\s/g, "");
      const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
      setFormData((prev) => ({ ...prev, [name]: formatted }));
      return;
    }

    // تنسيق تاريخ الانتهاء
    if (name === "expiryDate") {
      const cleaned = value.replace(/\D/g, "");
      const formatted =
        cleaned.length >= 2
          ? `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`
          : cleaned;
      setFormData((prev) => ({ ...prev, [name]: formatted }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayment = (e) => {
    e.preventDefault();

    // التحقق من البيانات
    if (paymentMethod === "credit-card") {
      if (
        !formData.cardNumber ||
        !formData.cardName ||
        !formData.expiryDate ||
        !formData.cvv
      ) {
        showToast(t("payment.fillAllFields"), "error");
        return;
      }
    }

    setIsProcessing(true);

    // محاكاة عملية الدفع
    setTimeout(() => {
      setIsProcessing(false);
      showToast(t("payment.paymentSuccess"), "success");

      setTimeout(() => {
        navigate("/payment-success", { state: bookingData });
      }, 2000);
    }, 2500);
  };

  const paymentMethods = [
    { id: "credit-card", name: t("payment.creditCard"), component: VisaLogo },
    { id: "mada", name: t("payment.mada"), component: MadaLogo },
    { id: "apple-pay", name: t("payment.applePay"), component: ApplePayLogo },
    { id: "stc-pay", name: t("payment.stcPay"), component: StcPayLogo },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-triply-mint/20 via-white to-triply-teal/20 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg py-20 px-4">
      <div className="mx-auto max-w-4xl">
        {/* عنوان الصفحة */}
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-3xl md:text-4xl font-bold text-triply-dark dark:text-dark-text-primary mb-2">
            {t("payment.title")} 💳
          </h1>
          <p className="text-triply-dark/70 dark:text-dark-text-secondary">
            {t("payment.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* ملخص الحجز */}
          <div className="md:col-span-1 animate-fadeInRight">
            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg p-6 border border-triply-mint/30 dark:border-dark-border sticky top-24">
              <h2 className="text-xl font-bold text-triply-dark dark:text-dark-text-primary mb-4">
                {t("payment.bookingSummary")} 📋
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-triply-dark/70 dark:text-dark-text-secondary">
                    {t("payment.destination")}:
                  </span>
                  <span className="font-semibold text-triply-dark dark:text-dark-text-primary">
                    {bookingData.destination}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-triply-dark/70 dark:text-dark-text-secondary">
                    {t("bookingDetails.category")}:
                  </span>
                  <span className="font-semibold text-triply-dark dark:text-dark-text-primary">
                    {bookingData.category}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-triply-dark/70 dark:text-dark-text-secondary">
                    {t("bookingDetails.numberOfDays")}:
                  </span>
                  <span className="font-semibold text-triply-dark dark:text-dark-text-primary">
                    {bookingData.days}{" "}
                    {bookingData.days === 1
                      ? t("dashboard.day")
                      : t("dashboard.days_plural")}
                  </span>
                </div>

                {bookingData.numberOfGuests && (
                  <div className="flex justify-between">
                    <span className="text-triply-dark/70 dark:text-dark-text-secondary">
                      {t("bookingDetails.summaryGuests")}:
                    </span>
                    <span className="font-semibold text-triply-dark dark:text-dark-text-primary">
                      {bookingData.numberOfGuests}{" "}
                      {bookingData.numberOfGuests === 1
                        ? t("bookingDetails.person")
                        : t("bookingDetails.persons")}
                    </span>
                  </div>
                )}

                <div className="border-t border-triply-mint/30 dark:border-dark-border pt-3 mt-3">
                  {bookingData.numberOfGuests > 1 && bookingData.pricePerPerson && (
                    <div className="flex justify-between text-sm text-triply-dark/70 dark:text-dark-text-secondary mb-2">
                      <span>{t("bookingDetails.pricePerPerson")}:</span>
                      <span>{bookingData.pricePerPerson.toLocaleString()} ر.س</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-triply-dark dark:text-dark-text-primary">
                      {t("payment.totalAmount")}:
                    </span>
                    <div className="text-left">
                      <div className="text-triply-teal dark:text-triply-mint">
                        {bookingData.totalCost?.toLocaleString() || "0"} ر.س 🇸🇦
                      </div>
                      {(() => {
                        const dualCurrency = formatDualCurrency(
                          bookingData.totalCost || 0,
                          bookingData.destination
                        );
                        return (
                          dualCurrency.secondary && (
                            <div className="text-sm text-triply dark:text-triply-mint mt-1">
                              ≈ {dualCurrency.secondary}
                            </div>
                          )
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* نموذج الدفع */}
          <div className="md:col-span-2 animate-fadeInLeft">
            <form
              onSubmit={handlePayment}
              className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg p-6 md:p-8 border border-triply-mint/30 dark:border-dark-border"
            >
              {/* اختيار طريقة الدفع */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-triply-dark dark:text-dark-text-primary mb-4">
                  {t("payment.paymentMethod")}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => {
                    const LogoComponent = method.component;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`group flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                          paymentMethod === method.id
                            ? "border-triply-teal bg-white shadow-lg dark:bg-dark-bg"
                            : "border-gray-200 bg-white/80 hover:border-triply-mint dark:border-dark-border dark:bg-dark-bg"
                        }`}
                      >
                        <LogoComponent />
                        <div className="text-sm font-semibold text-triply-dark transition group-hover:text-triply-teal dark:text-dark-text-primary">
                          {method.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* معلومات البطاقة */}
              {paymentMethod === "credit-card" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-triply-dark dark:text-dark-text-primary mb-2">
                      {t("payment.cardNumber")} *
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder={t("payment.cardNumberPlaceholder")}
                      maxLength="19"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-triply-dark dark:text-dark-text-primary focus:border-triply-teal focus:ring-2 focus:ring-triply-mint/20 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-triply-dark dark:text-dark-text-primary mb-2">
                      {t("payment.cardName")} *
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      placeholder={t("payment.cardNamePlaceholder")}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-triply-dark dark:text-dark-text-primary focus:border-triply-teal focus:ring-2 focus:ring-triply-mint/20 outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-triply-dark dark:text-dark-text-primary mb-2">
                        {t("payment.expiryDate")} *
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        placeholder={t("payment.expiryDatePlaceholder")}
                        maxLength="5"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-triply-dark dark:text-dark-text-primary focus:border-triply-teal focus:ring-2 focus:ring-triply-mint/20 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-triply-dark dark:text-dark-text-primary mb-2">
                        {t("payment.cvv")} *
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder={t("payment.cvvPlaceholder")}
                        maxLength="3"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-triply-dark dark:text-dark-text-primary focus:border-triply-teal focus:ring-2 focus:ring-triply-mint/20 outline-none transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* رسالة لطرق الدفع الأخرى */}
              {paymentMethod !== "credit-card" && (
                <div className="p-6 bg-triply-mint/10 dark:bg-triply-teal/10 rounded-xl text-center">
                  <p className="text-triply-dark dark:text-dark-text-primary font-semibold mb-2">
                    {t("payment.redirectMessage", {
                      method: paymentMethods.find((m) => m.id === paymentMethod)?.name,
                    })}
                  </p>
                  <p className="text-sm text-triply-dark/70 dark:text-dark-text-secondary">
                    {t("payment.redirectInstruction")}
                  </p>
                </div>
              )}

              {/* زر الدفع */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-triply-teal to-triply-mint text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t("payment.processing")}</span>
                  </div>
                ) : (
                  `${t("payment.payNow")} ${formatCurrency(bookingData.totalCost || 0, language)}`
                )}
              </button>

              {/* أمان الدفع */}
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-triply-dark/60 dark:text-dark-text-secondary">
                <svg
                  className="h-5 w-5 text-triply-teal dark:text-triply-mint"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10V7a4 4 0 118 0v3"
                  />
                  <rect width="16" height="12" x="4" y="10" rx="2" ry="2" />
                </svg>
                <span>{t("payment.securePayment")}</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Toast للإشعارات */}
      {toast.show && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-4 animate-slide-down">
          <FeedbackToast
            message={toast.message}
            variant={toast.type}
            onDismiss={() =>
              setToast({ show: false, message: "", type: "success" })
            }
          />
        </div>
      )}
    </div>
  );
}

export default PaymentPage;
