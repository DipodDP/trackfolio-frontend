# Trackfolio Frontend

Investment portfolio tracking and sandbox trading analysis frontend built with Next.js, React, and TypeScript.

## Features

- **Authentication**: JWT-based authentication with automatic token refresh
- **Dashboard**: Portfolio overview with key metrics
- **Positions**: View and manage portfolio positions
- **Trading**: Search instruments and execute trades
- **Analysis**: Portfolio analysis and rebalancing recommendations
- **Settings**: Manage API clients, risk profile, and position targets
- **Responsive Design**: "Cosmic Frontier" design system with retro space theme

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Query (planned), Zustand (planned)

## Getting Started

### Prerequisites

- Node.js 20+ (LTS)
- pnpm 10+

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Update `.env.local` with your backend API URL (default: `http://localhost:8000/api/v1`)

### Development

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:

```bash
pnpm build
```

Start production server:

```bash
pnpm start
```

## Project Structure

```
trackfolio_frontend/
├── src/
│   ├── app/                  # Next.js app router pages
│   │   ├── login/           # Login page
│   │   ├── register/        # Registration page
│   │   ├── dashboard/       # Dashboard page
│   │   ├── positions/       # Positions pages
│   │   ├── trading/         # Trading pages
│   │   ├── analysis/        # Analysis pages
│   │   ├── operations/      # Operations history
│   │   └── settings/        # Settings pages
│   ├── components/          # Reusable components
│   ├── lib/                 # Utilities and API client
│   ├── types/               # TypeScript type definitions
│   └── hooks/               # Custom React hooks
├── docs/                    # Project documentation
├── trackfolio_design/       # Design prototypes
└── public/                  # Static assets
```

## API Integration

The frontend integrates with the [Trackfolio Backend](../trackfolio) API:

### Authentication
- `POST /api/v1/login` - User login
- `POST /api/v1/logout` - User logout
- `POST /api/v1/refresh` - Refresh access token

### Portfolio
- `POST /api/v1/api-clients/{id}/portfolio-analysis/full` - Full portfolio analysis

### Trading
- `POST /api/v1/api-clients/{id}/orders/market` - Execute market order
- `GET /api/v1/instruments/search` - Search instruments

### Settings
- `GET/POST /api/v1/api-clients` - Manage API clients
- `GET/POST /api/v1/portfolio-structures` - Manage risk profile
- `GET/POST /api/v1/position-attributes` - Manage position targets

See [docs/06_backend_interface_contracts.md](./docs/06_backend_interface_contracts.md) for complete API documentation.

## Key Pages

### Public Pages
- `/` - Landing page
- `/login` - User login
- `/register` - User registration

### Authenticated Pages (requires login)
- `/dashboard` - Main dashboard with portfolio summary
- `/positions` - Portfolio positions list
- `/trading/search` - Search for instruments to trade
- `/analysis` - Portfolio analysis and recommendations
- `/operations` - Transaction history
- `/settings` - Settings hub
- `/settings/api-clients` - Manage broker connections
- `/settings/risk-profile` - Configure portfolio structure
- `/settings/position-targets` - Set profit targets and stop-loss levels

## Design System

The app uses the "Cosmic Frontier" design system inspired by 1960s Soviet space program aesthetics:

### Colors
- **Primary**: Rocket Red (#D72C2C)
- **Background**: Cosmic Navy (#121828)
- **Cards**: Dark Blue (#1A2238)
- **Text**: Cream Moonlight (#F2E3C2)

### Typography
- **Display**: Bebas Neue
- **Body**: Manrope

### Components
All components follow the design system defined in `/trackfolio_design/context/style-guide.md`

## Development Guidelines

1. **Follow Documentation**: Refer to `/docs/INDEX.md` for comprehensive development guidelines
2. **Type Safety**: Use TypeScript types defined in `/src/types/`
3. **API Calls**: Use the configured axios instance from `/src/lib/api-client.ts`
4. **Authentication**: Use `AuthGuard` component for protected pages
5. **Design System**: Follow the Cosmic Frontier design system

## Contributing

See the [main project documentation](./docs/INDEX.md) for development workflow and guidelines.

## License

MIT
