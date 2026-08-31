import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
  confirmPassword?: string;
}

interface PasswordCriteria {
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password, confirmPassword }) => {
  const criteria: PasswordCriteria[] = [
    {
      label: 'Au moins 8 caractères',
      test: (pwd) => pwd.length >= 8,
      met: password.length >= 8,
    },
    {
      label: 'Au moins une majuscule',
      test: (pwd) => /[A-Z]/.test(pwd),
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Au moins une minuscule',
      test: (pwd) => /[a-z]/.test(pwd),
      met: /[a-z]/.test(password),
    },
    {
      label: 'Au moins un chiffre',
      test: (pwd) => /\d/.test(pwd),
      met: /\d/.test(password),
    },
    {
      label: 'Au moins un caractère spécial',
      test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
  ];

  // Calculer la force du mot de passe
  const metCriteria = criteria.filter((c) => c.test(password)).length;
  const strengthPercentage = (metCriteria / criteria.length) * 100;

  // Déterminer le niveau de force
  const getStrengthLevel = () => {
    if (strengthPercentage === 100) return { level: 'Très fort', color: 'bg-green-500', textColor: 'text-green-400' };
    if (strengthPercentage >= 80) return { level: 'Fort', color: 'bg-green-400', textColor: 'text-green-400' };
    if (strengthPercentage >= 60) return { level: 'Moyen', color: 'bg-red-500', textColor: 'text-red-400' };
    if (strengthPercentage >= 40) return { level: 'Faible', color: 'bg-orange-500', textColor: 'text-orange-400' };
    return { level: 'Très faible', color: 'bg-red-500', textColor: 'text-red-400' };
  };

  const strengthInfo = getStrengthLevel();

  // Vérifier si les mots de passe correspondent
  const passwordsMatch = confirmPassword ? password === confirmPassword : true;

  return (
    <div className="space-y-3">
      {/* Barre de force du mot de passe */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-300">Force du mot de passe</span>
          <span className={`text-sm font-medium ${strengthInfo.textColor}`}>{strengthInfo.level}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${strengthInfo.color}`}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
      </div>

      {/* Critères de validation */}
      <div className="space-y-2">
        {criteria.map((criterion, index) => (
          <div key={index} className="flex items-center space-x-2">
            {criterion.test(password) ? (
              <Check className="w-4 h-4 text-green-400" data-testid="check-icon" />
            ) : (
              <X className="w-4 h-4 text-red-400" data-testid="x-icon" />
            )}
            <span className={`text-sm ${criterion.test(password) ? 'text-green-400' : 'text-gray-400'}`}>
              {criterion.label}
            </span>
          </div>
        ))}
      </div>

      {/* Vérification de correspondance des mots de passe */}
      {confirmPassword !== undefined && (
        <div className="flex items-center space-x-2">
          {passwordsMatch ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-red-400" />}
          <span className={`text-sm ${passwordsMatch ? 'text-green-400' : 'text-red-400'}`}>
            Les mots de passe correspondent
          </span>
        </div>
      )}
    </div>
  );
};

export default PasswordStrength;
