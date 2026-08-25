# 🌸 Saathi

<p align="center">
  <img src="src/images/saathi-hero.png" alt="Saathi" width="720">
</p>

<p align="center">
  <strong>A personal menstrual health and wellness companion built to help users understand their cycle, track their wellbeing, and make sense of their health data.</strong>
</p>

<p align="center">
  <em>Track. Understand. Reflect. Take care.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Firebase-12-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase">
  <img src="https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google" alt="Gemini">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

---

## 🌷 What is Saathi?

**Saathi** is a personal menstrual health and wellness platform designed around one idea:

> **Health tracking should help you understand yourself, not just record numbers.**

Saathi combines cycle tracking with daily wellbeing logs, symptom analysis, health reports, AI-powered insights, educational content, wellness recommendations, and optional connection with a trusted supporter.

Instead of treating menstrual health as a single calendar problem, Saathi looks at the **broader picture**:

```text
                 ┌────────────────────┐
                 │   Menstrual Cycle  │
                 └─────────┬──────────┘
                           │
          ┌────────────────┼────────────────┐
          ↓                ↓                ↓
      Symptoms           Mood             Pain
          │                │                │
          └────────────────┼────────────────┘
                           ↓
                 ┌────────────────────┐
                 │ Daily Health Logs  │
                 └─────────┬──────────┘
                           ↓
                 ┌────────────────────┐
                 │ Pattern Analysis   │
                 └─────────┬──────────┘
                           ↓
              ┌────────────┴────────────┐
              ↓                         ↓
        Personal Reports           AI Insights
              │                         │
              └────────────┬────────────┘
                           ↓
                  Better Understanding
```

---

# ✨ What Saathi Can Do

## 🩸 Cycle Tracking

Saathi tracks the menstrual cycle and represents it through four major phases:

* **Menstrual**
* **Follicular**
* **Ovulation**
* **Luteal**

The application calculates cycle days and phase information from the user's cycle setup and history.

The calendar isn't simply a date picker.

It becomes a visual representation of where the user is within their cycle.

---

## 📅 Interactive Cycle Calendar

The cycle calendar provides a day-by-day view of the user's cycle.

Users can:

* Navigate through dates
* View cycle phases
* Inspect logged health information
* View selected-day details
* Understand where a day falls within the cycle

The calendar also handles cycles crossing month boundaries.

---

# 📝 Daily Health Tracking

Saathi allows users to record daily health information rather than relying only on period dates.

Tracked information includes areas such as:

### Physical

* Pain
* Bleeding
* Symptoms
* Energy
* Sleep
* Hydration
* Physical wellbeing

### Emotional

* Mood
* Mental wellbeing
* Stress
* Concentration
* Emotional symptoms

This produces a much richer health history than a simple period calendar.

---

# 📊 Personal Health Reports

Saathi turns accumulated health logs into monthly reports.

The report engine calculates metrics such as:

| Metric         | Purpose                          |
| -------------- | -------------------------------- |
| Cycle Day      | Current position in cycle        |
| Cycle Length   | Typical cycle duration           |
| Period Length  | Period duration                  |
| Logged Days    | Tracking consistency             |
| Average Pain   | Pain trend                       |
| Common Symptom | Most frequently recorded symptom |

---

## 📈 Cycle Analysis

Saathi analyzes cycle history rather than making conclusions from a single cycle.

For example, with enough historical data it can calculate:

```text
Minimum cycle length
        ↓
Maximum cycle length
        ↓
Average cycle length
        ↓
Historical trend
```

The application deliberately requires multiple cycles before describing a cycle range as reliable.

---

## 🔎 Symptom Analysis

Symptoms are classified into categories including:

### Pain

* Cramps
* Headache
* Migraine
* Backache
* Pelvic pain
* Breast pain
* Muscle aches
* Joint pain
* Stomach pain

### Physical

* Bloating
* Fatigue
* Weakness
* Nausea
* Dizziness
* Acne
* Constipation
* Diarrhea
* Hot flashes
* Chills
* Bleeding-related symptoms

### Mood

