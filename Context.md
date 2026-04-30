# MomentCraft — Context & Documentation

**Last Updated:** April 30, 2026  
**Repository:** GouthamA15/MomentCraft  
**Current Branch:** main

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Features & Functionalities](#features--functionalities)
7. [Recent Improvements (UX/Performance)](#recent-improvements-uxperformance)
8. [Authentication Flow](#authentication-flow)
9. [API Endpoints](#api-endpoints)
10. [Environment Configuration](#environment-configuration)

---

## Project Overview

**MomentCraft** is a premium wedding template publishing platform for administrators. It provides:

- **Agency-grade dashboard** with clean operational clarity
- **Secure Supabase authentication** with protected route controls
- **Template-ready architecture** for controlled phased rollout
- **Multi-language support** (English, Telugu, Hindi)
- **Project lifecycle management** (Draft → Client Review → Live → Archived)
- **Public website hosting** for published projects with shareable URLs
- **Admin-only access** with role-based controls

**Target Users:** Wedding photographers, event planners, and vendors managing client projects and template deployments.

---

## Architecture

### Core Principles

- **Server-First Rendering:** Next.js App Router with server components by default
- **Client Optimization:** Minimal client-side JavaScript; prefer server-side logic
- **Type Safety:** Full TypeScript coverage across frontend and backend
- **Session Persistence:** Supabase-backed authentication with automatic routing
- **Database-Driven:** Supabase PostgreSQL with real-time capabilities
- **Clean Migrations:** Removed legacy `project_content` table; full migration to `project_translations`

### Authentication & Authorization

- **Provider:** Supabase Auth (email/password)
- **Fallback (Dev Only):** Cookie-based fallback auth via `NEXT_PUBLIC_DEV_FALLBACK_*` env vars
- **Route Protection:** Server-side session checks on protected routes
- **Session Persistence:** Automatic redirect to dashboard when authenticated; redirect away from login if already logged in

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15+ (App Router) | Full-stack React framework |
| **UI Library** | React 18+ | Component rendering |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Form Validation** | Manual HTML5 | Lightweight, no external deps |
| **Database** | Supabase (PostgreSQL) | Backend-as-a-service |
| **Authentication** | Supabase Auth | Secure session management |
| **File Storage** | Supabase Storage | Cloud asset hosting |
| **Build Tool** | Turbopack (Next.js default) | Fast bundler |
| **Package Manager** | npm | Dependency management |
| **Language** | TypeScript | Type-safe development |
| **Environment** | Node.js 18+ | Runtime |

---

## Project Structure

```
MomentCraft/
├── src/
│   ├── app/                                 # Next.js App Router pages
│   │   ├── page.tsx                         # Root page (smart redirect)
│   │   ├── layout.tsx                       # Root layout
│   │   ├── globals.css                      # Global styles
│   │   │
│   │   ├── (auth)/                          # Auth layout group
│   │   │   └── login/
│   │   │       └── page.tsx                 # Login page (with guard)
│   │   │
│   │   ├── api/                             # API routes (backend)
│   │   │   ├── qr/
│   │   │   │   └── route.ts                 # QR code generation (env-based URL)
│   │   │   ├── projects/
│   │   │   │   ├── route.ts                 # POST/GET projects
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts             # PATCH/DELETE projects
│   │   │   │       ├── publish/
│   │   │   │       └── versions/
│   │   │   ├── clients/
│   │   │   │   ├── route.ts                 # Vendor client management
│   │   │   │   └── [id]/route.ts
│   │   │   ├── vendors/
│   │   │   │   ├── route.ts                 # Vendor CRUD
│   │   │   │   └── [id]/route.ts
│   │   │   ├── uploads/
│   │   │   │   └── route.ts                 # Asset upload handler
│   │   │   ├── revisions/
│   │   │   │   └── route.ts                 # Project version history
│   │   │   ├── logout/
│   │   │   │   └── route.ts                 # Session logout
│   │   │   └── ...
│   │   │
│   │   ├── dashboard/                       # Admin dashboard (protected)
│   │   │   ├── layout.tsx                   # Dashboard layout shell
│   │   │   ├── page.tsx                     # Dashboard home
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx                 # Projects list
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx             # Create project form
│   │   │   │   ├── edit/[projectId]/
│   │   │   │   │   └── page.tsx             # Edit project form
│   │   │   │   ├── preview/[projectId]/
│   │   │   │   └── versions/[projectId]/
│   │   │   ├── templates/
│   │   │   │   ├── page.tsx                 # Templates gallery
│   │   │   │   └── preview/[templateCode]/
│   │   │   │       └── page.tsx             # Template preview
│   │   │   ├── clients/
│   │   │   │   └── page.tsx                 # Clients management
│   │   │   ├── vendors/
│   │   │   │   └── page.tsx                 # Vendors management
│   │   │   ├── revisions/
│   │   │   │   └── page.tsx                 # Project revisions
│   │   │   ├── settings/
│   │   │   │   └── page.tsx                 # Admin settings
│   │   │   └── debug/
│   │   │       └── supabase-test/           # Debug tools
│   │   │
│   │   ├── preview/                         # Public template previews
│   │   │   └── template-1/
│   │   │       └── page.tsx
│   │   │
│   │   └── site/                            # Public-facing project sites
│   │       └── [slug]/
│   │           └── page.tsx                 # Dynamic published project page
│   │
│   ├── components/                          # Reusable React components
│   │   ├── auth/
│   │   │   └── login-form.tsx               # Login form (with loading state)
│   │   │
│   │   ├── dashboard/
│   │   │   ├── dashboard-shell.tsx          # Layout wrapper (memoized)
│   │   │   ├── sidebar.tsx                  # Nav sidebar (memoized)
│   │   │   ├── header.tsx                   # Page header (memoized)
│   │   │   ├── create-project-form.tsx      # Project creation/edit form
│   │   │   ├── projects/
│   │   │   │   └── projects-table.tsx       # Projects list table
│   │   │   ├── clients/
│   │   │   │   └── clients-manager.tsx      # Clients CRUD UI
│   │   │   ├── vendors/
│   │   │   │   └── vendors-manager.tsx      # Vendors CRUD UI
│   │   │   ├── revisions/
│   │   │   │   └── revisions-manager.tsx
│   │   │   ├── gallery-manager.tsx          # Image gallery uploader
│   │   │   └── asset-uploader.tsx           # Multi-asset uploader
│   │   │
│   │   ├── perf/                            # Performance/UX components
│   │   │   ├── fetch-instrumentation.tsx    # Dev: network call logging
│   │   │   └── route-progress.tsx           # Route transition progress bar
│   │   │
│   │   ├── ui/                              # Base UI components
│   │   │   ├── button.tsx                   # Button (with loading spinner)
│   │   │   ├── input.tsx                    # Input field
│   │   │   └── ...
│   │   │
│   │   ├── templates/                       # Template-specific components
│   │   └── shared/                          # Shared utilities
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── server.ts                    # Server-side Supabase client
│   │   │   ├── client.ts                    # Client-side Supabase client
│   │   │   ├── public-server.ts             # Public (unauthenticated) server client
│   │   │   └── middleware.ts                # Auth middleware
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts                        # Tailwind class merge
│   │   │   ├── slug.ts                      # URL slug generator
│   │   │   ├── date-format.ts               # Date formatting utilities
│   │   │   └── ...
│   │   │
│   │   ├── template-registry.ts             # Dynamic template loader
│   │   └── ...
│   │
│   ├── constants/
│   │   ├── template-config.ts               # Template metadata
│   │   ├── template-fields.ts               # Translatable field definitions
│   │   └── ...
│   │
│   ├── types/
│   │   ├── project.ts                       # TypeScript type definitions
│   │   └── ...
│   │
│   ├── hooks/                               # Custom React hooks (if any)
│   ├── services/                            # Business logic services
│   ├── styles/                              # Additional stylesheets
│   └── assets/                              # Static assets
│
├── public/                                  # Public static files
│   └── Dheeni Premantara - ...mp3.mpeg      # Sample audio
│
├── middleware.ts                            # Next.js middleware (route protection)
├── next.config.ts                           # Next.js configuration
├── tsconfig.json                            # TypeScript configuration
├── tailwind.config.js                       # Tailwind CSS configuration
├── postcss.config.js                        # PostCSS configuration
├── eslint.config.mjs                        # ESLint configuration
├── package.json                             # Dependencies and scripts
├── .env.local                               # Environment variables (local)
├── database.txt                             # Database schema reference
├── Context.md                               # This file
├── README.md                                # Project README
└── CLAUDE.md                                # Coding guidelines

```

---

## Database Schema

### Core Tables

#### **projects**
Represents a wedding project/invitation.

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) NOT NULL,
  client_id UUID REFERENCES clients(id) NOT NULL,
  template_id UUID REFERENCES templates(id) NOT NULL,
  project_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'draft', -- draft, published, archived
  publish_status BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  event_date DATE,
  theme_color TEXT,
  font_family TEXT,
  background_music TEXT,
  seo_title TEXT,
  seo_description TEXT,
  og_image TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### **project_translations** ⭐ (Replaces old project_content)
Stores multilingual content for projects.

```sql
CREATE TABLE project_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) NOT NULL,
  field_key TEXT NOT NULL, -- e.g., "bride_name", "venue_address"
  language_code TEXT NOT NULL, -- "en", "te", "hi"
  field_value TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(project_id, field_key, language_code)
);
```

#### **project_gallery**
Stores gallery images for a project.

```sql
CREATE TABLE project_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT now()
);
```

#### **project_assets**
Stores media assets (music, cover images, OG images).

```sql
CREATE TABLE project_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) NOT NULL,
  asset_type TEXT, -- "cover_image", "background_music", "og_image"
  file_url TEXT NOT NULL,
  file_name TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

#### **templates**
Available invitation templates.

```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  template_code TEXT UNIQUE NOT NULL,
  event_type TEXT, -- "wedding", "birthday", etc.
  template_path TEXT,
  preview_image TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now()
);
```

#### **vendors**
Partner vendors (photographers, event planners).

```sql
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  owner_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### **clients**
Clients belonging to vendors.

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) NOT NULL,
  client_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  event_type TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### **project_revisions**
Tracks project version history.

```sql
CREATE TABLE project_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) NOT NULL,
  revision_number INTEGER,
  snapshot JSONB, -- full project state snapshot
  created_by TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## Features & Functionalities

### 1. **Authentication & Session Management**

✅ **Secure Login**
- Email/password authentication via Supabase
- Dev fallback auth (cookie-based) for local development
- Loading state with spinner during login
- Immediate feedback ("Logging in..." message)
- Prevention of duplicate submissions

✅ **Session Persistence**
- Automatic redirect to dashboard on app reopen if authenticated
- Automatic redirect away from login page if already authenticated
- Clean root route (/) that checks session and routes appropriately
- Protected dashboard routes prevent unauthenticated access

✅ **Logout**
- Clean session destruction
- Redirect to login page after logout

---

### 2. **Project Management**

✅ **Create Project**
- Form-based project creation with validation
- Template selection required
- Multi-language content input (English, Telugu, Hindi)
- Automatic URL slug generation from project name
- Design settings: theme color, font family
- Asset uploads: cover image, background music, OG image
- Gallery image management
- SEO metadata (title, description, OG image)
- Save as draft with immediate success feedback
- Success toast before redirect to projects list

✅ **Edit Project**
- Modify all project fields
- Update translations across languages
- Re-upload assets
- Manage gallery
- Save changes with clear feedback
- Preserve client/vendor associations

✅ **Project Versioning**
- Track project revision history
- Snapshot full project state on each save
- Browse historical versions

✅ **Publish Flow**
- Draft → Published state transition
- Public URL generation with shareable link
- QR code generation (env-based URL using NEXT_PUBLIC_SITE_URL)
- Unpublish to return to draft
- Archive projects for historical reference

✅ **Project Filtering & Search**
- List view with sorting
- Project status badges (draft, published, archived)
- Client and vendor relationships displayed

---

### 3. **Vendor Management**

✅ **Vendor CRUD**
- Create new vendors with business details
- Edit vendor information
- Deactivate/activate vendors
- Delete vendors (with cascade delete of related clients)
- Search and filter vendor list
- Active/inactive status indicator

✅ **Inline Vendor Creation**
- Create vendors on-the-fly during project creation
- Seamless vendor → project workflow

---

### 4. **Client Management**

✅ **Client CRUD**
- Create clients under specific vendors
- Edit client details
- Delete clients
- Search and filter by name, contact info
- Vendor relationship validation
- Event type categorization

✅ **Inline Client Creation**
- Create clients during project creation if needed
- Vendor-to-client filtering

---

### 5. **Template System**

✅ **Template Gallery**
- Browse all active templates
- View template metadata (name, event type, category)
- Preview button to see template in action
- Select template for new projects

✅ **Template Preview**
- Full-screen template rendering
- Live content editing
- Test translations in multiple languages

✅ **Multi-Language Support**
- Templates define translatable fields
- Support for English, Telugu, Hindi
- Per-language content storage in project_translations
- Language toggle in preview

---

### 6. **Public Site**

✅ **Published Project Pages**
- Dynamic route: `/site/[slug]`
- Serve published projects publicly
- Full template rendering with project-specific content
- Gallery display
- Media playback (background music, images)
- SEO metadata (title, description, OG image)
- No authentication required

---

### 7. **Admin Dashboard**

✅ **Dashboard Navigation**
- Memoized sidebar (prevents unnecessary re-renders)
- Memoized header (prevents unnecessary re-renders)
- Clean layout shell with preserved state during navigation
- Route-change progress indicator (subtle visual feedback)

✅ **Dashboard Sections**
- **Projects:** View, create, edit, publish, archive
- **Templates:** Browse and preview available templates
- **Vendors:** Manage vendor partnerships
- **Clients:** Manage client records under vendors
- **Revisions:** View project version history
- **Settings:** Admin configuration (if needed)
- **Debug:** Supabase connectivity testing

---

### 8. **Asset Management**

✅ **Image Uploads**
- Upload to Supabase Storage
- Gallery image management
- Cover images for projects
- OG images for social sharing
- Preview URLs for uploaded assets

✅ **Audio Uploads**
- Background music upload
- Playback support in templates

✅ **Batch Upload**
- Multiple image gallery uploads
- Organized asset management

---

## Recent Improvements (UX/Performance)

### Session & Routing Fixes ✅

1. **Smart Root Route (`/app/page.tsx`)**
   - Checks if user is authenticated server-side
   - Redirects to `/dashboard` without try/catch (prevents fake NEXT_REDIRECT errors)
   - Falls back to home page if not authenticated
   - Clean UX with no console noise

2. **Login Page Guard (`/app/(auth)/login/page.tsx`)**
   - Redirects away from login if already authenticated
   - Prevents login form flash
   - Clean server-side check without error logs

3. **Dashboard Layout Protection (`/app/dashboard/layout.tsx`)**
   - Server-side session validation
   - Redirects unauthenticated users to `/login`
   - Remains stable and protected

### Database Architecture Migration ✅

4. **Removed `project_content` Table**
   - Eliminated old unused table references
   - Cleaned up `POST /api/projects` - removed project_content insert logic
   - Cleaned up `PATCH /api/projects/[id]` - removed project_content merge logic
   - Cleaned up edit page fetch - removed project_content query
   - Full migration to `project_translations` only
   - No more "table not found" errors

### Login Experience ✅

5. **Loading State with Spinner**
   - Button shows spinner while logging in
   - "Logging in..." label during submission
   - Disabled button prevents duplicate submissions
   - Aria-busy attribute for accessibility

### URL & QR Routing ✅

6. **Environment-Based Site URL**
   - QR code generation uses `NEXT_PUBLIC_SITE_URL` env var
   - Public links respect deployment domain
   - No hardcoded localhost fallback in production
   - Clean base URL resolution for both QR and live links

### Layout Optimization ✅

7. **Memoized Dashboard Components**
   - `Sidebar` wrapped in `React.memo()` - prevents re-renders on navigation
   - `DashboardHeader` wrapped in `React.memo()` - prevents re-renders on navigation
   - Sidebar and header remain stable during route changes
   - Preserved layout state across navigation

8. **Route Progress Indicator**
   - Subtle cyan progress bar on route changes
   - Shows at top of viewport for ~900ms during navigation
   - Improves perceived performance
   - Non-blocking visual feedback

### Network Debugging ✅

9. **Fetch Instrumentation (Dev Only)**
   - Wraps `window.fetch()` in development
   - Logs slow requests (>200ms) with stack trace
   - Logs repeated requests (same URL called multiple times)
   - Groups logs for easy inspection
   - Automatically clears counts every 5 seconds
   - Zero impact in production

### Save Draft UX ✅

10. **Professional Save Flow**
    - Click "Save Draft" → immediate button loading state with spinner
    - Fetch API call wrapped in try/catch for error safety
    - On success: green "Project saved successfully!" message appears
    - Wait 800ms for user to see success confirmation
    - Then auto-redirect to `/dashboard/projects?saved=1`
    - No frozen "Rendering" state
    - No `router.refresh()` freeze (removed)
    - Edit flow uses same professional pattern
    - Clear error messages on failure
    - Cancel button disabled during save

---

## Authentication Flow

```
User visits app
    ↓
Root route (/) checks session server-side
    ├─ If authenticated → redirect to /dashboard ✅
    └─ If not → show home page with login link
        ↓
    User clicks "Enter Admin Login" → go to /login
        ↓
    /login checks session server-side
        ├─ If authenticated → redirect to /dashboard ✅
        └─ If not → show login form
            ↓
        User fills email/password
            ↓
        Clicks "Login to Dashboard"
            ├─ Button shows loading spinner immediately
            ├─ "Logging in..." text shown
            ├─ Repeated clicks prevented
            ↓
        Supabase auth.signInWithPassword() called
            ├─ On error → show red error message
            └─ On success → redirect to /dashboard + router.refresh()
                ↓
        Dashboard loads (protected, requires valid session)
            ↓
        User navigates dashboard pages
            ├─ Route progress bar shows (~900ms)
            ├─ Sidebar/header remain stable (memoized)
            ├─ Content updates smoothly
            └─ Network calls logged in dev console
                ↓
        User logs out → POST /api/logout
            ├─ Session destroyed
            └─ Redirect to /login
```

---

## API Endpoints

### Authentication

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `POST` | `/api/logout` | Logout user | ✅ Required |

### Projects

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `POST` | `/api/projects` | Create project | ✅ Required |
| `GET` | `/api/projects` | List projects | ✅ Required |
| `PATCH` | `/api/projects/[id]` | Update project | ✅ Required |
| `DELETE` | `/api/projects/[id]` | Delete project | ✅ Required |
| `POST` | `/api/projects/[id]/publish` | Publish/unpublish project | ✅ Required |

### Vendors

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `POST` | `/api/vendors` | Create vendor | ✅ Required |
| `GET` | `/api/vendors` | List vendors | ✅ Required |
| `PATCH` | `/api/vendors/[id]` | Update vendor | ✅ Required |
| `DELETE` | `/api/vendors/[id]` | Delete vendor | ✅ Required |

### Clients

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `POST` | `/api/clients` | Create client | ✅ Required |
| `GET` | `/api/clients` | List clients | ✅ Required |
| `PATCH` | `/api/clients/[id]` | Update client | ✅ Required |
| `DELETE` | `/api/clients/[id]` | Delete client | ✅ Required |

### Assets & Media

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `POST` | `/api/uploads` | Upload asset/image | ✅ Required |
| `GET` | `/api/qr` | Generate QR code (env-based URL) | ❌ Public |

### Project Content

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `GET` | `/api/revisions` | List project revisions | ✅ Required |
| `GET` | `/api/revisions/[id]` | Get revision details | ✅ Required |

### Public

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `GET` | `/site/[slug]` | View published project | ❌ Public |

---

## Environment Configuration

### Required Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://localhost:3000  # Change to deployment domain
```

### Optional Development Environment Variables

```env
# Dev-Only Fallback Authentication (for local testing without Supabase)
NEXT_PUBLIC_DEV_FALLBACK_AUTH_ENABLED=true
NEXT_PUBLIC_DEV_FALLBACK_EMAIL=admin@local.dev
NEXT_PUBLIC_DEV_FALLBACK_PASSWORD=ChangeMeNow
```

### Environment Variable Usage

- **`NEXT_PUBLIC_SUPABASE_URL`**: Backend-as-a-service endpoint
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Public authentication key for client-side requests
- **`SUPABASE_SERVICE_ROLE_KEY`**: Admin key for server-side requests (never expose to client)
- **`NEXT_PUBLIC_SITE_URL`**: Public domain for QR codes, shareable links, and public URLs
  - Used in `/api/qr` route for QR base URL
  - Used in project links for "Open Live" button
  - Used for QR scanner URLs
  - Change when deploying to production
- **Dev Fallback Variables**: Enable cookie-based auth for local testing without Supabase

---

## Performance Optimizations

### Frontend Optimization

1. **Component Memoization**
   - Sidebar, Header memoized to prevent re-renders
   - Reduces layout thrashing during navigation

2. **Layout Stability**
   - Dashboard shell preserved across route changes
   - Only content area updates during navigation
   - Smooth UX without layout shift

3. **Route Progress Indicator**
   - Provides visual feedback during navigation
   - Improves perceived performance
   - Non-blocking animation

4. **Development Instrumentation**
   - Fetch logging for duplicate/slow requests
   - Stack traces for debugging
   - Production-safe (dev-only)

### Backend Optimization

1. **Efficient Queries**
   - Selective field selection (avoid `select("*")`)
   - Indexed lookups on common fields
   - Batch operations for related inserts

2. **Server-Side Rendering**
   - Pages rendered server-side by default
   - Reduces client-side JavaScript
   - Faster first contentful paint

3. **Database Indexes**
   - Unique constraints on slug, email, etc.
   - Foreign key indexes for joins
   - Composite indexes for common filters

---

## Key TypeScript Types

### Project Types

```typescript
type ProjectListRow = {
  id: string;
  project_name: string;
  status: "draft" | "published" | "archived";
  publish_status: boolean;
  slug: string;
  clients?: ClientRow[];
  vendors?: VendorRow[];
  templates?: TemplateRow[];
};

type ProjectTemplateData = {
  project: ProjectData;
  translations: Record<TemplateLanguageCode, Record<TemplateFieldKey, string | null>>;
  gallery: Array<{ image_url: string; sort_order: number }>;
  assets: Array<{ asset_type: string | null; file_url: string; file_name: string | null }>;
};
```

### Template Types

```typescript
type TemplateFieldKey = 
  | "title" | "subtitle" | "bride_name" | "groom_name"
  | "welcome_message" | "story_title" | "story_text"
  | "venue_name" | "venue_address" | "event_time"
  | "event_date_text" | "rsvp_text" | "footer_message"
  | "family_message" | "custom_note";

type TemplateLanguageCode = "en" | "te" | "hi";
```

---

## Scripts

```bash
# Development
npm run dev              # Start development server (Turbopack)

# Production
npm run build           # Build for production
npm run start           # Start production server

# Maintenance
npm audit              # Check dependencies for vulnerabilities
npm update             # Update dependencies
```

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Smart root route with session check |
| `src/app/(auth)/login/page.tsx` | Login page with auth guard |
| `src/app/dashboard/layout.tsx` | Protected dashboard layout |
| `src/components/dashboard/create-project-form.tsx` | Project creation/edit (with UX fixes) |
| `src/components/dashboard/dashboard-shell.tsx` | Dashboard layout wrapper (memoized) |
| `src/lib/supabase/server.ts` | Server Supabase client |
| `src/app/api/projects/route.ts` | Project CRUD API |
| `src/app/api/qr/route.ts` | QR generation (env-based URL) |
| `middleware.ts` | Route protection middleware |
| `.env.local` | Environment configuration |

---

## Development Guidelines

### Code Quality

- **TypeScript:** Full type coverage; no `any` without justification
- **Components:** Server components by default; client only when needed (`"use client"`)
- **Styling:** Tailwind utilities; avoid custom CSS
- **Error Handling:** Try/catch for async operations; meaningful error messages
- **Performance:** Memoize expensive components; avoid unnecessary re-renders

### Commit Conventions

- Keep commits small and focused
- Use clear commit messages describing the change
- Reference issues/PRs where relevant

### Testing & Debugging

- Use dev console for network instrumentation (fetch logs)
- Check Supabase dashboard for database state
- Test with both authenticated and unauthenticated flows

---

## Future Enhancements

- [ ] Analytics dashboard for project metrics
- [ ] Email notifications for status changes
- [ ] Template marketplace
- [ ] Batch project operations
- [ ] Advanced revision comparison
- [ ] Team collaboration features
- [ ] Custom domain support

---

## Support & Resources

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs/

---

**Generated:** April 30, 2026  
**Last Update:** Session Persistence, Database Migration, UX Optimization, Save Draft Flow
