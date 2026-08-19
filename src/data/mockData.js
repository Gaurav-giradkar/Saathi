// ---------------------------------------------------------------------------
// mockData.js
// Static reference data, educational content, UI options and application
// constants used across Saathi.
//
// IMPORTANT:
// - This file must NOT contain real user/personal health data.
// - User-specific data belongs in Firebase.
// - Cycle history, pain trends, health logs and personal insights should
//   eventually be calculated from Firebase data.
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// MENSTRUAL CYCLE PHASES
// ---------------------------------------------------------------------------

export const PHASES = {
  menstrual: {
    label: 'Menstrual',
    color: '#E85D75',
    bg: '#FCE1E6',
    text: '#9E2F45',
    desc: 'The uterine lining sheds, causing menstrual bleeding. Some people may experience cramps, fatigue, or lower energy during this phase.',
  },

  follicular: {
    label: 'Follicular',
    color: '#4FA89B',
    bg: '#D6EEE9',
    text: '#2F675E',
    desc: 'The body prepares for ovulation. Follicle development continues and estrogen generally rises during this phase.',
  },

  ovulation: {
    label: 'Ovulation',
    color: '#E8A94A',
    bg: '#FBEACB',
    text: '#C88C31',
    desc: 'An egg is released from an ovary. Fertility is highest during the days surrounding ovulation.',
  },

  luteal: {
    label: 'Luteal',
    color: '#6B5B95',
    bg: '#E8E0F0',
    text: '#443A61',
    desc: 'The body prepares for a possible pregnancy. If pregnancy does not occur, hormone levels fall and the next menstrual period begins.',
  },
};


// ---------------------------------------------------------------------------
// SYMPTOM OPTIONS
// Static choices. A user's selected symptoms are stored in Firebase.
// ---------------------------------------------------------------------------

export const SYMPTOM_OPTIONS = [
  'Cramps',
  'Headache',
  'Migraine',
  'Bloating',
  'Backache',
  'Pelvic pain',
  'Nausea',
  'Dizziness',
  'Fatigue',
  'Weakness',
  'Breast tenderness',
  'Breast pain',
  'Acne',
  'Constipation',
  'Diarrhea',
  'Gas',
  'Hot flashes',
  'Chills',
  'Muscle aches',
  'Joint pain',
  'Heavy bleeding',
  'Light bleeding',
  'Spotting',
  'Clots',
  'Vaginal dryness',
  'Increased discharge',
  'Unusual discharge',
  'Sore throat',
  'Fever',
  'Cold symptoms',
  'Other',
];


// ---------------------------------------------------------------------------
// MOOD OPTIONS
// Static choices. The user's actual mood is stored in Firebase.
// ---------------------------------------------------------------------------

export const MOOD_OPTIONS = [
  {
    key: 'great',
    label: 'Great',
    emoji: '😄',
  },
  {
    key: 'good',
    label: 'Good',
    emoji: '🙂',
  },
  {
    key: 'okay',
    label: 'Okay',
    emoji: '😐',
  },
  {
    key: 'low',
    label: 'Low',
    emoji: '😔',
  },
  {
    key: 'irritable',
    label: 'Irritable',
    emoji: '😤',
  },
];


// ---------------------------------------------------------------------------
// ENERGY LEVELS
// Static choices. The user's actual energy level is stored in Firebase.
// ---------------------------------------------------------------------------

export const ENERGY_LEVELS = [
  'Very Low',
  'Low',
  'Medium',
  'High',
  'Very High',
];


// ---------------------------------------------------------------------------
// SUPPORTER RELATIONSHIP TYPES
// ---------------------------------------------------------------------------

export const RELATIONSHIP_TYPES = [
  'Partner',
  'Spouse',
  'Sibling',
  'Parent',
  'Friend',
  'Other',
];


// ---------------------------------------------------------------------------
// SHARING CATEGORIES
// These define what Saathi can allow a user to share with a connected
// supporter. Actual permissions are stored in Firebase.
// ---------------------------------------------------------------------------

