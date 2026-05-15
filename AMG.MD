# 🏥 Aden Medical Guide (PWA)
### *The Ultimate Offline-First Intelligent Health Directory for Aden City*

---

## 📑 Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Core Value Proposition](#2-core-value-proposition)
3. [Key Features & Product Logic](#3-key-features--product-logic)
4. [UI/UX Design System (Liquid Glass)](#4-uiux-design-system-liquid-glass)
5. [Technical Architecture & Stack](#5-technical-architecture--stack)
6. [PWA & Offline Strategy](#6-pwa--offline-strategy)
7. [Database Schema (Supabase)](#7-database-schema-supabase)
8. [Security, Privacy & Roles](#8-security-privacy--roles)
9. [Project Roadmap](#9-project-roadmap)
10. [Non-Goals (Scope Boundaries)](#10-non-goals-scope-boundaries)

---

## 1. Executive Summary
**Aden Medical Guide** is a high-performance, Progressive Web Application (PWA) designed to serve as a reliable, centralized medical directory for Aden, Yemen. It solves the critical issue of fragmented, outdated medical information scattered across social media platforms. By utilizing an "Offline-First" architecture, the app ensures that citizens can access verified doctors, on-duty pharmacies, and emergency services instantly, even in extreme low-connectivity environments.

---

## 2. Core Value Proposition
- **Verified Accuracy over Crowdsourcing:** Replaces unreliable public reviews with a rigorous "Verified Badge" system. 
- **Zero-Latency Access:** Engineered as a PWA with advanced caching to load instantly, regardless of network conditions.
- **Modern User Experience:** Features a premium, native-app-like interface utilizing a "Liquid Glass" dark-mode design system.
- **Community-Driven Updates:** Empowers users to report changes securely, ensuring the database remains a living, accurate resource.

---

## 3. Key Features & Product Logic

### 🔍 Smart Search & Discovery
- **Fuzzy Search API:** Tolerates typos in both Arabic and English queries.
- **Geographic Filtering:** Precise filtering across Aden’s 8 districts (Crater, Sheikh Othman, Al-Mansoura, etc.).
- **Smart Ranking:** Results are sorted dynamically by:
  1. Verification Status (Verified providers appear first).
  2. "Last Updated" timestamp.
  3. Click-to-call frequency.

### 📇 Provider Profiles (The Liquid Card)
- **Bottom Sheet UI:** Doctor details open via a smooth, non-intrusive bottom sheet rather than a new page.
- **Live Status Indicator:** Real-time 🟢 Open Now / 🔴 Closed indicator based on the current time and provider's schedule.
- **Actionable Data:** Direct "Click-to-Call" buttons and integrated Dark-Mode Google Maps routing.
- **Offline Favorites:** Users can tap a 'Heart' icon to save a provider's full profile to their device's `LocalStorage` for guaranteed offline access.

### 🚨 Emergency & Critical Services
- **Emergency Hub:** A dedicated quick-access floating button for Ambulance, Civil Defense, Blood Banks, and Oxygen Centers.
- **On-Duty Pharmacies:** A dynamic section highlighting pharmacies operating 24/7 or currently on night shifts.
- **Offline First-Aid Guide:** Text-based, locally stored emergency medical protocols accessible without any internet connection.

### 🤝 Community & Growth Loops
- **Missing Data Reporting:** Users can submit "Suggest a Clinic" forms to expand the database.
- **Update Flagging:** One-click reporting for broken phone numbers or relocated clinics.
- **QR Code Integration:** Auto-generated QR codes for clinics to display on their doors, linking directly to their verified in-app profile.

---

## 4. UI/UX Design System (Liquid Glass)

The application utilizes a **Glassmorphism / Liquid Glass** aesthetic in a strict Dark Mode environment to reduce eye strain and provide a premium, modern feel.

### Visual Guidelines
- **Base Theme:** Deep Navy/Slate Black (`#050A18`).
- **Glass Effect:** Heavy use of `backdrop-filter: blur(12px) to blur(24px)` with `rgba(255, 255, 255, 0.05)` backgrounds.
- **Borders & Shadows:** Ultra-thin, semi-transparent borders (`1px solid rgba(255, 255, 255, 0.1)`) with soft, diffused drop shadows.
- **Gradients:** Subtle mesh gradients in the background (deep blues and purples) to give depth behind the glass cards.

### Typography & i18n
The app fully supports dynamic layout switching (RTL for Arabic, LTR for English).
- **Arabic UI:** - Primary: `Tajawal` (Highly legible on small screens).
  - Headers: `Cairo`.
- **English UI:** - Primary: `Inter`.
  - UI Elements: `Poppins`.

### Animations
- **Framer Motion:** Used for fluid state transitions, bottom-sheet sliding, and micro-interactions (e.g., subtle card scaling on click).

---

## 5. Technical Architecture & Stack

Designed for maximum speed, maintainability, and compatibility with AI-assisted development tools (like Antigravity/Cursor).

- **Frontend Framework:** `Next.js 14+` (App Router).
- **Styling:** `Tailwind CSS` (Configured for Glassmorphism utilities).
- **State Management:** `Zustand` (for Theme, Language, and Offline states).
- **Backend/Database:** `Supabase` (PostgreSQL, Auth, Edge Functions).
- **Deployment & Hosting:** `Vercel` (Provides native Next.js optimization and Edge networking).
- **Version Control:** `GitHub`.

---

## 6. PWA & Offline Strategy

To combat unstable internet infrastructure:
- **Workbox / next-pwa:** Used to generate the `manifest.json` and configure Service Workers.
- **Cache-First Strategy for Assets:** Fonts, icons, and the App Shell are cached permanently upon the first visit.
- **Stale-While-Revalidate for Data:** API responses (`/api/doctors`) are cached. The user immediately sees the cached list while the app fetches fresh data in the background.
- **Background Sync API:** If a user submits a "Report Error" form while offline, the payload is held in `IndexedDB` and automatically dispatched to Supabase once the connection is restored.
- **Image Optimization:** Implementation of the "Blur-Up" technique using lightweight SVGs as placeholders until high-res images load.

---

## 7. Database Schema (Supabase)

High-level overview of the core PostgreSQL tables:

### `providers` Table
- `id` (uuid, PK)
- `name_ar` / `name_en` (text)
- `specialty_ar` / `specialty_en` (text)
- `district_id` (uuid, FK)
- `phone_numbers` (jsonb array)
- `Maps_url` (text)
- `working_hours` (jsonb)
- `is_verified` (boolean, default: false)
- `last_updated` (timestamp)

### `districts` Table
- `id` (uuid, PK)
- `name_ar` / `name_en` (text)

### `reports` Table (Community loop)
- `id` (uuid, PK)
- `provider_id` (uuid, FK)
- `report_type` (enum: 'wrong_number', 'moved', 'closed')
- `status` (enum: 'pending', 'resolved', 'dismissed')
- `created_at` (timestamp)

---

## 8. Security, Privacy & Roles

### User Privacy
- **Zero-Logging Search:** Search queries are not logged against user IPs or identifiers. Medical inquiries remain strictly confidential.
- **Rate Limiting:** Implemented on API routes (specifically `/api/report`) to prevent spam and DDoS attempts.

### Access Control (RBAC)
- **Admin:** Full CRUD access to all tables, approves 'Verified' badges.
- **Moderator:** Can review community reports and update provider details.
- **Public (Unauthenticated):** Read-only access to provider data, ability to submit reports anonymously.

---

## 9. Project Roadmap

- **Phase 1: Foundation (MVP)**
  - Database schema setup in Supabase.
  - Next.js UI Shell with Liquid Glass styling.
  - Basic District & Specialty filtering.
- **Phase 2: Progressive Enhancement**
  - i18n implementation (RTL/LTR).
  - Bottom Sheet integration and Framer Motion animations.
  - PWA configuration and Service Worker caching.
- **Phase 3: Smart Features**
  - Emergency Hub and Offline First-Aid.
  - "Live Status" logic implementation.
  - Community Report/Suggestion forms.
- **Phase 4: Launch & Scale**
  - Vercel Deployment.
  - Beta testing with the Aden medical community.
  - Admin Dashboard finalization.

---

## 10. Non-Goals (Scope Boundaries)
To ensure the MVP remains focused, lightweight, and legally safe, the following features are strictly **excluded** from the current scope:
1. **No Public Ratings/Reviews:** To prevent review-bombing, defamation, and fake praise.
2. **No In-App Messaging:** Users must use standard phone calls or WhatsApp. The app does not host doctor-patient chats.
3. **No Complex Booking System:** The platform acts as a directory and guide, not a clinic management or appointment scheduling software.
4. **No Mandatory User Login:** Citizens should be able to access life-saving numbers and doctor profiles instantly without creating an account.

---
*End of Document.*

