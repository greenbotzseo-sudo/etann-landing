import { useEffect } from 'react';
import { GuideProvider } from './lib/guide';
import { ReviewsProvider } from './lib/reviews';
import { initMotion } from './lib/motion';
import { ChatWidget } from './components/ChatWidget';
import { ClassSlider } from './components/ClassSlider';
import { Courses } from './components/Courses';
import { EnquiryForm } from './components/EnquiryForm';
import { Contact, Faq, FinalCta, Footer, Funding, Steps, Testimonials, Why } from './components/Bottom';
import { Deadline, Hero, Situation, TrustBar } from './components/Top';

/**
 * Page order follows the lead-quality brief:
 * identify (hero, deadline, situation) → reassure (trust) → qualify (course guide) → convert (form),
 * then answer remaining questions (courses, funding, trust, reviews, process, FAQ).
 */
export default function App() {
  useEffect(() => initMotion(), []);
  return (
    <ReviewsProvider>
    <GuideProvider>
      <main id="top">
        <Hero />
        <Deadline />
        <Situation />
        <TrustBar />
        <EnquiryForm />
        <Courses />
        <Funding />
        <Why />
        <ClassSlider />
        <Testimonials />
        <Steps />
        <Faq />
        <FinalCta />
        <Contact />
      </main>
      <Footer />
      <ChatWidget />
    </GuideProvider>
    </ReviewsProvider>
  );
}