export const SHARING_CATEGORIES = [
  {
    key: 'cyclePhase',
    label: 'Cycle phase',
    desc: 'The currently estimated phase of the menstrual cycle.',
    locked: true,
  },

  {
    key: 'periodStatus',
    label: 'Period status',
    desc: 'Whether the user has marked their period as active today.',
  },

  {
    key: 'expectedPeriod',
    label: 'Expected period',
    desc: 'The estimated start date of the next period based on the available cycle history.',
  },

  {
    key: 'painLevel',
    label: 'Pain level',
    desc: 'The pain intensity reported by the user on a 1–10 scale.',
  },

  {
    key: 'symptoms',
    label: 'Symptoms',
    desc: 'Physical symptoms that the user has chosen to share.',
    defaultOn: false,
  },

  {
    key: 'mood',
    label: 'Mood',
    desc: 'Daily mood information that the user has chosen to share.',
    defaultOn: false,
  },

  {
    key: 'dietNutrition',
    label: 'Diet & nutrition',
    desc: 'Food, hydration, and nutrition information that the user has chosen to share.',
    defaultOn: false,
  },

  {
    key: 'sleep',
    label: 'Sleep',
    desc: 'Sleep duration and quality information that the user has chosen to share.',
    defaultOn: false,
  },

  {
    key: 'medicalInfo',
    label: 'Medical information',
    desc: 'Health or medical notes that the user has explicitly chosen to share.',
    defaultOn: false,
  },
];


// ---------------------------------------------------------------------------
// EDUCATION CENTER
// Static educational content.
// ---------------------------------------------------------------------------

