/**
 * Tests des exports du module security (middleware).
 * Vérifie que handleValidationErrors et commonValidations ont bien été retirés.
 */
const security = require('../../src/middleware/security');

describe('security middleware exports', () => {
  it('exports expected middleware only', () => {
    expect(security.createRateLimiters).toBeDefined();
    expect(security.sanitizeInput).toBeDefined();
    expect(security.helmetConfig).toBeDefined();
    expect(security.csrfProtection).toBeDefined();
    expect(security.securityLogger).toBeDefined();
  });

  it('does not export handleValidationErrors or commonValidations', () => {
    expect(security.handleValidationErrors).toBeUndefined();
    expect(security.commonValidations).toBeUndefined();
  });
});
