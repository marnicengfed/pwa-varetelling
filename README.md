# Månedsavslutt for kaffebar

Dette prosjektet er en progressiv webapplikasjon (PWA) bygget med Next.js (App Router), React og TypeScript for å forenkle månedsavslutt i en kaffebar. Løsningen fungerer helt uten backend: all databehandling skjer lokalt i nettleseren og lagres i IndexedDB via Dexie. Excel-filer leses og skrives med SheetJS, og brukergrensesnittet er bygget med Tailwind CSS og shadcn/ui-komponenter.

## Funksjoner

- **Varetelling:** Last opp varetellingsfilen fra Excel (`VARETELLINGSLISTE`-arket). Programmet detekterer header-raden automatisk, grupperer varer per kategori, og viser kun de feltene som trengs for telling. Du kan filtrere per kategori, søke etter varer, vise kun rader uten registrert antall og justere avviksgrense for pris. Tellekontroller med +/- knapper og tastatursnarveier gir rask inntasting. Rader med uvanlig høy verdi markeres med advarsel.
- **Eksport:** Kun `ANTALL`-kolonnen oppdateres når du eksporterer tilbake til Excel. All formatering, formler og øvrige kolonner bevares. Fila lastes ned direkte til nettleseren.
- **Historikk:** Tellingsdata lagres automatisk i IndexedDB med måned/år og filnavn. På historikksiden kan du se tidligere perioder og eksportere antallene til CSV.
- **Sjekklister:** Innebygde sjekklister per måned med avhuking og kommentarer. Du kan redigere eller importere egne sjekklister (ikke aktivert i MVP).
- **Pengetelling:** Egen fane for kasseopgjør med to kasser og safe. Standard norske valører er forhåndsutfylt. For safe kan du definere verdien per rull. Summene beregnes automatisk og lagres i historikk.
- **PWA & offline:** Applikasjonen installeres som en app på mobil og nettbrett. En service worker cache‑lagrer app‑skallet slik at du kan åpne, bla og lagre data uten nett. Når du kommer på nett igjen beholdes dataene.

## Installering og kjøring lokalt

1. **Installer avhengigheter**

   Sørg for at du har Node.js (≥16) og npm installert. Kjør deretter fra prosjektmappen:

   ```bash
   npm install
   ```

2. **Start utviklingsserver**

   ```bash
   npm run dev
   ```

   Appen er nå tilgjengelig på `http://localhost:3000`. Ved første oppstart laster du opp varetellingsfilen din for å komme i gang.

3. **Bygg for produksjon**

   For å bygge en statisk produksjonsversjon (blir brukt ved deploy til Netlify/Vercel):

   ```bash
   npm run build
   npm run start
   ```

## Katalogstruktur

```
pwa-varetelling/
├── app/              # Next.js App Router – layout, sider og globale stiler
│   ├── layout.tsx    # Rotlayout med tema‑toggler og service‑worker registrering
│   ├── page.tsx      # Startside med faner for varetelling, sjekkliste, pengetelling og historikk
│   └── globals.css   # Tailwind‑stiler og globale tilpasninger
├── components/       # Gjenbrukbare UI‑komponenter
│   ├── Counter.tsx   # +/-‑kontroller og tallinput
│   ├── ItemList.tsx  # Viser liste med varer, kategorier og teller
│   ├── Filters.tsx   # Filtrering og søk
│   ├── Checklist.tsx # Per‑måned sjekkliste med avhuking og kommentarer
│   ├── CashCounter.tsx  # Pengetelling for to kasser og safe
│   └── HistoryList.tsx # Viser lagret historikk
├── lib/
│   ├── db.ts         # Dexie‑oppsett for IndexedDB
│   ├── excel.ts      # Hjelpefunksjoner for å lese og skrive Excel
│   └── types.ts      # TypeScript‑typer
├── public/
│   ├── manifest.json # Web App Manifest for PWA
│   ├── sw.js         # Service worker for cacheing
│   ├── icon-192x192.png # App‑ikon
│   └── icon-512x512.png # App‑ikon
├── tailwind.config.js # Tailwind‑oppsett med dark‑mode
├── tsconfig.json      # TypeScript‑konfigurasjon
├── next.config.js     # Next.js‑konfigurasjon
└── README.md          # Denne filen
```

## Testing

End‑to‑end‑tester kan skrives i `playwright` for å automatisere opplasting, telling og eksport. Konfigurasjonen er ikke inkludert her, men prosjektet er satt opp med `playwright` som dev‑avhengighet og klar til bruk.

## Deploy til Netlify

Siden er designet for å deployes som statisk PWA. På Netlify legger du til et nytt prosjekt som peker til dette depotet. Build‑kommandoen er `npm run build`, og publish‑mappen er `.next`. Netlify vil da automatisk installere avhengigheter, bygge appen og serve den som en statisk side med service‑worker. Husk å aktivere prerendering dersom du ønsker fullstendig statisk eksport.

## Videre arbeid

- **Supabase‑adapter**: Kodebasen er forberedt på å kunne synkronisere historikk mellom flere brukere, men dette er avskrudd i MVP.
- **Skjulte prisfelt**: Pris‑ og sumkolonner er tilgjengelige i koden, men er skjult som standard. Du kan utvide UI for å vise dem.
- **Kamera/kvitteringslesing**: Det er plass til moduler for bildegjenkjenning og OCR for automatisk telling.

Har du spørsmål eller forslag til forbedringer? Opprett gjerne en issue eller send en pull request!