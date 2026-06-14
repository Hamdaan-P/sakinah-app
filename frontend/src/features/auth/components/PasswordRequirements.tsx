/**
 * Password Requirements Component
 * Mirrors Flutter's PasswordValidator.buildRequirementsList
 */

import { getRequirementItems } from '../utils/passwordValidator';
import { FiCheck, FiX } from 'react-icons/fi';

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const requirements = getRequirementItems(password);

  return (
    <div className="p-3 bg-gray-800/50 rounded-lg border border-[#D4A853]/20">
      <p className="text-xs font-semibold text-gray-400 mb-2">
        Password Requirements
      </p>
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2">
            {req.met ? (
              <FiCheck className="w-4 h-4 text-green-500" />
            ) : (
              <FiX className="w-4 h-4 text-gray-500" />
            )}
            <span
              className={`text-sm ${
                req.met ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
