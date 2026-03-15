import { isDoctorActive } from './doctorStatus'

export interface DoctorFull {
  id: string
  full_name: string
  specialization: string
  phone: string
  city: string
  clinic_address: string
  bio: string
  diseases_treated: string[]
  is_approved: boolean
  is_active: boolean
  is_featured: boolean
  rating: number
  rating_count: number
  working_hours_start: string
  working_hours_end: string
  working_days: number[]
  avatar_url: string
  user_id: string
}

export const DEMO_DOCTORS: DoctorFull[] = [
  {
    id: 'demo-doc-001',
    full_name: 'د. أحمد محمد',
    specialization: 'طب قلبية',
    phone: '+963988888888',
    city: 'دمشق',
    clinic_address: 'شارع الحمراء',
    bio: 'أخصائي أمراض القلب والأوعية الدموية بخبرة 15 سنة',
    diseases_treated: ['أمراض القلب', 'ارتفاع ضغط الدم', 'تصلب الشرايين', 'قصور القلب'],
    is_approved: true, is_active: true, is_featured: true,
    rating: 4.8, rating_count: 24,
    working_hours_start: '08:00', working_hours_end: '16:00',
    working_days: [0, 1, 2, 3, 4],
    avatar_url: '/doctors/dr-ahmad.jpg',
    user_id: 'demo-doctor-001',
  },
  {
    id: 'demo-doc-002',
    full_name: 'د. سارة علي',
    specialization: 'جهاز هضمي',
    phone: '+963966666666',
    city: 'حلب',
    clinic_address: 'شارع النيل',
    bio: 'متخصصة في أمراض الجهاز الهضمي والكبد بخبرة 10 سنوات',
    diseases_treated: ['قرحة المعدة', 'القولون العصبي', 'التهاب الكبد', 'ارتجاع المريء'],
    is_approved: true, is_active: true, is_featured: true,
    rating: 4.7, rating_count: 19,
    working_hours_start: '09:00', working_hours_end: '17:00',
    working_days: [0, 1, 2, 3, 4],
    avatar_url: '/doctors/dr-sara.jpg',
    user_id: 'demo-doctor-002',
  },
  {
    id: 'demo-doc-003',
    full_name: 'د. علي حسن',
    specialization: 'طب أعصاب',
    phone: '+963955555555',
    city: 'دمشق',
    clinic_address: 'ساحة الأمويين',
    bio: 'استشاري طب الأعصاب والدماغ بخبرة 12 سنة',
    diseases_treated: ['الصداع النصفي', 'الصرع', 'التصلب اللويحي', 'آلام الأعصاب'],
    is_approved: true, is_active: true, is_featured: true,
    rating: 4.9, rating_count: 31,
    working_hours_start: '08:00', working_hours_end: '15:00',
    working_days: [0, 1, 2, 3, 4],
    avatar_url: '/doctors/dr-ali.jpg',
    user_id: 'demo-doctor-003',
  },
  {
    id: 'demo-doc-004',
    full_name: 'د. ليلى كريم',
    specialization: 'طب أطفال',
    phone: '+963944444444',
    city: 'حمص',
    clinic_address: 'شارع الجامعة',
    bio: 'أخصائية طب الأطفال وحديثي الولادة بخبرة 8 سنوات',
    diseases_treated: ['أمراض الأطفال العامة', 'حساسية الأطفال', 'نمو وتطور الطفل', 'أمراض الجهاز التنفسي'],
    is_approved: true, is_active: false, is_featured: true,
    rating: 4.6, rating_count: 15,
    working_hours_start: '10:00', working_hours_end: '18:00',
    working_days: [1, 2, 3, 4, 6],
    avatar_url: '/doctors/dr-layla.jpg',
    user_id: 'demo-doctor-004',
  },
  {
    id: 'demo-doc-005',
    full_name: 'د. عمر يوسف',
    specialization: 'طب جلدية',
    phone: '+963933333333',
    city: 'اللاذقية',
    clinic_address: 'شارع بغداد',
    bio: 'أخصائي الأمراض الجلدية والتجميل بخبرة 10 سنوات',
    diseases_treated: ['حب الشباب', 'الأكزيما', 'الصدفية', 'أمراض الشعر'],
    is_approved: true, is_active: true, is_featured: false,
    rating: 4.5, rating_count: 18,
    working_hours_start: '09:00', working_hours_end: '17:00',
    working_days: [0, 1, 2, 3, 4],
    avatar_url: '/doctors/dr-omar.jpg',
    user_id: 'demo-doctor-005',
  },
  {
    id: 'demo-doc-006',
    full_name: 'د. هاني سعد',
    specialization: 'طب عظمية',
    phone: '+963922222222',
    city: 'دمشق',
    clinic_address: 'شارع المزة',
    bio: 'جراح عظام ومفاصل بخبرة 20 سنة',
    diseases_treated: ['كسور العظام', 'خشونة المفاصل', 'آلام الظهر', 'تمزق الأربطة'],
    is_approved: true, is_active: true, is_featured: false,
    rating: 4.7, rating_count: 27,
    working_hours_start: '08:00', working_hours_end: '14:00',
    working_days: [0, 1, 2, 3, 4],
    avatar_url: '/doctors/dr-hani.jpg',
    user_id: 'demo-doctor-006',
  },
  {
    id: 'demo-doc-007',
    full_name: 'د. رنا إبراهيم',
    specialization: 'طب نسائية',
    phone: '+963911111111',
    city: 'دمشق',
    clinic_address: 'شارع الصالحية',
    bio: 'أخصائية أمراض النساء والتوليد بخبرة 14 سنة',
    diseases_treated: ['أمراض الرحم', 'الحمل والولادة', 'العقم', 'تكيس المبايض'],
    is_approved: true, is_active: true, is_featured: true,
    rating: 4.9, rating_count: 35,
    working_hours_start: '09:00', working_hours_end: '17:00',
    working_days: [0, 1, 2, 3, 4],
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=رنا إبراهيم&backgroundColor=0055A0&textColor=ffffff',
    user_id: 'demo-doctor-007',
  },
  {
    id: 'demo-doc-008',
    full_name: 'د. كريم ناصر',
    specialization: 'طب عيون',
    phone: '+963910000000',
    city: 'حلب',
    clinic_address: 'شارع المتنبي',
    bio: 'أخصائي أمراض العيون وجراحة الليزك بخبرة 11 سنة',
    diseases_treated: ['ضعف النظر', 'الماء الأبيض', 'الماء الأزرق', 'التهاب الشبكية'],
    is_approved: true, is_active: false, is_featured: false,
    rating: 4.4, rating_count: 12,
    working_hours_start: '10:00', working_hours_end: '18:00',
    working_days: [0, 1, 2, 3, 4],
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=كريم ناصر&backgroundColor=0055A0&textColor=ffffff',
    user_id: 'demo-doctor-008',
  },
  {
    id: 'demo-doc-009',
    full_name: 'د. منى خالد',
    specialization: 'طب باطنية',
    phone: '+963909000000',
    city: 'دمشق',
    clinic_address: 'شارع بغداد',
    bio: 'أخصائية الأمراض الداخلية والسكري بخبرة 9 سنوات',
    diseases_treated: ['السكري', 'أمراض الغدة الدرقية', 'فقر الدم', 'أمراض الكلى'],
    is_approved: true, is_active: true, is_featured: false,
    rating: 4.6, rating_count: 21,
    working_hours_start: '08:00', working_hours_end: '16:00',
    working_days: [0, 1, 2, 3, 4],
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=منى خالد&backgroundColor=0055A0&textColor=ffffff',
    user_id: 'demo-doctor-009',
  },
  {
    id: 'demo-doc-010',
    full_name: 'د. طارق سليمان',
    specialization: 'طب قلبية',
    phone: '+963908000000',
    city: 'حمص',
    clinic_address: 'شارع الحضارة',
    bio: 'استشاري أمراض القلب والتدخل القسطري بخبرة 18 سنة',
    diseases_treated: ['جلطة القلب', 'ضعف القلب', 'عدم انتظام الضربات', 'أمراض الصمامات'],
    is_approved: true, is_active: true, is_featured: true,
    rating: 4.8, rating_count: 29,
    working_hours_start: '09:00', working_hours_end: '15:00',
    working_days: [0, 1, 2, 4],
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=طارق سليمان&backgroundColor=0055A0&textColor=ffffff',
    user_id: 'demo-doctor-010',
  },
  {
    id: 'demo-doc-011',
    full_name: 'د. نورا فارس',
    specialization: 'طب جلدية',
    phone: '+963907000000',
    city: 'دمشق',
    clinic_address: 'شارع الملك فيصل',
    bio: 'أخصائية أمراض الجلد والتجميل الطبي بخبرة 7 سنوات',
    diseases_treated: ['الشرى', 'التهاب الجلد', 'إزالة الوشم', 'تجديد الجلد'],
    is_approved: true, is_active: true, is_featured: false,
    rating: 4.5, rating_count: 16,
    working_hours_start: '11:00', working_hours_end: '19:00',
    working_days: [1, 2, 3, 4, 6],
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=نورا فارس&backgroundColor=0055A0&textColor=ffffff',
    user_id: 'demo-doctor-011',
  },
  {
    id: 'demo-doc-012',
    full_name: 'د. بلال عمر',
    specialization: 'طب عظمية',
    phone: '+963906000000',
    city: 'اللاذقية',
    clinic_address: 'شارع الأمين',
    bio: 'أخصائي جراحة العمود الفقري والمفاصل بخبرة 13 سنة',
    diseases_treated: ['انزلاق الغضروف', 'تضيق القناة الشوكية', 'التهاب المفاصل', 'إصابات الركبة'],
    is_approved: true, is_active: false, is_featured: false,
    rating: 4.3, rating_count: 11,
    working_hours_start: '08:00', working_hours_end: '14:00',
    working_days: [0, 1, 2, 3, 4],
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=بلال عمر&backgroundColor=0055A0&textColor=ffffff',
    user_id: 'demo-doctor-012',
  },
]

// تحويل لبيانات DoctorCard
export function getDemoCardData() {
  return DEMO_DOCTORS.map((d) => ({
    id: d.id,
    name: d.full_name,
    specialization: d.specialization,
    rating: d.rating,
    image: d.avatar_url,
    isActive: isDoctorActive(d.working_hours_start, d.working_hours_end, d.working_days),
    isFeatured: d.is_featured,
  }))
}

export function getFeaturedCardData() {
  return DEMO_DOCTORS.filter((d) => d.is_featured).map((d) => ({
    id: d.id,
    name: d.full_name,
    specialization: d.specialization,
    rating: d.rating,
    image: d.avatar_url,
    isActive: isDoctorActive(d.working_hours_start, d.working_hours_end, d.working_days),
    isFeatured: true,
  }))
}
