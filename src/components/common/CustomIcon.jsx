function CustomIcon({ type }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: '0 0 32 32',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
  }

  const stroke = 'currentColor'

  // =========================================================
  // PRODUCT ADVISOR
  // =========================================================

  // Sanitary Pads
  if (type === 'sanitary-pad') {
    return (
      <svg {...common}>
        <path
          d="M11 4.5C9.5 4.5 8.5 5.8 8.9 7.2L12.4 25.2C12.7 26.6 14 27.5 15.4 27.5H16.6C18 27.5 19.3 26.6 19.6 25.2L23.1 7.2C23.5 5.8 22.5 4.5 21 4.5H11Z"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />

        <path
          d="M10 11L6.5 14.5L9.5 18"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M22 11L25.5 14.5L22.5 18"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M13 10.5C15 12 17 12 19 10.5"
          stroke={stroke}
          strokeWidth="1.3"
          strokeLinecap="round"
        />

        <path
          d="M13.5 20.5C15 19.5 17 19.5 18.5 20.5"
          stroke={stroke}
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  // Tampon
  if (type === 'tampon') {
    return (
      <svg {...common}>
        <path
          d="M12 5.5C12 4.4 12.9 3.5 14 3.5H18C19.1 3.5 20 4.4 20 5.5L18.2 15H13.8L12 5.5Z"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />

        <path
          d="M13.8 15H18.2"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M16 15C16 18.5 13.2 19.5 12.5 22C11.8 24.5 13.7 26.5 16 26.5C18.2 26.5 19.5 24.7 18.5 23"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  // Menstrual Cup
  if (type === 'menstrual-cup') {
    return (
      <svg {...common}>
        <path
          d="M7 7.5C7 6.4 8 5.5 9.2 5.5H22.8C24 5.5 25 6.4 25 7.5"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M7 7.5C7.5 14.5 9 20.5 12 23.5C13.1 24.6 14.3 25 16 25C17.7 25 18.9 24.6 20 23.5C23 20.5 24.5 14.5 25 7.5"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />

        <path
          d="M16 25V28"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M14.5 28H17.5"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  // Period Underwear
  if (type === 'period-underwear') {
    return (
      <svg {...common}>
        <path
          d="M5 8L11 10L16 12L21 10L27 8L26 18C25.8 20.2 24.5 21.5 22.3 22L18.5 23L16 26L13.5 23L9.7 22C7.5 21.5 6.2 20.2 6 18L5 8Z"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />

        <path
          d="M11 10L12 17"
          stroke={stroke}
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        <path
          d="M21 10L20 17"
          stroke={stroke}
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        <path
          d="M12.5 17C14.5 18 17.5 18 19.5 17"
          stroke={stroke}
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  // =========================================================
  // EDUCATION CENTER
  // =========================================================

  // About Periods
  if (type === 'periods') {
    return (
      <svg {...common}>
        <path
          d="M16 4C13 8 9 11.5 9 17C9 22 12 26 16 26C20 26 23 22 23 17C23 11.5 19 8 16 4Z"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />

        <path
          d="M12.5 19C13 21.5 14.5 23 16 23"
          stroke={stroke}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  // Four Cycle Phases
  if (type === 'cycle-phases') {
    return (
      <svg {...common}>
        <circle
          cx="16"
          cy="16"
          r="10.5"
          stroke={stroke}
          strokeWidth="1.7"
        />

        <path
          d="M16 5.5V10"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M26.5 16H22"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M16 26.5V22"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M5.5 16H10"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <circle
          cx="16"
          cy="16"
          r="2"
          fill={stroke}
        />
      </svg>
    )
  }

  // Understanding Hormones
  if (type === 'hormones') {
    return (
      <svg {...common}>
        <circle
          cx="16"
          cy="16"
          r="3"
          stroke={stroke}
          strokeWidth="1.6"
        />

        <circle
          cx="8"
          cy="10"
          r="2.5"
          stroke={stroke}
          strokeWidth="1.5"
        />

        <circle
          cx="24"
          cy="10"
          r="2.5"
          stroke={stroke}
          strokeWidth="1.5"
        />

        <circle
          cx="8"
          cy="22"
          r="2.5"
          stroke={stroke}
          strokeWidth="1.5"
        />

        <circle
          cx="24"
          cy="22"
          r="2.5"
          stroke={stroke}
          strokeWidth="1.5"
        />

        <path
          d="M10 11.5L13.5 14"
          stroke={stroke}
          strokeWidth="1.4"
        />

        <path
          d="M22 11.5L18.5 14"
          stroke={stroke}
          strokeWidth="1.4"
        />

        <path
          d="M10 20.5L13.5 18"
          stroke={stroke}
          strokeWidth="1.4"
        />

        <path
          d="M22 20.5L18.5 18"
          stroke={stroke}
          strokeWidth="1.4"
        />
      </svg>
    )
  }

  // Symptoms Guide
  if (type === 'symptoms') {
    return (
      <svg {...common}>
        <circle
          cx="16"
          cy="9"
          r="3"
          stroke={stroke}
          strokeWidth="1.6"
        />

        <path
          d="M10 27C10.5 21 12 17 16 17C20 17 21.5 21 22 27"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M9 16L6 19L9 22"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle
          cx="24"
          cy="19"
          r="2"
          stroke={stroke}
          strokeWidth="1.5"
        />
      </svg>
    )
  }

  // Mental Wellness
  if (type === 'mental-wellness') {
    return (
      <svg {...common}>
        <path
          d="M16 27C13 24 8 21 8 15C8 11.5 10.5 9 13.5 9C14.7 9 15.5 9.5 16 10.5C16.5 9.5 17.3 9 18.5 9C21.5 9 24 11.5 24 15C24 21 19 24 16 27Z"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />

        <path
          d="M12 16H14L15 13L17 19L18 16H20"
          stroke={stroke}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  // Myths vs Facts
  if (type === 'myths-facts') {
    return (
      <svg {...common}>
        <path
          d="M7 6.5H25V25.5H7V6.5Z"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />

        <path
          d="M11 11H21"
          stroke={stroke}
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        <path
          d="M11 15H16"
          stroke={stroke}
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        <path
          d="M18 19L20 21L23 17.5"
          stroke={stroke}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  // Menstrual Hygiene
  if (type === 'menstrual-hygiene') {
    return (
      <svg {...common}>
        <path
          d="M16 4L25 7.5V15C25 21 21 25 16 28C11 25 7 21 7 15V7.5L16 4Z"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />

        <path
          d="M12.5 15.5L15 18L20 12.5"
          stroke={stroke}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  // Understanding Your Patterns
  if (type === 'patterns') {
    return (
      <svg {...common}>
        <path
          d="M6 25L12 18L16 21L25.5 9"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M20 9H25.5V14.5"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M6 27H26"
          stroke={stroke}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  // Self-Care & Wellbeing
  if (type === 'self-care-wellbeing') {
    return (
      <svg {...common}>
        <path
          d="M16 27C13 23 9 21 9 16C9 12.5 11.5 10 14.5 10C15.2 10 15.7 10.2 16 10.5C16.3 10.2 16.8 10 17.5 10C20.5 10 23 12.5 23 16C23 21 19 23 16 27Z"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />

        <path
          d="M16 10C15 7.5 16 5.5 18.5 4"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <path
          d="M18.5 4C21 4.5 22.5 6 22.5 8"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  // =========================================================
  // WELLNESS
  // =========================================================

  // Nutrition
  if (type === 'nutrition') {
    return (
      <svg {...common}>
        <path
          d="M7 15C7 21 10.5 25 16 25C21.5 25 25 21 25 15"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M7 15H25"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M16 15C15 11 17 8 21 7"
          stroke={stroke}
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        <path
          d="M21 7C21 10 19 12 16 12"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  // Movement
  if (type === 'movement') {
    return (
      <svg {...common}>
        <circle
          cx="16"
          cy="7"
          r="2.5"
          stroke={stroke}
          strokeWidth="1.6"
        />

        <path
          d="M16 10L13 16L8 14"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M13 16L18 19L21 25"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M13 16L11 24"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M8 14L5 11"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  // Pain Management
  if (type === 'pain-management') {
    return (
      <svg {...common}>
        <circle
          cx="16"
          cy="16"
          r="10"
          stroke={stroke}
          strokeWidth="1.7"
        />

        <path
          d="M16 9L13.5 16H17L14.5 23L19 15.5H15.8L18 9H16Z"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  // Self-Care
  if (type === 'self-care') {
    return (
      <svg {...common}>
        <path
          d="M16 25C12 21.5 9 19 9 15C9 12.2 11 10 13.5 10C14.8 10 15.6 10.7 16 11.5C16.4 10.7 17.2 10 18.5 10C21 10 23 12.2 23 15C23 19 20 21.5 16 25Z"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />

        <path
          d="M23 6V10"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <path
          d="M21 8H25"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  // Wellness Menstrual Hygiene
  if (type === 'wellness-hygiene') {
    return (
      <svg {...common}>
        <path
          d="M16 4L24 7V14.5C24 20 20.5 24 16 27C11.5 24 8 20 8 14.5V7L16 4Z"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />

        <path
          d="M12.5 15.5L15 18L19.5 13"
          stroke={stroke}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  // Wellness Mental Wellness
  if (type === 'wellness-mental') {
    return (
      <svg {...common}>
        <path
          d="M16 27C13 24 8 21 8 15C8 11.5 10.5 9 13.5 9C14.7 9 15.5 9.5 16 10.5C16.5 9.5 17.3 9 18.5 9C21.5 9 24 11.5 24 15C24 21 19 24 16 27Z"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />

        <path
          d="M12 16H14L15 13L17 19L18 16H20"
          stroke={stroke}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return null
}

export default CustomIcon