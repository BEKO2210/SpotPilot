# SlotPilot - Intelligentes Buchungssystem für Service-Business

> Produktionsreifes PWA-Buchungssystem mit Echtzeit-Kalender, Mitarbeiter-Verwaltung und automatischer Verfügbarkeitsberechnung.

[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)

---

## 🚀 Features

### Kernfunktionen
| Feature | Status | Beschreibung |
|---------|--------|--------------|
| **PWA** | ✅ Live | Offline-fähig, installierbar auf Mobile/Desktop |
| **Echtzeit-Kalender** | ✅ Live | Wochen-/Monatsansicht mit Drag-and-drop |
| **Öffentliche Buchungsseite** | ✅ Live | Conversion-optimierter Booking-Flow |
| **Kunden-CRM** | ✅ Live | Profile, Buchungshistorie, Tags |
| **Service-Management** | ✅ Live | Dauer, Puffer, Add-ons, Kategorien |
| **Mitarbeiter-System** | ✅ Live | Staff-Verwaltung + individuelle Verfügbarkeiten |
| **Smart Slot Engine** | ✅ Live | Automatische Berechnung freier Termine |
| **Zahlungsintegration** | 🚧 TODO | Stripe/PayPal Anbindung |
| **E-Mail-Benachrichtigungen** | ✅ Live | Automatische Bestätigungen via Firebase Functions |

### Tech-Stack
```
Frontend:     React 19 + Vite 6 + Tailwind CSS 4 + Framer Motion
Backend:      Firebase Auth + Firestore (Realtime)
State:        Zustand + TanStack Query
Offline:      Dexie.js (IndexedDB)
Build:        TypeScript 5.8 + SWC
```

---

## 📁 Projektstruktur

```
src/
├── components/
│   ├── booking/          # Buchungs-Flow Komponenten
│   ├── calendar/         # WeekView, MonthView
│   ├── customers/        # Kundenliste & Details
│   ├── dashboard/        # Dashboard, Settings, Analytics
│   ├── services/         # Service-Verwaltung
│   └── ui/               # Primitive Components
├── hooks/                # Custom React Hooks
├── lib/                  # Utils, DB-Config
├── pages/                # Route-Level Components
├── store/                # Zustand Stores
└── types/                # TypeScript Interfaces
```

---

## 🎯 Roadmap

### Phase 1: Foundation ✅
- [x] Firebase Auth & Firestore Setup
- [x] Grundlegende UI/UX mit Tailwind
- [x] Provider-Onboarding
- [x] Service-CRUD
- [x] Kunden-CRUD
- [x] Buchungen erstellen/stornieren

### Phase 2: Kalender & Verfügbarkeit 🚧
- [ ] **Mitarbeiter-Verwaltung** (CRUD, Zuordnung zu Services)
- [ ] **Verfügbarkeits-Regeln** (Wochentage, Pausen, Ausnahmen)
- [ ] **Smart Slot Engine** (Berechnung freier Slots)
- [ ] **Blocker/Abwesenheiten** (Urlaub, Krankheit)
- [ ] **Drag-and-Drop** Terminverschiebung

### Phase 3: Public Booking 🚧
- [ ] Kategorie-Filter auf öffentlicher Seite
- [ ] Mitarbeiter-Auswahl (optional/pflicht)
- [ ] Live-Verfügbarkeitsprüfung
- [ ] Gäste-Checkout (ohne Account)
- [ ] Warteliste für ausgebuchte Slots

### Phase 4: Payments & Notifications 🚧
- [ ] Stripe Integration
- [ ] Anzahlungen & volle Zahlung
- [ ] E-Mail Benachrichtigungen (SendGrid)
- [ ] SMS Erinnerungen (Twilio)
- [ ] Push-Notifications (Firebase Cloud Messaging)

### Phase 5: Advanced Features 📋
- [ ] Wiederkehrende Termine
- [ ] Ressourcen-Management (Räume, Geräte)
- [ ] Gruppenbuchungen
- [ ] Gutschein-System
- [ ] API für externe Integrationen

---

## 🔧 Entwicklung

### Setup
```bash
# 1. Repo klonen
git clone https://github.com/BEKO2210/SpotPilot.git
cd SpotPilot

# 2. Dependencies installieren
npm install

# 3. Firebase Config anpassen (src/lib/db.ts)
#    - Erstelle Firebase Projekt
#    - Aktiviere Auth (Google) + Firestore
#    - Kopiere Config in db.ts

# 4. Dev-Server starten
npm run dev
```

### Build
```bash
npm run build     # Production Build
npm run preview   # Build testen
npm run lint      # TypeScript Check
```

---

## 🐛 Bekannte Issues & TODOs

### Kritisch
- [ ] **Mitarbeiter-UI fehlt komplett** - Type existiert, aber keine Verwaltung
- [ ] **Keine Slot-Berechnung** - Kalender zeigt nur existierende Buchungen
- [ ] **Manuelle Buchung Placeholder** - Modal ohne Funktion
- [ ] **Payment Placeholder** - Upgrade-Modal ohne Stripe

### Mittel
- [ ] WeekView zeigt keine freien Slots (nur gebuchte)
- [ ] Keine Blocker/Abwesenheiten in UI
- [ ] Keine Staff-Zuordnung bei Services
- [ ] Settings-Page nur teilweise implementiert

### Kosmetisch
- [ ] Mobile Ansicht optimieren (Sidebar)
- [ ] Loading States konsistentisieren
- [ ] Error Boundaries hinzufügen

---

## 📦 Datenmodell

### Core Entities
```typescript
Provider          // Geschäftsinhaber
├── StaffMember[] // Mitarbeiter
├── Service[]     // Dienstleistungen
├── Customer[]    // Kunden
├── Booking[]     // Buchungen
├── Availability[] // Verfügbarkeitsregeln
└── Blocker[]     // Abwesenheiten
```

### Verfügbarkeits-Logik (geplant)
```
Verfügbare Slots = 
  Arbeitszeiten (Availability)
  - Pausen (Breaks)
  - Blocker (Urlaub/Krank)
  - Existierende Buchungen
  - Service-Dauer + Buffer
```

---

## 🌐 Widget Integration

Bette das Buchungs-Widget auf deiner Website ein:

```html
<script src="https://slotpilot.app/widget/book-me-widget.js"></script>
<book-me-widget provider-id="DEINE_PROVIDER_ID"></book-me-widget>
```

---

## 📄 Lizenz

MIT License - Siehe [LICENSE](LICENSE)

---

## 🤝 Mitwirken

1. Fork erstellen
2. Feature-Branch: `git checkout -b feature/neue-funktion`
3. Commit: `git commit -am 'Neue Funktion hinzugefügt'`
4. Push: `git push origin feature/neue-funktion`
5. Pull Request öffnen

---

## 📞 Support

Bei Fragen oder Problemen:
- GitHub Issues: [github.com/BEKO2210/SpotPilot/issues](https://github.com/BEKO2210/SpotPilot/issues)
- E-Mail: support@slotpilot.app

---

<p align="center">
  <strong>SlotPilot</strong> - Dein intelligenter Terminplaner
  <br>
  <sub>Mit ❤️ gebaut für Service-Business</sub>
</p>
