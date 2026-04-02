# SlotPilot - Empfohlene Skills

## 🔥 Priorität 1: Sofort einrichten

### 1. feishu-calendar (oder wecom-schedule)
**Warum:** Dein Buchungssystem braucht Kalender-Integration
- Export von Terminen in persönliche Kalender
- Frei/Belegt-Check für Mitarbeiter
- Erinnerungen versenden

**Verwendung:**
```typescript
// Wenn ein Kunde bucht → Termin in Provider-Kalender
feishu_calendar_event create \
  --summary "Haarschnitt - Max Mustermann" \
  --start_time "2026-04-05T14:00:00+08:00" \
  --end_time "2026-04-05T15:00:00+08:00" \
  --attendees [{"type":"user","id":"mitarbeiter_open_id"}]
```

### 2. feishu-bitable (oder wecom-smartsheet)
**Warum:** Ersetzt Firestore für komplexe Daten
- Mitarbeiter-Verwaltung mit Berechtigungen
- Verfügbarkeits-Tabellen (einfacher als Firestore)
- Buchungs-Logs und Analytics

**Verwendung:**
```typescript
// Mitarbeiter-Tabelle
| Name | E-Mail | Services | Mo | Di | Mi | Do | Fr |
|------|--------|----------|----|----|----|----|----|

// Automatisch freie Slots berechnen via Formeln
```

---

## ⚡ Priorität 2: Workflow-Automation

### 3. tts (Text-to-Speech)
**Warum:** Erinnerungs-Anrufe für Termine
```typescript
// Cron Job: Täglich um 18:00
// "Guten Abend, Sie haben morgen um 14:00 Uhr einen Termin bei..."
```

### 4. web_search / kimi_search
**Warum:**
- Konkurrenz-Analyse anderer Buchungssysteme
- Best Practices für UX recherchieren
- Firebase/Stripe Docs durchsuchen

---

## 🛠️ Priorität 3: Entwicklung

### 5. browser
**Warum:** E2E-Testing der Buchungs-Flows
```typescript
// Test: Öffentliche Buchungsseite
browser open https://slotpilot.app/book/test-provider
browser act --kind click --ref "Service auswählen"
browser act --kind type --ref "Name" --text "Max Mustermann"
```

### 6. exec (bereits aktiv)
**Nutzen:**
- Firebase Emulator starten
- Deployments automatisieren
- GitHub CLI für Releases

---

## 📝 Skill-Kombinationen für SlotPilot

### Szenario 1: Mitarbeiter onboarding
```
1. feishu_search_user → Mitarbeiter in Firmen-Directory finden
2. feishu_bitable_app_table_record create → In Staff-Tabelle eintragen
3. feishu_calendar_calendar get → Mitarbeiter-Kalender verbinden
4. feishu_im_user_message send → Willkommensnachricht
```

### Szenario 2: Buchung erhalten
```
1. Kunde bucht auf slotpilot.app/book/provider
2. SlotPilot erstellt Booking in Firestore
3. feishu_calendar_event create → Termin in Mitarbeiter-Kalender
4. tts → Erinnerung generieren (optional)
5. feishu_im_user_message send → Mitarbeiter benachrichtigen
```

### Szenario 3: Täglicher Report
```
1. Cron: Jeden Tag um 08:00
2. feishu_bitable_app_table_record list → Heutige Buchungen
3. md-to-pdf → Tagesübersicht generieren
4. message send → An Admin
```

---

## 🎯 Empfohlene Installation

```bash
# Sofort (Priorität 1)
openclaw skills install feishu-calendar
openclaw skills install feishu-bitable

# Bald (Priorität 2)  
openclaw skills install tts
openclaw skills install kimi-search

# Optional (Priorität 3)
openclaw skills install browser
```

---

## 💡 Pro-Tip: Skill statt Code

Statt Slot-Berechnung selbst zu coden:
```
feishu_calendar_freebusy list \
  --time_min "2026-04-05T09:00:00+08:00" \
  --time_max "2026-04-05T18:00:00+08:00" \
  --user_ids ["mitarbeiter_1", "mitarbeiter_2"]
```
→ Liefert direkt freie Zeitfenster, ohne eigene Logik!

---

**Fazit:** Mit feishu-calendar + feishu-bitable sparst du dir ~40% der Backend-Logik. Die Skills übernehmen Kalender-Sync, Verfügbarkeits-Checks und Benachrichtigungen.
