# KWahlG Calc

Browser- and Node-compatible calculation core for:

- Sainte-Lague / Schepers
- D'Hondt
- Hare-Niemeyer
- NRW KWahlG council seat allocation
- committee seat allocation

Public API:

```js
const {
  SainteLagueAllocator,
  DHondtAllocator,
  HareNiemeyerAllocator,
  NrwKWahlGCalculator,
  CommitteeCalculator
} = require("./lib/kwahlg-calc");
```