export const EDUCATION_TOPICS = [
  {
    id: 'about-periods',
    title: 'About Periods',
    icon: 'Droplet',
    summary: 'Understand what a period is, why it happens, and how it fits into the menstrual cycle.',

    content: [
      'A period, or menstruation, is the release of blood and tissue from the lining of the uterus when pregnancy has not occurred.',

      'A period is one part of the menstrual cycle. The cycle is counted from the first day of menstrual bleeding to the first day of the next period.',

      'A period commonly lasts about 2–7 days. The average menstrual cycle is around 28 days, although cycle length can vary between people and from one cycle to another.',

      'Tracking the first day of each period can help you understand your own cycle pattern and notice changes over time.',
    ],
  },


  {
    id: 'four-phases',
    title: 'The Four Phases',
    icon: 'RefreshCw',
    summary: 'Learn about the menstrual, follicular, ovulation, and luteal phases of the cycle.',

    content: [
      'Menstrual phase: The uterine lining is shed, producing menstrual bleeding. This is the phase commonly called the period.',

      'Follicular phase: This phase begins on the first day of the period and continues until ovulation. Follicles develop in the ovaries and estrogen generally rises.',

      'Ovulation: An egg is released from an ovary. The timing varies between people and between cycles, so it should be treated as an estimate rather than a fixed calendar day.',

      'Luteal phase: After ovulation, the body prepares for a possible pregnancy. If pregnancy does not occur, hormone levels fall and menstruation begins again.',
    ],
  },


  {
    id: 'symptoms-guide',
    title: 'Symptoms Guide',
    icon: 'Stethoscope',
    summary: 'Understand common menstrual symptoms and practical ways to manage mild discomfort.',

    content: [
      'Common menstrual symptoms can include cramps, bloating, headaches, fatigue, breast tenderness, nausea, acne, and changes in mood.',

      'For mild period discomfort, heat, gentle movement, adequate rest, and staying hydrated may help some people feel more comfortable.',

      'Over-the-counter pain relievers such as paracetamol or ibuprofen can help some people with period pain. They are not suitable for everyone, so product instructions and individual medical advice should be followed.',

      'If period pain is severe, worsening, or regularly interferes with school, work, exercise, sleep, or daily activities, it should be discussed with a healthcare professional.',
    ],
  },


  {
    id: 'myths-facts',
    title: 'Myths vs Facts',
    icon: 'CheckCircle2',
    summary: 'Separate common menstrual myths from evidence-based information.',

    content: [
      'Myth: You should completely avoid exercise during your period.',
      'Fact: Gentle or moderate physical activity can be helpful for some people and may reduce period discomfort.',

      'Myth: Every period must arrive on exactly the same day each month. ',
      'Fact: Cycle length can naturally vary between people and between cycles.',

      'Myth: Menstrual blood is dirty or impure. ',
      'Fact: Menstrual fluid is a normal mixture of blood, tissue from the uterine lining, and other fluids.',

      'Myth: There is one menstrual product that is best for everyone.',
      'Fact: Pads, tampons, menstrual cups, and period underwear have different characteristics, and the best choice depends on individual needs, comfort, access, and preferences.',
    ],
  },


  {
    id: 'hygiene',
    title: 'Menstrual Hygiene',
    icon: 'ShieldCheck',
    summary: 'Simple practices for using menstrual products safely and maintaining good hygiene.',

    content: [
      'Wash your hands before and after changing or handling a menstrual product.',

      'Change menstrual products regularly and follow the instructions provided with the specific product. Wearing a product for too long can increase the risk of irritation and bacterial growth.',

      'For tampons, use the lowest absorbency that adequately manages your flow and never leave a tampon in for more than 8 hours.',

      'Menstrual cups should be emptied, cleaned, and cared for according to the manufacturer’s instructions. Many cups can be worn for several hours, but the exact maximum wear time depends on the product.',

      'Keep the external genital area clean. Avoid harsh or strongly fragranced products that may cause irritation.',
    ],
  },


  {
    id: 'mental-wellness',
    title: 'Mental Wellness',
    icon: 'HeartHandshake',
    summary: 'Understand how cycle-related symptoms and everyday wellbeing can interact.',

    content: [
      'Some people notice changes in mood, concentration, energy, or stress levels during different parts of their menstrual cycle.',

      'These experiences vary considerably between individuals. Saathi should help you identify your own patterns rather than assuming how you should feel during a particular phase.',

      'Tracking mood alongside cycle information can help you recognize recurring personal patterns and discuss them more clearly with a healthcare professional when needed.',

      'If low mood, anxiety, irritability, or other emotional symptoms are severe, persistent, or interfere with daily life, consider speaking with a qualified healthcare professional.',
    ],
  },
];


// ---------------------------------------------------------------------------
// WELLNESS CATEGORIES
// Static educational categories. Personalized recommendations should be
// generated from actual user information stored in Firebase.
// ---------------------------------------------------------------------------

export const WELLNESS_CATEGORIES = [
  {
    key: 'nutrition',
    title: 'Nutrition',
    icon: 'Apple',
    color: 'teal',
    tip: 'Choose a balanced diet that includes iron-rich foods such as lentils, beans, leafy green vegetables, eggs, meat, or other suitable sources.',
  },

  {
    key: 'exercise',
    title: 'Exercise',
    icon: 'Dumbbell',
    color: 'amber',
    tip: 'Gentle activities such as walking, stretching, yoga, swimming, or cycling may help some people manage period discomfort.',
  },

  {
    key: 'painManagement',
    title: 'Pain Management',
    icon: 'Thermometer',
    color: 'rose',
    tip: 'Heat applied to the lower abdomen or back can help relieve period pain for some people.',
  },

  {
    key: 'selfCare',
    title: 'Self-Care',
    icon: 'Sparkles',
    color: 'plum',
    tip: 'Give yourself enough time for rest, sleep, meals, hydration, and activities that help you feel comfortable during difficult days.',
  },

  {
    key: 'hygiene',
    title: 'Hygiene',
    icon: 'ShieldCheck',
    color: 'teal',
    tip: 'Change menstrual products regularly, wash your hands before and after handling them, and follow the product’s care instructions.',
  },

  {
    key: 'mentalWellness',
    title: 'Mental Wellness',
    icon: 'HeartHandshake',
    color: 'rose',
    tip: 'Track how you actually feel rather than assuming that a particular cycle phase determines your mood or personality.',
  },
];


