/**
 * SectionHeader — gold gradient section title for profile pages.
 */

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <h2 className="text-xl font-semibold bg-gradient-to-r from-[#D4A853] to-[#E8C97A] bg-clip-text text-transparent mb-4">
      {title}
    </h2>
  );
}
