/**
 * SakinahLayout — shell wrapper for all Sakinah pages.
 * Renders the SakinahSubNav sidebar on the left and the
 * page content on the right, mirroring the Barakah Labs layout pattern.
 * Import this in every Sakinah page that should show the sidebar.
 */
import { SakinahSubNav } from './SakinahSubNav';
import '../sakinah.css';

interface SakinahLayoutProps {
  children: React.ReactNode;
}

export function SakinahLayout({ children }: SakinahLayoutProps) {
  return (
    <div className="sk-layout">
      <SakinahSubNav />
      <div className="sk-layout-content">
        {children}
      </div>
    </div>
  );
}