// ---------------------------------------------------------------------------
// MENSTRUAL PRODUCT CATEGORIES
//
// These are educational categories, NOT products sold by Saathi.
// Saathi does not sell menstrual products.
//
// "comfort" and "ecoScore" from the original mock data have intentionally
// been removed because there is no universal scientifically valid score for
// comfort or environmental impact across every person/product.
// ---------------------------------------------------------------------------

export const PRODUCTS = [
  {
    id: 'pads',
    name: 'Sanitary Pads',
    icon: 'Layers',

    bestFor: 'People who prefer external protection, including beginners and users who do not want an internally inserted product.',

    absorbency: 'Available in different absorbency levels, from light to overnight/heavy-flow options depending on the product.',

    reusable: false,

    comfort: 4,

    ecoScore: 2,

    costPerCycle: '₹100–300',

    pros: [
      'Easy to use without inserting anything into the vagina.',
      'Available in many sizes, shapes, and absorbency levels.',
      'Can be convenient for overnight use when the appropriate product is selected.',
    ],

    cons: [
      'Disposable pads need to be changed regularly.',
      'Some people may experience skin irritation or discomfort, particularly in warm or humid conditions.',
      'Single-use products create more waste than reusable alternatives.',
      'Pads can shift during some physical activities depending on fit and design.',
    ],
  },


  {
    id: 'tampons',
    name: 'Tampons',
    icon: 'Minus',

    bestFor: 'People who prefer internal protection or want a compact option for activities such as swimming.',

    absorbency: 'Available in different absorbencies. Use the lowest absorbency that adequately manages your flow.',

    reusable: false,

    comfort: 4,

    ecoScore: 2,

    costPerCycle: '₹150–300',

    pros: [
      'Inserted internally, so there is no external pad.',
      'Compact and convenient to carry.',
      'Can be suitable for swimming and many physical activities.',
    ],

    cons: [
      'Requires insertion and removal.',
      'There is a rare but serious risk of toxic shock syndrome (TSS), particularly when tampons are used incorrectly or left in too long.',
      'The absorbency should be matched to the amount of menstrual flow.',
    ],
  },


  {
    id: 'cups',
    name: 'Menstrual Cups',
    icon: 'Wine',

    bestFor: 'People who prefer reusable menstrual products and are comfortable with insertion and removal.',

    absorbency: 'Capacity varies by cup. Follow the manufacturer’s instructions for maximum wear time and empty the cup as needed based on flow.',

    reusable: true,

    comfort: 3,

    ecoScore: 5,

    costPerCycle: '₹250–600',

    pros: [
      'Reusable and designed for repeated use.',
      'Can reduce the number of disposable menstrual products used over time.',
      'Can hold menstrual fluid rather than absorbing it.',
      'Different sizes and shapes are available.',
    ],

    cons: [
      'Requires a learning period for insertion, removal, and positioning.',
      'Needs regular cleaning and appropriate care.',
      'The cup must be emptied according to the product instructions and the user’s flow.',
      'Some people may not be comfortable with internal products.',
    ],
  },


  {
    id: 'underwear',
    name: 'Period Underwear',
    icon: 'Shirt',

    bestFor: 'People who prefer reusable external protection or want additional protection alongside another menstrual product.',

    absorbency: 'Absorbency varies significantly by product. Check the manufacturer’s stated capacity and intended flow level.',

    reusable: true,

    comfort: 5,

    ecoScore: 4,

    costPerCycle: '₹0 after purchase',

    pros: [
      'Can be worn like regular underwear.',
      'Reusable and washable.',
      'Available in styles designed for different levels of menstrual flow.',
      'Can be used alone or as backup protection depending on the product.',
    ],

    cons: [
      'Requires washing after use.',
      'Needs adequate time to dry before reuse.',
      'Initial purchase cost can be higher than a single disposable product.',
      'A particular pair may not provide enough protection for very heavy flow.',
    ],
  },
];


