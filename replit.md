# DocTrack - Document Management System

## Overview

DocTrack is an internal web application for managing technical documentation. It provides a rich text editing experience similar to Notion/Google Docs, with automatic version control, visual diff comparison between versions, and PDF export capabilities. The application supports three document categories (Manuals, Checklists, Guides) and includes a command palette for quick navigation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for fluid micro-interactions
- **Rich Text Editor**: TipTap with extensions for links, images, tables, and placeholders
- **Icons**: Lucide React

### Backend Architecture
- **Runtime**: Node.js with Express
- **API Design**: RESTful endpoints under `/api/` prefix
- **Storage**: Abstracted storage interface (`IStorage`) with in-memory implementation (`MemStorage`)
- **PDF Generation**: jsPDF for document export

### Data Model
The application uses Drizzle ORM with PostgreSQL schema definitions:
- **Users**: Authentication with role-based access (reader, editor, admin)
- **Documents**: Core content with title, content, category, status, and author
- **Versions**: Automatic version history for each document
- **Comments**: Document-level commenting system
- **Audit Logs**: Activity tracking for compliance

### Key Design Patterns
- **Shared Schema**: Database schema and TypeScript types defined in `shared/schema.ts` using Drizzle with Zod validation
- **API Abstraction**: Storage interface allows swapping between memory and database implementations
- **Component Composition**: UI built from shadcn/ui primitives with custom business components

### Build System
- **Development**: Vite dev server with HMR through Express middleware
- **Production**: ESBuild bundles server code, Vite builds client assets to `dist/public`
- **Path Aliases**: `@/` maps to client source, `@shared/` maps to shared modules

## External Dependencies

### Database
- **PostgreSQL**: Primary database (configured via `DATABASE_URL` environment variable)
- **Drizzle ORM**: Type-safe database queries and migrations
- **Drizzle Kit**: Database migration tooling (`db:push` command)

### Third-Party Libraries
- **TipTap**: Headless rich text editor framework with table, link, and image extensions
- **diff-match-patch**: Visual diff comparison between document versions
- **jsPDF**: Client-side PDF generation for document export
- **date-fns**: Date formatting and manipulation
- **Zod**: Runtime validation for API inputs

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Development tooling (dev only)
- **@replit/vite-plugin-dev-banner**: Development banner (dev only)