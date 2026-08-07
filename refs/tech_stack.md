# Tech Stack & Architecture Configuration

This document defines the architectural boundaries, tech stack specifications, and development conventions for the integrated LMS & E-Rapor Monolith platform. Agentic AI must adhere strictly to these constraints when generating code.

---

## 1. Core Architecture
- **Pattern:** Monolithic Web Application (Modular Structure)
- **Deployment Target:** Serverless / Edge-ready Environment
- **Data flow:** Strict Type-safe Server-to-Client propagation

---

## 2. Technology Stack Specification

| Component | Technology | Version / Specifics |
| :--- | :--- | :--- |
| **Framework** | Next.js | v16+ (App Router, React Server Components) |
| **Styling** | Tailwind CSS | Utility-first styling |
| **UI Components** | shadcn/ui | Radix UI primitives, modern minimalist style |
| **Media CRM** | Cloudinary | v2 |
| **Database** | Supabase | Managed PostgreSQL (Host) |
| **ORM** | Prisma | Type-safe Client generation |
| **Authentication** | Clerk | Managed Identity Provider + Session Management |
| **Validation** | Zod | Schema-based validation (Form & API boundaries) |

---

## 3. Database & ID Strategy (UUIDv7)
- **Primary Keys:** Every table MUST use **UUIDv7** as its Primary Key type.
- **Generation Logic:** Since ID indexing depends on time-ordering, UUIDv7 is enforced at any layer (application, database, or ORM) that doesn't already have a time-ordered ID and doesn't face directly to users.
- **Data Integrity:** Application-level validation must enforce unique checks to prevent double-enrollments and overlapping school years (e.g., verifying `student_id` is unique per active `academic_year_id`).

---

## 4. Integration Guidelines for Agentic AI

### A. Authentication & User Syncing
1. Clerk handles the frontend authentication flow and session state.
2. **Database Sync:** The application relies on a Clerk Webhook listener (`/api/webhooks/clerk`). When a user signs up, Clerk pushes a webhook payload containing the `id`, `email`, and `metadata.role`.
3. The webhook handler must use Prisma to upsert the user into the local database `USERS` table to maintain relational integrity with classes, submissions, and grades.

### B. Validation & Type Boundaries
- **Form Submission:** Every form interaction must be validated using a Zod schema before hitting the server.
- **Server Actions:** Next.js Server Actions must parse inputs using `zodSchema.safeParse(formData)`. Never trust client-side payloads blindly.
- **Database Types:** Use Prisma-generated types (`User`, `Class`, etc.) as the baseline source of truth for application types.

### C. Folder Structure Conventions
Agentic AI must organize the monolithic application using the standard Next.js App Router convention:
```text
├── app/
│   ├── (auth)/           # Clerk Auth route groupings
│   ├── (dashboard)/      # Protected LMS dashboards (Role-split routing)
│   │   ├── admin/
│   │   ├── guru/
│   │   └── siswa/
│   ├── api/              # Webhooks and external integrations if needed
│   └── layout.tsx
├── components/           # Reusable shadcn/ui and custom components
├── lib/                  # Prisma client instance, Zod schemas, utilities
├── services/             # Core business logic and data access that is shared across the application
├── types/               # TypeScript shared type definitions
├── schemas/             # Zod schemas for form validation and data parsing
└── prisma/
    └── schema.prisma     # Single source of truth database design
