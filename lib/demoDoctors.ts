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

// مواعيد تجريبية لكل يوم عمل - نفسها لكل الأطباء التجريبيين
export const DEMO_SLOTS: Record<number, string[]> = {
  0: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'],
  1: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'],
  2: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'],
  3: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'],
  4: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'],
  5: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'],
  6: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'],
}

export const DEMO_DOCTORS: DoctorFull[] = [
  {
    id: 'f02e7fa6-b9f4-4505-a70f-f9ef01d3dfb6',
    user_id: 'efe416c2-3ebf-4d28-ba2a-ab2aaefda909',
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
  },
  {
    id: '406a1a52-4c6a-4b76-b6d7-77389c58678e',
    user_id: 'c3f72aa8-0224-4bcc-a954-dd249842d177',
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
  },
  {
    id: 'a61fa9ff-5a7e-40e3-b77b-04e6217774c3',
    user_id: 'f05e2fed-efc3-46f8-9ff2-f9d4d522d794',
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
  },
  {
    id: '389912d5-2109-4258-9aaf-de3e987c249a',
    user_id: 'ca057f0c-68f5-4958-8ee7-2ed407d9ca20',
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
  },
  {
    id: '86613f43-7cc9-4f0e-ab50-1d14175bc4b8',
    user_id: 'b66edc83-2159-4a4a-a1bb-cac6b2c767fc',
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
  },
  {
    id: '38adc132-69cb-464d-a3dd-f3b269b95588',
    user_id: '7f105a6e-c283-4eaa-921f-426f9249eda9',
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
  },
  {
    id: 'da07e5f5-a3cb-489e-857a-1656ba40fd31',
    user_id: 'ca62ea94-75e2-40b2-8ae8-74370f480797',
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
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=رنا&backgroundColor=0055A0&textColor=ffffff',
  },
  {
    id: '805120a7-7e33-41e4-b232-4ce7f9cc2b81',
    user_id: '7bef41c3-05f2-4332-aef9-895e99bbbbfa',
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
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=كريم&backgroundColor=0055A0&textColor=ffffff',
  },
  {
    id: '2054e50a-9f8f-4117-a111-b0bb271f7670',
    user_id: '94d902dd-3e0c-49d5-a639-8d2f320137ab',
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
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=منى&backgroundColor=0055A0&textColor=ffffff',
  },
  {
    id: '976eef04-0528-4737-820b-523482d10d17',
    user_id: '5c0999d1-4ae5-44d1-ae6b-2d2971066153',
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
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=طارق&backgroundColor=0055A0&textColor=ffffff',
  },
  {
    id: 'c8539898-5134-45a0-a2ab-6458fc35d7f0',
    user_id: '0d7e4abf-86b3-4f76-a9bc-10c816ca045c',
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
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=نورا&backgroundColor=0055A0&textColor=ffffff',
  },
  {
    id: '642ebd9a-7298-4806-ae1f-5e194552cc27',
    user_id: 'f2d5978e-0af0-4cab-b51a-489fa78604f5',
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
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=بلال&backgroundColor=0055A0&textColor=ffffff',
  },
]

// IDs الأطباء التجريبيين للتحقق السريع
export const DEMO_DOCTOR_IDS = new Set(DEMO_DOCTORS.map((d) => d.id))

export function isDemoDoctor(id: string) {
  return DEMO_DOCTOR_IDS.has(id)
}

export function getDemoSlotsForDay(dayOfWeek: number): string[] {
  return DEMO_SLOTS[dayOfWeek] || []
}

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
