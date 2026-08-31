const nodemailer = require('nodemailer');

// Configuration du transporteur email
const createTransport = async () => {
  // Vérifier si on a des credentials SMTP configurés (Gmail)
  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasSmtpConfig && process.env.NODE_ENV !== 'production') {
    // Utiliser SMTP configuré (Gmail) seulement en développement
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Ajouter des options de debug pour diagnostiquer les problèmes
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
      // Configuration spéciale pour Render (timeout et retry)
      connectionTimeout: 60000, // 60 secondes
      greetingTimeout: 30000, // 30 secondes
      socketTimeout: 60000, // 60 secondes
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  } else {
    // Fallback vers Ethereal Email pour les tests et production
    const testAccount = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

// Fonction pour envoyer un email (attachments optionnels)
const sendEmail = async (to, subject, message, attachments = []) => {
  try {
    const transporter = await createTransport();

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
                <div style="font-size:12px;color:#e5e7eb;opacity:.85;margin-top:6px;">Spectacles • Comédie • Lille</div>
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
                  Pour toute question, écrivez-nous à <a href="mailto:contact@espacecomedie.fr" style="color:#111111;text-decoration:underline;">contact@espacecomedie.fr</a>.
                </div>
              </td>
            </tr>
          </table>
          <div style="text-align:center;font-size:11px;color:#9ca3af;margin-top:12px;">
            © ${new Date().getFullYear()} Espace Comédie. Tous droits réservés.
          </div>
        </div>
      `,
      attachments: Array.isArray(attachments) ? attachments : [],
    };

    // Vérifier la connexion SMTP avant l'envoi
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('📧 ✗ Erreur de vérification SMTP:', verifyError.message);
      throw new Error(`Erreur de connexion SMTP: ${verifyError.message}`);
    }

    const info = await transporter.sendMail(mailOptions);

    // En Ethereal (pas de vraie boîte mail derrière), l'URL de prévisualisation
    // est le seul moyen de voir le contenu de l'email "envoyé"
    const isUsingEthereal = !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS;
    if (isUsingEthereal) {
      console.log('📧 Email envoyé (Ethereal, pas de vraie livraison) - prévisualisation:', nodemailer.getTestMessageUrl(info));
    } else {
      console.log('📧 Email envoyé:', to, '-', info.messageId);
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur envoi email:', error.code || error.message);

    // Retourner une erreur plus descriptive
    let errorMessage = "Erreur lors de l'envoi de l'email";

    if (error.code === 'EAUTH') {
      errorMessage = "Erreur d'authentification SMTP - Vérifiez les identifiants Gmail";
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Erreur de connexion au serveur SMTP - Vérifiez la configuration réseau';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Timeout de connexion au serveur SMTP';
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

module.exports = {
  sendEmail,
};
