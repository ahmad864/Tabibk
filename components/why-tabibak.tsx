import { CalendarCheck, ShieldCheck, Clock, Smile } from 'lucide-react'

const features = [
  { icon: CalendarCheck, title: 'سهولة حجز المواعيد', desc: 'احجز موعدك الطبي بخطوات بسيطة وسريعة' },
  { icon: ShieldCheck, title: 'أطباء موثوقون', desc: 'جميع الأطباء معتمدون ومرخصون' },
  { icon: Clock, title: 'تنظيم المواعيد الطبية', desc: 'تابع مواعيدك الطبية بسهولة' },
  { icon: Smile, title: 'تجربة استخدام بسيطة', desc: 'واجهة سهلة ومريحة للجميع' },
]

export default function WhyTabibak() {
  return (
    <section className="section-padding bg-muted/30">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <img src="/why-tabibak.jpg" alt="لماذا طبيبك" className="rounded-2xl shadow-lg w-full max-w-md mx-auto" />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">لماذا طبيبك؟</h2>
            <div className="space-y-5">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-1">{f.title}</h3>
                    <p className="font-body text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
