/** UAE prototype copy. Arabic UI chrome is draft — human review before campaign use. */

export const UAE_PRICE_NOTE = "€490 setup + €199/month · €1.50/topic run";

/** Existing live catalog that is citizen/lived — not ministry or alliance frames. */
export const UAE_CITIZEN_CATALOG_IDS = [
  "ai-productivity-gdp-growth",
  "crypto-regulation-financial-markets",
  "crime-safety-lawlessness",
  "elon-musk-public-voices",
] as const;

/**
 * UAE citizen monitors. Desk-only names — not added to the public live mix.
 * Stay 0 · awaiting data until a billed run. Do not invent scores.
 */
export const UAE_CITIZEN_CUSTOM_TOPICS = [
  "Dubai cost of living & rents",
  "UAE jobs, visas & talent",
  "Heat, livability & daily life",
  "Housing & school fees",
  "Workforce talk vs paid campaign frames",
  "Gig work & startup life in Dubai",
  "Traffic & daily commute",
] as const;

export const UAE_EN = {
  kicker: "UAE · workforce communication alert",
  title: "Hear the workforce — not ministry feeds, not media as the public",
  blurb:
    "Citizen communication alert for UAE SMBs and corporates. Same dashboard and locked scoring as elenchos.live. In the UAE the workforce drives the story under leadership. You do not run the method. You get the alert.",
  payCta: "Pay and brand your desk",
  walkCta: "Test the alert desk (no charge)",
  productTitle: "What you get",
  product: [
    {
      title: "Workforce speech, labeled honestly",
      body: "Earned = unprompted ordinary accounts. Paid/official = boosts, ministry and media volume — contrast, never mixed in as “the public.” Not activism. Respect for leadership and for people doing the work.",
    },
    {
      title: "Lived UAE topics",
      body: "Rents, jobs and visas, heat, housing, commute, gig and startup life. Same Pass-1 logic as elenchos.live. Locked. You cannot edit how truth is surfaced.",
    },
    {
      title: "Accuracy without you sampling",
      body: "You buy the alert surface. A billed run samples public X onto your desk. Empty tiles stay 0 · awaiting data — never invented.",
    },
  ],
  whyTitle: "Why this view",
  why: "SMBs and corporates need to know what the workforce is actually saying. Official and media volume is real — it is not the same as earned speech. Communication alert, not a smear tool.",
  buyersTitle: "Who buys",
  buyers:
    "UAE SMBs, corporates, in-house comms, agencies. Job: hear workforce communication early, without treating official or media campaigns as public talk.",
  limits:
    "Public X + API only. GDPR/EU (operator in Greece) and UAE law. No private messages, no targeting individuals, no smear. Method locked. Arabic UI is draft — human review before campaign use.",
  arReview: "Arabic UI is a draft. Human review before campaign use.",
  lens: "Workforce speech · public X · method locked",
  rulesTitle: "Use rules",
  rules: [
    "Same locked scoring as elenchos.live — you cannot edit Pass-1 or use this desk to invent harm.",
    "Public X only. No private chats, no targeting named private individuals.",
    "Not for smear, harassment, or agitation against leadership or workers.",
    "EU GDPR (freelancer operator in Greece) plus UAE law.",
    "Empty boards stay 0 · awaiting data. Never publish invented samples as live.",
  ],
} as const;

export const UAE_AR = {
  kicker: "الإمارات · تنبيه تواصل القوة العاملة",
  title: "اسمع القوة العاملة — لا تغذية الوزارات ولا الإعلام كصوت الجمهور",
  blurb:
    "تنبيه تواصل للمؤسسات الصغيرة والشركات في الإمارات. نفس اللوحة ونفس التقييم المقفول في elenchos.live. القوة العاملة هي المحرّك تحت القيادة. أنت لا تشغّل المنهج. أنت تحصل على التنبيه.",
  payCta: "ادفع وخصّص لوحتك",
  walkCta: "جرّب لوحة التنبيه دون دفع",
  productTitle: "ماذا تحصل",
  product: [
    {
      title: "كلام القوة العاملة بوسم صادق",
      body: "المكتسب: حسابات عادية غير موجَّهة. المدفوع/الرسمي: تعزيز ووزارات وإعلام — للمقارنة لا كصوت الجمهور. ليست نشاطاً سياسياً. احترام للقيادة وللعاملين.",
    },
    {
      title: "مواضيع معيشة إماراتية",
      body: "الإيجار، العمل والتأشيرات، الحر، السكن، التنقل، العمل الحر. نفس منطق التقييم. مقفول. لا يمكن تعديل طريقة السطح.",
    },
    {
      title: "دقة دون أن تأخذ العيّنة بنفسك",
      body: "تشتري سطح التنبيه. التشغيل المدفوع يضع عيّنة إكس العامة على لوحتك. الفارغ يبقى 0 بانتظار البيانات — بلا اختراع.",
    },
  ],
  whyTitle: "لماذا هذه القراءة",
  why: "المؤسسات تحتاج أن تعرف ماذا تقول القوة العاملة. حجم الرسمي والإعلام حقيقي — وليس هو الكلام المكتسب. تنبيه تواصل لا أداة تشهير.",
  buyersTitle: "من يشتري",
  buyers: "شركات صغيرة وكبيرة واتصالات داخلية ووكالات في الإمارات. المهمة: سماع تواصل القوة العاملة مبكراً.",
  limits:
    "إكس العام فقط. اللائحة الأوروبية (المشغّل مستقل في اليونان) وقانون الإمارات. لا رسائل خاصة ولا استهداف أفراد ولا تشهير. المنهج مقفول. العربية مسودة.",
  arReview: "واجهة عربية مسودة. مراجعة بشرية قبل الاستخدام في الحملات.",
  lens: "كلام القوة العاملة · إكس العام · المنهج مقفول",
  rulesTitle: "قواعد الاستخدام",
  rules: [
    "نفس التقييم المقفول — لا تعديل للمنهج ولا استخدام للإضرار.",
    "إكس العام فقط. لا محادثات خاصة ولا استهداف أفراد.",
    "ليست للتشهير أو التحرش أو التحريض ضد القيادة أو العاملين.",
    "اللائحة الأوروبية (مستقل في اليونان) وقانون الإمارات.",
    "اللوحات الفارغة تبقى 0 بانتظار البيانات. لا نشر لعيّنات مخترعة.",
  ],
} as const;

export type UaeLang = "en" | "ar";
