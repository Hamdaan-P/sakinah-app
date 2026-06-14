import { useBarakahFlow, type Screen } from '../stores/barakah-flow.store';

type Item = { id: Screen; num: string; label: string; tag?: 'NEW' | 'UPD' | 'REN' };
type Group = { heading: string; items: Item[] };

const GROUPS: Group[] = [
  {
    heading: 'Today · the practice',
    items: [
      { id: 's01', num: '01', label: 'Today (home)', tag: 'UPD' },
      { id: 's02', num: '02', label: 'Heart check-in' },
      { id: 's03', num: '03', label: 'Settle + compose' },
      { id: 's05', num: '05', label: '6 Doors', tag: 'UPD' },
      { id: 's06', num: '06', label: 'Door: active', tag: 'UPD' },
      { id: 's07', num: '07', label: 'Door → Raya', tag: 'NEW' },
    ],
  },
  {
    heading: 'Tohfa · gift to others',
    items: [
      { id: 's09', num: '09', label: 'Tohfa compose', tag: 'UPD' },
      { id: 's10', num: '10', label: 'Tohfa received' },
    ],
  },
  {
    heading: 'Tafakkur · sit & reflect',
    items: [
      { id: 's11', num: '11', label: 'Tafakkur entry' },
      { id: 's12', num: '12', label: 'Tafakkur sit' },
      { id: 's13', num: '13', label: 'Tafakkur end' },
      { id: 's14', num: '14', label: 'Tafakkur → Raya' },
    ],
  },
  {
    heading: 'Trail & circles',
    items: [
      { id: 's16', num: '16', label: 'Trail / Yours', tag: 'UPD' },
      { id: 's17', num: '17', label: 'Trail / Companions' },
      { id: 's18', num: '18', label: 'Inside a circle', tag: 'NEW' },
    ],
  },
  {
    heading: 'Weekly · slow rhythm',
    items: [
      { id: 's19', num: '19', label: 'Weekly report', tag: 'NEW' },
      { id: 's20', num: '20', label: 'Share with one', tag: 'NEW' },
      { id: 's21', num: '21', label: 'Research opt-in', tag: 'NEW' },
    ],
  },
];

export function SubNav() {
  const active = useBarakahFlow((s) => s.screen);
  const go = useBarakahFlow((s) => s.go);

  return (
    <aside className="bk-subnav-rail" aria-label="Barakah Labs sections">
      <div className="bk-subnav-brand">
        <h1>Barakah Labs</h1>
        <p>MVP v2 · the practice</p>
      </div>
      {GROUPS.map((g) => (
        <div key={g.heading} className="bk-subnav-group">
          <h2>{g.heading}</h2>
          {g.items.map((it) => (
            <button
              key={it.id}
              className={`bk-subnav-item ${active === it.id ? 'active' : ''}`}
              onClick={() => go(it.id)}
            >
              <span className="bk-subnav-num">{it.num}</span>
              <span className="bk-subnav-label">{it.label}</span>
              {it.tag ? <span className={`bk-subnav-tag tag-${it.tag.toLowerCase()}`}>{it.tag}</span> : null}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}
