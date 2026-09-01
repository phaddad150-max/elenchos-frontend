/** Solvo Creations UAE prototype — 10 desk topics × 9 Socratic questions. Simulated only. */

export type SolvoAudience =
  | "tech"
  | "smb"
  | "freelance"
  | "fintech"
  | "crypto"
  | "emirati";

export type SolvoQuestion = {
  q: string;
  cardTitle: string;
  answer: string;
  score: number;
  label: string;
  keyPoints: [string, string, string];
};

export type SolvoTopic = {
  id: string;
  name: string;
  audience: SolvoAudience;
  group: "Political" | "Economic" | "Social";
  blurb: string;
  headline: string;
  score: number;
  label: string;
  divergence: number;
  sample: number;
  delta: number;
  questions: SolvoQuestion[];
};

function Q(
  q: string,
  cardTitle: string,
  answer: string,
  score: number,
  label: string,
  keyPoints: [string, string, string],
): SolvoQuestion {
  return { q, cardTitle, answer, score, label, keyPoints };
}

export const SOLVO_TOPICS: SolvoTopic[] = [
  {
    id: "ai-smb-productivity",
    name: "AI productivity for UAE SMBs",
    audience: "tech",
    group: "Economic",
    blurb: "How operators talk about AI tools versus paid “transformation” campaigns.",
    headline: "Simulated: SMB operators on AI tools vs paid transformation claims.",
    score: 66,
    label: "Leaning Positive",
    divergence: 34,
    sample: 412,
    delta: 4,
    questions: [
      Q("What concrete tasks do UAE SMB owners say AI actually saves time on, versus slogans about transformation?", "Tasks beat slogans", "Simulated discourse clusters around invoicing, bilingual drafts, and scheduling—not “AI strategy.” Paid campaigns over-claim transformation while earned talk names tools and hours saved.", 64, "cautiously positive", ["Named tasks, not visions", "Promo diverges from ops talk", "Hours saved is the proof language"]),
      Q("Where do founders distrust AI vendors, and does that match official digital-economy messaging?", "Vendor distrust", "Simulated replies flag lock-in, data residency, and English-only support. Official hub language rarely meets those objections at the same grain.", 52, "mixed", ["Residency and lock-in recur", "Support language gaps", "Hub claims stay high-level"]),
      Q("How do SMBs compare in-house AI experiments to agency retainers?", "In-house vs agency", "Simulated operators treat cheap copilots as in-house leverage and agencies as packaging. Cost per useful output is the comparison, not brand decks.", 58, "trust conditional", ["Copilots = leverage", "Agencies = packaging", "Cost per output"]),
      Q("What Arabic vs English product gaps show up when teams try AI in daily work?", "Arabic product gap", "Simulated bilingual teams report English-first models and weak dialect handling. That undercuts “regional AI hub” talk when the shop floor is Arabic.", 48, "slightly negative", ["Dialect quality lags", "English-first defaults", "Hub claim vs shop floor"]),
      Q("Which AI use-cases earn spontaneous praise from non-technical staff?", "Staff praise", "Simulated praise attaches to WhatsApp drafting, invoice OCR, and meeting notes—not model names. Spontaneous trust is UX, not architecture.", 70, "positive", ["WhatsApp and OCR", "Notes over models", "UX is the trust"]),
      Q("How do SMB CEOs talk about risk, hallucination, and customer-facing AI?", "Customer-facing risk", "Simulated caution is highest when AI touches clients. Internal drafts are tolerated; public copy and pricing bots draw pushback.", 55, "mixed", ["Internal vs client use", "Hallucination as brand risk", "Pricing bots disliked"]),
      Q("What would make an AI vendor credible to a 20-person Dubai company?", "Credibility test", "Simulated credibility = local billing, Arabic support, and a named person. Global logos without a UAE number lose.", 61, "leaning positive", ["Local billing", "Arabic support", "A named human"]),
      Q("Where does “AI will replace agencies” talk collide with who still buys retainers?", "Replace agencies?", "Simulated founders say they will cut retainers, then still buy launches. The collision is time, not ideology.", 57, "mixed", ["Intent to cut", "Still buy launches", "Time, not ideology"]),
      Q("If this sample flipped negative, which event would expose the gap first?", "Flip risk", "Simulated: a public hallucination on a client WhatsApp, or a data-residency scare, would outrun any transformation ad.", 50, "watch", ["Client-facing error", "Residency scare", "Ads cannot catch up"]),
    ],
  },
  {
    id: "founder-branding-x",
    name: "Founder personal branding on X",
    audience: "tech",
    group: "Social",
    blurb: "Earned founder voice versus packaged thought-leadership media.",
    headline: "Simulated: executives’ earned replies vs packaged personal-brand media.",
    score: 72,
    label: "Positive",
    divergence: 41,
    sample: 388,
    delta: 6,
    questions: [
      Q("What makes a founder’s X post feel earned rather than an agency calendar?", "Earned vs calendar", "Simulated readers reward specifics, replies, and same-day ops. Calendar carousels are called ads even when unpaid.", 68, "leaning positive", ["Specifics and replies", "Carousels read as ads", "Same-day ops"]),
      Q("How do UAE founders talk about personal brand versus company brand?", "Person vs company", "Simulated split: the person opens DMs; the company logo does not. Tension appears when legal wants the logo only.", 63, "cautiously positive", ["Person opens DMs", "Logo closes rooms", "Legal friction"]),
      Q("Which founder topics get replies from actual buyers, not other founders?", "Buyer replies", "Simulated buyer replies cluster on hiring, pricing, and delivery—not “lessons from failing.” Founder-to-founder loops inflate vanity.", 59, "mixed", ["Hiring and pricing", "Delivery stories", "Peer loops inflate"]),
      Q("Where does ghostwritten thought-leadership lose credibility?", "Ghostwriting tell", "Simulated tells: identical cadence across founders, no typos, no local time. Credibility drops when the founder cannot answer a reply.", 47, "slightly negative", ["Identical cadence", "No local time", "Cannot answer replies"]),
      Q("How do Arabic and English founder voices differ in this sample?", "AR/EN voice", "Simulated English posts hunt capital; Arabic posts hunt trust with family businesses. Mixing both without dialect care is called out.", 60, "mixed", ["EN = capital", "AR = trust", "Dialect care"]),
      Q("What role do podcasts and PR hits play versus daily replies?", "Podcasts vs replies", "Simulated: a podcast spike is paid-adjacent volume; daily replies are the earned graph. Rankings that mix them mislead.", 54, "mixed", ["Spike ≠ earned", "Daily replies", "Do not mix graphs"]),
      Q("How do founders describe the cost of being visible on X in the UAE?", "Cost of visibility", "Simulated costs: time, family exposure, and legal caution. Visibility is not free; some opt for LinkedIn-only.", 56, "mixed", ["Time and family", "Legal caution", "Some leave X"]),
      Q("Which personal-brand promises from agencies contradict founder experience?", "Agency promises", "Simulated agencies sell follower counts; founders wanted inbound deals. The contradiction is KPI, not aesthetics.", 49, "slightly negative", ["Followers vs inbound", "Wrong KPI", "Aesthetics are secondary"]),
      Q("What would authentic founder success look like beyond impressions?", "Authentic success", "Simulated: named meetings, hired people, and closed retainers from replies—not a blue check.", 71, "positive", ["Named meetings", "Hires from replies", "Not the check"]),
    ],
  },
  {
    id: "uae-freelance-economy",
    name: "Freelance economy in the UAE",
    audience: "freelance",
    group: "Economic",
    blurb: "Permits, late pay, and platforms versus official freelance-hub messaging.",
    headline: "Simulated: freelancer lived talk vs hub-strategy announcements.",
    score: 51,
    label: "Mixed",
    divergence: 46,
    sample: 355,
    delta: -3,
    questions: [
      Q("What permit and visa friction do freelancers name that official hub pages omit?", "Permit friction", "Simulated: mainland vs free-zone permits, bank KYC, and visa renewals dominate. Hub pages sell lifestyle; earned talk sells paperwork.", 44, "critical", ["Paperwork first", "KYC delays", "Lifestyle vs lived"]),
      Q("How do late payments and retainers show up in public talk?", "Late pay", "Simulated complaints about 60–90 day cycles and scope creep. Official entrepreneurship talk rarely names collections.", 42, "critical", ["60–90 day cycles", "Scope creep", "Collections unspoken"]),
      Q("Which platforms do UAE freelancers actually use to find work?", "Platforms used", "Simulated: WhatsApp groups, referrals, and a few local boards beat global marketplaces. Upwork is backup, not the market.", 58, "mixed", ["WhatsApp and referrals", "Local boards", "Global as backup"]),
      Q("How do Emirati and expat freelancers describe the same market differently?", "Emirati vs expat", "Simulated Emirati voices stress networks and family business; expats stress visas and switching cost. Same rates, different risk.", 53, "mixed", ["Networks vs visas", "Same rates", "Different risk"]),
      Q("Where does “freelance hub” language collide with banking access?", "Banking access", "Simulated: freelance licences without a usable account. That collision is louder than any hub slogan.", 40, "critical", ["Licence ≠ account", "KYC walls", "Slogan collision"]),
      Q("What skills are actually in demand versus courses being sold?", "Skills vs courses", "Simulated demand: bilingual ops, paid ads with Arabic creative, bookkeeping. Course ads sell generic “AI freelance.”", 55, "mixed", ["Bilingual ops", "Arabic creative", "Generic course ads"]),
      Q("How do agencies treat freelancers in this sample—partners or overflow?", "Agency treatment", "Simulated: overflow at night rates, partner language in the pitch. Earned talk is overflow.", 48, "slightly negative", ["Overflow rates", "Partner in the pitch", "Earned = overflow"]),
      Q("What would make freelance work in the UAE feel secure without becoming a job?", "Security without a job", "Simulated asks: faster pay, portable health, and a bank that understands the licence. Not a co-working photo.", 57, "mixed", ["Faster pay", "Portable health", "Bank that gets it"]),
      Q("If sentiment flipped, which policy or platform event would do it?", "Flip event", "Simulated: a banking clamp or a high-profile non-payment case would outrun a new freelance-visa press release.", 46, "watch", ["Banking clamp", "Non-payment case", "Press cannot cover"]),
    ],
  },
  {
    id: "uae-fintech-banking-trust",
    name: "UAE digital banking & fintech trust",
    audience: "fintech",
    group: "Economic",
    blurb: "App trust, fees, freezes versus official fintech-hub strategy.",
    headline: "Simulated: app trust and fee talk vs hub-strategy volume.",
    score: 62,
    label: "Leaning Positive",
    divergence: 38,
    sample: 501,
    delta: 2,
    questions: [
      Q("What experiences make users call a UAE fintech “better than the bank”?", "Better than the bank", "Simulated: onboarding speed, 24/7 app, salary accounts. “Better” is ops, not the skyline shot.", 67, "leaning positive", ["Speed and salary rails", "24/7 app", "Not the skyline"]),
      Q("Where do frozen accounts and KYC dominate the conversation?", "Freezes and KYC", "Simulated freeze threads spike after compliance waves. Official pages stay on licences; users stay on access to their money.", 45, "critical", ["Freeze threads", "Access to money", "Licence vs access"]),
      Q("How do fees and FX spreads show up against “low cost” ads?", "Fees vs ads", "Simulated users compare FX to a bank counter and to Wise. Low-cost ads lose when the spread is named.", 50, "mixed", ["Named spreads", "Wise as benchmark", "Ads lose"]),
      Q("Is success described as organic product love or policy scaffolding?", "Organic vs policy", "Simulated mix: people like the app and still name DIFC/ADGM. Neither story is exclusive in this sample.", 55, "mixed", ["App love", "Free-zone named", "Not exclusive"]),
      Q("Which features earn spontaneous trust—licences, cards, or support?", "Trust features", "Simulated trust: visible licence + a human in chat. Cards without support do not hold.", 60, "leaning positive", ["Licence visible", "Human in chat", "Cards alone fail"]),
      Q("How do users in other Arab markets talk about UAE fintech versus local options?", "Regional comparison", "Simulated: UAE apps are the reference; local options win on cash and family. Leadership is partial.", 58, "mixed", ["UAE as reference", "Local cash/family", "Partial leadership"]),
      Q("What assumptions about low corruption appear, and where do they crack?", "Corruption assumptions", "Simulated: high trust in regulation, cracks on unexplained freezes and opaque merchant holds.", 52, "mixed", ["Reg trust high", "Freeze opacity", "Merchant holds"]),
      Q("How do SMBs use fintech versus consumers in this sample?", "SMB vs consumer", "Simulated SMBs care about payroll and VAT; consumers care about cards and splitting. Mixing the two audiences hides the gap.", 61, "leaning positive", ["Payroll/VAT", "Cards/splitting", "Do not mix"]),
      Q("What would authentic fintech success look like beyond hub metrics?", "Authentic success", "Simulated: fewer freeze horror stories, named fee tables, and support that answers in Arabic after 9pm.", 63, "cautiously positive", ["Fewer freeze stories", "Named fees", "Arabic after 9pm"]),
    ],
  },
  {
    id: "crypto-vara-uae",
    name: "Crypto & VARA regulation in the UAE",
    audience: "crypto",
    group: "Economic",
    blurb: "Licensed venues versus Telegram deal flow and global exchange talk.",
    headline: "Simulated: licensed-venue talk vs Telegram deal flow.",
    score: 54,
    label: "Mixed",
    divergence: 44,
    sample: 367,
    delta: -2,
    questions: [
      Q("How do traders describe VARA/ADGM licences in daily language—shield or friction?", "Licence as shield", "Simulated: licence is a shield when talking to family and banks; friction when onboarding takes weeks.", 53, "mixed", ["Shield for family", "Friction onboarding", "Both true"]),
      Q("Where does Telegram OTC still beat licensed venues in this sample?", "Telegram OTC", "Simulated OTC for size and speed; licensed venues for fiat ramps. The split is liquidity, not ideology.", 49, "slightly negative", ["OTC for size", "Venues for fiat", "Liquidity split"]),
      Q("What retail complaints about fees and spreads attach to which brands?", "Retail fees", "Simulated fee complaints attach to ramps, not to the token. Brand talk is the on-ramp.", 51, "mixed", ["Ramps, not tokens", "On-ramp is the brand", "Spreads named"]),
      Q("How do banking relationships show up when users try to cash out?", "Cash-out banks", "Simulated cash-out is the stress test. Licensed does not always mean the bank will take the wire.", 43, "critical", ["Cash-out stress", "Licence ≠ wire", "Bank still decides"]),
      Q("What do founders building in crypto say they need from UAE policy next?", "Policy next", "Simulated asks: clearer retail rules, faster approvals, and bank letters that mean something.", 56, "mixed", ["Retail clarity", "Faster approvals", "Bank letters"]),
      Q("How is Dubai crypto talk different from Abu Dhabi in this sample?", "Dubai vs Abu Dhabi", "Simulated Dubai = venues and events; Abu Dhabi = institutional tone. Users pick the city for the job.", 60, "leaning positive", ["Dubai venues", "Abu Dhabi institutional", "City for the job"]),
      Q("Where do global exchange narratives overwrite local licensed ones?", "Global overwrite", "Simulated: large global brands still set the meme; local licences set the bank meeting. Two graphs.", 52, "mixed", ["Global memes", "Local bank meetings", "Two graphs"]),
      Q("How do Emirati and expat crypto users differ in risk language?", "Risk language", "Simulated Emirati voices stress family and reputation; expats stress tickets and exits. Same book, different chapter.", 55, "mixed", ["Family/reputation", "Tickets/exits", "Same book"]),
      Q("What event would flip this topic’s public graph fastest?", "Flip event", "Simulated: a bank-wide cash-out freeze or a licensed-venue incident would beat any conference keynote.", 47, "watch", ["Cash-out freeze", "Venue incident", "Keynotes lose"]),
    ],
  },
  {
    id: "ai-search-geo-reputation",
    name: "AI search & GEO reputation",
    audience: "smb",
    group: "Economic",
    blurb: "Being found by models versus SEO-agency ads.",
    headline: "Simulated: how buyers find firms on AI search vs SEO-agency ads.",
    score: 69,
    label: "Leaning Positive",
    divergence: 36,
    sample: 329,
    delta: 5,
    questions: [
      Q("What do UAE buyers say they asked ChatGPT/Grok before calling a firm?", "What they asked", "Simulated queries: “best [category] in Dubai that replies on WhatsApp.” Not the agency keyword list.", 70, "positive", ["WhatsApp in the query", "Dubai + category", "Not the keyword list"]),
      Q("Where do SEO retainers fail to show up in AI answers?", "SEO vs AI answers", "Simulated: blog mills do not get cited; named case studies and X threads do. GEO is not last year’s SEO.", 58, "mixed", ["Blogs not cited", "Cases and threads", "GEO ≠ old SEO"]),
      Q("How do agencies sell GEO, and how do clients describe the delivery?", "GEO sales vs delivery", "Simulated agencies sell “we get you in ChatGPT.” Clients describe PDFs and hope. Delivery is thin.", 46, "slightly negative", ["Sold as ChatGPT", "Delivered as PDFs", "Thin delivery"]),
      Q("What reputation risks appear when AI search summarizes a brand?", "Summary risk", "Simulated: old complaints and a single 1-star review get amplified. Brands learn summaries are sticky.", 50, "mixed", ["Old complaints stick", "One review amplified", "Summaries persist"]),
      Q("Which proof assets seem to get cited—press, X, or directories?", "Cited assets", "Simulated citations: X threads with numbers, Google listings, and one reputable press hit. Vanity awards do not.", 66, "leaning positive", ["Numbered threads", "Listings + press", "Awards ignored"]),
      Q("How do Arabic queries change who gets recommended?", "Arabic queries", "Simulated Arabic queries surface different firms than English. Brands with no Arabic footprint disappear.", 54, "mixed", ["Different firm set", "No Arabic = invisible", "Two indexes"]),
      Q("What do SMB CEOs want from GEO that they do not want from SEO?", "GEO vs SEO want", "Simulated want: to be the named answer, not page-four. They will not wait 12 months.", 62, "leaning positive", ["Named answer", "Not page four", "No 12-month wait"]),
      Q("Where does personal founder brand leak into company GEO?", "Founder leak", "Simulated: the founder’s X is cited more than the .com. That is a gift and a bus-factor.", 64, "leaning positive", ["Founder cited", ".com quieter", "Bus-factor"]),
      Q("What would a credible GEO programme look like in this market?", "Credible GEO", "Simulated: source pages models can quote, Arabic + English, and a human who answers the WhatsApp the model promised.", 71, "positive", ["Quotable sources", "Bilingual", "WhatsApp kept"]),
    ],
  },
  {
    id: "uae-housing-cost-living",
    name: "Housing costs & quality of life",
    audience: "emirati",
    group: "Social",
    blurb: "Rents, school fees, and commute versus lifestyle media.",
    headline: "Simulated: rent and school-fee talk vs lifestyle media volume.",
    score: 43,
    label: "Slightly Negative",
    divergence: 52,
    sample: 478,
    delta: -5,
    questions: [
      Q("What rent and renewal experiences dominate earned talk this sample?", "Rent renewals", "Simulated renewals and agency fees dominate. Lifestyle media still sells skyline living. The gap is the story.", 38, "critical", ["Renewals named", "Agency fees", "Skyline vs lease"]),
      Q("How do school fees enter household conversations on X?", "School fees", "Simulated school-fee threads are as loud as rent in family accounts. Official livability indexes rarely show the line item.", 41, "critical", ["Fees as loud as rent", "Family accounts", "Indexes miss the line"]),
      Q("Where do commute and heat show up as quality-of-life, not weather?", "Commute and heat", "Simulated: heat + school run + parking is the day. Weather apps are not the discourse.", 44, "critical", ["School run + heat", "Parking", "Not the weather app"]),
      Q("How do Emirati and expat housing talk differ without smearing either?", "Emirati vs expat housing", "Simulated Emirati talk includes family compounds and inheritance; expats include deposits and exit. Both name price.", 50, "mixed", ["Compounds/inheritance", "Deposits/exit", "Both name price"]),
      Q("What “quality of life” official claims get the fastest earned correction?", "Fastest correction", "Simulated: “affordable luxury” and commute-time claims. Corrections are receipts, not ideology.", 40, "critical", ["Affordable luxury", "Commute claims", "Receipts"]),
      Q("How do SMBs talk about staff housing and retention?", "Staff housing", "Simulated SMBs lose people to rent more than to salary. Retention is a housing story.", 47, "slightly negative", ["Rent > salary", "Retention", "Housing story"]),
      Q("Which areas are named as still livable, and on what evidence?", "Livable areas", "Simulated named areas come with school + metro + rent bands. Unnamed “community living” ads do not stick.", 55, "mixed", ["School + metro", "Rent bands", "Ads do not stick"]),
      Q("What would closing the livability gap look like in public talk?", "Closing the gap", "Simulated: predictable renewals, published fee tables, and less lifestyle footage in the same week as a 20% hike.", 48, "slightly negative", ["Predictable renewals", "Fee tables", "Timing of footage"]),
      Q("Which event would flip this topic positive in a week?", "Positive flip", "Simulated: a visible cap or a large new supply announcement that names prices, not just unit counts.", 46, "watch", ["Named prices", "Not unit counts", "Visible cap"]),
    ],
  },
  {
    id: "golden-visa-talent",
    name: "Golden Visa, talent & remote work",
    audience: "emirati",
    group: "Political",
    blurb: "Talent attraction versus paperwork and remote-work lived experience.",
    headline: "Simulated: talent-visa talk vs paperwork and remote-work lived experience.",
    score: 61,
    label: "Leaning Positive",
    divergence: 33,
    sample: 341,
    delta: 3,
    questions: [
      Q("What do applicants praise about Golden Visa that official pages also claim?", "Overlap with official", "Simulated overlap: duration, family, and prestige. That overlap is real and should be named.", 72, "positive", ["Duration", "Family", "Prestige"]),
      Q("Where does paperwork diverge from the landing-page story?", "Paperwork gap", "Simulated: document loops, translation, and “come back tomorrow.” The landing page is one screen.", 49, "slightly negative", ["Document loops", "Translation", "One-screen ads"]),
      Q("How do remote workers describe UAE as a base versus a tourist stay?", "Base vs tourist", "Simulated remote workers want banking, schools, and a desk. Tourist frames do not help them.", 58, "mixed", ["Banking and schools", "A desk", "Not tourist frames"]),
      Q("What talent does public talk say the UAE is winning—and losing?", "Winning and losing", "Simulated win: product and finance talent. Simulated loss: people who cannot clear KYC or school fees.", 57, "mixed", ["Product/finance win", "KYC/school loss", "Two lists"]),
      Q("How do Emirati voices talk about inbound talent without this becoming smear?", "Emirati inbound", "Simulated Emirati talk wants high-skill inbound and fair access at home. Both can be true in one sample.", 60, "leaning positive", ["High-skill inbound", "Fair access at home", "Both true"]),
      Q("Which employers are named as actually sponsoring versus posting ads?", "Sponsoring vs ads", "Simulated: a short list of sponsors, a long list of ads. Named sponsors are the signal.", 52, "mixed", ["Short sponsor list", "Long ad list", "Names are the signal"]),
      Q("How does remote-work policy talk compare to office-return talk?", "Remote vs office", "Simulated hybrid is the lived compromise. Absolute remote and absolute office both get pushback.", 55, "mixed", ["Hybrid lived", "Absolutes push back", "Compromise"]),
      Q("What would make talent stay five years, not one?", "Stay five years", "Simulated: school seats, a bank, and a path that does not reset every visa cycle.", 63, "leaning positive", ["School seats", "A bank", "No reset cycle"]),
      Q("Which announcement would move this graph without a new slogan?", "Move the graph", "Simulated: published processing times and a named ombudsman for stuck files.", 59, "mixed", ["Processing times", "Stuck-file ombudsman", "No new slogan"]),
    ],
  },
  {
    id: "smb-visibility-paid",
    name: "SMB visibility vs paid takeovers",
    audience: "smb",
    group: "Economic",
    blurb: "Organic discovery versus boosted B2B campaigns.",
    headline: "Simulated: unprompted partner mentions vs boosted B2B campaigns.",
    score: 58,
    label: "Mixed",
    divergence: 40,
    sample: 394,
    delta: 1,
    questions: [
      Q("How do SMBs say they actually get discovered by buyers on X?", "How discovered", "Simulated: replies, groups, and a founder name. Boosted B2B creatives are background noise.", 62, "leaning positive", ["Replies and groups", "Founder name", "Boosted = noise"]),
      Q("Where do paid takeovers annoy the same audience they target?", "Takeover annoyance", "Simulated: timeline takeovers during industry weeks. Buyers mute; they do not convert.", 45, "critical", ["Industry-week takeovers", "Mute not convert", "Same audience"]),
      Q("What organic proof do CEOs trust when shortlisting a vendor?", "Organic proof", "Simulated: a client who replies in public. Case PDFs without a human are discounted.", 66, "leaning positive", ["Public client reply", "PDFs discounted", "A human"]),
      Q("How do agencies report performance versus what CEOs say they received?", "Reported vs received", "Simulated agencies report impressions; CEOs wanted meetings. The KPI fight is the topic.", 48, "slightly negative", ["Impressions vs meetings", "KPI fight", "The topic"]),
      Q("Which categories still need paid because organic is captured?", "When paid is needed", "Simulated: hiring and events still need paid. Advisory and B2B services do not if the founder posts.", 57, "mixed", ["Hiring/events paid", "Advisory organic", "Founder posts"]),
      Q("How does Arabic creative change paid versus earned performance?", "Arabic creative", "Simulated Arabic creative lifts earned replies more than paid CTR. Dialect is the difference.", 60, "leaning positive", ["Earned replies lift", "CTR less so", "Dialect"]),
      Q("What “thought leadership” spend looks like a takeover in this sample?", "Thought leadership spend", "Simulated: identical carousels from five firms in one week. That is a takeover with nicer fonts.", 46, "slightly negative", ["Identical carousels", "One week", "Nicer fonts"]),
      Q("How do SMBs describe partner mentions they did not pay for?", "Unpaid mentions", "Simulated unpaid mentions are the gold standard. They are rare and named.", 73, "positive", ["Gold standard", "Rare", "Named"]),
      Q("What would a competitive, non-spam B2B presence look like?", "Non-spam presence", "Simulated: three useful posts a week, replies within an hour, no takeover days.", 65, "leaning positive", ["Three useful posts", "Hour replies", "No takeover days"]),
    ],
  },
  {
    id: "emirati-family-business",
    name: "Family business & SMB growth",
    audience: "emirati",
    group: "Economic",
    blurb: "Succession, diversification, and next-gen operators versus brochure growth talk.",
    headline: "Simulated: next-gen operator talk vs brochure growth narratives.",
    score: 64,
    label: "Leaning Positive",
    divergence: 31,
    sample: 318,
    delta: 2,
    questions: [
      Q("How do next-gen operators describe growth that is not a press release?", "Growth not a release", "Simulated: new SKUs, new cities, and a cousin who can sell. Press releases are for the holding company.", 66, "leaning positive", ["SKUs and cities", "Who can sell", "Press = holding"]),
      Q("Where does succession talk appear—and where is it silent?", "Succession", "Simulated succession is whispered, not posted. Silence is the data; do not invent a crisis.", 58, "mixed", ["Whispered", "Silence is data", "Do not invent crisis"]),
      Q("What diversification bets get earned support versus official diversification talk?", "Diversification bets", "Simulated earned support: logistics, education, health. Official lists are longer than earned lists.", 61, "leaning positive", ["Logistics/education/health", "Official lists longer", "Earned is shorter"]),
      Q("How do family businesses talk about hiring outside the family?", "Hiring outside", "Simulated: hire for digital and finance; keep relationships in the family. A practical split, not a slogan.", 63, "leaning positive", ["Digital/finance hires", "Relationships stay", "Practical split"]),
      Q("What role does X play that majlis and WhatsApp do not?", "X vs majlis", "Simulated X is for weak ties and inbound; majlis is for trust. They are not substitutes.", 68, "positive", ["X = weak ties", "Majlis = trust", "Not substitutes"]),
      Q("How do Emirati SMBs talk about agencies and consultancies?", "Agencies and consultancies", "Simulated: useful for a launch, expensive as a habit. Next-gen wants in-house digital.", 54, "mixed", ["Launch yes", "Habit no", "In-house digital"]),
      Q("Which capital sources are named—banks, family, or funds?", "Capital sources", "Simulated: family and banks first; funds when the story is tech. Naming matters.", 59, "mixed", ["Family and banks", "Funds if tech", "Naming"]),
      Q("What “vision” language lands, and what reads as brochure?", "Vision language", "Simulated: a named factory or school lands. “Regional champion” without a site does not.", 56, "mixed", ["Named site lands", "Champion without site", "Brochure"]),
      Q("What would next-gen success look like in earned talk five years on?", "Five years on", "Simulated: the same family name, a public hire, and a product people repurchase—not another MOU.", 70, "positive", ["Same name", "Public hire", "Repurchase not MOU"]),
    ],
  },
];

export function solvoTopicById(id: string): SolvoTopic | undefined {
  return SOLVO_TOPICS.find((t) => t.id === id);
}

export const SOLVO_TOPIC_IDS = SOLVO_TOPICS.map((t) => t.id);
export const SOLVO_TOPIC_NAMES = SOLVO_TOPICS.map((t) => t.name);
