const nodemailer = require('nodemailer');
const { sendEmail } = require('../../src/services/emailService');

// Mock nodemailer
jest.mock('nodemailer');

describe('Email Service', () => {
  let mockTransporter;
  let mockSendMail;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSendMail = jest.fn();
    mockTransporter = {
      sendMail: mockSendMail,
      verify: jest.fn().mockResolvedValue(true)
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
        'Test message'
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
});
