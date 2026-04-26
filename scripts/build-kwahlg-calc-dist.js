const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const libRoot = path.join(projectRoot, 'lib', 'kwahlg-calc');
const srcRoot = path.join(libRoot, 'src');
const distRoot = path.join(libRoot, 'dist');
const distFile = path.join(distRoot, 'kwahlg-calc.umd.js');

const sourceFiles = [
    path.join(srcRoot, 'Allocators.js'),
    path.join(srcRoot, 'NrwCalculator.js'),
    path.join(srcRoot, 'CommitteeCalculator.js')
];

const bundleHeader = `/*!
 * kwahlg-calc browser bundle
 * Generated file. Do not edit directly.
 */
`;

const bundleFooter = `
(function exposeKwahlgCalcLibrary(globalScope) {
    const REQUIRED_EXPORTS = [
        'SainteLagueAllocator',
        'DHondtAllocator',
        'HareNiemeyerAllocator',
        'NrwBezirksvertretungAllocator',
        'NrwKWahlGCalculator',
        'CommitteeCalculator'
    ];

    function createPublicApi(source, environmentLabel) {
        const api = {};
        const missingExports = [];

        REQUIRED_EXPORTS.forEach((exportName) => {
            if (typeof source[exportName] === 'function') {
                api[exportName] = source[exportName];
            } else {
                missingExports.push(exportName);
            }
        });

        if (missingExports.length > 0) {
            throw new Error(
                'KWahlGCalcLib could not initialize in ' + environmentLabel + '. ' +
                'Missing exports: ' + missingExports.join(', ') + '.'
            );
        }

        return api;
    }

    const api = createPublicApi({
        SainteLagueAllocator: typeof SainteLagueAllocator === 'function' ? SainteLagueAllocator : globalScope.SainteLagueAllocator,
        DHondtAllocator: typeof DHondtAllocator === 'function' ? DHondtAllocator : globalScope.DHondtAllocator,
        HareNiemeyerAllocator: typeof HareNiemeyerAllocator === 'function' ? HareNiemeyerAllocator : globalScope.HareNiemeyerAllocator,
        NrwBezirksvertretungAllocator: typeof NrwBezirksvertretungAllocator === 'function' ? NrwBezirksvertretungAllocator : globalScope.NrwBezirksvertretungAllocator,
        NrwKWahlGCalculator: typeof NrwKWahlGCalculator === 'function' ? NrwKWahlGCalculator : globalScope.NrwKWahlGCalculator,
        CommitteeCalculator: typeof CommitteeCalculator === 'function' ? CommitteeCalculator : globalScope.CommitteeCalculator
    }, 'browser bundle');

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    globalScope.KWahlGCalcLib = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
`;

const bundleBody = sourceFiles
    .map((filePath) => fs.readFileSync(filePath, 'utf8'))
    .join('\n\n');

const output = `${bundleHeader}\n${bundleBody}\n${bundleFooter}`;
const checkMode = process.argv.includes('--check');
const targetPath = path.relative(projectRoot, distFile);

if (checkMode) {
    if (!fs.existsSync(distFile)) {
        console.error(`Missing ${targetPath}. Run: npm run build:kwahlg-calc`);
        process.exit(1);
    }

    const existing = fs.readFileSync(distFile, 'utf8');
    if (existing !== output) {
        console.error(`${targetPath} is out of date. Run: npm run build:kwahlg-calc`);
        process.exit(1);
    }

    console.log(`Verified ${targetPath}`);
    process.exit(0);
}

fs.mkdirSync(distRoot, { recursive: true });
fs.writeFileSync(distFile, output);
console.log(`Built ${targetPath}`);
