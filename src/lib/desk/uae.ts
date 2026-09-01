/** UAE prototype copy. Arabic UI chrome is draft — human review before campaign use. */

export const UAE_PRICE_NOTE = "AED 6,000 setup · Pulse AED 249/mo · Insight AED 899/mo";

import { SOLVO_TOPIC_IDS } from "./solvo-topics";

/** Public catalog ids are not mixed into this desk — Solvo uses its own 10 topics. */
export const UAE_CITIZEN_CATALOG_IDS = [] as const;

/** Desk-only names — not added to the public live mix. */
export const UAE_CITIZEN_CUSTOM_TOPICS = SOLVO_TOPIC_IDS;

export const UAE_EN = {
  kicker: "Solvo Creations · Public Discourse × Research Desk",
  title: "Hear the workforce — not ministry feeds, not media as the public",
  blurb:
    "White-label Public Discourse × Research Desk for Solvo Creations (Dubai). Same locked scoring as elenchos.live. This preview uses labeled simulated samples so you can walk the product. In the UAE the workforce drives the story under leadership.",
  payCta: "Pay and brand your desk",
  walkCta: "Test the alert desk (no charge)",
  productTitle: "What you get",
  product: [
    {
      title: "Workforce speech, labeled honestly",
      body: "Earned = unprompted ordinary accounts. Paid/official = boosts, ministry and media volume — contrast, never mixed in as “the public.” Not activism. Respect for leadership and for people doing the work.",
    },
    {
      title: "Topics for Solvo’s buyers",
      body: "B2B visibility, founder branding, AI/GEO search, SMB trust, decision-maker discovery, agency vs in-house, PR/podcast authority, GCC expansion. Same Pass-1 logic. Locked.",
    },
    {
      title: "Weekly sample, not a per-topic meter",
      body: "Pulse: 15 topics, n=120, once a week, no human support. Insight: same 15 topics, n=1000, plus 1 hour/week to analyze and rework. Empty tiles stay 0 · awaiting data — never invented.",
    },
  ],
  whyTitle: "Why this view",
  why: "SMBs and corporates need to know what the workforce is actually saying. Official and media volume is real — it is not the same as earned speech. Communication alert, not a smear tool.",
  buyersTitle: "Who buys",
  buyers:
    "Solvo’s audience: SMBs and startups, founders and executives, expansion brands in the UAE. Job: public discourse vs paid/media noise around visibility, trust and partnerships.",
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
      title: "عيّنة أسبوعية لا رسوم لكل موضوع",
      body: "نبض: 15 موضوعاً، عيّنة 120، مرة أسبوعياً، بلا دعم بشري. رؤية: نفس المواضيع، عيّنة 1000، مع ساعة أسبوعياً للتحليل وإعادة الصياغة. الفارغ يبقى 0 بانتظار البيانات — بلا اختراع.",
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
