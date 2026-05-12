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
- Google login with popup sign-in flow for seamless authentication
- Conditional profile collection: VIT student emails auto-populate school name; non-VIT users must provide school/college name
- Persistent profile fields: mobile number, registration number, and school/college name
- Workshop interest tracking saved to MongoDB with full profile details
- Profile-only saves for users who want to register without workshop selection
- Dedicated Events page for saved interests with one-click removal
- FAQ accordion with scroll-padding for proper section navigation
- Enhanced member popover displaying full profile details on desktop and mobile
- Mobile-responsive auth button in popover for compact mobile layout
- Themed modal styling with accent colors for each workshop category
- Updated MIC logo branding throughout the app

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

- `MONGODB_URI` - MongoDB connection string (e.g., MongoDB Atlas URI)
- `NEXTAUTH_URL` - base URL for authentication callbacks (e.g., `http://localhost:3000` for dev)
- `NEXTAUTH_SECRET` - random secret for NextAuth session encryption
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

## Database Schema

The app uses MongoDB with Mongoose. The `InterestedUser` model includes:

- `email` - user's email (lowercase, unique)
- `name` - user's full name
- `mobileNumber` - 10-digit Indian mobile number
- `registrationNumber` - user's registration/ID number
- `schoolCollegeName` - school or college name (auto-populated for VIT students)
- `workshopNames` - array of saved workshop titles
- `status` - user status (e.g., "Interested")

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

- **Profile Management**: The app collects mobile number, registration number, and school/college name during sign-up. VIT students (emails ending in `@vitstudent.ac.in`) automatically have "Vellore Institute Of Technology" set as their school.
- **Workshop Interest Flow**: Users can sign in, complete their profile, and save interest in one or more workshops. Interests are stored in MongoDB linked to the user's email.
- **Profile-Only Registration**: Users can save their profile without selecting a workshop; this allows profile completion before workshop selection.
- **Session Synchronization**: After popup-based Google sign-in, the page automatically reloads to sync the session and reflect the logged-in state.
- **Events Page**: The `/events` page displays all saved workshop interests. Users can remove interest from individual workshops; if no workshops remain, the profile is preserved if profile details are complete.
- **Mobile Layout**: On mobile devices, the login/logout button moves into the member popover to conserve header space. The header auth button is hidden on small screens.
- **Responsive Navigation**: Section heading navigation includes scroll-padding to ensure proper alignment with the fixed header.
- **Assets**: The project uses the updated MIC logo (`mic-logo-removedbg.png`) in all header and footer locations.
