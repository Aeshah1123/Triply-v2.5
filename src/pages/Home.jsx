/**
 * صفحة Home - الصفحة الرئيسية للموقع
 * تعرض جميع الأقسام الرئيسية:
 * - القسم الترحيبي، الخدمات، الوجهات، طريقة العمل، الآراء، الحجز، التواصل
 */

import { HeroSection } from "../components/sections/HeroSection.jsx";
import { ServicesSection } from "../components/sections/ServicesSection.jsx";
import { HowItWorksSection } from "../components/sections/HowItWorksSection.jsx";
import { DestinationsSection } from "../components/sections/DestinationsSection.jsx";
import { BookingSection } from "../components/sections/BookingSection.jsx";
import AITravelAssistant from "../components/sections/AITravelAssistant.jsx";
import { ContactSection } from "../components/sections/ContactSection.jsx";

function Home() {
  return (
    <>
      <HeroSection />
      <AITravelAssistant />
      <ServicesSection />
      <DestinationsSection />
      <HowItWorksSection />
      <BookingSection />
      <ContactSection />
    </>
  );
}

export default Home;
