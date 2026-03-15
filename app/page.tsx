import Navbar from '@/components/navbar'
import HeroSlider from '@/components/hero-slider'
import SymptomsAnalysis from '@/components/symptoms-analysis'
import FeaturedDoctors from '@/components/featured-doctors'
import WhyTabibak from '@/components/why-tabibak'
import ReviewsSlider from '@/components/reviews-slider'
import ContactSection from '@/components/contact-section'
import Footer from '@/components/footer'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSlider />
        <SymptomsAnalysis />
        <FeaturedDoctors />
        <WhyTabibak />
        <ReviewsSlider />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}
