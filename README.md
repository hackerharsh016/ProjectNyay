# Project Nyaya

A civic discussion platform built with Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui, and Prisma.

## Architecture & Conventions

This project strictly adheres to a Modular Monolith architecture as defined in `AGENTS.md`. 
Any human or AI contributor must respect these rules:

1. **Modular Separation**: All business logic, repositories, and validators live in `modules/<domain>/`. The `app/` folder is strictly for Next.js routing and UI components.
2. **Database Access**: Prisma queries must only happen inside `modules/<domain>/<domain>.repository.ts`. UI components and route handlers must never call Prisma directly.
3. **Validation**: All incoming data (params, bodies, forms) must be validated with Zod in the `app/` boundary or `validators/` folder before being passed to business logic.
4. **Middlewares**: Cross-cutting concerns like Auth, rate-limiting, and feature flags live in `middlewares/` (used via Next.js middleware or HOFs for route handlers/actions).
5. **Events**: Cross-module communication (e.g., user created -> send email) must happen via the `events/` folder to prevent tight coupling.
6. **Strict Types**: The project uses strict TypeScript rules. No `any` types. Run `npm run typecheck` to verify.

## Getting Started

1. Copy `.env.example` to `.env` and fill in the required variables.
2. Run `npm install`
3. Start the development server with `npm run dev`
