# MIC Workshop Registration Portal

Arcade-inspired workshop and hackathon registration app for the Microsoft Innovations Club.

## Stack

- Next.js 16 App Router
- React 19 + TypeScript
- NextAuth with Google sign-in
- MongoDB with Mongoose
- shadcn-style UI primitives built on Radix UI

## Features

- Workshop and hackathon cards with modal details
- Google login with popup sign-in flow
- Workshop interest tracking saved to MongoDB
- Dedicated Events page for saved interests
- `Not-interested` action to remove saved events
- FAQ accordion, member popover, and themed modal styling
- MIC logo favicon and branding assets

## Routes

- `/` - main workshop and hackathon landing page
- `/events` - saved/interested events page
- `/auth/signin` - custom Google sign-in page
- `/auth/popup-close` - popup close callback used after sign-in

## Requirements

Create a local environment file from the example template:

```bash
cp .env.example .env.local
```

Populate these values:

- `MONGODB_URI`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Development

Install dependencies and run the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `npm run dev` - start the development server
- `npm run build` - build the app for production
- `npm run start` - start the production server
- `npm run lint` - run ESLint

## Notes

- The home page stores interested workshops in MongoDB under the signed-in user.
- The `/events` page shows those saved items and lets the user remove interest from a saved event.
- The project uses the MIC logo in the browser tab via `public/mic-logo.svg`.
