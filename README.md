# Kartice-projekat

Aplikacija za učenje njemačkog (React/Vite).

- Podaci: `public/seed.json` (≈1276 kartica, 14 kapitela)
- Inicijalno učitavanje iz `seed.json`, potom localStorage
- Preporuka: `public/seed-meta.json` za verzioniranje (auto-refresh podataka)

## Pokretanje (lokalno)
npm install
npm run dev

## Build
npm run build
npm run preview

## Struktura
- public/seed.json — sve kartice
- public/seed-meta.json — { version, count, updatedAt } (opcionalno)
- src/ — aplikacijski kod

## Napomene
- Nakon ažuriranja `seed.json`, obriši localStorage ili povisi `version` u `seed-meta.json`.
- JSON mora biti validan (koristi obični minus `-`, ne “pametne” crtice).
