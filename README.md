# kwahlg-calc

Browser- and Node-compatible seat allocation core for NRW municipal elections (KWahlG), committee allocation, and standard methods (Sainte-Lague, d'Hondt, Hare-Niemeyer).

This repository contains:

- the library package in `lib/kwahlg-calc`
- the Sitzrechner web app as a reference consumer in `index.html` and `js/`

## Repository layout

- `lib/kwahlg-calc/src`: calculation source modules
- `lib/kwahlg-calc/index.js`: Node/CommonJS entrypoint
- `lib/kwahlg-calc/dist/kwahlg-calc.umd.js`: browser bundle exposing `KWahlGCalcLib`
- `tests/`: library and contract tests
- `scripts/build-kwahlg-calc-dist.js`: browser bundle build and integrity check

## Development scripts

From repository root:

```bash
npm run build:kwahlg-calc
npm run check:kwahlg-calc-dist
npm test
```

## Browser usage

Load the bundle:

```html
<script src="./lib/kwahlg-calc/dist/kwahlg-calc.umd.js"></script>
```

Then consume:

```js
const { NrwKWahlGCalculator, CommitteeCalculator } = KWahlGCalcLib;
```

## Node usage

```js
const { NrwKWahlGCalculator, CommitteeCalculator } = require("./lib/kwahlg-calc");
```

## License

MIT. See [LICENSE](./LICENSE).
