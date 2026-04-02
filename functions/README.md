# SpotPilot Firebase Functions

Automatische E-Mail-Benachrichtigungen für Buchungen.

## Setup

### 1. Firebase CLI installieren
```bash
npm install -g firebase-tools
firebase login
```

### 2. Dependencies installieren
```bash
cd functions
npm install
```

### 3. E-Mail-Konfiguration setzen
```bash
# Gmail App-Passwort erstellen: https://myaccount.google.com/apppasswords
firebase functions:config:set gmail.email="deine-email@gmail.com" gmail.password="dein-app-password"
```

### 4. Deploy
```bash
firebase deploy --only functions
```

## Funktionen

| Function | Trigger | Beschreibung |
|----------|---------|--------------|
| `sendBookingConfirmation` | Firestore onCreate | Sendet Bestätigungs-E-Mail bei neuer Buchung |
| `resendConfirmation` | HTTP POST | Manuelles erneutes Senden |
| `sendReminderEmails` | Scheduled (18:00) | Tägliche Erinnerungen für morgen |

## E-Mail-Template

Das Template ist in `src/index.ts` als Handlebars-Template definiert.

Variablen:
- `businessName` - Name des Dienstleisters
- `customerName` - Name des Kunden
- `reference` - Buchungsnummer (z.B. SP-A1B2C3)
- `serviceName` - Name der Dienstleistung
- `date` - Datum (YYYY-MM-DD)
- `time` - Uhrzeit (HH:mm)
- `duration` - Dauer in Minuten
- `staffName` - Name des Mitarbeiters (optional)
- `price` - Preis
- `bookingUrl` - Link zur Buchungsverwaltung

## Lokale Entwicklung

```bash
# Emulator starten
npm run serve

# Function testen
firebase functions:shell
> sendBookingConfirmation({...})
```

## Troubleshooting

### "Invalid login"
- Gmail App-Passwort verwenden (nicht normales Passwort)
- 2-Faktor-Auth muss aktiv sein

### "Function execution failed"
- Logs prüfen: `firebase functions:log`
- Firestore-Regeln prüfen (Function braucht Leserechte)

## ToDo

- [ ] SendGrid statt Gmail (bessere Zustellbarkeit)
- [ ] SMS-Benachrichtigungen (Twilio)
- [ ] ICS-Kalender-Datei anhängen
- [ ] Mehrsprachige Templates
