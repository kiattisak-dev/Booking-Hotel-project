# Hotel Admin Console

A comprehensive admin dashboard for hotel management built with Next.js, TypeScript, and modern web technologies.

## Features

### Authentication
- Admin-only login system
- Route protection with authentication guards
- Session persistence with Zustand

### Dashboard
- Key Performance Indicators (KPIs) with real-time stats
- Revenue tracking and booking analytics
- Recent bookings overview
- Occupancy rate monitoring

### Room Management
- Full CRUD operations for rooms
- Room types: Standard, Deluxe, Suite
- Capacity and pricing management
- Status management (active/inactive)
- Image upload support

### Package Management
- Create and manage promotional packages
- Flexible pricing with discounts
- Validity period management
- Active/inactive status control

### Booking Management
- View all bookings with advanced filtering
- Confirm or cancel pending bookings
- Status tracking and timeline view
- Guest information and room details

### Payment Management
- Payment slip inbox for manual verification
- Image preview for submitted slips
- Approve/reject functionality with reason tracking
- Automated status updates

## Tech Stack

- **Framework**: Next.js 13 with Pages Router
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: React Query (@tanstack/react-query)
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18 or higher
- pnpm (recommended) or npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Credentials
- **Email**: admin@hotel.com
- **Password**: admin123

## Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## Project Structure

```
├── components/
│   ├── admin/           # Admin-specific components
│   │   ├── AdminLayout.tsx
│   │   ├── AdminTable.tsx
│   │   ├── KPICard.tsx
│   │   └── StatusBadge.tsx
│   └── ui/              # Reusable UI components
├── lib/
│   ├── stores/          # Zustand stores
│   ├── types/           # TypeScript type definitions
│   └── auth-guards.tsx  # Authentication guards
├── pages/
│   ├── admin/           # Admin pages
│   │   ├── index.tsx    # Dashboard
│   │   ├── rooms/       # Room management
│   │   ├── packages/    # Package management
│   │   ├── bookings.tsx # Booking management
│   │   └── payments.tsx # Payment management
│   ├── login.tsx        # Login page
│   └── _app.tsx         # App root
└── utils/               # Utility functions
```

## API Integration

The frontend is designed to work with the following API endpoints:

### Authentication
- `POST /auth/login` - Admin login
- `GET /auth/me` - Get current user

### Rooms
- `GET /admin/rooms` - List rooms
- `POST /admin/rooms` - Create room
- `GET /admin/rooms/:id` - Get room details
- `PATCH /admin/rooms/:id` - Update room
- `DELETE /admin/rooms/:id` - Delete room

### Packages
- `GET /admin/packages` - List packages
- `POST /admin/packages` - Create package
- `PATCH /admin/packages/:id` - Update package
- `DELETE /admin/packages/:id` - Delete package

### Bookings
- `GET /admin/bookings` - List bookings with filters
- `PATCH /admin/bookings/:id/confirm` - Confirm booking
- `PATCH /admin/bookings/:id/cancel` - Cancel booking

### Payments
- `GET /admin/payments?status=SUBMITTED` - List payment slips
- `PATCH /admin/payments/:id/approve` - Approve payment
- `PATCH /admin/payments/:id/reject` - Reject payment with reason

## Development

### Adding New Pages
1. Create the page component in the appropriate directory
2. Wrap with `withAdminAuth` for protected routes
3. Add navigation links in `AdminLayout.tsx`

### State Management
- Use Zustand stores for global state
- React Query for server state management
- Local state for component-specific data

### Styling Guidelines
- Use Tailwind CSS utility classes
- Leverage shadcn/ui components
- Maintain consistent spacing and typography
- Follow the established color scheme

## Production Deployment

1. Build the application:
   ```bash
   pnpm build
   ```

2. Start the production server:
   ```bash
   pnpm start
   ```

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for new features
3. Include proper error handling
4. Test all functionality thoroughly
5. Update documentation as needed

## License

This project is proprietary software. All rights reserved.