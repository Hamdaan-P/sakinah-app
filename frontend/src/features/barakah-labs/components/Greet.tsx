import type { ReactNode } from 'react';
import { useBarakahFlow, type Screen } from '../stores/barakah-flow.store';
import { BackIcon, MenuIcon } from './icons';

export function BackHeader({ to, center, right }: { to: Screen; center?: React.ReactNode; right?: React.ReactNode }) {
  const go = useBarakahFlow((s) => s.go);
  return (
    <div className="bk-greet">
      <button className="bk-iconbtn" onClick={() => go(to)} aria-label="Back">
        <BackIcon />
      </button>
      {center !== undefined ? center : null}
      {right !== undefined ? right : <div style={{ width: 36 }} />}
    </div>
  );
}

/** Header used on Today. The trailing button used to jump to a Raya tab
 *  inside Barakah; that tab was removed (Raya now lives on the global
 *  BottomNavBar). A 36px spacer keeps the header layout balanced. */
export function MenuHeader({ left }: { left: React.ReactNode }) {
  return (
    <div className="bk-greet">
      <div>{left}</div>
      <div style={{ width: 36 }} aria-hidden />
    </div>
  );
}

/**
 * Standard screen header with optional title + subtitle. Use this for
 * sub-screens where the header should show a name + a meta line (member
 * count, step number, "private circle", etc.) — instead of ad-hoc center
 * markup passed into BackHeader. Mirrors S18's clean header pattern.
 *
 * Leading slot rules:
 *   - back: Screen  → renders back-arrow that navigates to that screen
 *   - menu: true    → renders menu icon (calls onMenu when provided)
 *   - neither       → renders a 36px spacer for header symmetry
 */
export function ScreenHeader({
  back,
  menu,
  onMenu,
  title,
  subtitle,
  right,
}: {
  back?: Screen;
  menu?: boolean;
  onMenu?: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  const go = useBarakahFlow((s) => s.go);

  let leading: ReactNode;
  if (back !== undefined) {
    leading = (
      <button className="bk-iconbtn" onClick={() => go(back)} aria-label="Back">
        <BackIcon />
      </button>
    );
  } else if (menu) {
    leading = (
      <button
        className="bk-iconbtn"
        onClick={onMenu}
        aria-label="Menu"
        disabled={!onMenu}
      >
        <MenuIcon />
      </button>
    );
  } else {
    leading = <div style={{ width: 36 }} aria-hidden />;
  }

  return (
    <div className="bk-screen-header">
      {leading}
      <div className="bk-screen-header-mid">
        {title ? <div className="bk-screen-header-title">{title}</div> : null}
        {subtitle ? <div className="bk-screen-header-subtitle">{subtitle}</div> : null}
      </div>
      {right ?? <div style={{ width: 36 }} aria-hidden />}
    </div>
  );
}
