import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-heading text-xl font-bold mb-4">طبيبك</h3>
            <p className="font-body text-sm text-secondary-foreground/70 leading-relaxed">
              منصة طبيبك هي أول منصة لحجز المواعيد الطبية في سوريا. نوفر لك أفضل الأطباء وأسهل طريقة لحجز موعدك الطبي.
            </p>
          </div>
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 font-body text-sm">
              <li><Link href="/" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">الصفحة الرئيسية</Link></li>
              <li><Link href="/doctors" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">الأطباء</Link></li>
              <li><Link href="/about" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">من نحن</Link></li>
              <li><Link href="/contact" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">اتصل بنا</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">تواصل معنا</h4>
            <ul className="space-y-3 font-body text-sm">
              <li className="flex items-center gap-2 text-secondary-foreground/70"><Phone className="w-4 h-4" /><span dir="ltr">+963 999 000 000</span></li>
              <li className="flex items-center gap-2 text-secondary-foreground/70"><Mail className="w-4 h-4" /><span>info@tabibak.sy</span></li>
              <li className="flex items-center gap-2 text-secondary-foreground/70"><MapPin className="w-4 h-4" /><span>دمشق - سوريا</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">تابعنا</h4>
            <div className="flex gap-3">
              {['فيسبوك', 'تويتر', 'انستغرام'].map((name) => (
                <span key={name} className="px-3 py-1.5 rounded-xl bg-secondary-foreground/10 text-secondary-foreground/70 text-xs font-body hover:bg-secondary-foreground/20 transition-colors cursor-pointer">{name}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-secondary-foreground/10 mt-8 pt-6 text-center">
          <p className="font-body text-xs text-secondary-foreground/50">© 2026 طبيبك. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  )
}
