/*
|--------------------------------------------------------------------------
| Saathi Recommendation Engine
|--------------------------------------------------------------------------
|
| Purpose:
|   Generate personalized Health & Wellness recommendations from
|   Daily Health data.
|
| Categories:
|   - nutrition
|   - exercise
|   - painManagement
|   - selfCare
|   - hygiene
|   - mentalWellness
|
| IMPORTANT:
|   This is a deterministic rule-based engine.
|
|   Later, Gemini can be placed AFTER this engine to turn the structured
|   insights into more natural AI-generated responses.
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| DEFAULT CONTENT
|--------------------------------------------------------------------------
*/

const DEFAULTS = {
  nutrition: {
    summary:
      'Your nutrition needs can vary with your energy, symptoms, cycle, and daily routine.',

    insights: [
      'Keep your meals balanced and regular.',
      'Pay attention to changes in appetite and cravings.',
    ],

    actions: [
      'Include a mix of protein, carbohydrates, fruits, and vegetables.',
      'Stay hydrated throughout the day.',
    ],
  },

  exercise: {
    summary:
      'Choose movement based on how your body feels today rather than following a fixed intensity.',

    insights: [
      'Your activity level can be adjusted according to your energy and symptoms.',
    ],

    actions: [
      'Choose movement that feels comfortable.',
      'Allow yourself to rest when you need recovery.',
    ],
  },

  painManagement: {
    summary:
      'Tracking pain, symptoms, and relief methods helps Saathi understand your personal pattern.',

    insights: [
      'Continue recording your pain intensity and symptoms.',
    ],

    actions: [
      'Keep noting which relief methods you use and how helpful they feel.',
    ],
  },

  selfCare: {
    summary:
      'Your sleep, energy, hydration, stress, and symptoms can all help identify what your body needs today.',

    insights: [
      'Keep checking in with your daily wellbeing.',
    ],

    actions: [
      'Prioritize rest, hydration, meals, and recovery.',
    ],
  },

  hygiene: {
    summary:
      'Menstrual hygiene recommendations should reflect whether you are bleeding, your flow, and the products you use.',

    insights: [
      'Continue tracking your bleeding and menstrual products.',
    ],

    actions: [
      'Follow the instructions for the menstrual products you use.',
      'Wash your hands before and after handling menstrual products.',
    ],
  },

  mentalWellness: {
    summary:
      'Your mood, stress, sleep, energy, and concentration can help Saathi recognize your personal wellbeing patterns.',

    insights: [
      'Continue recording your mood and mental wellbeing.',
    ],

    actions: [
      'Pay attention to changes in mood, stress, sleep, and energy.',
    ],
  },
}


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function array(value) {
  if (Array.isArray(value)) return value
  if (value === undefined || value === null || value === '') return []
  return [value]
}

function has(value) {
  return value !== undefined && value !== null && value !== ''
}

function number(value) {
  if (!has(value)) return null

  const result = Number(value)

  return Number.isFinite(result) ? result : null
}

function contains(values, target) {
  return array(values).some(
    (value) =>
      String(value).toLowerCase() === String(target).toLowerCase(),
  )
}

function containsAny(values, targets) {
  const source = array(values).map((value) =>
    String(value).toLowerCase(),
  )

  return targets.some((target) =>
    source.includes(String(target).toLowerCase()),
  )
}

