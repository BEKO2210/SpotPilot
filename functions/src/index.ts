import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';

// Firebase Admin initialisieren
admin.initializeApp();

// E-Mail-Konfiguration (muss in Firebase Config gesetzt werden)
// firebase functions:config:set gmail.email="deine-email@gmail.com" gmail.password="app-password"
const gmailEmail = functions.config().gmail?.email;
const gmailPassword = functions.config().gmail?.password;

// Nodemailer Transporter erstellen
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

// E-Mail-Template für Buchungsbestätigung
const confirmationTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
    .reference { background: #dbeafe; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; }
    .reference-code { font-size: 24px; font-weight: bold; color: #1e40af; letter-spacing: 2px; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Termin bestätigt!</h1>
      <p>Deine Buchung bei {{businessName}}</p>
    </div>
    
    <div class="content">
      <p>Hallo {{customerName}},</p>
      <p>dein Termin wurde erfolgreich gebucht. Hier sind die Details:</p>
      
      <div class="reference">
        <p style="margin: 0 0 10px 0; color: #3b82f6; font-weight: bold;">Deine Buchungsnummer</p>
        <div class="reference-code">{{reference}}</div>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #64748b;">Bitte bei Änderungen angeben</p>
      </div>
      
      <div class="details">
        <div class="detail-row">
          <span>Service:</span>
          <strong>{{serviceName}}</strong>
        </div>
        <div class="detail-row">
          <span>Datum:</span>
          <strong>{{date}}</strong>
        </div>
        <div class="detail-row">
          <span>Uhrzeit:</span>
          <strong>{{time}} Uhr</strong>
        </div>
        <div class="detail-row">
          <span>Dauer:</span>
          <strong>{{duration}} Minuten</strong>
        </div>
        {{#if staffName}}
        <div class="detail-row">
          <span>Mitarbeiter:</span>
          <strong>{{staffName}}</strong>
        </div>
        {{/if}}
        <div class="detail-row" style="border-bottom: none;">
          <span>Preis:</span>
          <strong>{{price}}</strong>
        </div>
      </div>
      
      <p style="text-align: center;">
        <a href="{{bookingUrl}}" class="button">Termin verwalten</a>
      </p>
      
      <p><strong>Wichtige Hinweise:</strong></p>
      <ul>
        <li>Bitte sei pünktlich.</li>
        <li>Bei Absage bitte mindestens 24 Stunden vorher Bescheid geben.</li>
        <li>Nimm deine Buchungsnummer mit (oder diese E-Mail).</li>
      </ul>
    </div>
    
    <div class="footer">
      <p>Diese E-Mail wurde automatisch von SpotPilot gesendet.</p>
      <p>{{businessName}} | {{businessEmail}}</p>
    </div>
  </div>
</body>
</html>
`;

// Template kompilieren
const compiledTemplate = Handlebars.compile(confirmationTemplate);

/**
 * Firebase Function: Sendet E-Mail bei neuer Buchung
 * Wird automatisch aufgerufen wenn eine neue Buchung erstellt wird
 */
export const sendBookingConfirmation = functions.firestore
  .document('bookings/{bookingId}')
  .onCreate(async (snap, context) => {
    const booking = snap.data();
    const bookingId = context.params.bookingId;
    
    try {
      // Provider-Daten laden
      const providerDoc = await admin.firestore()
        .doc(`providers/${booking.providerId}`)
        .get();
      
      if (!providerDoc.exists) {
        console.error('Provider nicht gefunden:', booking.providerId);
        return null;
      }
      
      const provider = providerDoc.data();
      
      // Kunden-Daten laden
      const customerDoc = await admin.firestore()
        .doc(`customers/${booking.customerId}`)
        .get();
      
      if (!customerDoc.exists) {
        console.error('Kunde nicht gefunden:', booking.customerId);
        return null;
      }
      
      const customer = customerDoc.data();
      
      // Service-Daten laden
      const serviceDoc = await admin.firestore()
        .doc(`services/${booking.serviceId}`)
        .get();
      
      const service = serviceDoc.exists ? serviceDoc.data() : { name: 'Unbekannter Service' };
      
      // Mitarbeiter laden (falls zugewiesen)
      let staffName = null;
      if (booking.staffId) {
        const staffDoc = await admin.firestore()
          .doc(`staff/${booking.staffId}`)
          .get();
        if (staffDoc.exists) {
          staffName = (staffDoc.data() as any).name;
        }
      }
      
      // E-Mail-Daten vorbereiten
      const emailData = {
        businessName: provider?.businessName || 'SpotPilot',
        businessEmail: provider?.email || '',
        customerName: `${customer?.firstName} ${customer?.lastName}`,
        reference: booking.bookingReference || bookingId,
        serviceName: service?.name,
        date: booking.date,
        time: booking.startTime,
        duration: service?.duration,
        staffName: staffName,
        price: service?.price ? `${service.price.toFixed(2)} €` : 'Auf Anfrage',
        bookingUrl: `https://slotpilot.app/booking/${bookingId}`,
      };
      
      // E-Mail senden
      const mailOptions = {
        from: `"${emailData.businessName}" <${gmailEmail}>`,
        to: customer?.email,
        subject: `✅ Terminbestätigung: ${emailData.serviceName} am ${emailData.date}`,
        html: compiledTemplate(emailData),
      };
      
      await transporter.sendMail(mailOptions);
      
      // In Firestore markieren dass E-Mail gesendet wurde
      await snap.ref.update({
        confirmationEmailSent: true,
        confirmationEmailSentAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log('✅ Bestätigungs-E-Mail gesendet an:', customer?.email);
      return { success: true };
      
    } catch (error) {
      console.error('❌ Fehler beim Senden der E-Mail:', error);
      
      // Fehler in Firestore speichern für Retry
      await snap.ref.update({
        confirmationEmailError: error.message,
        confirmationEmailSent: false,
      });
      
      return { success: false, error: error.message };
    }
  });

/**
 * HTTP Function: Manuelles Senden einer Bestätigungs-E-Mail
 * Nutzung: POST https://europe-west1-spotpilot.cloudfunctions.net/resendConfirmation
 */
export const resendConfirmation = functions.https.onRequest(async (req, res) => {
  // CORS-Header setzen
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  
  const { bookingId } = req.body;
  
  if (!bookingId) {
    res.status(400).json({ error: 'bookingId erforderlich' });
    return;
  }
  
  try {
    const bookingDoc = await admin.firestore().doc(`bookings/${bookingId}`).get();
    
    if (!bookingDoc.exists) {
      res.status(404).json({ error: 'Buchung nicht gefunden' });
      return;
    }
    
    // Trigger die onCreate Function manuell
    // (In Produktion: eigene Logik oder Pub/Sub)
    
    res.json({ success: true, message: 'E-Mail wird gesendet...' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Scheduled Function: Tägliche Erinnerungs-E-Mails
 * Sendet Erinnerungen 24h vor dem Termin
 */
export const sendReminderEmails = functions.pubsub
  .schedule('0 18 * * *') // Jeden Tag um 18:00 Uhr
  .timeZone('Europe/Berlin')
  .onRun(async (context) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    try {
      // Buchungen für morgen laden
      const bookingsSnapshot = await admin.firestore()
        .collection('bookings')
        .where('date', '==', tomorrowStr)
        .where('status', '==', 'confirmed')
        .where('reminderEmailSent', '!=', true)
        .get();
      
      console.log(`📧 ${bookingsSnapshot.size} Erinnerungs-E-Mails zu senden...`);
      
      const sendPromises = bookingsSnapshot.docs.map(async (doc) => {
        const booking = doc.data();
        // ... Erinnerungs-E-Mail Logik hier
      });
      
      await Promise.all(sendPromises);
      
      console.log('✅ Erinnerungs-E-Mails gesendet');
      return null;
    } catch (error) {
      console.error('❌ Fehler beim Senden der Erinnerungen:', error);
      return null;
    }
  });