* Mood swings
* Irritability
* Anxiety
* Low mood
* Stress
* Restlessness
* Emotional sensitivity
* Brain fog
* Overwhelm
* Sadness

The report system can calculate symptom frequency and percentage across logged days.

---

# 🤖 AI Insights

Saathi includes an AI insight system designed to interpret the user's logged information.

The AI layer can work with information such as:

```text
Cycle information
       +
Health logs
       +
Symptoms
       +
Mood
       +
Pain
       +
Wellness information
       ↓
AI Context
       ↓
Personalized Insight
```

The application uses **Google Gemini** through its server/API layer.

AI functionality is separated from the main React interface instead of embedding API credentials directly into client-side components.

---

## 🧠 AI + Deterministic Analysis

One of the design decisions in Saathi is that not everything is handed to an LLM.

Some calculations are deterministic:

* Cycle phase calculation
* Monthly statistics
* Symptom classification
* Symptom frequency
* Cycle-length statistics
* Report generation logic

AI is then used where interpretation and conversational guidance are more appropriate.

```text
Structured Data
      │
      ├── Deterministic Analysis
      │       ↓
      │   Reliable Metrics
      │
      └── AI Interpretation
              ↓
         Human-Friendly Insights
```

This keeps numerical analysis predictable while using AI where it adds value.

---

# 🌿 Health & Wellness

Saathi includes a dedicated wellness section with recommendations and activities.

The project contains visual guidance for activities such as:

* Walking
* Cycling
* Swimming
* Strength exercises
* Hamstring stretches
* Hip-flexor stretches
* Lower-back exercises
* Neck and shoulder exercises
* Child's pose
* Cat-cow
* Legs-up-the-wall
* Butterfly pose

The goal is to connect cycle awareness with everyday wellbeing rather than isolating menstrual tracking from the rest of the user's health.

---

# 🛍️ Product Advisor

Saathi includes a product-advisor experience for health and menstrual-care products.

The recommendation engine evaluates available product information and generates recommendations based on the user's selected context.

This functionality is separated into its own recommendation engine rather than being embedded directly into page components.

---

# 👥 Supporter Mode

One of Saathi's more distinctive features is its **supporter system**.

A user can establish a connection with a trusted supporter and selectively share relevant information.

The architecture separates:

```text
                  USER
                   │
                   ↓
             Private Health Data
                   │
                   │ Sanitized projection
                   ↓
             Shared Data
                   │
                   ↓
               SUPPORTER
```

The supporter does **not** automatically receive unrestricted access to the user's health collection.

Instead, Saathi uses a dedicated shared projection.

---

## 🔐 Firestore Security Model

The Firestore rules enforce ownership and access boundaries.

Users can access their own:

```text
users/{uid}/cycles
users/{uid}/healthEntries
users/{uid}/aiReports
```

Connections are managed separately:

```text
connections/{connectionId}
```

Shared information is exposed through:

```text
connections/{connectionId}/shared/{documentId}
```

Only an active owner/supporter relationship can read the shared projection.

This is one of the more important architectural aspects of Saathi because **private health data and supporter-facing data are intentionally separated**.

---

# 🧩 Application Architecture

```text
                         ┌──────────────────┐
                         │      React       │
                         │   Application    │
                         └────────┬─────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ↓                   ↓                   ↓
        Cycle Tracking      Health Tracking       Wellness
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  ↓
                         ┌──────────────────┐
                         │ Analysis Engine  │
                         └────────┬─────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ↓                           ↓
             Report Analysis               AI Layer
                    │                           │
                    │                     Gemini API
                    │                           │
                    └─────────────┬─────────────┘
                                  ↓
                         Personalized Output
```

---

# 🛠️ Tech Stack

| Layer          | Technology              |
| -------------- | ----------------------- |
| Frontend       | React 19                |
| Language       | JavaScript / JSX        |
| Build Tool     | Vite                    |
| Styling        | Tailwind CSS            |
| Backend        | Firebase / Server API   |
| Database       | Cloud Firestore         |
| Authentication | Firebase Authentication |
| AI             | Google Gemini           |
| Charts         | Recharts                |
| Icons          | Lucide React            |
| Routing        | React Router            |
| State          | React Context           |
| Deployment     | Vercel / Firebase       |

