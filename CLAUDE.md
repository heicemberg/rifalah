# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Start Development Server
```bash
npm run dev
```
Uses Next.js with Turbopack for fast development builds. Application runs on http://localhost:3000

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Linting
```bash
npm run lint
```
Uses ESLint with Next.js configuration for code quality checks.

### Type Checking
Since this is a TypeScript project, you can run type checking with:
```bash
npx tsc --noEmit
```

## Architecture Overview

This is a **Next.js 15** React application for a Mexican truck raffle system ("Rifa de Camioneta"). The application uses TypeScript and follows modern React patterns.

### Core Architecture

**Frontend Framework**: Next.js 15 with App Router
**State Management**: Zustand with persistence
**Styling**: Tailwind CSS 4.x
**Language**: TypeScript with strict mode
**Real-time Features**: Custom real-time simulation system

### Key Directory Structure

- `src/app/` - Next.js App Router pages and layouts
  - `src/app/page.tsx` - Main raffle homepage
  - `src/app/admin/page.tsx` - Admin interface
  - `src/app/comprar/page.tsx` - Purchase flow page
  - `src/app/layout.tsx` - Root layout with comprehensive SEO and metadata

- `src/components/` - Reusable UI components
  - All components are client-side (`'use client'`) React components
  - Includes animated components, payment modals, ticket grids, live notifications

- `src/lib/` - Shared utilities and core logic
  - `types.ts` - Complete TypeScript type definitions for the raffle system
  - `constants.ts` - Application constants, payment methods, Mexican names/cities
  - `utils.ts` - Utility functions for pricing, formatting, validation
  - `realtime.ts` - Real-time activity simulation system
  - `analytics.ts` - Analytics utilities

- `src/stores/` - Zustand state management
  - `raffle-store.ts` - Main application state with persistence

### State Management Architecture

The application uses **Zustand** with the following key features:
- Persistent storage for critical data (sold/reserved tickets, admin config)
- Devtools integration for debugging
- Computed values for derived state
- Specialized hooks for different parts of the store

Key store sections:
- **Ticket Management**: Selection, reservation, sales tracking
- **Customer Data**: User information and checkout flow
- **Live Activities**: Real-time purchase notifications simulation
- **Admin Configuration**: Prize details, payment methods, theme colors

### Business Logic

**Ticket System**: 10,000 numbered tickets (0001-10000) with pricing tiers and bulk discounts
**Payment Methods**: Mexican-focused (BanCoppel, Banco Azteca, OXXO, Binance Pay)
**Reservation System**: 30-minute ticket reservation with automatic release
**Real-time Features**: Live purchase notifications and viewing counters

### Mexican Localization

The application is specifically designed for Mexico:
- Currency formatting in Mexican Pesos (MXN)
- Mexican bank integration (BanCoppel, Banco Azteca)
- OXXO convenience store payments
- Mexican names and cities for realistic demo data
- Spanish language throughout
- Mexican WhatsApp number validation (+52 format)

### Key Technical Details

- Uses dynamic imports for performance optimization
- Comprehensive SEO with structured data (JSON-LD)
- Mobile-responsive design with Tailwind CSS
- Custom Tailwind configuration with Mexican-themed colors and animations
- Sound effects system for user interactions
- Progressive Web App (PWA) ready with manifest
- Real-time activity simulation without actual backend
- No test framework configured - project focuses on demo/prototype functionality

### Development Notes

- The application simulates a real raffle system but doesn't include actual payment processing
- Live activities are generated via simulation, not real purchases
- Admin panel exists but may have limited functionality
- The codebase follows Mexican business context with authentic payment methods and localization

## Development Patterns

### Store Architecture
The application uses a sophisticated Zustand store (`src/stores/raffle-store.ts`) with:
- **Persistence**: Critical data (sold tickets, admin config) persists across sessions
- **Computed Properties**: Getters for derived state like `totalPrice`, `soldPercentage`
- **Specialized Hooks**: `useTickets()`, `useCheckout()`, `useLiveActivities()`, `useAdminConfig()`
- **Shallow Comparison**: Custom implementation for optimal re-renders

### Component Architecture
- All components use `'use client'` directive (client-side rendering)
- Components follow functional pattern with hooks
- Custom hooks in `src/hooks/` for performance optimization
- Provider pattern in `src/providers/` for context management

### State Management Flow
1. **Ticket Selection**: Users select tickets → stored in `selectedTickets`
2. **Reservation**: Selected tickets → moved to `reservedTickets` with 30-minute timeout
3. **Purchase**: Reserved tickets → moved to `soldTickets` with customer data
4. **Real-time Updates**: Live activities and viewing counters simulate engagement

### Performance Optimizations
- React Window virtualization for large ticket grids
- Dynamic imports for code splitting
- Memoized selectors with custom shallow comparison
- Optimized re-renders through specialized store hooks

### Configuration Files
- **ESLint**: Uses Next.js config with custom rules (warnings for TypeScript strict mode)
- **TypeScript**: Strict mode enabled with path aliases (`@/*` → `./src/*`)
- **Tailwind**: Custom Mexican-themed colors and animations
- **PostCSS**: Dual configuration files (`.js` and `.mjs`) for compatibility