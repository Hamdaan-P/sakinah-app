import { useEffect, useRef } from 'react';
import { trackFeature } from '@/lib/analytics';
import { useBarakahFlow } from '../stores/barakah-flow.store';
import { useHeartCheckinsSync } from '../hooks/useHeartCheckinsSync';
import { usePresenceHeartbeat } from '../hooks/usePresence';

import '../styles/barakah.css';

import { S01_Today } from '../screens/S01_Today';
import { S02_HeartCheckIn } from '../screens/S02_HeartCheckIn';
import { S03_Settle } from '../screens/S03_Settle';
import { S05_SevenDoors } from '../screens/S05_SevenDoors';
import { S06_DoorActive } from '../screens/S06_DoorActive';
import { S07_DoorRaya } from '../screens/S07_DoorRaya';
import { S09_TohfaCompose } from '../screens/S09_TohfaCompose';
import { S10_TohfaReceived } from '../screens/S10_TohfaReceived';
import { S11_TafakkurEntry } from '../screens/S11_TafakkurEntry';
import { S12_TafakkurSit } from '../screens/S12_TafakkurSit';
import { S13_TafakkurEnd } from '../screens/S13_TafakkurEnd';
import { S14_TafakkurRaya } from '../screens/S14_TafakkurRaya';
import { S16_TrailYours } from '../screens/S16_TrailYours';
import { S17_Companions } from '../screens/S17_Companions';
import { S18_InsideCircle } from '../screens/S18_InsideCircle';
import { S19_WeeklyReport } from '../screens/S19_WeeklyReport';
import { S20_ShareReport } from '../screens/S20_ShareReport';
import { S21_Research } from '../screens/S21_Research';
import { SubNav } from '../components/SubNav';

const SCREEN_COMPONENTS = {
  s01: S01_Today,
  s02: S02_HeartCheckIn,
  s03: S03_Settle,
  s05: S05_SevenDoors,
  s06: S06_DoorActive,
  s07: S07_DoorRaya,
  s09: S09_TohfaCompose,
  s10: S10_TohfaReceived,
  s11: S11_TafakkurEntry,
  s12: S12_TafakkurSit,
  s13: S13_TafakkurEnd,
  s14: S14_TafakkurRaya,
  s16: S16_TrailYours,
  s17: S17_Companions,
  s18: S18_InsideCircle,
  s19: S19_WeeklyReport,
  s20: S20_ShareReport,
  s21: S21_Research,
} as const;

export function BarakahLabsRoot() {
  const screen = useBarakahFlow((s) => s.screen);
  const Screen = SCREEN_COMPONENTS[screen];
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackFeature('barakah-labs');
  }, []);

  // Barakah Labs internal screen swaps don't change the URL, so MainLayout's
  // route-level scroll reset doesn't fire. Reset the nearest scrolling
  // ancestor (<main>) on every screen change so every screen starts at
  // the top, not wherever the previous screen left off.
  useEffect(() => {
    const scroller = rootRef.current?.closest('main');
    scroller?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [screen]);

  useHeartCheckinsSync();
  usePresenceHeartbeat();

  return (
    <div className="barakah-root" data-screen={screen} ref={rootRef}>
      <SubNav />
      <div className="bk-shell">
        <Screen />
      </div>
    </div>
  );
}
