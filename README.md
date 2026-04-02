# SlotPilot - Professional Booking & Scheduling System

SlotPilot is a production-ready PWA for service businesses to manage their appointments, services, and customers.

## Features

- **PWA Support**: Installable on mobile and desktop, works offline for providers.
- **Real-time Calendar**: Weekly view of all appointments with drag-and-drop support (coming soon).
- **Smart Slot Engine**: Automatically calculates available time slots based on complex rules.
- **Public Booking Page**: Conversion-optimized booking flow for your customers.
- **Analytics Dashboard**: Track revenue, bookings, and customer trends.
- **Customer CRM**: Manage customer profiles and booking history.

## Tech Stack

- **Frontend**: React 19, Vite 6, Tailwind CSS 4, Framer Motion.
- **Backend**: Firebase Auth & Firestore.
- **State Management**: Zustand & TanStack Query.
- **Offline Cache**: Dexie.js.

## Integration

To embed the booking widget on your website, use the following snippet:

```html
<script src="https://slotpilot.app/widget/book-me-widget.js"></script>
<book-me-widget provider-id="YOUR_PROVIDER_ID"></book-me-widget>
```

## Setup

1. Login with your Google account.
2. Complete your provider profile.
3. Add your services and working hours.
4. Share your booking link with your customers!
