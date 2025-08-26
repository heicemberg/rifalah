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

### Netlify Deployment Commands
```bash
npm run netlify:build    # Production build optimized for Netlify
npm run netlify:dev      # Development server for Netlify
npm run serve            # Serve static build locally
npm run clean            # Clean build artifacts
```

### Build Output
- Static export build outputs to `out/` directory
- Netlify deployment uses static site generation

### Supabase Integration
- **Database**: PostgreSQL con 3 tablas (customers, purchases, tickets)
- **Real-time**: WebSocket connections para updates automáticos
- **Storage**: Bucket para comprobantes de pago
- **Hook personalizado**: `useSupabaseSync` maneja toda la sincronización

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

The application uses **Zustand** with **Supabase** integration:
- **Local State**: Zustand para UI state y tickets seleccionados
- **Database State**: Supabase para datos persistentes (sold/reserved tickets)
- **Sync Hook**: `useSupabaseSync` mantiene ambos sincronizados
- **FOMO System**: Sistema visual que muestra 8-18% tickets vendidos para crear urgencia
- **Real-time Updates**: WebSocket subscriptions para cambios instantáneos

Key store sections:
- **Ticket Management**: Selección local + sincronización BD
- **Customer Data**: Formularios y checkout flow
- **Supabase Sync**: Estados de conexión y datos reales
- **Admin Configuration**: Panel conectado a base de datos real

### Business Logic

**Ticket System**: 10,000 numbered tickets (0001-10000) stored in Supabase
**FOMO Strategy**: Shows 8-18% tickets as "sold" visually (pero disponibles para compra real)
**Payment Methods**: Mexican-focused (BanCoppel, Banco Azteca, OXXO, Binance Pay)  
**Reservation System**: 30-minute ticket reservation with automatic DB release
**Real-time Features**: WebSocket updates + live purchase notifications
**Admin Panel**: Gestión completa de compras con asignación automática de tickets

### Mexican Localization

The application is specifically designed for Mexico:
- Currency formatting in Mexican Pesos (MXN)
- Mexican bank integration (BanCoppel, Banco Azteca)
- OXXO convenience store payments
- Mexican names and cities for realistic demo data
- Spanish language throughout
- Mexican WhatsApp number validation (+52 format)

### Key Technical Details

- **Supabase Integration**: Base de datos PostgreSQL completa con real-time
- **FOMO System**: Tickets visualmente vendidos para crear urgencia de compra
- **Hook Personalizado**: `useSupabaseSync` maneja toda la sincronización
- **Admin Panel**: Dashboard funcional conectado a BD para gestión real
- **Sistema de Filtros**: Ocultar tickets ocupados, mostrar solo disponibles
- **Modal Inteligente**: Asigna solo números realmente disponibles
- **WebSocket Updates**: Cambios instantáneos via Supabase subscriptions
- **Fallback System**: Modo offline con localStorage si BD no disponible

### Development Notes

- **Sistema Completo**: Base de datos real conectada y funcionando
- **Admin Funcional**: Panel completo para gestionar compras reales
- **FOMO Activo**: Sistema visual que incrementa conversiones
- **Sin Errores**: Modal y tickets grid completamente funcionales
- **Real-time**: Actualizaciones instantáneas via WebSocket
- **Listo para Producción**: Sistema completo y probado

## Development Patterns

### Store Architecture
The application uses **Zustand + Supabase** (`src/stores/raffle-store.ts` + `src/hooks/useSupabaseSync.ts`):
- **Database Sync**: Supabase como source of truth para tickets vendidos/reservados
- **Local State**: Zustand para UI state y selección de tickets  
- **FOMO Integration**: Sistema visual integrado con datos reales
- **Real-time Updates**: WebSocket subscriptions automáticas
- **Specialized Hooks**: `useSupabaseSync()`, `useRealTimeTickets()`, etc.

### Component Architecture
- All components use `'use client'` directive (client-side rendering)
- Components follow functional pattern with hooks
- Custom hooks in `src/hooks/` for performance optimization
- Provider pattern in `src/providers/` for context management

### State Management Flow
1. **Initialization**: `useSupabaseSync` carga tickets reales + aplica FOMO visual
2. **Selection**: User selecciona tickets → estado local Zustand
3. **Purchase**: Modal usa `getRealAvailableTickets()` para asignación real  
4. **Database**: Compra se guarda en Supabase con tickets reales
5. **Admin**: Admin confirma → tickets se marcan vendidos en BD
6. **Sync**: WebSocket actualiza UI automáticamente para todos los usuarios

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
- **Netlify**: Configured with security headers, caching rules, and SPA routing

## important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.