function containsText(values, text) {
  const source = array(values).map((value) =>
    String(value).toLowerCase(),
  )

  return source.some((value) => value.includes(text.toLowerCase()))
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function cleanText(value) {
  if (!has(value)) return ''

  return String(value).trim()
}


/*
|--------------------------------------------------------------------------
| NORMALIZATION
|--------------------------------------------------------------------------
|
| Daily Health uses the following fields:
|
| symptoms
| pain
| painLocations
| painTypes
| moods
| energy
| usualActivityLimited
| sleep
| sleepQuality
| sleepIssues
| waterLiters
| exerciseActivities
| exerciseIntensity
| exerciseMinutes
| meals
| appetite
| cravings
| activity
| stress
| mentalWellbeing
| concentration
| bleeding
| flowChange
| periodStatus
| productOptions
| relief
| notes
|
| These fields are already present in the Daily Health tracker.
|--------------------------------------------------------------------------
*/

export function normalizeHealthData(input = {}) {
  const data = {
    ...input,

    symptoms: array(input.symptoms),
    painLocations: array(input.painLocations),
    painTypes: array(input.painTypes),
    moods: array(input.moods || input.mood),

    energy: cleanText(input.energy),

    sleep:
      input.sleep === '' || input.sleep === null
        ? null
        : number(input.sleep),

    waterLiters:
      input.waterLiters === '' || input.waterLiters === null
        ? null
        : number(input.waterLiters),

    sleepIssues: array(input.sleepIssues),

    exerciseActivities: array(input.exerciseActivities),

    exerciseMinutes:
      input.exerciseMinutes === '' || input.exerciseMinutes === null
        ? null
        : number(input.exerciseMinutes),

    meals: array(input.meals),

    cravings: array(input.cravings),

    mentalWellbeing: array(
      input.mentalWellbeing || input.wellbeing,
    ),

    productOptions: array(
      input.productOptions ||
        input.protectionUsed ||
        input.products,
    ),

    relief: array(input.relief),

    pain: number(input.pain) ?? 0,

    stress: cleanText(input.stress),

    concentration: cleanText(input.concentration),

    bleeding: cleanText(input.bleeding),

    flowChange: cleanText(input.flowChange),

    periodStatus: cleanText(input.periodStatus),

    appetite: cleanText(input.appetite),

    activity: cleanText(input.activity),

    exerciseIntensity: cleanText(input.exerciseIntensity),

    sleepQuality: cleanText(input.sleepQuality),

    usualActivityLimited: Boolean(input.usualActivityLimited),

    notes: cleanText(input.notes),
  }

  return data
}


/*
|--------------------------------------------------------------------------
| SIGNAL DETECTION
|--------------------------------------------------------------------------
|
| Instead of directly generating recommendations from every field,
| first detect useful signals.
|--------------------------------------------------------------------------
*/

export function detectSignals(input = {}) {
  const data = normalizeHealthData(input)

  const signals = {
    // Physical
    highPain: data.pain >= 7,
    moderatePain: data.pain >= 4 && data.pain < 7,
    anyPain: data.pain > 0,

    cramps:
      contains(data.symptoms, 'Cramps') ||
      contains(data.painTypes, 'Cramping'),

    headache: containsAny(data.symptoms, [
      'Headache',
      'Migraine',
    ]),

    digestiveSymptoms: containsAny(data.symptoms, [
      'Bloating',
      'Nausea',
      'Constipation',
      'Diarrhea',
      'Gas',
    ]),

    fatigue: containsAny(data.symptoms, [
      'Fatigue',
      'Weakness',
    ]),

    dizziness: contains(data.symptoms, 'Dizziness'),

    breastSymptoms: containsAny(data.symptoms, [
      'Breast tenderness',
      'Breast pain',
    ]),

    backPain:
      contains(data.symptoms, 'Backache') ||
      contains(data.painLocations, 'Lower back'),

    pelvicPain:
      contains(data.symptoms, 'Pelvic pain') ||
      contains(data.painLocations, 'Pelvis'),

    // Energy
    veryLowEnergy: containsAny(data.energy, [
      'Very Low',
      'Low',
    ]),

    belowAverageEnergy: containsAny(data.energy, [
      'Very Low',
      'Low',
      'Below Average',
    ]),

    highEnergy: containsAny(data.energy, [
      'Above Average',
      'High',
      'Very High',
    ]),
    
    // Sleep
    shortSleep:
      data.sleep !== null &&
      data.sleep < 6,

    reducedSleep:
      data.sleep !== null &&
      data.sleep < 7,

    poorSleep:
      data.sleepQuality === 'Poor' ||
      containsAny(data.sleepIssues, [
        'Difficulty falling asleep',
        'Woke up frequently',
        'Woke up too early',
        'Restless sleep',
        'Nightmares',
      ]),

    // Hydration
    lowHydration:
      data.waterLiters !== null &&
      data.waterLiters < 1.5,

    // Food
    skippedMeal: containsAny(data.meals, [
      'Skipped breakfast',
      'Skipped lunch',
      'Skipped dinner',
    ]),

    ateLess: contains(data.meals, 'Ate less than usual'),

    ateMore: contains(data.meals, 'Ate more than usual'),

    balancedMeal: contains(data.meals, 'Balanced'),

    lightMeals: contains(data.meals, 'Light meals'),

    heavyMeals: contains(data.meals, 'Heavy meals'),

    lowAppetite: containsAny(data.appetite, [
      'Low',
      'Less',
      'Poor',
    ]),

    highAppetite: containsAny(data.appetite, [
      'High',
      'Increased',
    ]),

    hasCravings:
      data.cravings.length > 0 &&
      !contains(data.cravings, 'None'),

    // Activity
    activityLimited:
      data.usualActivityLimited === true,

    noExercise:
      data.exerciseActivities.length === 0 ||
      contains(data.exerciseActivities, 'None'),

    didExercise:
      data.exerciseActivities.length > 0 &&
      !contains(data.exerciseActivities, 'None'),

    // Stress / mental
    highStress: containsAny(data.stress, [
      'High',
      'Very high',
    ]),

    moderateStress: contains(data.stress, 'Moderate'),

    lowMood: containsAny(data.moods, [
      'Low',
      'Sad',
      'Lonely',
    ]),

    anxiousMood: containsAny(data.moods, [
      'Anxious',
    ]),

    stressedMood: containsAny(data.moods, [
      'Stressed',
    ]),

    irritableMood: containsAny(data.moods, [
      'Irritable',
      'Angry',
      'Frustrated',
    ]),

    overwhelmed:
      contains(data.moods, 'Overwhelmed') ||
      contains(data.mentalWellbeing, 'Overwhelmed'),

    anxiousWellbeing:
      contains(data.mentalWellbeing, 'Anxious'),

    stressedWellbeing:
      contains(data.mentalWellbeing, 'Stressed'),

    poorConcentration:
      data.concentration === 'Poor',

    okayConcentration:
      data.concentration === 'Okay',

    // Period
    periodActive:
      data.periodStatus === 'period' ||
      data.periodStarted === true,

    spotting:
      data.bleeding === 'Spotting' ||
      data.periodStatus === 'spotting' ||
      contains(data.symptoms, 'Spotting'),

    heavyBleeding:
      containsAny(data.bleeding, [
        'Heavy',
        'Very heavy',
      ]) ||
      data.flowChange === 'Heavier than usual' ||
      contains(data.symptoms, 'Heavy bleeding'),

    lightBleeding:
      data.bleeding === 'Light' ||
      data.flowChange === 'Lighter than usual' ||
      contains(data.symptoms, 'Light bleeding'),

    clots:
      contains(data.symptoms, 'Clots'),

    unusualDischarge:
      contains(data.symptoms, 'Unusual discharge'),

    increasedDischarge:
      contains(data.symptoms, 'Increased discharge'),

    dryness:
      contains(data.symptoms, 'Vaginal dryness'),

    // Products / relief
    usesProduct:
      data.productOptions.length > 0,

    usedHeat:
      contains(data.relief, 'Heat'),

    usedRest:
      contains(data.relief, 'Rest'),

    usedStretching:
      contains(data.relief, 'Stretching'),

    usedMedication:
      contains(data.relief, 'Medication'),

    hasRelief:
      data.relief.length > 0 &&
      !contains(data.relief, 'None'),

    hasNote:
      data.notes.length > 0,
  }

  return {
    data,
    signals,
  }
}


/*
|--------------------------------------------------------------------------
| NUTRITION
|--------------------------------------------------------------------------
*/

function getNutrition(input) {
  const { data, signals } = detectSignals(input)

  const insights = []
  const actions = []

  if (signals.lowHydration) {
    insights.push(
      `You logged ${data.waterLiters} L of water today, which is lower than 1.5 L.`,
    )

    actions.push(
      'Keep fluids available and drink regularly throughout the day.',
    )
  }

  if (signals.heavyBleeding) {
    insights.push(
      'You reported heavier bleeding today.',
    )

    actions.push(
      'Include iron-rich foods such as lentils, beans, leafy greens, eggs, or meat where appropriate.',
    )
  }

  if (signals.ateLess || signals.lowAppetite) {
    insights.push(
      'You reported eating less than usual or having a lower appetite.',
    )

    actions.push(
      'Consider smaller, balanced meals or snacks rather than skipping food completely.',
    )
  }

  if (signals.skippedMeal) {
    insights.push(
      'You reported skipping a meal today.',
    )

    actions.push(
      'Try to keep your meals regular when possible.',
    )
  }

  if (signals.highAppetite) {
    insights.push(
      'You reported a higher appetite than usual.',
    )

    actions.push(
      'Choose satisfying meals with protein, fiber, and carbohydrates.',
    )
  }

  if (signals.hasCravings) {
    insights.push(
      `You logged cravings for ${data.cravings.join(', ').toLowerCase()}.`,
    )

    actions.push(
      'You do not need to ignore cravings; try pairing foods you enjoy with a balanced meal or snack.',
    )
  }

  if (signals.fatigue || signals.belowAverageEnergy) {
    insights.push(
      'Your energy is lower today.',
    )

    actions.push(
      'Include regular meals with protein and carbohydrates to support your energy.',
    )
  }

  if (signals.digestiveSymptoms) {
    insights.push(
      'You reported digestive symptoms today.',
    )

    actions.push(
      'Notice whether particular foods or meal patterns appear alongside these symptoms.',
    )
  }

  if (signals.dizziness) {
    insights.push(
      'You reported dizziness today.',
    )

    actions.push(
      'Keep track of when the dizziness occurs and whether it repeats.',
    )
  }

  if (signals.balancedMeal) {
    insights.push(
      'You logged a balanced meal today.',
    )
  }

  if (signals.ateMore) {
    insights.push(
      'You reported eating more than usual today.',
    )
  }

  if (signals.heavyMeals) {
    insights.push(
      'You reported having a heavier meal today.',
    )
  }

  if (signals.lightMeals) {
    insights.push(
      'You reported lighter meals today.',
    )
  }

  return {
    key: 'nutrition',
    summary:
      insights.length > 0
        ? 'Saathi’s nutrition guidance considers your recent meals, hydration, appetite, cravings, and energy levels.'
        : DEFAULTS.nutrition.summary,

    insights: unique(insights).slice(0, 6),

    actions: unique(actions).slice(0, 6),
  }
}


/*
|--------------------------------------------------------------------------
| MOVEMENT
|--------------------------------------------------------------------------
*/

function getExercise(input) {
  const { data, signals } = detectSignals(input)

  const insights = []
  const actions = []

  if (signals.highPain) {
    insights.push(
      `Your reported pain is ${data.pain}/10.`,
    )

    actions.push(
      'Consider gentle movement or rest instead of intense exercise.',
    )
  }

  if (signals.moderatePain) {
    insights.push(
      `You reported moderate pain at ${data.pain}/10.`,
    )

    actions.push(
      'Adjust exercise intensity according to how comfortable you feel.',
    )
  }

  if (signals.veryLowEnergy) {
    insights.push(
      'Your energy is currently low.',
    )

    actions.push(
      'Keep movement gentle and allow yourself enough recovery time.',
    )
  }

  if (signals.activityLimited) {
    insights.push(
      'You reported that your usual activity is limited today.',
    )

    actions.push(
      'Do not force your usual activity level when your body is telling you to slow down.',
    )
  }

  if (signals.highEnergy) {
    insights.push(
      `Your energy is ${data.energy.toLowerCase()} today.`,
    )

    actions.push(
      'If you feel comfortable, you can continue your usual movement or exercise routine.',
    )
  }

  if (signals.didExercise) {
    insights.push(
      `You logged ${data.exerciseActivities.join(', ').toLowerCase()} today.`,
    )

    if (has(data.exerciseIntensity)) {
      insights.push(
        `Your reported exercise intensity was ${data.exerciseIntensity.toLowerCase()}.`,
      )
    }

    if (data.exerciseMinutes !== null) {
      insights.push(
        `You logged ${data.exerciseMinutes} minutes of exercise.`,
      )
    }

    actions.push(
      'Continue choosing movement that feels appropriate for your current energy and symptoms.',
    )
  }

  if (signals.noExercise) {
    insights.push(
      'You did not log an exercise activity today.',
    )
  }

  if (signals.shortSleep) {
    insights.push(
      'Your sleep was shorter than 6 hours.',
    )

    actions.push(
      'Prioritize recovery before increasing exercise intensity.',
    )
  }

  if (signals.cramps || signals.backPain || signals.pelvicPain) {
    insights.push(
      'You reported discomfort that may make some activities less comfortable today.',
    )

    actions.push(
      'Gentle stretching or walking may be preferable if they feel comfortable.',
    )
  }

  return {
    key: 'exercise',
    summary:
      insights.length > 0
        ? 'Saathi’s pain guidance considers your pain intensity, symptoms, affected areas, and the relief methods you track.'
        : DEFAULTS.exercise.summary,

    insights: unique(insights).slice(0, 6),

    actions: unique(actions).slice(0, 6),
  }
}


/*
|--------------------------------------------------------------------------
| PAIN MANAGEMENT
|--------------------------------------------------------------------------
*/

function getPainManagement(input) {
  const { data, signals } = detectSignals(input)

  const insights = []
  const actions = []

  if (signals.highPain) {
    insights.push(
      `Your reported pain is ${data.pain}/10, which is high.`,
    )

    actions.push(
      'Continue tracking the pain level, location, type, symptoms, and relief methods.',
    )
  } else if (signals.moderatePain) {
    insights.push(
      `Your reported pain is ${data.pain}/10.`,
    )

    actions.push(
      'Keep recording what helps and how your discomfort changes during the day.',
    )
  } else if (signals.anyPain) {
    insights.push(
      `You reported pain at ${data.pain}/10.`,
    )
  } else {
    insights.push(
      'You did not report significant pain today.',
    )
  }

  if (data.painLocations.length > 0) {
    insights.push(
      `Pain location: ${data.painLocations.join(', ').toLowerCase()}.`,
    )
  }

  if (data.painTypes.length > 0) {
    insights.push(
      `Pain type: ${data.painTypes.join(', ').toLowerCase()}.`,
    )
  }

  if (signals.cramps) {
    insights.push(
      'You reported cramping.',
    )

    actions.push(
      'If heat or gentle movement has helped you before, you can continue tracking how helpful it feels.',
    )
  }

  if (signals.headache) {
    insights.push(
      'You reported a headache or migraine.',
    )

    actions.push(
      'Keep tracking when the symptom occurs and whether it appears alongside changes in sleep, hydration, or your cycle.',
    )
  }

  if (signals.digestiveSymptoms) {
    insights.push(
      'You reported digestive symptoms.',
    )

    actions.push(
      'Track whether these symptoms tend to appear alongside particular cycle days or meals.',
    )
  }

  if (signals.usedHeat) {
    insights.push(
      'You logged heat as a relief method.',
    )
  }

  if (signals.usedRest) {
    insights.push(
      'You logged rest as a relief method.',
    )
  }

  if (signals.usedStretching) {
    insights.push(
      'You logged stretching as a relief method.',
    )
  }

  if (signals.usedMedication) {
    insights.push(
      'You logged medication as a relief method.',
    )
  }

  if (signals.hasRelief) {
    actions.push(
      'Continue recording which relief methods you use so your personal pattern becomes clearer over time.',
    )
  }

  return {
    key: 'painManagement',

    summary:
      insights.length > 0
        ? 'Saathi’s pain guidance considers your pain intensity, symptoms, affected areas, and the relief methods you track.'
        : DEFAULTS.painManagement.summary,

    insights: unique(insights).slice(0, 8),

    actions: unique(actions).slice(0, 6),
  }
}


/*
|--------------------------------------------------------------------------
| SELF CARE
|--------------------------------------------------------------------------
*/

function getSelfCare(input) {
  const { data, signals } = detectSignals(input)

  const insights = []
  const actions = []

  if (signals.shortSleep) {
    insights.push(
      `You logged ${data.sleep} hours of sleep.`,
    )

    actions.push(
      'Prioritize rest and recovery today where possible.',
    )
  } else if (signals.reducedSleep) {
    insights.push(
      `You logged ${data.sleep} hours of sleep.`,
    )
  }

  if (signals.poorSleep) {
    insights.push(
      'You reported sleep difficulties or poor sleep quality.',
    )

    actions.push(
      'Keep tracking what is affecting your sleep so Saathi can identify recurring patterns.',
    )
  }

  if (signals.veryLowEnergy) {
    insights.push(
      'Your energy is low today.',
    )

    actions.push(
      'Give yourself more room for rest and avoid pushing through exhaustion.',
    )
  }

  if (signals.lowHydration) {
    insights.push(
      `Your logged hydration is ${data.waterLiters} L.`,
    )

    actions.push(
      'Keep fluids available and drink regularly throughout the day.',
    )
  }

  if (signals.highStress) {
    insights.push(
      'Your stress level is high.',
    )

    actions.push(
      'Make some time for rest and activities that help you feel calmer.',
    )
  }

  if (signals.moderateStress) {
    insights.push(
      'You reported moderate stress today.',
    )
  }

  if (signals.highPain) {
    insights.push(
      'Your reported pain is high today.',
    )

    actions.push(
      'Allow yourself additional recovery time if pain is affecting your usual activities.',
    )
  }

  if (signals.fatigue) {
    insights.push(
      'You reported fatigue or weakness.',
    )

    actions.push(
      'Pay attention to whether fatigue continues across multiple days.',
    )
  }

  if (signals.digestiveSymptoms) {
    insights.push(
      'You reported digestive symptoms today.',
    )
  }

  if (signals.hasNote) {
    insights.push(
      'You added a personal note to today\'s check-in.',
    )

    actions.push(
      'Your notes can help Saathi understand context that structured check-ins may not capture.',
    )
  }

  return {
    key: 'selfCare',

    summary:
      insights.length > 0
        ? 'Saathi’s hygiene guidance considers your period status, bleeding, symptoms, and menstrual products.'
        : DEFAULTS.selfCare.summary,

    insights: unique(insights).slice(0, 8),

    actions: unique(actions).slice(0, 6),
  }
}


/*
|--------------------------------------------------------------------------
| MENSTRUAL HYGIENE
|--------------------------------------------------------------------------
*/

function getHygiene(input) {
  const { data, signals } = detectSignals(input)

  const insights = []
  const actions = []

  if (signals.periodActive) {
    insights.push(
      'Your period is marked as active today.',
    )

    actions.push(
      'Continue tracking your bleeding level and menstrual products during your period.',
    )
  }

  if (signals.heavyBleeding) {
    insights.push(
      `Your reported bleeding is ${data.bleeding || 'heavier than usual'}.`,
    )

    actions.push(
      'Keep tracking changes in flow and product use throughout the day.',
    )
  }

  if (signals.lightBleeding) {
    insights.push(
      'You reported lighter bleeding than usual.',
    )
  }

  if (signals.spotting) {
    insights.push(
      'You reported spotting.',
    )

    actions.push(
      'Continue tracking whether the spotting changes or develops into your usual period pattern.',
    )
  }

  if (signals.clots) {
    insights.push(
      'You reported clots today.',
    )

    actions.push(
      'Continue tracking when this occurs and how it compares with your usual experience.',
    )
  }

  if (signals.usesProduct) {
    insights.push(
      `You logged ${data.productOptions.join(', ').toLowerCase()} as products used.`,
    )

    actions.push(
      'Follow the care and usage instructions for the menstrual products you use.',
    )
  }

  if (signals.unusualDischarge) {
    insights.push(
      'You reported unusual discharge.',
    )

    actions.push(
      'Keep tracking the symptom and any changes over time.',
    )
  }

  if (signals.increasedDischarge) {
    insights.push(
      'You reported increased discharge.',
    )
  }

  if (signals.dryness) {
    insights.push(
      'You reported vaginal dryness.',
    )
  }

  if (!signals.periodActive && !signals.spotting) {
    insights.push(
      'You are not currently reporting active menstrual bleeding.',
    )
  }

  return {
    key: 'hygiene',

    summary:
      insights.length > 0
        ? 'Saathi’s hygiene guidance considers your period status, bleeding, symptoms, and menstrual products.'
        : DEFAULTS.hygiene.summary,

    insights: unique(insights).slice(0, 8),

    actions: unique(actions).slice(0, 6),
  }
}


/*
|--------------------------------------------------------------------------
| MENTAL WELLNESS
|--------------------------------------------------------------------------
*/

function getMentalWellness(input) {
  const { data, signals } = detectSignals(input)

  const insights = []
  const actions = []

  if (signals.lowMood) {
    insights.push(
      `You reported a lower mood today: ${data.moods.join(', ').toLowerCase()}.`,
    )

    actions.push(
      'Continue tracking mood, sleep, energy, stress, and personal notes so Saathi can identify whether this pattern repeats.',
    )
  }

  if (signals.anxiousMood || signals.anxiousWellbeing) {
    insights.push(
      'You reported anxiety today.',
    )

    actions.push(
      'Track when the feeling occurs and what other factors are present at the same time.',
    )
  }

  if (signals.stressedMood || signals.stressedWellbeing) {
    insights.push(
      'You reported feeling stressed today.',
    )

    actions.push(
      'Give yourself time for activities that help you slow down and recover.',
    )
  }

  if (signals.irritableMood) {
    insights.push(
      'You reported irritability or frustration today.',
    )

    actions.push(
      'Continue logging mood alongside sleep, energy, stress, and cycle information.',
    )
  }

  if (signals.overwhelmed) {
    insights.push(
      'You reported feeling overwhelmed.',
    )

    actions.push(
      'Consider reducing unnecessary demands and giving yourself time to recover.',
    )
  }

  if (signals.highStress) {
    insights.push(
      'Your stress level is high today.',
    )

    actions.push(
      'Track whether high stress tends to occur alongside changes in sleep, mood, or energy.',
    )
  }

  if (signals.poorConcentration) {
    insights.push(
      'You reported poor concentration today.',
    )

    actions.push(
      'Compare concentration with your sleep, stress, energy, and cycle information over time.',
    )
  }

  if (signals.okayConcentration) {
    insights.push(
      'You reported okay concentration today.',
    )
  }

  if (signals.shortSleep) {
    insights.push(
      'Your sleep was shorter than 6 hours.',
    )

    actions.push(
      'Keep tracking whether shorter sleep is followed by changes in mood, stress, or concentration.',
    )
  }

  if (signals.fatigue) {
    insights.push(
      'You reported fatigue or weakness.',
    )
  }

  if (data.mentalWellbeing.length > 0) {
    insights.push(
      `Mental wellbeing logged: ${data.mentalWellbeing.join(', ').toLowerCase()}.`,
    )
  }

  if (data.notes) {
    actions.push(
      'Your personal note can provide additional context about how you are feeling today.',
    )
  }

  return {
    key: 'mentalWellness',

    summary:
      insights.length > 0
        ? 'Saathi’s mental wellness guidance considers your mood, stress, sleep, energy, concentration, and overall wellbeing.'
        : DEFAULTS.mentalWellness.summary,

    insights: unique(insights).slice(0, 8),

    actions: unique(actions).slice(0, 6),
  }
}


/*
|--------------------------------------------------------------------------
| CATEGORY GENERATOR
|--------------------------------------------------------------------------
*/

export function generatePersonalizedRecommendations(input = {}) {
  const data = normalizeHealthData(input)

  return {
    nutrition: getNutrition(data),
    exercise: getExercise(data),
    painManagement: getPainManagement(data),
    selfCare: getSelfCare(data),
    hygiene: getHygiene(data),
    mentalWellness: getMentalWellness(data),
  }
}


/*
|--------------------------------------------------------------------------
| FLATTENED VERSION
|--------------------------------------------------------------------------
|
| Use this if your current RecommendationCard only accepts:
|
|   tip
|
| It converts the multiple insights/actions into one readable string.
|
|--------------------------------------------------------------------------
*/

export function generateRecommendationTips(input = {}) {
  const recommendations =
    generatePersonalizedRecommendations(input)

  const result = {}

  for (const [key, recommendation] of Object.entries(
    recommendations,
  )) {
    const parts = []

    if (recommendation.summary) {
      parts.push(recommendation.summary)
    }

    if (recommendation.insights.length > 0) {
      parts.push(
        recommendation.insights
          .map((item) => `• ${item}`)
          .join('\n'),
      )
    }

    if (recommendation.actions.length > 0) {
      parts.push(
        recommendation.actions
          .map((item) => `• ${item}`)
          .join('\n'),
      )
    }

    result[key] = parts.join('\n\n')
  }

  return result
}


/*
|--------------------------------------------------------------------------
| SINGLE CATEGORY HELPER
|--------------------------------------------------------------------------
|
| Useful when opening the large modal.
|--------------------------------------------------------------------------
*/

export function getCategoryRecommendation(
  category,
  input = {},
) {
  const recommendations =
    generatePersonalizedRecommendations(input)

  return (
    recommendations[category] ||
    DEFAULTS[category] ||
    {
      summary: '',
      insights: [],
      actions: [],
    }
  )
}


/*
|--------------------------------------------------------------------------
| PATTERN SUMMARY
|--------------------------------------------------------------------------
|
| This is useful later when you want the AI to explain WHY a
| recommendation was generated.
|--------------------------------------------------------------------------
*/

export function getRecommendationContext(input = {}) {
  const { data, signals } = detectSignals(input)

  const context = []

  if (signals.highPain) {
    context.push(`Pain is high at ${data.pain}/10.`)
  } else if (signals.moderatePain) {
    context.push(`Pain is moderate at ${data.pain}/10.`)
  } else if (signals.anyPain) {
    context.push(`Pain reported at ${data.pain}/10.`)
  }

  if (signals.cramps) {
    context.push('Cramps reported.')
  }

  if (signals.headache) {
    context.push('Headache or migraine reported.')
  }

  if (signals.digestiveSymptoms) {
    context.push('Digestive symptoms reported.')
  }

  if (signals.fatigue) {
    context.push('Fatigue or weakness reported.')
  }

  if (signals.belowAverageEnergy) {
    context.push(
      `Energy is ${data.energy.toLowerCase()}.`,
    )
  }

  if (signals.shortSleep) {
    context.push(
      `Sleep was ${data.sleep} hours.`,
    )
  }

  if (signals.poorSleep) {
    context.push('Poor sleep or sleep difficulties reported.')
  }

  if (signals.lowHydration) {
    context.push(
      `Hydration logged at ${data.waterLiters} L.`,
    )
  }

  if (signals.skippedMeal) {
    context.push('A meal was skipped.')
  }

  if (signals.ateLess) {
    context.push('Eating less than usual reported.')
  }

  if (signals.hasCravings) {
    context.push(
      `Cravings reported: ${data.cravings.join(', ')}.`,
    )
  }

  if (signals.highStress) {
    context.push('High stress reported.')
  }

  if (signals.lowMood) {
    context.push(
      `Lower mood reported: ${data.moods.join(', ')}.`,
    )
  }

  if (signals.anxiousMood || signals.anxiousWellbeing) {
    context.push('Anxiety reported.')
  }

  if (signals.poorConcentration) {
    context.push('Poor concentration reported.')
  }

  if (signals.periodActive) {
    context.push('Period currently marked as active.')
  }

  if (signals.heavyBleeding) {
    context.push('Heavy or heavier-than-usual bleeding reported.')
  }

  if (signals.spotting) {
    context.push('Spotting reported.')
  }

  if (signals.clots) {
    context.push('Clots reported.')
  }

  if (signals.usesProduct) {
    context.push(
      `Products used: ${data.productOptions.join(', ')}.`,
    )
  }

  if (signals.hasRelief) {
    context.push(
      `Relief methods used: ${data.relief.join(', ')}.`,
    )
  }

  if (signals.hasNote) {
    context.push('A personal note was added.')
  }

  return unique(context)
}


/*
|--------------------------------------------------------------------------
| DEFAULT EXPORT
|--------------------------------------------------------------------------
*/

export default generatePersonalizedRecommendations