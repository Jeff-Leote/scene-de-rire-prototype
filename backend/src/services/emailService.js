const nodemailer = require('nodemailer');

// Configuration du transporteur email
const createTransport = async () => {
  // Vérifier si on a des credentials SMTP configurés (Gmail)
  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  
  console.log('📧 Configuration email - Variables d\'environnement:');
  console.log('📧 SMTP_HOST:', process.env.SMTP_HOST ? '✓ Configuré' : '✗ Manquant');
  console.log('📧 SMTP_USER:', process.env.SMTP_USER ? '✓ Configuré' : '✗ Manquant');
  console.log('📧 SMTP_PASS:', process.env.SMTP_PASS ? '✓ Configuré' : '✗ Manquant');
  console.log('📧 SMTP_PORT:', process.env.SMTP_PORT || '587 (défaut)');
  console.log('📧 SMTP_SECURE:', process.env.SMTP_SECURE || 'non défini');
  console.log('📧 NODE_ENV:', process.env.NODE_ENV || 'non défini');
  
  if (hasSmtpConfig && process.env.NODE_ENV !== 'production') {
    // Utiliser SMTP configuré (Gmail) seulement en développement
    console.log('📧 Utilisation de SMTP configuré pour l\'envoi d\'emails');
    console.log('📧 Host:', process.env.SMTP_HOST);
    console.log('📧 Port:', process.env.SMTP_PORT || 587);
    console.log('📧 User:', process.env.SMTP_USER);
    
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      // Ajouter des options de debug pour diagnostiquer les problèmes
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
      // Options supplémentaires pour Gmail
      tls: {
        rejectUnauthorized: false
      },
      // Configuration spéciale pour Render (timeout et retry)
      connectionTimeout: 60000, // 60 secondes
      greetingTimeout: 30000,   // 30 secondes
      socketTimeout: 60000,     // 60 secondes
      pool: true,
      maxConnections: 5,
      maxMessages: 100
    });
  } else {
    // Fallback vers Ethereal Email pour les tests et production
    console.log('📧 Utilisation d\'Ethereal Email (service de test)');
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

// Fonction pour envoyer un email (attachments optionnels, showUnsubscribe optionnel)
const sendEmail = async (to, subject, message, attachments = [], showUnsubscribe = true) => {
  try {
    console.log('📧 Début envoi email à:', to);
    console.log('📧 Sujet:', subject);
    
    const transporter = await createTransport();
    
    // Générer un lien de désabonnement unique avec token sécurisé (seulement si showUnsubscribe = true)
    let unsubscribeUrl = '';
    if (showUnsubscribe) {
      const unsubscribeToken = Buffer.from(`${to}-${Date.now()}-${Math.random()}`).toString('base64');
      
      // Utiliser l'URL de production ou localhost selon l'environnement
      // En production, toujours utiliser l'URL de production même si NODE_ENV n'est pas défini
      const isProduction = process.env.NODE_ENV === 'production' || process.env.FRONTEND_URL?.includes('espacecomedie.fr');
      const baseUrl = isProduction 
        ? (process.env.FRONTEND_URL || 'https://espacecomedie.fr')
        : (process.env.FRONTEND_URL || 'http://localhost:5173');
      
      // Pour éviter les 404 sur des routes profondes en prod, on pointe vers l'accueil
      // puis on laisse le client rediriger vers /unsubscribe via Index.tsx
      unsubscribeUrl = `${baseUrl}/?unsubscribe=1&email=${encodeURIComponent(to)}&token=${unsubscribeToken}`;
      
      console.log('📧 URL de désabonnement générée:', unsubscribeUrl);
      console.log('📧 Base URL utilisée:', baseUrl);
      console.log('📧 NODE_ENV:', process.env.NODE_ENV);
      console.log('📧 FRONTEND_URL:', process.env.FRONTEND_URL);
      console.log('📧 Variables d\'environnement email:');
      console.log('📧 - SMTP_HOST:', process.env.SMTP_HOST ? '✓ Configuré' : '✗ Manquant');
      console.log('📧 - SMTP_USER:', process.env.SMTP_USER ? '✓ Configuré' : '✗ Manquant');
      console.log('📧 - FROM_EMAIL:', process.env.FROM_EMAIL || 'Non défini');
    } else {
      console.log('📧 Lien de désabonnement désactivé pour cet email');
    }
    
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
                  ${showUnsubscribe ? `
                  <div style="margin-top: 16px; padding: 12px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #dc2626;">
                    <p style="margin: 0; font-size: 11px; color: #6b7280;">
                      <a href="${unsubscribeUrl}" style="color:#dc2626;text-decoration:underline;font-weight:600;">Se désabonner de la newsletter</a>
                    </p>
                  </div>
                  ` : ''}
                </div>
              </td>
            </tr>
          </table>
          <div style="text-align:center;font-size:11px;color:#9ca3af;margin-top:12px;">
            © ${new Date().getFullYear()} Espace Comédie. Tous droits réservés.
          </div>
        </div>
      `,
      attachments: Array.isArray(attachments) ? attachments : []
    };

    console.log('📧 Tentative d\'envoi via SMTP...');
    
    // Vérifier la connexion SMTP avant l'envoi
    try {
      await transporter.verify();
      console.log('📧 ✓ Connexion SMTP vérifiée avec succès');
    } catch (verifyError) {
      console.error('📧 ✗ Erreur de vérification SMTP:', verifyError.message);
      throw new Error(`Erreur de connexion SMTP: ${verifyError.message}`);
    }
    
    const info = await transporter.sendMail(mailOptions);
    
    // Vérifier si on utilise Ethereal (mode test)
    const isUsingEthereal = !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS;
    
    if (isUsingEthereal) {
      console.log('📧 Email envoyé (mode test Ethereal):');
      console.log('📧 URL de prévisualisation:', nodemailer.getTestMessageUrl(info));
      console.log('📧 Message ID:', info.messageId);
    } else {
      console.log('📧 Email envoyé via SMTP configuré:', info.messageId);
      console.log('📧 Réponse du serveur SMTP:', info.response);
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur détaillée envoi email:', error);
    console.error('❌ Code d\'erreur:', error.code);
    console.error('❌ Message d\'erreur:', error.message);
    console.error('❌ Stack trace:', error.stack);
    
    // Retourner une erreur plus descriptive
    let errorMessage = 'Erreur lors de l\'envoi de l\'email';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Erreur d\'authentification SMTP - Vérifiez les identifiants Gmail';
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

// Fonction pour envoyer des emails en masse
const sendBulkEmails = async (recipients, subject, message) => {
  console.log('📧 Début envoi en masse à', recipients.length, 'destinataires');
  console.log('📧 Destinataires:', recipients);
  console.log('📧 Sujet:', subject);
  console.log('📧 Message:', message);
  const results = [];
  
  for (const recipient of recipients) {
    try {
      console.log('📧 Envoi à:', recipient);
      const result = await sendEmail(recipient, subject, message);
      results.push({ email: recipient, success: true, messageId: result.messageId });
      console.log('📧 ✓ Succès pour:', recipient, '- MessageId:', result.messageId);
    } catch (error) {
      console.error('📧 ✗ Échec pour:', recipient, '- Erreur:', error.message);
      console.error('📧 ✗ Détails erreur:', error);
      results.push({ email: recipient, success: false, error: error.message });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  
  console.log('📧 Résultats envoi en masse:', successCount, 'succès,', failureCount, 'échecs');
  
  return results;
};

module.exports = {
  sendEmail,
  sendBulkEmails
};
