/**
 * ProfileInfoRow — label + value display row with optional icon.
 */

interface ProfileInfoRowProps {
  label: string;
  value: string | undefined;
  icon?: React.ReactNode;
}

export function ProfileInfoRow({ label, value, icon }: ProfileInfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      {icon && <span className="text-[#D4A853]/70 mt-0.5">{icon}</span>}
      <div className="flex-1">
        <p className="text-white/50 text-xs">{label}</p>
        <p className="text-white text-sm">{value || 'Not specified'}</p>
      </div>
    </div>
  );
}
