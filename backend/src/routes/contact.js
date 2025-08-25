const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendEmail } = require('../services/emailService');

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

    console.log('📧 Envoi email contact:', { from: email, to: toEmail, subject });

    // Utiliser le service d'email unifié
    const result = await sendEmail(
      toEmail,
      `[Contact] ${subject}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333; margin: 0;">📧 Nouveau message de contact</h1>
          </div>
          <div style="padding: 20px; background-color: white;">
            <h2 style="color: #333;">Message de ${firstName} ${lastName}</h2>
            <div style="line-height: 1.6; color: #555;">
              <p><strong>De:</strong> ${firstName} ${lastName} &lt;${email}&gt;</p>
              <p><strong>Sujet:</strong> ${subject}</p>
              <p><strong>Message:</strong></p>
              <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #888; font-size: 12px;">
              Cet email a été envoyé depuis le formulaire de contact d'Espace Comédie.
            </p>
          </div>
        </div>
      `
    );

    return res.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('Erreur envoi contact:', error);
    return res.status(500).json({ error: "Impossible d'envoyer le message.", details: error.message });
  }
});

module.exports = router;