// ---------------------------------------------------------------------------
// SUPPORT ACTIONS
//
// These replace assumptions such as "luteal = irritable" or
// "ovulation = confident". Saathi should respond to what the user actually
// reports, not stereotype their feelings based on cycle phase.
// ---------------------------------------------------------------------------

export const SUPPORT_SUGGESTIONS = {
  painReported: {
    feeling: 'They have reported period-related pain or discomfort.',
    help: [
      'Ask whether they need anything rather than assuming what they want.',
      'Offer practical help if appropriate.',
      'Offer a warm drink or heating pad if they find those helpful.',
      'Keep plans flexible if they have asked for rest.',
    ],
    avoid: [
      'Dismissing or minimizing their pain.',
      'Assuming that their pain is normal simply because they are menstruating.',
      'Giving medication advice without considering their individual health circumstances.',
    ],
  },

  lowEnergyReported: {
    feeling: 'They have reported lower energy today.',
    help: [
      'Offer practical support with everyday tasks.',
      'Ask whether they would prefer rest or company.',
      'Keep plans flexible when possible.',
    ],
    avoid: [
      'Assuming the reason for their low energy.',
      'Pressuring them into activities they do not want.',
    ],
  },

  periodActive: {
    feeling: 'They have shared that their period is currently active.',
    help: [
      'Ask whether they need menstrual products or other practical support.',
      'Offer comfort without making assumptions about how they feel.',
      'Respect their preferred level of privacy.',
    ],
    avoid: [
      'Making jokes or comments that embarrass them.',
      'Assuming they are in pain.',
    ],
  },

  noDataShared: {
    feeling: 'No additional health information has been shared.',
    help: [
      'Respect their privacy.',
      'Ask how they are doing rather than trying to infer it from their cycle phase.',
    ],
    avoid: [
      'Guessing their mood, energy, pain, or personality from their menstrual phase.',
      'Attempting to access information that they have not shared.',
    ],
  },
};


// ---------------------------------------------------------------------------
// DEMO DATA — TEMPORARY
//
// These sections should NOT be used as real user data.
//
// Keep them only if the current UI requires sample data before Firebase is
// fully connected. Once Firebase is connected, replace them with queries
// against the authenticated user's actual data.
// ---------------------------------------------------------------------------

export const CYCLE_HISTORY = [];

export const PAIN_TREND = [];


// ---------------------------------------------------------------------------
// PERSONAL INSIGHTS
//
// Do NOT store fabricated statements such as:
// "Your last 4 cycles varied by 1–2 days"
// until these values are calculated from the user's Firebase data.
//
// Keep an empty array until the real insight engine is connected.
// ---------------------------------------------------------------------------

export const INSIGHT_TEMPLATES = [];


// ---------------------------------------------------------------------------
// PHASE ESTIMATION
//
// This function provides an approximate phase for visualization.
// It must NOT be presented as a medically confirmed ovulation prediction.
//
// day = cycle day, where the first day of menstrual bleeding is day 1.
// ---------------------------------------------------------------------------

export function getPhaseForDay(
  day,
  cycleLength = 28,
  periodLength = 5
) {
  if (day <= 0) return 'menstrual';

  if (day <= periodLength) {
    return 'menstrual';
  }

  // This is only a simplified estimate.
  // Ovulation does not necessarily happen on the same cycle day for
  // every person or every cycle.
  const estimatedOvulationDay = cycleLength - 14;

  if (day < estimatedOvulationDay - 2) {
    return 'follicular';
  }

  if (day <= estimatedOvulationDay + 1) {
    return 'ovulation';
  }

  return 'luteal';
}
