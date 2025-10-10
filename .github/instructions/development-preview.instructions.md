---
applyTo: '**'
---

# Development Preview Instructions

This document provides step-by-step instructions for running and previewing the application during local development.

---

## Prerequisites

- **Node.js**: Version specified in `.tool-versions` (currently using asdf)
- **pnpm**: Package manager (install via `npm install -g pnpm` if needed)
- **Firebase CLI**: Required for emulator (install via `pnpm install` or `npm install -g firebase-tools`)

---

## Local Development Workflow

### 1. Start Firebase Emulators with Next.js Dev Server

Firebase emulators provide a local environment for Firestore, Authentication, and other Firebase services. The emulator automatically starts the Next.js development server as configured in `firebase.json`.

```bash
pnpm emu
```

**What this does:**
- Starts Firebase emulators (Firestore, Auth, etc.)
- Automatically starts Next.js dev server via `apphosting.startCommand`
- Imports data from `emudata/` directory
- Exports data back to `emudata/` on exit
- Emulator UI accessible at `http://localhost:4000`

**Important notes:**
- Keep this terminal running while developing
- Data persists between sessions via the `emudata/` directory
- Default ports:
  - Next.js app: `http://localhost:5002` (via apphosting emulator)
  - Firestore: 8081
  - Auth: 9099
  - Emulator UI: 4000

**Environment variables:**
- Create `.env.local` with Firebase configuration
- The app will connect to local emulators automatically in development mode

### 2. Access the Application

Open your browser and navigate to:

```
http://localhost:5002
```

**Development features:**
- Hot Module Replacement (HMR) - changes reflect immediately
- React DevTools integration
- Next.js Fast Refresh for component state preservation
- Detailed error messages with stack traces
- Firebase Emulator UI at `http://localhost:4000` for debugging Firestore and Auth

---

## Alternative: Production Preview

To test the production build locally:

```bash
# 1. Build the application
pnpm build

# 2. Start the production server
pnpm start
```

**Differences from dev mode:**
- No hot reload
- Optimized bundles
- Production-level performance
- Mirrors deployed behavior

---

## Common Development Tasks

### Running Linter

Check code quality and style:

```bash
pnpm lint
```

### Clearing Next.js Cache

If you encounter unexpected behavior:

```bash
rm -rf .next
pnpm dev
```

---

## Troubleshooting

### Port Already in Use

If ports are occupied:

```bash
# Find and kill process on port 5002 (Next.js via apphosting)
lsof -ti:5002 | xargs kill -9

# Find and kill process on port 4000 (Firebase Emulator UI)
lsof -ti:4000 | xargs kill -9
```

### Firebase Emulator Connection Issues

Ensure your Firebase configuration points to emulators in development:

```typescript
// src/firebase/index.ts should include:
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8081);
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

### Module Resolution Errors

If you see TypeScript or module errors:

```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install
```

---

## Summary: Quick Start Commands

For daily development, run this command:

```bash
# Start Firebase Emulators with Next.js
pnpm emu
```

Then open `http://localhost:5002` in your browser.

---

## Related Documentation

- [Next.js Best Practices](nextjs.instructions.md)
- [Main README](../../README.md)
- Firebase Documentation: https://firebase.google.com/docs/emulator-suite
- Next.js Documentation: https://nextjs.org/docs
