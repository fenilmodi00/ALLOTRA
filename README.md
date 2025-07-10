# IPO Tracker

A mobile application for tracking IPO allotment status built with React Native, Expo, and TypeScript.

## Features

- User authentication with Clerk
- PAN card management
- IPO tracking and allotment status checking
- Dark mode support
- Admin panel for managing IPOs

## Tech Stack

- **Frontend**:
  - React Native
  - Expo
  - TypeScript
  - React Navigation
  - React Native Paper (UI components)
  - Clerk (Authentication)
  - React Hook Form + Zod (Form validation)

- **Backend**:
  - Node.js + Express
  - PostgreSQL
  - Prisma ORM
  - JWT Authentication (API)

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ipo-tracker.git
cd ipo-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

4. Update the publishable key in `src/context/ClerkProvider.tsx` with your Clerk publishable key.

5. Start the development server:
```bash
npm start
```

## Authentication with Clerk

This application uses [Clerk](https://clerk.dev/) for authentication. Clerk provides a complete user management system with features like:

- Email/password authentication
- Social login
- Multi-factor authentication
- Email verification

To set up Clerk:

1. Create an account on [clerk.dev](https://clerk.dev/)
2. Create a new application
3. Get your publishable key from the Clerk Dashboard
4. Add the key to your `.env` file and `ClerkProvider.tsx`

## Project Structure

```
ipo-tracker/
├── src/
│   ├── components/     # Reusable components
│   ├── context/        # Context providers
│   ├── navigation/     # Navigation configuration
│   ├── screens/        # App screens
│   ├── services/       # API services
│   ├── theme/          # Theme configuration
│   └── types/          # TypeScript type definitions
├── App.tsx             # Main app component
└── README.md           # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 