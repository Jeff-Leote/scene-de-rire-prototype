const nodemailer = require('nodemailer');

// Configuration du transporteur email
const createTransport = async () => {
  // Vérifier si on a des credentials SMTP configurés (Gmail)
  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  
  if (hasSmtpConfig) {
    // Utiliser SMTP configuré (Gmail)
    console.log('📧 Utilisation de SMTP configuré pour l\'envoi d\'emails');
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Fallback vers Ethereal Email pour les tests
    console.log('📧 Aucune configuration SMTP trouvée, utilisation d\'Ethereal Email pour les tests');
    const testAccount = await nodemailer.createTestAccount();
    console.log('📧 Compte de test Ethereal créé:', testAccount.user);
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }
};

// Fonction pour envoyer un email
const sendEmail = async (to, subject, message) => {
  try {
    const transporter = await createTransport();
    
    // Générer un lien de désabonnement unique avec token sécurisé
    const unsubscribeToken = Buffer.from(`${to}-${Date.now()}-${Math.random()}`).toString('base64');
    
    // Utiliser l'URL de production ou localhost selon l'environnement
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://espacecomedie.fr' 
      : (process.env.FRONTEND_URL || 'http://localhost:5173');
    
    const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(to)}&token=${unsubscribeToken}`;
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER || 'Espace Comédie <noreply@espacecomedie.fr>',
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background:#f7f7f7; padding:24px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
            <tr>
              <td style="background:#111111;padding:24px 24px 20px 24px;text-align:center;">
                <div style="font-size:24px;line-height:28px;color:#facc15;font-weight:800;letter-spacing:.5px;">Espace Comédie</div>
                <div style="font-size:12px;color:#e5e7eb;opacity:.85;margin-top:6px;">Spectacles • Réservations • Newsletter</div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 24px 0 24px;">
                <h1 style="margin:0 0 12px 0;font-size:20px;line-height:26px;color:#111111;">${subject}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 8px 24px;">
                <div style="font-size:15px;line-height:24px;color:#374151;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"/>
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 24px 24px;">
                <div style="font-size:12px;line-height:18px;color:#6b7280;">
                  Cet email a été envoyé par <strong>Espace Comédie</strong>.<br/>
                  Pour toute question, écrivez-nous à <a href="mailto:contact@espacecomedie.fr" style="color:#111111;text-decoration:underline;">contact@espacecomedie.fr</a>.<br/>
                  <br/>
                  <a href="${unsubscribeUrl}" style="color:#dc2626;text-decoration:underline;font-size:11px;">Se désabonner de la newsletter</a>
                </div>
              </td>
            </tr>
          </table>
          <div style="text-align:center;font-size:11px;color:#9ca3af;margin-top:12px;">
            © ${new Date().getFullYear()} Espace Comédie. Tous droits réservés.
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Vérifier si on utilise Ethereal (mode test)
    const isUsingEthereal = !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS;
    
    if (isUsingEthereal) {
      console.log('📧 Email envoyé (mode test Ethereal):');
      console.log('📧 URL de prévisualisation:', nodemailer.getTestMessageUrl(info));
      console.log('📧 Message ID:', info.messageId);
    } else {
      console.log('📧 Email envoyé via SMTP configuré:', info.messageId);
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email');
  }
};

// Fonction pour envoyer des emails en masse
const sendBulkEmails = async (recipients, subject, message) => {
  const results = [];
  
  for (const recipient of recipients) {
    try {
      const result = await sendEmail(recipient, subject, message);
      results.push({ email: recipient, success: true, messageId: result.messageId });
    } catch (error) {
      results.push({ email: recipient, success: false, error: error.message });
    }
  }
  
  return results;
};

module.exports = {
  sendEmail,
  sendBulkEmails
};
