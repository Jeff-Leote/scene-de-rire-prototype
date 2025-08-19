const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');

async function getRecipientEmail() {
  try {
    const [rows] = await db.query("CREATE TABLE IF NOT EXISTS settings (\n      `key` VARCHAR(100) PRIMARY KEY,\n      `value` TEXT,\n      `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n    )");
    // Read current value
    const [res] = await db.query('SELECT value FROM settings WHERE `key` = ? LIMIT 1', ['contact_recipient_email']);
    if (Array.isArray(res) && res.length > 0 && res[0].value) {
      return res[0].value;
    }
  } catch (e) {
    // ignore and fallback to env
  }
  // Priorité : 1. Table settings, 2. Variables d'environnement
  return process.env.CONTACT_RECIPIENT_EMAIL || process.env.FROM_EMAIL || process.env.SMTP_USER;
}

function buildTransport() {
  // Prefer explicit SMTP settings
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log('SMTP Config:', { host, port, user: user ? '***' : undefined, pass: pass ? '***' : undefined });

  if (host && port && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for others
      auth: { user, pass },
    });
  }

  // Fallback to direct (useful for Mailtrap or local dev if configured via URL)
  if (process.env.SMTP_URL) {
    console.log('Using SMTP_URL fallback');
    return nodemailer.createTransport(process.env.SMTP_URL);
  }

  // For testing, use a mock transport
  console.log('Using mock transport for testing');
  return nodemailer.createTransport({
    host: 'localhost',
    port: 1025,
    ignoreTLS: true,
  });
}

router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body || {};
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({ error: 'Champs requis manquants.' });
    }

    const toEmail = await getRecipientEmail();
    if (!toEmail) {
      return res.status(500).json({ error: "Adresse de réception non configurée." });
    }

    const transporter = buildTransport();
    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER || email;

    // En mode développement, afficher les détails et simuler l'envoi
    if (process.env.NODE_ENV === 'development') {
      console.log('=== EMAIL ENVOYÉ (MODE DÉVELOPPEMENT) ===');
      console.log('📧 De:', fromEmail);
      console.log('📧 À:', toEmail);
      console.log('📧 Sujet:', `[Contact] ${subject}`);
      console.log('📧 Message:', message);
      console.log('📧 Configuration SMTP:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER ? '***' : 'Non configuré'
      });
      console.log('==========================================');
      
      // Si SMTP est configuré, essayer d'envoyer un vrai email
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          const info = await transporter.sendMail({
            from: fromEmail,
            to: toEmail,
            subject: `[Contact] ${subject}`,
            replyTo: email,
            text: `Message de ${firstName} ${lastName} <${email}>\n\n${message}`,
            html: `
              <p><b>De:</b> ${firstName} ${lastName} &lt;${email}&gt;</p>
              <p><b>Sujet:</b> ${subject}</p>
              <p><b>Message:</b></p>
              <p>${message.replace(/\n/g, '<br/>')}</p>
            `,
          });
          console.log('✅ Email envoyé avec succès via SMTP:', info.messageId);
          return res.json({ success: true, messageId: info.messageId });
        } catch (smtpError) {
          console.log('❌ Erreur SMTP:', smtpError.message);
          console.log('📧 Email simulé en mode développement');
          return res.json({ success: true, messageId: 'dev-' + Date.now() });
        }
      } else {
        console.log('📧 Email simulé (SMTP non configuré)');
        return res.json({ success: true, messageId: 'dev-' + Date.now() });
      }
    }

    const info = await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: `[Contact] ${subject}`,
      replyTo: email,
      text: `Message de ${firstName} ${lastName} <${email}>\n\n${message}`,
      html: `
        <p><b>De:</b> ${firstName} ${lastName} &lt;${email}&gt;</p>
        <p><b>Sujet:</b> ${subject}</p>
        <p><b>Message:</b></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    });

    return res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Erreur envoi contact:', error);
    return res.status(500).json({ error: "Impossible d'envoyer le message.", details: error.message });
  }
});

module.exports = router;
