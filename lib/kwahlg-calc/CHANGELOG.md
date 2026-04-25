# Changelog

All notable changes to `kwahlg-calc` are documented in this file.

## 0.1.0 - 2026-04-25

- Extracted the calculation core into `lib/kwahlg-calc/src`.
- Added public API entrypoint for Node (`index.js`) and browser bundle (`dist/kwahlg-calc.umd.js`).
- Switched the Sitzrechner app to consume the library API (`KWahlGCalcLib`).
- Replaced math HTML logs with structured protocol data.
- Added compatibility and contract tests for allocators and calculators.
- Added build and integrity-check scripts for browser bundle output.
- Added CI workflow for dist validation and test execution.
