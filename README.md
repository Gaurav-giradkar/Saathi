# Saathi

**Understand Your Cycle. Take Better Care.**

Saathi is a React and Vite menstrual-health companion. It uses Firebase Authentication for account security and Cloud Firestore for profiles, cycle details, daily check-ins, permissions, and carefully scoped supporter connections.

## Stack

- React 18, Vite, React Router, Tailwind CSS
- Firebase Authentication and Cloud Firestore
- Recharts and Lucide React

## Local setup

Requires Node.js 18+.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Create a Firebase web app, enable **Email/Password** under Authentication, create a Firestore database, then fill every `VITE_FIREBASE_*` value in `.env.local`. Never put an Admin SDK or service-account credential in this frontend.

Deploy [firestore.rules](./firestore.rules) and [firestore.indexes.json](./firestore.indexes.json) with the Firebase CLI after reviewing them for your Firebase project:

```bash
npx firebase-tools deploy --only firestore:rules,firestore:indexes --project YOUR_FIREBASE_PROJECT_ID
```

Replace `YOUR_FIREBASE_PROJECT_ID` with the same value as `VITE_FIREBASE_PROJECT_ID` in `.env.local`. This is required even when Authentication is working: Firebase Authentication and Cloud Firestore use separate configuration and permission controls.

## Data architecture

- `users/{uid}` stores only the authenticated person's profile and onboarding details.
- `users/{uid}/cycles/{cycleId}` stores recorded cycle data.
- `users/{uid}/healthEntries/{date}` stores daily check-ins.
- `connections/{connectionId}` holds an owner, supporter, status, and sharing choices.
- `connections/{connectionId}/shared/currentStatus` is the only projection supporters may read. It contains only fields the user opted to share.

The client does not use localStorage for authentication, health logs, profiles, permissions, or relationships. Cycle predictions are estimates, not medical advice.

## Production build

```bash
npm run build
```
