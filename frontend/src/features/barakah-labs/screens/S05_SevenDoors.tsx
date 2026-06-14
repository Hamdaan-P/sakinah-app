import { useBarakahFlow, type Door, type Screen } from '../stores/barakah-flow.store';
import { BackHeader } from '../components/Greet';
import {
  DoorMemoryIcon,
  DoorOthersIcon,
  DoorFearIcon,
  DoorDuaIcon,
  DoorSilenceIcon,
  DoorActionIcon,
} from '../components/icons';

// Doors redesigned 2026-05-23 — 6 doors. See zaryah-brain/projects/doors-redesign-2026.md.
// - Trials/Fear/Dua/Action route to S06 (extrapolate textarea + 3 actions).
// - Tohfa routes to S06 (recipient picker variant) → S09 compose.
// - Silence routes to S11 (Tafakkur entry; seed picker auto-skipped since
//   the noticing IS the seed — see S11_TafakkurEntry).
type Item = {
  door: Door;
  name: string;
  hint: string;
  next: Screen;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const DOORS: Item[] = [
  { door: 'trials', name: 'Into trials', hint: 'What did this remind you of from a harder chapter?', next: 's06', Icon: DoorMemoryIcon },
  { door: 'tohfa', name: 'Into tohfa', hint: 'Who is this noticing really about?', next: 's06', Icon: DoorOthersIcon },
  { door: 'fear', name: 'Into fear', hint: 'What would you miss if this were gone?', next: 's06', Icon: DoorFearIcon },
  { door: 'dua', name: 'Into dua', hint: 'What do you ask of Allah now?', next: 's06', Icon: DoorDuaIcon },
  { door: 'silence', name: 'Into silence', hint: 'Just sit with it.', next: 's11', Icon: DoorSilenceIcon },
  { door: 'action', name: 'Into action', hint: 'What small thing does this ask?', next: 's06', Icon: DoorActionIcon },
];

export function S05_SevenDoors() {
  const go = useBarakahFlow((s) => s.go);
  const setDoor = useBarakahFlow((s) => s.setDoor);
  const setDoorReflection = useBarakahFlow((s) => s.setDoorReflection);
  const setTohfaRecipient = useBarakahFlow((s) => s.setTohfaRecipient);
  const setTohfaLetter = useBarakahFlow((s) => s.setTohfaLetter);

  const pickDoor = (item: Item) => {
    setDoor(item.door);
    // Clear stale per-door state so a previous door's reflection doesn't
    // leak into the new one. Tohfa state is also cleared on every door
    // entry — entering Tohfa fresh should never inherit a half-typed letter
    // from a prior session.
    setDoorReflection('');
    setTohfaRecipient(null);
    setTohfaLetter('');
    go(item.next);
  };

  return (
    <div className="bk-screen">
      <BackHeader to="s03" />
      <div className="bk-doors-head">
        <div className="bk-doors-eyebrow">Optional · the noticing is yours</div>
        <div className="bk-doors-title">Want to walk a little further?</div>
        <div className="bk-doors-sub">Choose one door — or none.</div>
      </div>
      <div className="bk-door-list">
        {DOORS.map((d) => (
          <button
            key={d.door}
            className="bk-door"
            onClick={() => pickDoor(d)}
          >
            <div className="bk-door-icon"><d.Icon /></div>
            <div>
              <div className="bk-door-name">{d.name}</div>
              <div className="bk-door-hint">{d.hint}</div>
            </div>
          </button>
        ))}
      </div>
      <button
        className="bk-doors-skip"
        onClick={() => {
          setDoor(null);
          go('s01');
        }}
      >
        Just rest with it →
      </button>
    </div>
  );
}
