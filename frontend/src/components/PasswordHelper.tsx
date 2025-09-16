import React from 'react';
import { Info } from 'lucide-react';

const PasswordHelper: React.FC = () => {
  const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  return (
    <div className="mt-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-start space-x-2">
        <Info className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="space-y-2">
          <p className="text-sm text-gray-300">
            <strong>Caractères spéciaux autorisés :</strong>
          </p>
          <div className="flex flex-wrap gap-1">
            {specialChars.split('').map((char, index) => (
              <span 
                key={index}
                className="inline-block px-1 py-0.5 bg-gray-700 text-red-500 text-xs rounded"
              >
                {char}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <p>💡 <strong>Conseils de sécurité :</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Évitez les informations personnelles (nom, date de naissance)</li>
              <li>N'utilisez pas le même mot de passe que vos autres comptes</li>
              <li>Changez régulièrement votre mot de passe</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordHelper;
