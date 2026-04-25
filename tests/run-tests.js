const suites = [
    ...require('./kwahlg-calc-lib.test'),
    ...require('./allocators.test'),
    ...require('./nrw-kwahlg.test'),
    ...require('./committee-calculator.test')
];

let failed = 0;

for (const testCase of suites) {
    try {
        testCase.run();
        console.log(`PASS ${testCase.name}`);
    } catch (error) {
        failed += 1;
        console.error(`FAIL ${testCase.name}`);
        console.error(error.stack || error.message || error);
    }
}

if (failed > 0) {
    console.error(`\n${failed} test(s) failed.`);
    process.exit(1);
}

console.log(`\n${suites.length} test(s) passed.`);
