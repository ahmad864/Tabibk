import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import BackButton from '@/components/back-button'
import { Heart, Users, Award, Target } from 'lucide-react'

const stats = [
  { icon: Users, value: '500+', label: 'طبيب مسجل' },
  { icon: Heart, value: '10,000+', label: 'مريض سعيد' },
  { icon: Award, value: '50+', label: 'تخصص طبي' },
  { icon: Target, value: '15+', label: 'مدينة سورية' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <section className="hero-gradient section-padding">
          <div className="container mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">من نحن</h1>
            <p className="font-body text-lg text-primary-foreground/80 max-w-2xl mx-auto">طبيبك هي أول منصة لحجز المواعيد الطبية في سوريا، تهدف لربط المرضى بأفضل الأطباء بطريقة سهلة وسريعة</p>
          </div>
        </section>
        <section className="section-padding">
          <div className="container mx-auto">
            <BackButton />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-heading text-3xl font-bold text-foreground mb-6">رسالتنا</h2>
                <p className="font-body text-muted-foreground leading-relaxed mb-4">نسعى في طبيبك لتقديم أفضل تجربة حجز مواعيد طبية في سوريا. نؤمن بأن كل شخص يستحق الحصول على رعاية صحية مميزة وبأسهل الطرق.</p>
                <p className="font-body text-muted-foreground leading-relaxed">نعمل على ربط المرضى بأكفأ الأطباء في مختلف التخصصات، ونوفر أدوات حديثة لإدارة المواعيد والاستشارات الطبية.</p>
              </div>
              <div><img src="/why-tabibak.jpg" alt="رسالة طبيبك" className="rounded-2xl shadow-lg w-full" /></div>
            </div>
          </div>
        </section>
        <section className="section-padding bg-accent/30">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="premium-card text-center">
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="font-heading text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="font-body text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
