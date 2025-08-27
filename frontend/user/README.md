# Hotel Booking Frontend - Next.js Pages Router

A modern hotel booking website built with Next.js (Pages Router), TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 13.5.1 (Pages Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: Zustand (client) + React Query (server state)
- **Forms**: React Hook Form + Zod validation
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **i18n**: Thai translations in lib/i18n.ts

## Features

### Pages & Routes
- `/` - Landing page with search and available rooms
- `/login` - User authentication
- `/register` - User registration  
- `/rooms` - Room listing with filters
- `/rooms/[id]` - Room details with booking modal
- `/booking/checkout` - Booking form and payment slip upload
- `/booking/success` - Booking confirmation
- `/account/reservations` - User's bookings history

### Key Components
- `Navbar` - Navigation with auth state
- `RoomCard` - Room display component
- `RoomFilters` - Advanced filtering
- `DateRangePicker` - Date selection modal
- `UploadSlip` - Payment slip upload
- `ProtectedRoute` - Auth guard

### Authentication Flow
- Unauthenticated users are redirected to login
- Intended path is stored for post-login redirect
- Form validation with Zod schemas

### Booking Flow
1. User searches and selects room
2. Login check (redirect if needed)
3. Date and guest selection
4. Contact details form
5. Payment slip upload
6. Booking submission and confirmation

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## Project Structure

```
├── components/
│   ├── Layout/          # Navbar, Footer, Layout
│   ├── Auth/            # ProtectedRoute
│   ├── Rooms/           # Room-related components
│   ├── Booking/         # Booking-related components
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── api.ts           # API client with mock data
│   ├── i18n.ts          # Thai translations
│   ├── mock-data.ts     # Mock data for development
│   └── utils.ts         # Utilities
├── pages/
│   ├── _app.tsx         # App wrapper with providers
│   ├── _document.tsx    # Document structure
│   ├── index.tsx        # Landing page
│   ├── login.tsx        # Login page
│   ├── register.tsx     # Registration page
│   ├── rooms/           # Room pages
│   ├── booking/         # Booking pages
│   └── account/         # User account pages
├── store/
│   └── useAuth.ts       # Zustand auth store
├── types/
│   └── index.ts         # TypeScript definitions
└── styles/
    └── globals.css      # Global styles
```

## API Contract

The frontend expects these API endpoints:

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Rooms
- `GET /rooms/available` - Search available rooms
- `GET /rooms` - Get all rooms with pagination
- `GET /rooms/:id` - Get room details

### Bookings
- `POST /bookings` - Create booking
- `GET /me/bookings` - Get user's bookings
- `PATCH /bookings/:id/attach-payment` - Attach payment to booking

### Payments
- `POST /payments/slip` - Upload payment slip

### Packages
- `GET /packages?active=true` - Get active packages

## Mock Data

For development, the app uses mock data defined in `lib/mock-data.ts`. The API functions in `lib/api.ts` simulate real API calls with delays.

## Status Management

Booking statuses:
- `PENDING_PAYMENT` - Waiting for payment
- `AWAITING_REVIEW` - Payment under review
- `CONFIRMED` - Booking confirmed
- `REJECTED` - Payment rejected (allows re-upload)
- `CANCELLED` - Booking cancelled

## Responsive Design

- Mobile-first approach
- Responsive breakpoints for all screen sizes
- Touch-friendly interactions
- Optimized for both desktop and mobile

## Contributing

1. Follow the existing code style
2. Use TypeScript for type safety
3. Implement proper error handling
4. Add loading states for better UX
5. Follow the component structure pattern

## License

Private project - All rights reserved.