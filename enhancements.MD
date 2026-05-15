## 4. UI/UX Design System: Functional "Liquid Glass"

The **Liquid Glass (Glassmorphism)** aesthetic is not merely decorative; it is deeply integrated into the app's User Experience to solve cognitive load issues and manage visual hierarchy effectively.

### Functional Aesthetics
- **Context Preservation:** By using `backdrop-filter: blur(16px)` on the Bottom Sheets and Modals, users can still subconsciously see the search feed behind the active window. This assures them they haven't lost their place or navigated to a dead end.
- **Visual Hierarchy:** - *Base Layer (Deep Navy `#050A18`):* Represents the static background.
  - *Middle Layer (20% Opacity Glass):* Used for standard provider cards.
  - *Top Layer (40% Opacity Glass + Subtle White Border):* Used for active elements like the Emergency Hub or the currently opened Doctor Profile.
- **Haptic & Visual Feedback:** Interactive glass elements feature an "Inner Glow" (`box-shadow: inset 0 0 10px rgba(255,255,255,0.1)`) that triggers upon touch, providing tactile visual feedback without heavy animations.

---

## 8. Advanced Admin Dashboard & Command Center

The platform features a hidden, highly secure Admin Control Panel built for operational efficiency and real-time community management. It goes beyond simple data entry, acting as the nervous system of the application.

### 🎛️ Module 1: Provider Management & Auditing
- **One-Click Verification:** Admins can review pending community reports, verify the data, and toggle the `is_verified` boolean, instantly updating the UI for all users.
- **Audit Logs:** A transparent ledger showing exactly which moderator/admin updated a specific clinic's data and when.

### 📢 Module 2: Active Push Notification Engine (Command Center)
This is a fully functional Web Push API integration (not a mock-up), designed to reach users directly on their device lock screens.

- **Notification Composer Form:** A dedicated interface using Liquid Glass styling where the admin inputs:
  - `Title` (e.g., "Urgent Blood Donation Request").
  - `Body` (e.g., "O- Negative blood needed immediately at Al-Buraq Hospital.").
  - `Target URL` (Deep link to a specific hospital or page in the app).
- **Smart Audience Targeting:** Notifications aren't just blasted to everyone. The admin can select:
  - *Broadcast All:* To all registered devices in Aden.
  - *Geo-Targeted:* Only to users who have their primary district set to "Al-Mansoura" or "Crater".
- **Emergency Override UI:** If an admin marks a notification as `Emergency`, the payload triggers a distinct red-tinted Glassmorphic alert banner inside the PWA, ensuring it catches the user's eye immediately upon opening the app.

---

## 9. Technical PWA & Notification Strategy

To ensure notifications are delivered reliably:
- **Web Push API & VAPID Keys:** Integrated via Supabase Edge Functions to handle the secure delivery of messages to subscribed service workers.
- **Subscription Management:** Users are prompted to allow notifications (using a soft, non-intrusive Glassmorphic modal) explaining *why* they should accept (e.g., "Get alerted for emergency pharmacy shifts"). Their unique device tokens are saved securely in the `push_subscriptions` table.
- **iOS & Android Compliance:** Built to respect modern PWA standards, noting that iOS users will be prompted to "Add to Home Screen" to unlock full Push Notification capabilities.

---

## 10. Database Schema Additions (Supabase)

*(Add these to the existing schema section)*

### `push_subscriptions` Table (For Notification Engine)
- `id` (uuid, PK)
- `endpoint` (text, unique) - *The device's unique push address.*
- `auth_keys` (jsonb) - *p256dh and auth keys for secure payload encryption.*
- `preferred_district_id` (uuid, FK, nullable) - *For targeted geographic alerts.*
- `created_at` (timestamp)

### `broadcast_logs` Table (Admin History)
- `id` (uuid, PK)
- `admin_id` (uuid, FK)
- `message_title` (text)
- `target_audience` (text)
- `sent_at` (timestamp)
