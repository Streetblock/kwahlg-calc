# KWahlG Calc

`kwahlg-calc` is the browser- and Node-compatible calculation core for this project.

It currently exposes:

- `SainteLagueAllocator`
- `DHondtAllocator`
- `HareNiemeyerAllocator`
- `NrwKWahlGCalculator`
- `CommitteeCalculator`

## Usage

### Node

```js
const {
  SainteLagueAllocator,
  NrwKWahlGCalculator,
  CommitteeCalculator
} = require("./lib/kwahlg-calc");
```

### Browser

The calculator app itself is the primary browser example for this library. The page in
`index.html` loads the calculation core in classic script mode and uses the same
browser-compatible math files that back this package.

If you want to consume the packaged browser API directly, load the browser bundle:

```html
<script src="./lib/kwahlg-calc/dist/kwahlg-calc.umd.js"></script>
```

After that, the public API is available globally as:

```js
const { NrwKWahlGCalculator, CommitteeCalculator } = KWahlGCalcLib;
```

### Build browser bundle

```bash
npm run build:kwahlg-calc
```

### Verify bundle is up to date

```bash
npm run check:kwahlg-calc-dist
```

## Public API

### SainteLagueAllocator

```js
const allocator = new SainteLagueAllocator();
const result = allocator.calculate(parties, totalSeats);
```

Input:

- `parties`: array of objects with at least `id`, `abbreviation`, `color`, `votes`
- `totalSeats`: integer

Returns:

- `partyResults`
- `protocolEntries`
- `lotteryInfos`
- `tieInfo`

### DHondtAllocator

```js
const allocator = new DHondtAllocator();
const result = allocator.calculate(parties, totalSeats);
```

Returns:

- `partyResults`
- `allocationTable`
- `protocolEntries`
- `lotteryInfos`
- `tieInfo`

### HareNiemeyerAllocator

```js
const allocator = new HareNiemeyerAllocator();
const result = allocator.calculate(parties, totalSeats, totalVotes);
```

Returns:

- `partyResults`
- `protocolEntries`
- `lotteryInfos`
- `tieInfo`

### NrwKWahlGCalculator

```js
const baseAllocator = new SainteLagueAllocator();
const calculator = new NrwKWahlGCalculator(baseAllocator);

const result = calculator.calculate(parties, 66, totalVotes, {
  votesIndividualCandidates: 0,
  seatsWonByIndividualCandidates: 0,
  votesPartiesWithoutListPauschal: 0,
  seatsWonByPartiesWithoutListPauschal: 0
});
```

Input party records should contain:

- `id`
- `abbreviation`
- `color`
- `votes`
- `directMandates`
- optional `isListApproved`

Returns:

- `allocatedParties`
- `protocolEntries`
- `lotteryInfos`
- `tieInfo`

Each `allocatedParties` record contains:

- `id`
- `abbreviation`
- `color`
- `votes`
- `seats`
- `directMandatesWon`
- `directMandatesAwarded`
- `listSeatsAwarded`

### CommitteeCalculator

```js
const calculator = new CommitteeCalculator();

const result = calculator.calculate({
  committeeSizes: [5, 7],
  councilResults,
  factionAlliances: [],
  manualVotes,
  mode: "hare"
});
```

Returns:

- `calculationBasis`
- `individualMembers`
- `totalVotes`
- `mode`
- `displayMode`
- `title`
- `results`
- `protocolEntries`

`results` is keyed by committee size.

## Notes

- The library currently supports CommonJS in Node.
- The Sitzrechner app itself serves as the reference browser integration.
- In browser usage, the API is exposed globally as `KWahlGCalcLib`.
- Protocol output is structured data intended for renderer consumption, not HTML strings.
- License: [MIT](../../LICENSE).
