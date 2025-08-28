const nodemailer = require('nodemailer');
const { sendEmail, sendBulkEmails } = require('../../src/services/emailService');

// Mock nodemailer
jest.mock('nodemailer');

describe('Email Service', () => {
  let mockTransporter;
  let mockSendMail;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSendMail = jest.fn();
    mockTransporter = {
      sendMail: mockSendMail
    };
    
    nodemailer.createTransport.mockReturnValue(mockTransporter);
    nodemailer.createTestAccount.mockResolvedValue({
      user: 'test@ethereal.email',
      pass: 'testpass'
    });
  });

  describe('sendEmail', () => {
    it('should send email successfully with SMTP configuration', async () => {
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_USER = 'test@gmail.com';
      process.env.SMTP_PASS = 'testpass';
      
      mockSendMail.mockResolvedValue({
        messageId: 'test-message-id',
        response: 'OK'
      });

      const result = await sendEmail(
        'recipient@example.com',
        'Test Subject',
        'Test message',
        [],
        true
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('test-message-id');
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'recipient@example.com',
          subject: 'Test Subject',
          html: expect.stringContaining('Test message')
        })
      );
    });

    it('should send email with Ethereal when SMTP not configured', async () => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;
      
      mockSendMail.mockResolvedValue({
        messageId: 'test-message-id'
      });

      const result = await sendEmail(
        'recipient@example.com',
        'Test Subject',
        'Test message'
      );

      expect(result.success).toBe(true);
      expect(nodemailer.createTestAccount).toHaveBeenCalled();
    });

    it('should include unsubscribe link when showUnsubscribe is true', async () => {
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_USER = 'test@gmail.com';
      process.env.SMTP_PASS = 'testpass';
      
      mockSendMail.mockResolvedValue({
        messageId: 'test-message-id'
      });

      await sendEmail(
        'recipient@example.com',
        'Test Subject',
        'Test message',
        [],
        true
      );

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('Se désabonner de la newsletter');
    });

    it('should not include unsubscribe link when showUnsubscribe is false', async () => {
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_USER = 'test@gmail.com';
      process.env.SMTP_PASS = 'testpass';
      
      mockSendMail.mockResolvedValue({
        messageId: 'test-message-id'
      });

      await sendEmail(
        'recipient@example.com',
        'Test Subject',
        'Test message',
        [],
        false
      );

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).not.toContain('Se désabonner de la newsletter');
    });

    it('should handle email sending errors', async () => {
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_USER = 'test@gmail.com';
      process.env.SMTP_PASS = 'testpass';
      
      mockSendMail.mockRejectedValue(new Error('SMTP Error'));

      await expect(sendEmail(
        'recipient@example.com',
        'Test Subject',
        'Test message'
      )).rejects.toThrow('SMTP Error');
    });

    it('should handle authentication errors specifically', async () => {
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_USER = 'test@gmail.com';
      process.env.SMTP_PASS = 'testpass';
      
      const authError = new Error('Authentication failed');
      authError.code = 'EAUTH';
      mockSendMail.mockRejectedValue(authError);

      await expect(sendEmail(
        'recipient@example.com',
        'Test Subject',
        'Test message'
      )).rejects.toThrow('Erreur d\'authentification SMTP');
    });
  });

  describe('sendBulkEmails', () => {
    it('should send emails to multiple recipients', async () => {
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_USER = 'test@gmail.com';
      process.env.SMTP_PASS = 'testpass';
      
      mockSendMail.mockResolvedValue({
        messageId: 'test-message-id'
      });

      const recipients = ['user1@example.com', 'user2@example.com'];
      const results = await sendBulkEmails(
        recipients,
        'Bulk Test Subject',
        'Bulk test message'
      );

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(mockSendMail).toHaveBeenCalledTimes(2);
    });

    it('should handle partial failures in bulk sending', async () => {
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_USER = 'test@gmail.com';
      process.env.SMTP_PASS = 'testpass';
      
      mockSendMail
        .mockResolvedValueOnce({ messageId: 'success-1' })
        .mockRejectedValueOnce(new Error('SMTP Error'));

      const recipients = ['user1@example.com', 'user2@example.com'];
      const results = await sendBulkEmails(
        recipients,
        'Bulk Test Subject',
        'Bulk test message'
      );

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBe('SMTP Error');
    });

    it('should handle empty recipients array', async () => {
      const results = await sendBulkEmails(
        [],
        'Bulk Test Subject',
        'Bulk test message'
      );

      expect(results).toHaveLength(0);
      expect(mockSendMail).not.toHaveBeenCalled();
    });
  });
});
