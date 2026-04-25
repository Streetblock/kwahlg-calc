# kwahlg-calc

`kwahlg-calc` is a repository for two closely related parts:

- a reusable calculation library for seat allocation
- a browser-based Sitzrechner app that consumes this library

The goal is to keep election math testable and reusable, while the app provides a practical UI for real scenarios.

## What this repo is

This repository is both:

- a package source for `lib/kwahlg-calc`
- the reference implementation app (`index.html` + `js/`) showing how to use the library in a browser workflow

## What the library can do

The library package lives in `lib/kwahlg-calc` and supports:

- NRW municipal council seat allocation (`NrwKWahlGCalculator`)
- committee seat/access calculations (`CommitteeCalculator`)
- standard methods:
  - Sainte-Lague / Schepers
  - d'Hondt
  - Hare-Niemeyer
- structured protocol output for renderer/UI consumption
- Node/CommonJS usage and browser bundle usage via `KWahlGCalcLib`

Public browser bundle:

```html
<script src="./lib/kwahlg-calc/dist/kwahlg-calc.umd.js"></script>
```

Public Node entry:

```js
const { NrwKWahlGCalculator, CommitteeCalculator } = require("./lib/kwahlg-calc");
```

## What the app can do

The Sitzrechner app (`index.html`) provides:

- NRW council calculation flow (including direct mandates and KWahlG-based allocation)
- committee calculations (Hare and d'Hondt modes)
- simple/general seat distribution mode
- import/export helpers and protocol/result rendering
- charts and practical UI controls for interactive analysis

The app acts as the reference consumer of the library API.

## Repository layout

- `lib/kwahlg-calc/src`: library source modules
- `lib/kwahlg-calc/index.js`: Node/CommonJS entrypoint
- `lib/kwahlg-calc/dist/kwahlg-calc.umd.js`: browser bundle exposing `KWahlGCalcLib`
- `tests/`: contract, compatibility, and calculation tests
- `scripts/build-kwahlg-calc-dist.js`: bundle build + integrity check
- `index.html`, `js/`: browser app (reference consumer)

## Development scripts

From repository root:

```bash
npm run build:kwahlg-calc
npm run check:kwahlg-calc-dist
npm test
```

## GitHub Pages (app publishing)

If you want to publish the app via GitHub Pages:

1. Push the repository to GitHub.
2. In repository settings, open `Pages`.
3. Set source to `Deploy from a branch`.
4. Choose branch `main` and folder `/ (root)`.
5. Save and wait for Pages to publish.

After publishing, `index.html` is served as the app entry page.

## License

MIT. See [LICENSE](./LICENSE).
