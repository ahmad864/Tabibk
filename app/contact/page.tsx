import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import BackButton from '@/components/back-button'
import ContactSection from '@/components/contact-section'

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <section className="hero-gradient py-16">
          <div className="container mx-auto text-center px-4">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">اتصل بنا</h1>
            <p className="font-body text-lg text-primary-foreground/80">نسعد بتواصلك معنا ونرحب بجميع استفساراتك</p>
          </div>
        </section>
        <div className="container mx-auto px-4 pt-4"><BackButton /></div>
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}
