import nodemailer from 'nodemailer';

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendContactEmail({
  to,
  firstName,
  lastName,
  email,
  subject,
  message,
}: {
  to: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}) {
  const transporter = createTransport();

  await transporter.sendMail({
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    to,
    replyTo: email,
    subject: `[Contact] ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Nouveau message de contact</h1>
        </div>
        <div style="padding: 20px; background-color: white;">
          <h2 style="color: #333;">Message de ${firstName} ${lastName}</h2>
          <div style="line-height: 1.6; color: #555;">
            <p><strong>De :</strong> ${firstName} ${lastName} &lt;${email}&gt;</p>
            <p><strong>Sujet :</strong> ${subject}</p>
            <p><strong>Message :</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px;">
            Cet email a été envoyé depuis le formulaire de contact de L'Espace Comédie Lille.
          </p>
        </div>
      </div>
    `,
  });
}