---

# 📁 Project Structure

```text
Saathi/
│
├── api/
│   └── ai/
│       └── chat.js
│
├── server/
│   ├── aiServerMiddleware.js
│   └── geminiService.js
│
├── public/
│   ├── og-image.png
│   └── wellness/
│       ├── butterfly.png
│       ├── cat-cow.png
│       ├── child-pose.png
│       ├── cycling.png
│       ├── hamstring.png
│       ├── hip-flexor.png
│       ├── legs-wall.png
│       ├── lower-back.png
│       ├── neck-shoulder.png
│       ├── strength.png
│       ├── swimming.png
│       └── walking.png
│
├── src/
│   │
│   ├── components/
│   │   ├── calendar/
│   │   ├── charts/
│   │   ├── common/
│   │   └── reports/
│   │
│   ├── context/
│   │   ├── AppContext.jsx
│   │   └── AuthContext.jsx
│   │
│   ├── data/
│   │   ├── aiFallbacks.js
│   │   ├── api.js
│   │   └── mockData.js
│   │
│   ├── images/
│   │   ├── Follicular.png
│   │   ├── Luteal.png
│   │   ├── Menstural.png
│   │   ├── Ovulation.png
│   │   ├── saathi-girl.png
│   │   └── saathi-hero.png
│   │
│   ├── layouts/
│   │   ├── DashboardLayout.jsx
│   │   └── SupporterLayout.jsx
│   │
│   ├── pages/
│   │   ├── AIInsights.jsx
│   │   ├── CycleTracker.jsx
│   │   ├── DailyHealthTracker.jsx
│   │   ├── EducationCenter.jsx
│   │   ├── HealthWellness.jsx
│   │   ├── ProductAdvisor.jsx
│   │   ├── ReportsHistory.jsx
│   │   ├── UserDashboard.jsx
│   │   │
│   │   └── Supporter/
│   │       ├── SupporterDashboard.jsx
│   │       ├── SupporterAIInsights.jsx
│   │       ├── SupporterEducation.jsx
│   │       ├── SupporterGuidance.jsx
│   │       ├── SupporterProductAdvisor.jsx
│   │       └── SupporterWellness.jsx
│   │
│   ├── services/
│   │   └── geminiService.js
│   │
│   ├── utils/
│   │   ├── recommendationEngine.js
│   │   └── reportAnalysis.js
│   │
│   ├── lib/
│   │   └── firebase.js
│   │
│   ├── router/
│   │   └── ProtectedRoute.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

You need:

* Node.js
* npm
* A Firebase project
* Firebase Authentication
* Cloud Firestore
* Google Gemini API access for AI features

---

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Saathi
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file using the required Firebase and Gemini configuration.

**Never commit `.env` to a public repository.**

A typical configuration contains values for:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Server-side AI credentials should remain on the server/API side and should **not** be exposed through `VITE_*` variables.

---

## 4. Configure Firebase

Enable the required Firebase services:

* Authentication
* Cloud Firestore

Deploy Firestore rules when appropriate:

```bash
firebase deploy --only firestore:rules
```

---

## 5. Start Development Server

```bash
npm run dev
```

Vite will provide the local development URL.

---

# 🔄 Typical User Journey

```text
                    LANDING PAGE
                         │
                         ↓
                   CREATE ACCOUNT
                         │
                         ↓
                   USER SETUP
                         │
                         ↓
                  PERSONAL DASHBOARD
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
   Cycle Tracker    Daily Health     AI Insights
        │                │                │
        └────────────────┼────────────────┘
                         ↓
                   Monthly Reports
                         │
                         ↓
                Wellness & Education
                         │
                         ↓
                  Product Advisor
                         │
                         ↓
                Optional Supporter
