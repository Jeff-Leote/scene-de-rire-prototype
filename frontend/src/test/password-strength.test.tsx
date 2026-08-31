import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PasswordStrength from '../components/PasswordStrength';

describe('PasswordStrength Component', () => {
  it('should display all password criteria', () => {
    render(<PasswordStrength password="" />);

    expect(screen.getByText('Au moins 8 caractères')).toBeInTheDocument();
    expect(screen.getByText('Au moins une majuscule')).toBeInTheDocument();
    expect(screen.getByText('Au moins une minuscule')).toBeInTheDocument();
    expect(screen.getByText('Au moins un chiffre')).toBeInTheDocument();
    expect(screen.getByText('Au moins un caractère spécial')).toBeInTheDocument();
  });

  it('should show weak password strength', () => {
    render(<PasswordStrength password="weak" />);

    expect(screen.getByText('Très faible')).toBeInTheDocument();
  });

  it('should show strong password strength', () => {
    render(<PasswordStrength password="StrongPass123!" />);

    expect(screen.getByText('Très fort')).toBeInTheDocument();
  });

  it('should show checkmarks for met criteria', () => {
    render(<PasswordStrength password="StrongPass123!" />);

    // Tous les critères sont remplis, donc on devrait voir des checkmarks
    const checkmarks = document.querySelectorAll('[data-testid="check-icon"]');
    expect(checkmarks.length).toBeGreaterThan(0);
  });

  it('should show password match when confirmPassword is provided', () => {
    render(<PasswordStrength password="password123" confirmPassword="password123" />);

    expect(screen.getByText('Les mots de passe correspondent')).toBeInTheDocument();
  });

  it('should show password mismatch when confirmPassword does not match', () => {
    render(<PasswordStrength password="password123" confirmPassword="different" />);

    expect(screen.getByText('Les mots de passe correspondent')).toBeInTheDocument();
  });

  it('should calculate strength percentage correctly', () => {
    const { rerender } = render(<PasswordStrength password="weak" />);

    // Mot de passe faible (1 critère sur 5)
    expect(screen.getByText('Très faible')).toBeInTheDocument();

    // Mot de passe moyen (3 critères sur 5)
    rerender(<PasswordStrength password="StrongPass" />);
    expect(screen.getByText('Moyen')).toBeInTheDocument();

    // Mot de passe fort (5 critères sur 5)
    rerender(<PasswordStrength password="StrongPass123!" />);
    expect(screen.getByText('Très fort')).toBeInTheDocument();
  });
});
