/**
 * مكون Signup - نموذج إنشاء حساب جديد
 * يوفر:
 * - حقول الاسم، البريد، كلمة المرور
 * - التحقق من صحة البيانات
 * - تسجيل بجوجل
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../layouts/AuthLayout.jsx';
import { InputField } from '../../components/ui/InputField.jsx';
import { GoogleButton } from '../../components/ui/GoogleButton.jsx';
import { GlassButton } from '../../components/ui/GlassButton.jsx';
import { FeedbackToast } from '../../components/ui/FeedbackToast.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

function Signup() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName) {
      newErrors.fullName = t('auth.fullNameRequired');
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = t('auth.fullNameTooShort');
    }
    
    if (!formData.email) {
      newErrors.email = t('auth.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.emailInvalid');
    }
    
    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.passwordTooShort');
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordMismatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setStatus({ type: 'error', message: t('auth.checkRequiredFieldsSignup') });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    window.setTimeout(() => {
      localStorage.setItem('username', formData.fullName);
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('isLoggedIn', 'true');
      setIsSubmitting(false);
      setStatus({ type: 'success', message: `${t('auth.welcomeUser')} ${formData.fullName}! ${t('auth.signupSuccess')}.` });
      window.setTimeout(() => {
        navigate('/');
      }, 600);
    }, 1400);
  };

  const handleGoogleSignup = () => {
    // Google OAuth integration placeholder
    setIsSubmitting(true);
    setStatus(null);

    window.setTimeout(() => {
      const username = 'Google User';
      localStorage.setItem('username', username);
      localStorage.setItem('isLoggedIn', 'true');
      setIsSubmitting(false);
      setStatus({ type: 'success', message: t('auth.googleSignupSuccess') });
      window.setTimeout(() => {
        navigate('/');
      }, 600);
    }, 1100);
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Header with animation */}
        <div className="text-center animate-fadeIn">
          <h1 className="mb-3 font-display text-3xl font-bold bg-gradient-to-r from-triply-teal via-triply to-triply-mint bg-clip-text text-transparent dark:from-triply-mint dark:via-triply-teal dark:to-triply-accentLight animate-gradient-x">
            {t('auth.createAccount')}
          </h1>
          <p className="text-base text-triply-slate/70 dark:text-slate-400">
            {t('auth.joinUs')}
          </p>
        </div>

        <FeedbackToast
          message={status?.message}
          variant={status?.type === 'error' ? 'error' : 'success'}
          onDismiss={() => setStatus(null)}
        />

        {/* Form with staggered animation */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="animate-fadeInUp" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            <InputField
              label={t('auth.fullName')}
              type="text"
              name="fullName"
              placeholder={t('auth.fullNamePlaceholder')}
              value={formData.fullName}
              onChange={handleChange}
              required
              error={errors.fullName}
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
            />
          </div>

          <div className="animate-fadeInUp" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <InputField
              label={t('auth.email')}
              type="email"
              name="email"
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={handleChange}
              required
              error={errors.email}
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              }
            />
          </div>

          <div className="animate-fadeInUp" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            <InputField
              label={t('auth.password')}
              type="password"
              name="password"
              placeholder={t('auth.passwordPlaceholder')}
              value={formData.password}
              onChange={handleChange}
              required
              error={errors.password}
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
            />
          </div>

          <div className="animate-fadeInUp" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            <InputField
              label={t('auth.confirmPassword')}
              type="password"
              name="confirmPassword"
              placeholder={t('auth.confirmPasswordPlaceholder')}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              error={errors.confirmPassword}
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
          </div>

          {/* Submit button */}
          <div className="animate-fadeInUp" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
            <GlassButton type="submit" variant="primary" className="w-full group relative overflow-hidden" size="lg" isLoading={isSubmitting}>
              <span className="relative z-10">{t('auth.signupButton')}</span>
              <span className="absolute inset-0 -z-0 bg-gradient-to-r from-triply-teal via-triply to-triply-mint opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
            </GlassButton>
          </div>
        </form>

        {/* Divider with animation */}
        <div className="relative animate-fadeInUp" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-triply-mint/30 dark:border-triply-teal/30" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white/90 px-4 text-triply-slate/60 backdrop-blur-sm dark:bg-slate-900/90 dark:text-slate-400">
              {t('auth.orContinueWith')}
            </span>
          </div>
        </div>

        {/* Google signup */}
        <div className="animate-fadeInUp" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
          <GoogleButton label={t('auth.googleSignup')} onClick={handleGoogleSignup} disabled={isSubmitting} />
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-triply-slate/70 animate-fadeInUp dark:text-slate-400" style={{ animationDelay: '0.8s', animationFillMode: 'both' }}>
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="group relative font-semibold text-triply transition-all hover:text-triply-teal dark:text-triply-mint dark:hover:text-triply-accentLight">
            {t('auth.loginLink')}
            <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-current transition-all group-hover:w-full" />
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export { Signup };
