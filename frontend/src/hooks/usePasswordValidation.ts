import { useState, useEffect } from 'react';

interface PasswordValidation {
  isValid: boolean;
  criteria: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
  strength: 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong';
  strengthPercentage: number;
}

export const usePasswordValidation = (password: string, confirmPassword?: string) => {
  const [validation, setValidation] = useState<PasswordValidation>({
    isValid: false,
    criteria: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    },
    strength: 'very-weak',
    strengthPercentage: 0,
  });

  useEffect(() => {
    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    const metCriteria = Object.values(criteria).filter(Boolean).length;
    const strengthPercentage = (metCriteria / 5) * 100;

    let strength: PasswordValidation['strength'] = 'very-weak';
    if (strengthPercentage === 100) strength = 'very-strong';
    else if (strengthPercentage >= 80) strength = 'strong';
    else if (strengthPercentage >= 60) strength = 'medium';
    else if (strengthPercentage >= 40) strength = 'weak';

    const isValid = metCriteria === 5 && (!confirmPassword || password === confirmPassword);

    setValidation({
      isValid,
      criteria,
      strength,
      strengthPercentage,
    });
  }, [password, confirmPassword]);

  return validation;
};
