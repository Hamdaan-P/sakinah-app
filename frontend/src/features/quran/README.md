# Quran feature

Reader, recitation, Hifz, daily ayah, workspace, and the Tadabbur experience
(Raya AI integration).

## Design source

The product source-of-truth for the **Tadabbur — Quran + Raya** experience
is the standalone HTML mockup at the repo root:

- [`/tadabbur-app.html`](../../../../../tadabbur-app.html)

That file is kept verbatim as a living spec. Each of its 8 screens maps to
an entry in the table below; do not let the screens drift out of parity
without updating the mockup too.

_Last reconciled by TL: 2026-05-19 (merge `49e10cf` + followups `6c782d4`+)_

| HTML screen (`s-…`)         | Live entrypoint                                                | Status                                                          |
|------------------------------|----------------------------------------------------------------|-----------------------------------------------------------------|
| `s-home` — Home/Tadabbur     | `QuranHomePage.tsx` (`/quran`)                                 | **Built** — ProgressRing shipped                                |
| `s-reader` — Surah reader    | `QuranReadingPage.tsx` (`/quran/reading/:id/:verse`)            | **Built** — EOS card shipped                                    |
| `s-deepdive` — Ayah deep dive| `DeepDiveSheet.tsx` (long-press ayah → "Deep Dive")             | **Built** — all 6 tabs (Ask/Tafsir/Hadith/Scholars/Apply/X-Ray); content seeded for surahs 1–2 |
| `s-xray` — X-ray full view   | `QuranXrayPage.tsx` (`/quran/surah/:id/xray`)                   | **Built** — seeded for surahs 1–2; other surahs show graceful empty state |
| `s-faqs` — Depth FAQs        | `QuranDepthFaqsPage.tsx` (`/quran/faqs/:surahId`)               | **Built** — 3 FAQs each for surahs 1–2 (handoff spec'd 7; content TBD); clever-loop → DeepDive Ask shipped |
| `s-workspace` — Workspace    | `QuranWorkspacePage.tsx` (`/quran/workspace`)                   | **Built** — Phase A + Firestore sync (per-item, debounced writeBatch, last-write-wins) |
| `s-editor` — Note/Doc editor | `QuranWorkspaceEditorPage.tsx` (`/quran/workspace/:id`)         | **Built** — Phase A; ayah picker + reminder picker + in-page Raya |
| `s-whatsapp` — Raya/WhatsApp | _Not built yet_                                                | Planned (Phase D) — see `backend/langchain_backend/app/whatsapp/` for the channel infra |

### Coverage scope for content-gated features

The following features are **architecturally complete** but content-gated to surahs 1 (Al-Fatiha) and 2 (Al-Baqarah). Other surahs render graceful empty states ("Coming soon to more surahs"). The full curation target is the ~30 most-read surahs.

| Data file                                            | Current scope                              | Target                              |
|------------------------------------------------------|--------------------------------------------|-------------------------------------|
| `backend/.../data/tafsirs.json`                      | 6 ayahs (1:1, 1:2, 1:5, 2:1, 2:2, 2:255)   | ~30 high-traffic ayahs              |
| `backend/.../data/xray_surahs.json`                  | surahs 1, 2                                | 30 most-read surahs                 |
| `backend/.../data/depth_faqs.json`                   | 3 FAQs each for surahs 1, 2                | 7 per surah × 30 surahs             |
| `backend/.../data/word_index.json` (morphology)      | 4 verses (1:1, 1:2, 1:5, 2:2)              | all 6236 verses (Quranic Arabic Corpus import) |
| `frontend/.../data/scholarCommentary.json`           | 3 ayahs (1:1, 1:5, 2:255)                  | ~30 ayahs (scholar list needs Omar's sign-off) |
| `frontend/.../data/ayahApplications.json`            | 3 ayahs (1:5, 2:2, 2:255)                  | ~30 ayahs                           |

See `quran-handoff-followup.md` §5 for the Pinecone-backed extraction approach.

## Layout

- `pages/` — route entrypoints (one component per URL)
- `components/` — reusable UI for ayah blocks, panels, sheets, share cards
- `services/` — storage, API, scoring, hifz/learning engines
- `hooks/` — page-level hooks (theme, prefetch, recent surahs)
- `data/` — static lookup tables (mushaf index, etc.)
- `types/` — public types shared across services and components

## Workspace storage

`workspaceService.ts` keeps Notes / Documents / Reflections / Reminders in
localStorage under `quran_workspace_items`. Bookmarks remain in their own
key (`quran_bookmarks`); the Workspace feed joins the two virtually so the
"All" tab interleaves them without duplicating storage.