```

---

# 📊 Data → Insight Pipeline

Saathi's central concept is turning raw tracking into something useful.

```text
                    USER INPUT
                        │
                        ↓
                Health & Cycle Logs
                        │
                        ↓
              ┌─────────────────────┐
              │ Deterministic       │
              │ Analysis Engine     │
              └──────────┬──────────┘
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
      Cycle Data     Symptoms          Mood
          │              │              │
          └──────────────┼──────────────┘
                         ↓
                  Monthly Report
                         │
                         ↓
                 AI Context Builder
                         │
                         ↓
                    Gemini AI
                         │
                         ↓
               Personalized Insight
```

---

# 🎨 Design Direction

Saathi intentionally uses a softer visual language than a conventional medical dashboard.

The design focuses on:

* Organic shapes
* Soft colors
* Clear information hierarchy
* Calm visual density
* Cycle-phase illustrations
* Friendly cards
* Accessible interactions
* Responsive layouts

The goal is to make health data feel **approachable rather than clinical**.

---

# 🧠 Why Saathi?

Most cycle-tracking applications focus heavily on:

> **"When is my next period?"**

Saathi tries to ask a broader question:

> **"What can I learn about how I feel throughout my cycle?"**

That changes the product from a simple prediction calendar into a **personal health reflection tool**.

The system connects:

**Cycle → Symptoms → Mood → Daily Health → Patterns → Insights**

---

# 🔐 Privacy & Security

Saathi handles personal health information, so the application is designed with access boundaries at the Firestore level.

The security model includes:

* Authenticated user access
* Per-user health collections
* Owner/supporter relationship validation
* Restricted connection access
* Sanitized shared projections
* No unrestricted user collection listing

Firestore rules enforce these boundaries instead of relying solely on frontend checks.

> Frontend route protection is not considered a security boundary. Firestore rules are used as the actual data-access control layer.

---

# ⚠️ Current Limitations

Saathi is a project implementation and should not be treated as a medical diagnostic system.

Current technical/product limitations include:

* Some health analysis is based on user-entered information.
* Cycle-phase calculations use the user's configured cycle parameters.
* Emotion/symptom interpretation has limitations.
* AI-generated insights can be imperfect.
* Product recommendations are not a substitute for professional medical advice.
* Some AI functionality depends on external Gemini availability.
* The current project does not replace clinical evaluation or diagnosis.

---

# 🔮 Roadmap

### Intelligence

* [ ] More sophisticated health-pattern detection
* [ ] Better personalization across longer histories
* [ ] Improved AI context selection
* [ ] More robust anomaly detection
* [ ] Better explainability for AI insights

### Tracking

* [ ] More health metrics
* [ ] Wearable/device integrations
* [ ] Improved cycle prediction
* [ ] Custom symptom tracking
* [ ] More detailed trend analysis

### Supporter Experience

* [ ] Granular sharing controls
* [ ] Supporter notifications
* [ ] Shared insights
* [ ] More contextual guidance

### Platform

* [ ] PWA / mobile optimization
* [ ] Offline-first support
* [ ] Automated testing
* [ ] Improved accessibility
* [ ] Production monitoring

---

# 📸 Screenshots

Recommended screenshots for the repository:

```text
docs/
└── screenshots/
    ├── landing.png
    ├── dashboard.png
    ├── cycle-calendar.png
    ├── daily-health.png
    ├── reports.png
    ├── ai-insights.png
    ├── wellness.png
    ├── product-advisor.png
    └── supporter-dashboard.png
```

Example:

```markdown
![Saathi Dashboard](docs/screenshots/dashboard.png)

![Cycle Calendar](docs/screenshots/cycle-calendar.png)

![AI Insights](docs/screenshots/ai-insights.png)
```

---

# 🏆 Built For

**Smart India Hackathon**

Saathi was designed around the idea of making menstrual health tracking more informative, personalized, and supportive through a combination of:

**Health Data + Analytics + AI + Education + Wellness + Trusted Support**

---

# 👥 Team

**Saathi**

Built by a student development team with a focus on:

* Full-stack development
* AI integration
* Health-data analysis
* UX/UI design
* Firebase architecture

---

# 📜 License

This project is licensed under the **MIT License**.

See [`LICENSE`](LICENSE) for details.

---

<p align="center">

## 🌸 Saathi

### **Understand your cycle. Understand yourself.**

<em>Built to make health tracking feel a little more human.</em>

</p>
